import * as fs from 'node:fs'
import * as path from 'node:path'
import * as readline from 'node:readline/promises'

import { TextLoader } from '@langchain/classic/document_loaders/fs/text'
import { FaissStore } from '@langchain/community/vectorstores/faiss'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'

import { OPENAI_API_KEY } from '../commons'

//TODO:
// Create a system prompt that:
//   - Defines the assistant's role (microwave manual expert)
//   - Describes the structure of the user message:
//       - `RAG CONTEXT`: retrieved document chunks
//       - `USER QUESTION`: the actual user question
//   - Instructs the model to answer ONLY from the RAG context / conversation history
//   - Instructs it to refuse questions not covered by the context
//
// СИСТЕМНЫЙ ПРОМПТ — задаёт роль и правила поведения ассистента.
// Ключевые требования:
//   1. Модель должна отвечать ТОЛЬКО на основе RAG CONTEXT
//   2. Если вопрос не по теме — вежливо отказать (RAG guardrail)
//   3. Чётко объяснить структуру входящего сообщения
const SYSTEM_PROMPT = `You are an expert assistant for microwave oven manuals.
You help users understand how to use and troubleshoot their microwave ovens.

The user message has the following structure:
- ##RAG CONTEXT: relevant excerpts retrieved from the microwave manual
- ##USER QUESTION: the actual question from the user

Rules you must follow:
1. Answer ONLY based on the information provided in the RAG CONTEXT or previous conversation history.
2. If the RAG CONTEXT does not contain enough information to answer the question — politely refuse and explain that the topic is not covered in the microwave manual.
3. Do NOT use any external knowledge or make up information.
4. Be concise, clear and helpful.
5. If the question is completely unrelated to microwaves — politely decline to answer.`

// Template that injects retrieved context and the user question into a single prompt string
const getUserPrompt = (context: string, query: string) => `##RAG CONTEXT:
${context}


##USER QUESTION: 
${query}`

// Папка где будет сохранён FAISS индекс после первого запуска
const FAISS_INDEX_PATH = path.join(__dirname, 'faiss_index')

class MicrowaveRAG {
  vectorStore!: FaissStore

  /** Resolves when the vector store is fully initialised and ready for queries. */
  readonly ready: Promise<void>

  constructor(
    public embeddings: OpenAIEmbeddings,
    public llmClient: ChatOpenAI
  ) {
    this.ready = this.setupVectorStore()
  }

  //TODO:
  // Check if the FAISS index folder already exists on disk.
  //   - If yes: load it with FaissStore.load()
  //   - If no:  call createNewIndex() to build and save a fresh one
  //
  // ЛОГИКА:
  //   Первый запуск  → индекса нет → createNewIndex() → читаем manual.txt,
  //                    создаём эмбеддинги, сохраняем на диск (~10-30 сек)
  //   Второй запуск  → индекс уже есть → просто загружаем с диска (мгновенно!)
  //   Это ключевая оптимизация RAG — тяжёлая работа делается один раз.
  private async setupVectorStore(): Promise<void> {
    if (fs.existsSync(FAISS_INDEX_PATH)) {
      // Индекс уже существует — загружаем с диска
      // FaissStore.load() принимает путь и embedding модель
      // (embedding модель нужна чтобы конвертировать новые запросы в векторы)
      console.log('📂 Loading existing FAISS index from disk...')
      this.vectorStore = await FaissStore.load(
        FAISS_INDEX_PATH,
        this.embeddings
      )
      console.log('✅ FAISS index loaded!')
    } else {
      // Индекса нет — создаём новый
      console.log('🔨 No existing index found. Building new FAISS index...')
      this.vectorStore = await this.createNewIndex()
      console.log('✅ FAISS index created and saved!')
    }
  }

