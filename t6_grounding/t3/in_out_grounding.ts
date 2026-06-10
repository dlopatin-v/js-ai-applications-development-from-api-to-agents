import * as readline from 'node:readline/promises'

import { Chroma } from '@langchain/community/vectorstores/chroma'
import { Document } from '@langchain/core/documents'
import { OpenAIEmbeddings } from '@langchain/openai'
import { OpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

import { UserServiceClient } from '../user_service_client'
import { OPENAI_API_KEY, Role, UserInfo } from '../../commons'

// ================================================================
// PROMPTS
// ================================================================

// Промпт для Named Entity Extraction (NEE) —
// LLM получает найденных пользователей (только id + about_me) и запрос,
// возвращает ТОЛЬКО IDs сгруппированные по хобби — без личных данных!
// Это ключевое: LLM не трогает PII (имена, email, телефоны) → нет риска галлюцинаций в личных данных
const NEE_SYSTEM_PROMPT = `You are a Named Entity Extraction system for hobby analysis.

Given a list of users with their IDs and about_me descriptions, and a search query:
1. Identify hobbies/interests relevant to the search query
2. Group user IDs by their matching hobbies
3. Include ONLY users whose about_me clearly matches the query intent

Rules:
- Use specific hobby names as keys (e.g., "hiking", "rock climbing", "painting")
- Do not modify or infer user data — only classify by hobby
- Do not include users who don't clearly match the query`

const NEE_USER_PROMPT = `Users context:
{context}

Search query: {query}`

// ================================================================
// ZOD SCHEMAS
// ================================================================

// Схема результата NEE:
// { "hiking": [1, 23, 45], "rock climbing": [67, 89] }
// Только IDs — никаких личных данных через LLM!
const HobbyExtractionResult = z.object({
  hobbies: z.record(z.string(), z.array(z.number()))
})

// ================================================================
// HELPERS
// ================================================================

// ВАЖНО: embeddируем ТОЛЬКО id + about_me, не все поля пользователя.
// Зачем: about_me содержит хобби → это то что нам нужно для семантического поиска.
// Остальные поля (salary, credit_card, address...) только раздуют контекст и стоимость.
function formatUserForEmbedding(user: Record<string, unknown>): string {
  return `User ID: ${user['id']}\nAbout me: ${user['about_me'] ?? ''}`
}

function createUserDocument(user: Record<string, unknown>): Document {
  return new Document({
    pageContent: formatUserForEmbedding(user),
    id: String(user['id']), // ID документа в Chroma = ID пользователя
    metadata: { userId: Number(user['id']) }
  })
}

// ================================================================
// MAIN CLASS: UserHobbiesRAG
// ================================================================

class UserHobbiesRAG {
  private vectorStore!: Chroma
  private llmClient: OpenAI
  private userService: UserServiceClient
  // Храним известные IDs в памяти — чтобы не лезть внутрь Chroma за списком
  private knownUserIds = new Set<string>()

  readonly ready: Promise<void>

  constructor(private embeddings: OpenAIEmbeddings) {
    this.llmClient = new OpenAI({ apiKey: OPENAI_API_KEY })
    this.userService = new UserServiceClient()
    this.ready = this.coldStart()
  }

  // ── STAGE 1: Cold Start ─────────────────────────────────────
  // Выполняется один раз при старте приложения.
  // Загружаем всех пользователей и строим Chroma векторный индекс.
  private async coldStart(): Promise<void> {
    console.log('🚀 Cold start: loading all users...')
    const users = await this.userService.getAllUsers()

    console.log(
      `📄 Formatting ${users.length} documents (id + about_me only)...`
    )
    const documents = users.map(u =>
      createUserDocument(u as Record<string, unknown>)
    )

    // Запоминаем все текущие IDs
    users.forEach(u => this.knownUserIds.add(String((u as any).id)))

    console.log('↗️  Building Chroma vector store...')
    // Chroma хранит данные в Docker контейнере (localhost:8000) —
    // в отличие от FAISS который был только в памяти
    this.vectorStore = await Chroma.fromDocuments(documents, this.embeddings, {
      collectionName: 'users_hobbies',
      url: 'http://localhost:8000'
    })

    console.log(`✅ Vector store ready with ${users.length} users.`)
  }

  // ── STAGE 2: Adaptive Update ────────────────────────────────
  // Вызывается ПЕРЕД каждым поиском.
  // Сравниваем актуальных пользователей из API с тем что в Chroma:
  //   - Новые пользователи → добавляем в Chroma
  //   - Удалённые пользователи → удаляем из Chroma
  // Это дешевле чем пересоздавать весь индекс каждый раз!
  private async updateVectorStore(): Promise<void> {
    console.log('🔄 Syncing vector store with user service...')

    const currentUsers = await this.userService.getAllUsers()
    const currentIds = new Set(currentUsers.map(u => String((u as any).id)))

    // Пользователи которых ещё нет в Chroma (добавлены за последние 5 минут)
    const newUsers = currentUsers.filter(
      u => !this.knownUserIds.has(String((u as any).id))
    )
    // Пользователи которых уже нет в API (удалены за последние 5 минут)
    const deletedIds = [...this.knownUserIds].filter(id => !currentIds.has(id))

    // Удаляем из Chroma удалённых пользователей
    if (deletedIds.length > 0) {
      console.log(
        `🗑️  Removing ${deletedIds.length} deleted users from vector store...`
      )
      await this.vectorStore.delete({ ids: deletedIds })
      deletedIds.forEach(id => this.knownUserIds.delete(id))
    }

    // Добавляем новых пользователей в Chroma
    if (newUsers.length > 0) {
      console.log(`➕ Adding ${newUsers.length} new users to vector store...`)
      const newDocs = newUsers.map(u =>
        createUserDocument(u as Record<string, unknown>)
      )
      await this.vectorStore.addDocuments(newDocs)
      newUsers.forEach(u => this.knownUserIds.add(String((u as any).id)))
    }

    if (deletedIds.length === 0 && newUsers.length === 0) {
      console.log('✅ Vector store is up to date.')
    }
  }

  // ── STAGE 3: Semantic Search (Input Grounding) ───────────────
  // Векторный поиск по about_me — находим семантически похожих пользователей.
  // Возвращает текст с id + about_me найденных пользователей.
  private async retrieveContext(
    query: string,
    k: number = 20
  ): Promise<string> {
    console.log(`🔎 Semantic search (top-${k})...`)

    const results = await this.vectorStore.similaritySearch(query, k)

    for (const doc of results) {
      console.log(`  → ${doc.pageContent.slice(0, 80).replace(/\n/g, ' ')}...`)
    }

    return results.map(doc => doc.pageContent).join('\n\n')
  }

  // ── STAGE 4: Named Entity Extraction (LLM) ──────────────────
  // LLM получает ТОЛЬКО id + about_me (не полные данные пользователей!).
  // Задача: сгруппировать user IDs по хобби.
  // Возвращает: { "hiking": [1, 23, 45], "rock climbing": [67, 89] }
  //
  // Почему только IDs?
  //   - Экономия токенов (нет salary, credit_card, address...)
  //   - Нет риска галлюцинаций в PII данных
  //   - Полные данные получим на следующем шаге через Output Grounding
  private async extractHobbies(
    context: string,
    query: string
  ): Promise<Record<string, number[]>> {
    console.log('🧠 LLM Named Entity Extraction...')

    const userMessage = NEE_USER_PROMPT.replace('{context}', context).replace(
      '{query}',
      query
    )

    // Используем json_object вместо zodResponseFormat —
    // z.record() не совместим с OpenAI structured output (additionalProperties)
    const response = await this.llmClient.chat.completions.create({
      model: 'gpt-4.1-nano',
      temperature: 0,
      messages: [
        {
          role: Role.SYSTEM,
          content:
            NEE_SYSTEM_PROMPT +
            '\n\nReturn JSON in format: { "hobbies": { "hobby_name": [user_id, ...] } }'
        },
        { role: Role.USER, content: userMessage }
      ],
      response_format: { type: 'json_object' }
    })

    // Парсим JSON вручную и валидируем через Zod
    const content = response.choices[0].message.content ?? '{}'
    const parsed = HobbyExtractionResult.parse(JSON.parse(content))

    console.log('📋 Extracted:', JSON.stringify(parsed.hobbies, null, 2))
    return parsed.hobbies
  }

  // ── STAGE 5: Output Grounding ────────────────────────────────
  // Верифицируем каждый ID из LLM ответа через реальный API.
  // Это Output Grounding — проверяем что:
  //   1. Пользователь с таким ID реально существует (не галлюцинация)
  //   2. Получаем ПОЛНЫЕ актуальные данные (не только id + about_me)
  // Если пользователь был удалён между поиском и верификацией → просто пропускаем
  private async groundOutput(
    hobbies: Record<string, number[]>
  ): Promise<Record<string, UserInfo[]>> {
    console.log(
      '✅ Output grounding: verifying IDs and fetching full user data...'
    )

    const result: Record<string, UserInfo[]> = {}

    for (const [hobby, ids] of Object.entries(hobbies)) {
      // Параллельно запрашиваем полные данные для каждого ID
      const userPromises = ids.map(id =>
        this.userService.getUser(id).catch(() => null)
      )
      const users = await Promise.all(userPromises)

      // Фильтруем null — мог быть удалён между поиском и верификацией
      result[hobby] = users.filter((u): u is UserInfo => u !== null)
      console.log(
        `  ${hobby}: verified ${result[hobby].length}/${ids.length} users`
      )
    }

    return result
  }

  // ── PUBLIC: Full Pipeline ────────────────────────────────────
  // Полный флоу: Update → Retrieve → Extract → Ground
  async search(query: string): Promise<Record<string, UserInfo[]>> {
    await this.updateVectorStore() // Stage 2: синхронизация
    const context = await this.retrieveContext(query) // Stage 3: семантический поиск

    if (!context.trim()) {
      console.log('No relevant users found.')
      return {}
    }

    const hobbies = await this.extractHobbies(context, query) // Stage 4: NEE
    return this.groundOutput(hobbies) // Stage 5: Output Grounding
  }
}

// ================================================================
// MAIN
// ================================================================

async function main() {
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
    apiKey: OPENAI_API_KEY,
    dimensions: 384
  })

  const rag = new UserHobbiesRAG(embeddings)
  await rag.ready // ждём cold start

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  console.log('\nQuery samples:')
  console.log(' - I need people who love to go to mountains')
  console.log(' - Find users interested in arts and creativity')
  console.log(' - Who likes outdoor activities?')

  while (true) {
    const userQuestion = await rl.question('\n➡️ ')

    if (userQuestion.toLowerCase() === 'exit') {
      console.log('👋 Goodbye')
      rl.close()
      process.exit(0)
    }

    const result = await rag.search(userQuestion)
    console.log('\n=== RESULT ===')
    console.log(JSON.stringify(result, null, 2))
  }
}

main()
