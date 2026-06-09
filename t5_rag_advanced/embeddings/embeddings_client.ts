import { OpenAI } from 'openai'

type EmbeddingList = Record<number, Array<number>>

// Типизация одного элемента из массива data в ответе API
interface EmbeddingItem {
  index: number // порядковый номер (соответствует индексу в inputs[])
  embedding: number[] // вектор из 384 чисел
  object: string // всегда "embedding" — маркер типа от OpenAI
}

// Типизация полного ответа от /v1/embeddings
interface EmbeddingResponse {
  data: EmbeddingItem[]
  model: string
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}

/**
 * Client для генерации текстовых эмбеддингов через OpenAI Embeddings API.
 * Делает сырой HTTP запрос и возвращает индексированный словарь векторов.
 */
export class EmbeddingsClient {
  constructor(
    public endpoint: string,
    public modelName: string,
    public apiKey: string
  ) {
    if (!apiKey) {
      throw new Error('API key cannot be null or empty')
    }

    this.apiKey = `Bearer ${apiKey}`
  }

  async getEmbeddings(
    inputs: string | string[],
    dimensions: number,
    printResponse = true
  ): Promise<EmbeddingList> {
    // TODO:
    //  Implement `getEmbeddings(inputs, dimensions, printResponse)` that:
    //  - Sends a POST request to the Embeddings API
    //  - Builds the request body with: input, model, dimensions
    //  - Returns an indexed map of embedding vectors: { 0: [...], 1: [...], ... }
    //
    // https://developers.openai.com/api/reference/resources/embeddings/methods/create
    //
    // Request example:
    //   POST https://api.openai.com/v1/embeddings
    //   { "input": "Your text", "model": "text-embedding-3-small", "dimensions": 384 }
    //
    // Response JSON:
    //   {
    //     "data": [
    //       { "embedding": [0.196, ...], "index": 0, "object": "embedding" }
    //     ], ...
    //   }

    // ШАГ 1: Отправляем POST запрос к Embeddings API
    // input может быть строкой (один текст) или массивом (batch из нескольких текстов)
    // Batch выгоднее — один запрос для N чанков вместо N запросов
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.apiKey
      },
      body: JSON.stringify({
        input: inputs, // строка или массив строк
        model: this.modelName, // например "text-embedding-3-small"
        dimensions // 384 для этого задания
      })
    })

    if (response.status !== 200) {
      const error = await response.text()
      throw new Error(`HTTP ${response.status}: ${error}`)
    }

    // ШАГ 2: Парсим ответ
    const result = (await response.json()) as EmbeddingResponse

    if (printResponse) {
      console.log(
        `✅ Got embeddings for ${result.data.length} input(s), dimensions: ${result.data[0]?.embedding.length}`
      )
    }

    // ШАГ 3: Конвертируем массив в индексированный словарь
    // API возвращает: [{ index: 0, embedding: [...] }, { index: 1, embedding: [...] }]
    // Нам нужно:      { 0: [...], 1: [...] }
    const embeddingList: EmbeddingList = {}

    for (const item of result.data) {
      embeddingList[item.index] = item.embedding
    }

    return embeddingList
  }
}