  //TODO:
  // Build a new FAISS index from the microwave manual:
  //   - Load 'microwave_manual.txt' with TextLoader
  //   - Split into chunks with RecursiveCharacterTextSplitter
  //   - Create the store with FaissStore.fromDocuments()
  //   - Save the index locally for future runs
  //
  // ЗАЧЕМ РАЗБИВАТЬ НА ЧАНКИ?
  //   Весь документ не влезет в контекст GPT.
  //   Чанки позволяют найти именно нужный кусок, а не весь документ.
  //
  // chunkSize=1000    → каждый чанк ~1000 символов (~250 токенов)
  // chunkOverlap=200  → 200 символов перекрытия между чанками
  //                     нужно чтобы не терять смысл на границах чанков:
  //                     [...конец чанка 1...][...начало чанка 2...]
  //                     [...    overlap    ...]
  private async createNewIndex(): Promise<FaissStore> {
    // ШАГ 1: Загружаем текстовый файл
    const manualPath = path.join(__dirname, 'microwave_manual.txt')
    const loader = new TextLoader(manualPath)
    const docs = await loader.load()
    console.log(`📄 Loaded document: ${docs.length} page(s)`)

    // ШАГ 2: Разбиваем документ на чанки
    // RecursiveCharacterTextSplitter пытается разбивать по параграфам,
    // потом по предложениям, потом по словам — сохраняет смысловые границы
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, // максимальный размер чанка в символах
      chunkOverlap: 200 // перекрытие между соседними чанками
    })
    const chunks = await splitter.splitDocuments(docs)
    console.log(`✂️  Split into ${chunks.length} chunks`)

    // ШАГ 3: Создаём FAISS векторное хранилище
    // fromDocuments() делает два шага:
    //   а) вызывает OpenAI Embeddings API для каждого чанка → получает векторы
    //   б) сохраняет векторы в FAISS индекс в памяти
    // Это самый долгий шаг — N чанков = N API вызовов к embeddings
    console.log('🔢 Creating embeddings and building FAISS index...')
    const vectorStore = await FaissStore.fromDocuments(chunks, this.embeddings)

    // ШАГ 4: Сохраняем индекс на диск для будущих запусков
    // Создаёт папку faiss_index/ с двумя файлами:
    //   faiss.index      — бинарный файл с векторами (для FAISS)
    //   docstore.json    — оригинальные тексты чанков (для извлечения)
    await vectorStore.save(FAISS_INDEX_PATH)
    console.log(`💾 Index saved to: ${FAISS_INDEX_PATH}`)

    return vectorStore
  }

  //TODO:
  // Search the vector store for chunks most relevant to the query.
  //   - Use similaritySearchWithScore(query, k)
  //   - Print each chunk's L2 distance score and content
  //   - Return all matching chunks joined with "\n\n"
  //
  // k=4             → берём топ-4 самых похожих чанка
  // scoreThreshold  → максимальное L2 расстояние (НЕ процент схожести!)
  //                   FAISS использует L2 (евклидово) расстояние:
  //                   0.0 = идеально похожи
  //                   1.0 = умеренно похожи  ← хороший порог
  //                   2.0 = слабо похожи
  //                   Чем МЕНЬШЕ число — тем СТРОЖЕ фильтр
  async retrieveContext(
    query: string,
    k = 4,
    scoreThreshold = 1.0
  ): Promise<string> {
    console.log(
      `\n🔍 Searching for relevant chunks (k=${k}, threshold=${scoreThreshold})...`
    )

    // similaritySearchWithScore возвращает массив пар [документ, score]
    // где score — L2 расстояние (меньше = лучше)
    const results = await this.vectorStore.similaritySearchWithScore(query, k)

    // Фильтруем по порогу и печатаем результаты для дебага
    const relevantChunks: string[] = []

    for (const [doc, score] of results) {
      console.log(
        `📊 Score (L2 distance): ${score.toFixed(4)} | Chunk: "${doc.pageContent.slice(0, 80)}..."`
      )

      if (score <= scoreThreshold) {
        // Чанк прошёл порог — добавляем в контекст
        relevantChunks.push(doc.pageContent)
      } else {
        // Чанк слишком далёкий — игнорируем
        console.log(
          `   ⚠️  Skipped (score ${score.toFixed(4)} > threshold ${scoreThreshold})`
        )
      }
    }

    console.log(
      `✅ Using ${relevantChunks.length} relevant chunk(s) as context`
    )

    // Объединяем все релевантные чанки в одну строку контекста
    // \n\n между чанками — чёткое визуальное разделение для модели
    return relevantChunks.join('\n\n')
  }

  //TODO:
  // Format the user prompt by injecting context and query into getUserPrompt().
  //   - Print the formatted prompt
  //   - Return the formatted string
  //
  // АУГМЕНТАЦИЯ — добавляем найденный контекст к вопросу пользователя.
  // GPT не знает нашу документацию — мы буквально вставляем нужные куски
  // текста как "шпаргалку" перед вопросом.
  augmentPrompt(context: string, query: string): string {
    const augmented = getUserPrompt(context, query)

    // console.log('\n📝 Augmented prompt:')
    // console.log('─'.repeat(60))
    // console.log(augmented)
    // console.log('─'.repeat(60))

    return augmented
  }

  //TODO:
  // Send the augmented prompt to the LLM and return its answer.
  //   - Build a messages array: [SystemMessage(SYSTEM_PROMPT), HumanMessage(augmentedPrompt)]
  //   - Invoke llmClient and print the response content
  //   - Return the response content as a string
  //
  // ГЕНЕРАЦИЯ — финальный шаг RAG.
  // GPT получает:
  //   [SYSTEM]  — роль и правила (отвечай только по контексту)
  //   [HUMAN]   — контекст из документации + вопрос пользователя
  // GPT видит документацию как часть промпта и отвечает на её основе.
  async generateAnswer(augmentedPrompt: string): Promise<string> {
    const messages = [
      new SystemMessage(SYSTEM_PROMPT), // роль и инструкции
      new HumanMessage(augmentedPrompt) // контекст + вопрос
    ]

    console.log('\n🤖 Generating answer...')
    const response = await this.llmClient.invoke(messages)

    // response.content может быть строкой или массивом (для multimodal)
    // для текстовых ответов всегда строка
    const answer = response.content as string

    console.log('\n💬 Answer:')
    console.log(answer)

    return answer
  }
}

