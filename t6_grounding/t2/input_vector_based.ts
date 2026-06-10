import * as readline from 'node:readline/promises'

import { FaissStore } from '@langchain/community/vectorstores/faiss'
import { Document } from '@langchain/core/documents'
import { OpenAIEmbeddings } from '@langchain/openai'
import { OpenAI } from 'openai'

import { UserServiceClient } from '../user_service_client'

import { OPENAI_API_KEY, Role, UserInfo } from '../../commons'

// TODO:
// Define SYSTEM_PROMPT - instructs the LLM to act as a RAG-powered assistant

// Точно такой же промпт как в API-based версии —
// отвечать ТОЛЬКО на основе RAG CONTEXT, без выдумок
const SYSTEM_PROMPT = `You are a RAG-powered assistant that answers questions about users.

The user message contains two sections: RAG CONTEXT and USER QUESTION.

Rules:
- Answer ONLY based on the provided RAG CONTEXT and conversation history
- If no relevant information exists in RAG CONTEXT, state that the question cannot be answered based on available data
- Format user information clearly when presenting it`

// TODO:
// Define USER_PROMPT template with two placeholders:
//   - {context} - the retrieved user data
//   - {query}   - the user's question
const USER_PROMPT = `RAG CONTEXT:
{context}

USER QUESTION:
{query}`

function formatUserDocument(user: Record<string, unknown>): string {
  // TODO:
  // Форматируем объект пользователя в текстовый документ для векторизации.
  // ВАЖНО: чем лучше текст — тем точнее embedding → тем лучше поиск.
  // Все поля включаем чтобы можно было искать по любому из них.
  let result = 'User:\n'
  for (const [key, value] of Object.entries(user)) {
    result += `  ${key}: ${value}\n`
  }
  result += '\n'
  return result
}

class UserRAG {
  private vectorStore!: FaissStore
  private llmClient: OpenAI
  private userService: UserServiceClient

  readonly ready: Promise<void>

  constructor(private embeddings: OpenAIEmbeddings) {
    this.llmClient = new OpenAI({ apiKey: OPENAI_API_KEY })
    this.userService = new UserServiceClient()
    // ready — это промис который резолвится когда vectorStore готов.
    // Делаем это в конструкторе чтобы инициализация шла сразу при создании объекта.
    // В main() мы делаем await rag.ready — ждём готовности перед первым запросом.
    this.ready = this.initialize()
  }

  private async initialize(): Promise<void> {
    // TODO:
    // Одноразовая инициализация:
    // 1. Загружаем всех пользователей из API
    // 2. Форматируем в текстовые документы
    // 3. Создаём векторный индекс (дорогая операция — делается один раз)
    console.log('🔎 Loading all users...')
    const users: UserInfo[] = await this.userService.getAllUsers()

    console.log(`Formatting ${users.length} user documents...`)
    // Каждый пользователь → Document с текстовым представлением.
    // LangChain Document содержит pageContent (текст) который будет векторизован.
    const documents = users.map(
      user =>
        new Document({
          pageContent: formatUserDocument(user as Record<string, unknown>)
        })
    )

    console.log(
      `↗️ Creating embeddings and vectorstore for ${documents.length} documents...`
    )
    // Создаём FAISS store с батчингом — не отправляем все 1000 сразу,
    // а разбиваем на батчи по 100 чтобы не превысить лимиты API embeddings
    this.vectorStore = await this.createVectorStoreWithBatching(documents, 100)

    console.log('✅ Vectorstore is ready.')
  }

  private async createVectorStoreWithBatching(
    documents: Document[],
    batchSize: number = 100
  ): Promise<FaissStore> {
    // TODO:
    // Почему батчинг?
    // OpenAI Embeddings API имеет лимит на кол-во текстов за один запрос.
    // 1000 документов = 10 батчей по 100 → 10 параллельных запросов к embeddings API.

    // Разбиваем документы на батчи
    const batches: Document[][] = []
    for (let i = 0; i < documents.length; i += batchSize) {
      batches.push(documents.slice(i, i + batchSize))
    }

    // Создаём отдельный FAISS store для каждого батча параллельно.
    // FaissStore.fromDocuments() — векторизует документы и строит индекс.
    const storePromises = batches.map(batch =>
      FaissStore.fromDocuments(batch, this.embeddings)
    )
    const stores = await Promise.all(storePromises)

    // Объединяем все stores в один.
    // mergeFrom() добавляет векторы из другого store в текущий.
    const [baseStore, ...restStores] = stores
    for (const store of restStores) {
      await baseStore.mergeFrom(store)
    }

    return baseStore
  }

