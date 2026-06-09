import * as readline from 'node:readline/promises'
import * as path from 'node:path'

import {
  Conversation,
  Message,
  OPENAI_API_KEY,
  OPENAI_CHAT_COMPLETIONS_ENDPOINT,
  OPENAI_EMBEDDINGS_ENDPOINT,
  Role
} from '../commons'
import { ChatCompletionClient } from './chat/chat_completion_client'
import { EmbeddingsClient } from './embeddings/embeddings_client'
import { SearchMode, TextProcessor } from './embeddings/text_processor'

// TODO:
//  Create a SYSTEM_PROMPT that:
//  - Identifies the assistant as a RAG-powered microwave assistant
//  - Describes the User message structure (RAG CONTEXT section + USER QUESTION section)
//  - Instructs the LLM to answer only from RAG context and conversation history
//  - Instructs the LLM to decline questions unrelated to microwave usage or outside the context
//
// Системный промпт — задаёт роль и правила поведения ассистента.
// Критически важно указать структуру входящего сообщения чтобы
// модель знала где искать контекст а где вопрос пользователя.
const SYSTEM_PROMPT = `You are a RAG-powered expert assistant for microwave oven manuals.
You help users understand how to use and troubleshoot their microwave ovens.

The user message has the following structure:
- ##RAG CONTEXT: relevant excerpts retrieved from the microwave manual
- ##USER QUESTION: the actual question from the user

Rules you must follow:
1. Answer ONLY based on the information provided in ##RAG CONTEXT or previous conversation history.
2. If the ##RAG CONTEXT does not contain enough information — politely refuse and explain the topic is not covered in the manual.
3. Do NOT use any external knowledge or make up information.
4. Decline all questions unrelated to microwave usage or maintenance.
5. Be concise, clear and helpful.`

// TODO:
//  Create a getUserPrompt(context, query) helper that builds the augmented user message,
//  structured with `##RAG CONTEXT:` and `##USER QUESTION:` sections.
//
// Шаблон аугментированного промпта — склеивает найденный контекст с вопросом.
// GPT видит это как одно сообщение от пользователя.
const getUserPrompt = (context: string, query: string) => `##RAG CONTEXT:
${context}

##USER QUESTION:
${query}`

// TODO:
//  Initialize clients and TextProcessor:
//  - EmbeddingsClient: endpoint=OPENAI_EMBEDDINGS_ENDPOINT, modelName='text-embedding-3-small', apiKey=OPENAI_API_KEY
//  - ChatCompletionClient: endpoint=OPENAI_CHAT_COMPLETIONS_ENDPOINT, modelName='gpt-5.2', apiKey=OPENAI_API_KEY
//  - TextProcessor DB config: host=localhost, port=5433, database=vectordb, user=postgres, password=postgres
//
// Создаём клиентов:
//   embeddingsClient  — для конвертации текста в векторы (384D)
//   completionClient  — для генерации ответов через GPT
//   textProcessor     — связывает embeddingsClient с PostgreSQL+pgvector

const embeddingsClient = new EmbeddingsClient(
  OPENAI_EMBEDDINGS_ENDPOINT, // https://api.openai.com/v1/embeddings
  'text-embedding-3-small', // модель для эмбеддингов
  OPENAI_API_KEY // API ключ
)

const completionClient = new ChatCompletionClient(
  OPENAI_CHAT_COMPLETIONS_ENDPOINT, // https://api.openai.com/v1/chat/completions
  'gpt-5.2', // модель для генерации ответов
  OPENAI_API_KEY // API ключ
)

const textProcessor = new TextProcessor(embeddingsClient, {
  host: 'localhost',
  port: 5433, // нестандартный порт! (не 5432) чтобы избежать конфликтов
  database: 'vectordb',
  user: 'postgres',
  password: 'postgres'
})

// Параметры RAG — можно менять для экспериментов
const CHUNK_SIZE = 300 // символов в чанке (recommended: 300)
const OVERLAP = 40 // символов перекрытия между чанками
const TOP_K = 5 // сколько чанков брать из БД
const SCORE_THRESHOLD = 0.5 // порог схожести (0.1-0.99)
const DIMENSIONS = 385 // размерность вектора (text-embedding-3-small → 384)