const main = async (rag: MicrowaveRAG) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  console.log('🎯 Microwave RAG Assistant')
  console.log("Type your question or 'exit' to quit.")

  while (true) {
    const input = await rl.question('➡️  ')

    if (input.trim() === 'exit') {
      console.log('Exiting the chat. Goodbye!')
      rl.close()
      process.exit(0)
    }

    //TODO:
    // Execute the 3-step RAG pipeline for each user question:
    //   Step 1 (Retrieval):    call rag.retrieveContext()  → context
    //   Step 2 (Augmentation): call rag.augmentPrompt()   → augmentedPrompt
    //   Step 3 (Generation):   call rag.generateAnswer()  → answer
    //
    // ТРИ ШАГА RAG в действии:
    try {
      // ШАГ 1 — RETRIEVAL: ищем релевантные чанки в векторной БД
      const context = await rag.retrieveContext(input)

      // ШАГ 2 — AUGMENTATION: добавляем контекст к вопросу пользователя
      const augmentedPrompt = rag.augmentPrompt(context, input)

      // ШАГ 3 — GENERATION: отправляем в GPT и получаем ответ
      await rag.generateAnswer(augmentedPrompt)
    } catch (err) {
      console.error('❌ Error:', err)
    }
  }
}

//TODO:
// Instantiate MicrowaveRAG and start the chat loop:
//   - Create OpenAIEmbeddings with model "text-embedding-3-small"
//   - Create ChatOpenAI with model "gpt-4o" and temperature 0
//   - Construct MicrowaveRAG, await rag.ready, then call main(rag)
//
// КОНФИГУРАЦИЯ:
//   text-embedding-3-small — embedding модель для создания векторов
//   gpt-4o + temperature=0 — детерминированные ответы (факты из документации,
//                            не нужна креативность)

// ШАГ 1: Создаём embedding модель для векторизации текста
const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-small', // та же модель для документов И для запросов!
  apiKey: OPENAI_API_KEY
})

// ШАГ 2: Создаём LLM для генерации ответов
const llmClient = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0, // 0 = детерминированные ответы, идеально для фактических вопросов
  apiKey: OPENAI_API_KEY
})

// ШАГ 3: Создаём RAG систему и запускаем
const rag = new MicrowaveRAG(embeddings, llmClient)

// rag.ready — промис который резолвится когда FAISS индекс готов
// (либо загружен с диска, либо создан заново)
// Только после этого запускаем main loop
rag.ready
  .then(() => main(rag))
  .catch(err => console.error('❌ Fatal error:', err))