  async retrieveContext(
    query: string,
    k: number = 10,
    score: number = 1.0
  ): Promise<string> {
    console.log('Retrieving context...')
    // TODO:
    // ВАЖНО: FAISS возвращает L2 (Euclidean) дистанцию — НЕ cosine similarity!
    // L2 дистанция: чем МЕНЬШЕ — тем ПОХОЖЕЕ (в отличие от cosine где больше = похожее)
    // score: 0.1 — очень строгий порог (только очень близкие векторы)
    // Если нет результатов — попробуй увеличить до 0.5 или 1.0

    const results = await this.vectorStore.similaritySearchWithScore(query, k)

    // Фильтруем — оставляем только документы с дистанцией <= score
    const filteredResults = results.filter(([, distance]) => distance <= score)

    // Логируем каждый найденный документ с его дистанцией для отладки
    for (const [doc, distance] of filteredResults) {
      console.log(
        `Distance: ${distance.toFixed(4)} | ${doc.pageContent.slice(0, 80)}...`
      )
    }

    // Объединяем все найденные документы в одну строку контекста
    return filteredResults.map(([doc]) => doc.pageContent).join('\n\n')
  }

  augmentPrompt(query: string, context: string): string {
    // TODO:
    // Подставляем контекст и вопрос в шаблон USER_PROMPT
    return USER_PROMPT.replace('{context}', context).replace('{query}', query)
  }

  async generateAnswer(augmentedPrompt: string): Promise<string> {
    // TODO:
    // Финальный LLM вызов — отвечает на основе найденного контекста
    const response = await this.llmClient.chat.completions.create({
      model: 'gpt-4.1-mini',
      temperature: 0,
      messages: [
        { role: Role.SYSTEM, content: SYSTEM_PROMPT },
        { role: Role.USER, content: augmentedPrompt }
      ]
    })

    return response.choices[0].message.content ?? ''
  }
}

async function main() {
  // text-embedding-3-small с dimensions: 384 — компактные и быстрые векторы.
  // Та же модель должна использоваться и при поиске и при индексации!
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
    apiKey: OPENAI_API_KEY,
    dimensions: 384
  })

  // Создаём RAG — инициализация начинается сразу в конструкторе
  const rag = new UserRAG(embeddings)
  // Ждём пока vectorStore будет готов (загрузка + векторизация 1000 юзеров)
  await rag.ready

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  console.log('Query samples:')
  console.log(' - I need user emails that filled with hiking and psychology')
  console.log(' - Who is John?')

  while (true) {
    const userQuestion = await rl.question('➡️ ')

    if (userQuestion.toLowerCase() === 'exit') {
      console.log('👋 Goodbye')
      rl.close()
      process.exit(0)
    }

    // Полный RAG флоу:
    // 1. Семантический поиск по векторному индексу
    // 2. Обогащение промпта найденным контекстом
    // 3. Генерация ответа на основе контекста
    const context = await rag.retrieveContext(userQuestion)
    const augmentedPrompt = rag.augmentPrompt(userQuestion, context)
    const answer = await rag.generateAnswer(augmentedPrompt)
    console.log(`\nAnswer: ${answer}\n`)
  }
}

main()

// The problems with Vector based Grounding approach are:
//   - In current solution we fetched all users once, prepared Vector store (Embed takes money) but we didn't play
//     around the point that new users added and deleted every 5 minutes. (Actually, it can be fixed, we can create once
//     Vector store and with new request we will fetch all the users, compare new and deleted with version in Vector
//     store and delete the data about deleted users and add new users).
//   - Limit with top_k (we can set up to 100, but what if the real number of similarity search 100+?)
//   - With some requests works not so perfectly. (Here we can play and add extra chain with LLM that will refactor the
//     user question in a way that will help for Vector search, but it is also not okay in the point that we have
//     changed original user question).
//   - Need to play with balance between top_k and score_threshold
// Benefits are:
//   - Similarity search by context
//   - Any input can be used for search
//   - Costs reduce
