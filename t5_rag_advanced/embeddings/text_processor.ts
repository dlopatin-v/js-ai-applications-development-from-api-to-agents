import * as fs from 'node:fs'
import * as path from 'node:path'

import { Client, ClientConfig } from 'pg'

import { EmbeddingsClient } from './embeddings_client'
import { chunkText } from '../utils/text'

export enum SearchMode {
  EUCLIDIAN_DISTANCE = 'euclidean', // Euclidean distance (<->)
  COSINE_DISTANCE = 'cosine' // Cosine distance (<=>)
}

/** Processor for text documents that handles chunking, embedding, storing, and retrieval. */
export class TextProcessor {
  constructor(
    private embeddingClient: EmbeddingsClient,
    dbConfig: ClientConfig
  ) {
    this.client = new Client(dbConfig)
    this.getConnection()
  }

  client: Client

  private async getConnection() {
    await this.client.connect()
  }

  // TODO:
  //  Implement `processTextFile(filePath, chunkSize, overlap, dimensions, truncateTable?)` that:
  //  - Validates chunkSize (≥ 10) and overlap (0 ≤ overlap < chunkSize)
  //  - Optionally truncates the `vectors` table
  //  - Reads the file, chunks the content with `chunkText()`, generates embeddings,
  //    and inserts each chunk + embedding into PostgreSQL
  //  Hint: embeddings must be saved as a string wrapped in `[...]` and cast to `::vector`
  //
  // ЛОГИКА:
  //   1. Валидируем параметры
  //   2. Очищаем таблицу (если нужно)
  //   3. Читаем файл → разбиваем на чанки → получаем embeddings → сохраняем в БД
  async processTextFile(
    filePath: string,
    chunkSize: number,
    overlap: number,
    dimensions: number,
    truncate = false
  ): Promise<void> {
    // Валидация параметров
    if (chunkSize < 10) {
      throw new Error(`chunkSize must be ≥ 10, got ${chunkSize}`)
    }
    if (overlap < 0 || overlap >= chunkSize) {
      throw new Error(`overlap must be 0 ≤ overlap < chunkSize, got ${overlap}`)
    }

    // Опционально очищаем таблицу перед загрузкой
    if (truncate) {
      await this.truncateTable()
    }

    // ШАГ 1: Читаем файл
    const text = fs.readFileSync(filePath, 'utf-8')
    const documentName = path.basename(filePath) // "microwave_manual.txt"
    console.log(`📄 Loaded file: ${documentName} (${text.length} characters)`)

    // ШАГ 2: Разбиваем на чанки
    // chunkText возвращает массив строк с перекрытием
    const chunks = chunkText(text, chunkSize, overlap)
    console.log(
      `✂️  Split into ${chunks.length} chunks (size=${chunkSize}, overlap=${overlap})`
    )

    // ШАГ 3: Получаем embeddings для всех чанков одним batch запросом
    // Передаём весь массив чанков — API обработает их все за один HTTP запрос
    console.log(`🔢 Generating embeddings for ${chunks.length} chunks...`)
    const embeddings = await this.embeddingClient.getEmbeddings(
      chunks,
      dimensions
    )

    // ШАГ 4: Сохраняем каждый чанк с его embedding в PostgreSQL
    console.log(`💾 Saving chunks to database...`)
    for (let i = 0; i < chunks.length; i++) {
      await this.saveChunk(documentName, chunks[i], embeddings[i])
    }

    console.log(`✅ Saved ${chunks.length} chunks to database`)
  }

  // Очищаем таблицу vectors — полезно при переиндексации
  // TRUNCATE быстрее чем DELETE FROM — сбрасывает всю таблицу мгновенно
  async truncateTable(): Promise<void> {
    await this.client.query('TRUNCATE TABLE vectors RESTART IDENTITY')
    console.log('🗑️  Table vectors truncated')
  }

  // Сохраняем один чанк текста с его embedding вектором в PostgreSQL
  //
  // ВАЖНО про формат вектора:
  //   PostgreSQL pgvector ожидает строку вида: '[0.196, -0.234, 0.543, ...]'
  //   Нельзя передать JavaScript массив напрямую — нужно преобразовать в строку
  //   и добавить ::vector приведение типа в SQL запросе
  private async saveChunk(
    documentName: string,
    text: string,
    embedding: number[]
  ): Promise<void> {
    // Конвертируем массив чисел в строку формата pgvector: [0.1, -0.2, 0.3, ...]
    const embeddingString = `[${embedding.join(',')}]`

    await this.client.query(
      `INSERT INTO vectors (document_name, text, embedding)
       VALUES ($1, $2, $3::vector)`,
      [documentName, text, embeddingString]
      //                    ↑
      //              ::vector — приводим строку к типу vector в PostgreSQL
    )
  }

