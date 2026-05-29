import AIClient from '../base_client'

import { Message, Role } from '../../commons'

/**
 * Custom HTTP client for Google Gemini API.
 *
 * This implementation uses raw fetch requests instead of the official SDK,
 * demonstrating how to interact with Gemini's API directly and handle its
 * Server-Sent Events (SSE) streaming format.
 */
export class CustomGeminiAIClient extends AIClient {
  /**
   * Sends a non-streaming request using a raw HTTP POST to the Gemini API.
   *
   * The URL is constructed by appending `:generateContent` to the model endpoint.
   * Uses `x-goog-api-key` header for authentication.
   *
   * @param messages Conversation history sent to the model.
   * @returns The AI response as a single message.
   */
  response = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // https://ai.google.dev/gemini-api/docs/text-generation
    // - Prepare headers with api key and content type
    // - Convert messages using this._toGeminiContents(messages)
    // - Add System prompt
    // - Execute post request to AI API (use `fetch`)
    // - Parse response
    // - Print response to console
    // - Return ASSISTANT message

    // Заголовки — Gemini использует x-goog-api-key для авторизации
    const headers = {
      'Content-Type': 'application/json',
      'x-goog-api-key': this.apiKey
    }

    // Конвертируем сообщения в формат Gemini
    const contents = this._toGeminiContents(messages)

    // Тело запроса — systemInstruction передаётся отдельным полем
    const body = {
      contents,
      systemInstruction: {
        parts: [{ text: this.systemPrompt }]
      }
    }

    // URL: endpoint содержит базу с моделью, добавляем :generateContent
    const response = await fetch(
      `${this.endpoint}/${this.modelName}:generateContent`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      }
    )

    // Парсим JSON ответ
    const result = (await response.json()) as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>
    }

    // Извлекаем текст из первого кандидата
    const text = result.candidates[0].content.parts[0].text

    // Печатаем ответ в консоль
    console.log(text)

    // Возвращаем сообщение с ролью ASSISTANT
    return new Message(Role.ASSISTANT, text)
  }

  /**
   * Sends a streaming request using raw HTTP with Server-Sent Events (SSE).
   *
   * The URL is constructed with the `:streamGenerateContent?alt=sse` endpoint.
   * Each SSE chunk contains candidates with content parts that are written to
   * stdout immediately as they arrive.
   *
   * @param messages Conversation history sent to the model.
   * @returns The final aggregated AI message after the stream completes.
   */
  streamResponse = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // https://ai.google.dev/gemini-api/docs/text-generation
    // - Prepare headers with api key and content type
    // - Convert messages using this._toGeminiContents(messages)
    // - Add System prompt
    // - Execute post request to AI API (use `fetch`)
    // - Handle stream with chunks
    // - Parse response
    // - Print chunks to console
    // - Return ASSISTANT message

    const SSE_DATA_PREFIX = 'data: '

    // Заголовки
    const headers = {
      'Content-Type': 'application/json',
      'x-goog-api-key': this.apiKey
    }

    // Конвертируем сообщения
    const contents = this._toGeminiContents(messages)

    // Тело запроса
    const body = {
      contents,
      systemInstruction: {
        parts: [{ text: this.systemPrompt }]
      }
    }

    // URL: добавляем :streamGenerateContent?alt=sse для SSE стриминга
    const response = await fetch(
      `${this.endpoint}/${this.modelName}:streamGenerateContent?alt=sse`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      }
    )

    // Получаем ReadableStream из тела ответа
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    let fullText = ''
    let buffer = ''

    // Читаем стрим чанками
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith(SSE_DATA_PREFIX)) continue

        const data = line.slice(SSE_DATA_PREFIX.length)
        const parsed = JSON.parse(data) as {
          candidates: Array<{ content: { parts: Array<{ text: string }> } }>
        }

        // Каждый чанк содержит candidates[0].content.parts[0].text
        const delta = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
        process.stdout.write(delta)
        fullText += delta
      }
    }

    // Перевод строки после завершения стрима
    console.log()

    // Возвращаем собранное сообщение целиком
    return new Message(Role.ASSISTANT, fullText)
  }

  /**
   * Converts Message objects to Gemini's content dictionary format.
   *
   * @param messages Conversation messages to convert.
   * @returns Messages formatted as Gemini content objects.
   */
  private _toGeminiContents = (
    messages: Array<Message>
  ): Array<{ role: string; parts: Array<{ text: string }> }> => {
    //TODO:
    // - Map each message to an object with role and parts: [{text: message.content}]

    // Gemini использует роль "model" вместо "assistant"
    return messages.map(m => ({
      role: m.role === Role.ASSISTANT ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))
  }
}