async function main() {
  // TODO:
  //  Implement the console chat loop:
  //  1. Ask the user whether to load context into VectorDB (y/n)
  //     - If yes, call textProcessor.processTextFile() with the microwave manual
  //  2. Initialise a Conversation with the SYSTEM_PROMPT
  //  3. Loop:
  //     a. Read user input (exit on "exit")
  //     b. Step 1 — Retrieval: call textProcessor.search() to get relevant context chunks
  //     c. Step 2 — Augmentation: build the augmented prompt and add it to the conversation
  //     d. Step 3 — Generation: call completionClient.getCompletion() and add the reply to the conversation

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  // ШАГ 1: Спрашиваем нужно ли загружать документы в БД
  // Первый запуск → y (загружаем документы и создаём embeddings)
  // Повторный запуск → n (данные уже в БД, пропускаем)
  const loadContext = await rl.question('Load context into VectorDB? (y/n): ')

  if (loadContext.trim().toLowerCase() === 'y') {
    const manualPath = path.join(
      __dirname,
      'embeddings',
      'microwave_manual.txt'
    )
    console.log('📚 Loading microwave manual into VectorDB...')

    await textProcessor.processTextFile(
      manualPath,
      CHUNK_SIZE,
      OVERLAP,
      DIMENSIONS,
      true // truncate = true → очищаем таблицу перед загрузкой
    )

    console.log('✅ Context loaded successfully!\n')
  } else {
    console.log('⏭️  Skipping context loading, using existing data in DB\n')
  }

  // ШАГ 2: Инициализируем Conversation с системным промптом
  // Conversation хранит историю диалога — передаётся в GPT при каждом запросе
  const conversation = new Conversation()
  conversation.addMessage(new Message(Role.SYSTEM, SYSTEM_PROMPT))

  console.log('🎯 Microwave RAG Assistant (Advanced)')
  console.log("Type your question or 'exit' to quit.\n")

  // ШАГ 3: Основной цикл чата
  while (true) {
    const input = await rl.question('➡️  ')

    if (input.trim() === 'exit') {
      console.log('Exiting the chat. Goodbye!')
      rl.close()
      // Закрываем соединение с PostgreSQL
      await textProcessor.client.end()
      process.exit(0)
    }

    try {
      // ШАГ 3a — RETRIEVAL: ищем релевантные чанки в PostgreSQL через pgvector
      // textProcessor.search() конвертирует вопрос в вектор и делает SQL запрос
      const contextChunks = await textProcessor.search(
        SearchMode.COSINE_DISTANCE, // используем косинусное расстояние
        input,
        TOP_K,
        SCORE_THRESHOLD,
        DIMENSIONS
      )

      // Объединяем найденные чанки в одну строку контекста
      const context = contextChunks.join('\n\n')

      // ШАГ 3b — AUGMENTATION: строим аугментированный промпт
      // Вставляем контекст из БД + вопрос пользователя в шаблон
      const augmentedPrompt = getUserPrompt(context, input)

      // Добавляем аугментированный промпт в историю диалога как USER сообщение
      conversation.addMessage(new Message(Role.USER, augmentedPrompt))

      // ШАГ 3c — GENERATION: отправляем всю историю в GPT
      // GPT видит: [SYSTEM prompt] + [предыдущие сообщения] + [новый USER промпт с контекстом]
      console.log('\n🤖 Generating answer...')
      const reply = await completionClient.getCompletion(conversation.messages)

      // Добавляем ответ GPT в историю для поддержания контекста диалога
      conversation.addMessage(reply)

      console.log(`\n💬 Answer:\n${reply.content}\n`)
    } catch (err) {
      console.error('❌ Error:', err)
    }
  }
}

// TODO:
//  PAY ATTENTION THAT YOU NEED TO RUN Postgres DB ON PORT 5433 WITH PGVECTOR EXTENSION!
//  RUN docker-compose.yml

main().catch(err => console.error('❌ Fatal error:', err))