  // TODO:
  //  Implement `search(searchMode, userRequest, topK, scoreThreshold, dimensions)` that:
  //  - Validates topK (≥ 1) and scoreThreshold (0 ≤ x ≤ 1)
  //  - Embeds the userRequest and searches the DB for similar vectors
  //  - Returns an array of matching text chunks ordered by descending similarity
  //  Hint 1: Euclidean distance `<->`, Cosine distance `<=>`
  //  Hint 2: Filter by distance in WHERE clause; ORDER BY distance LIMIT topK
  //
  // SELECT text, embedding <-> '[0.23, -0.45, ...]'::vector AS distance
  // FROM vectors
  // WHERE embedding <-> '[0.23, -0.45, ...]'::vector <= {maxDistance}
  // ORDER BY distance
  // LIMIT {topK};
  //
  // ЛОГИКА:
  //   1. Валидируем параметры
  //   2. Конвертируем вопрос в вектор через Embedding API
  //   3. Ищем в БД похожие векторы через pgvector оператор
  //   4. Возвращаем тексты найденных чанков
  async search(
    searchMode: SearchMode,
    userRequest: string,
    topK: number,
    scoreThreshold: number,
    dimensions: number
  ): Promise<string[]> {
    // Валидация параметров
    if (topK < 1) {
      throw new Error(`topK must be ≥ 1, got ${topK}`)
    }
    if (scoreThreshold < 0 || scoreThreshold > 1) {
      throw new Error(`scoreThreshold must be 0 ≤ x ≤ 1, got ${scoreThreshold}`)
    }

    // ШАГ 1: Конвертируем вопрос пользователя в вектор
    // Используем ту же модель что и при индексации! (критически важно)
    const embeddings = await this.embeddingClient.getEmbeddings(
      userRequest,
      dimensions,
      false
    )
    const queryVector = embeddings[0] // getEmbeddings возвращает { 0: [...] }
    const queryVectorString = `[${queryVector.join(',')}]`

    // ШАГ 2: Выбираем оператор в зависимости от метрики
    // <->  Euclidean distance: измеряет расстояние между точками
    // <=>  Cosine distance:    измеряет угол между векторами (1 - cosine_similarity)
    //
    // ВАЖНО: Cosine distance в pgvector = 1 - cosine_similarity
    //   cosine_similarity = 1.0 → cosine_distance = 0.0 (идентичны)
    //   cosine_similarity = 0.0 → cosine_distance = 1.0 (не связаны)
    //   Поэтому scoreThreshold работает одинаково для обоих операторов:
    //   чем МЕНЬШЕ distance → тем ПОХОЖЕЕ
    const operator = searchMode === SearchMode.COSINE_DISTANCE ? '<=>' : '<->'

    // ШАГ 3: Выполняем векторный поиск в PostgreSQL
    // Параметризированный запрос защищает от SQL injection
    // $1 используется дважды — PostgreSQL подставит одно и то же значение
    const result = await this.client.query<{ text: string; distance: number }>(
      `SELECT text, embedding ${operator} $1::vector AS distance
       FROM vectors
       WHERE embedding ${operator} $1::vector <= $2
       ORDER BY distance
       LIMIT $3`,
      [queryVectorString, scoreThreshold, topK]
    )

    // Логируем результаты для дебага
    console.log(
      `\n🔍 Search results (${searchMode}, topK=${topK}, threshold=${scoreThreshold}):`
    )
    for (const row of result.rows) {
      console.log(
        `  📊 Distance: ${Number(row.distance).toFixed(4)} | "${row.text.slice(0, 80)}..."`
      )
    }
    console.log(`✅ Found ${result.rows.length} relevant chunk(s)`)

    // Возвращаем только тексты чанков (без distance)
    // Порядок: от самого похожего к менее похожему (ORDER BY distance ASC)
    return result.rows.map(row => row.text)
  }
}
