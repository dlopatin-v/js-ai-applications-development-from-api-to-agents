import { BaseOpenAiClient } from '../base'

import { Message, Role } from '../../../commons'

/**
 * Custom HTTP client for OpenAI Responses API.
 *
 * This implementation uses raw fetch requests instead of the official SDK,
 * demonstrating how to interact with the Responses API directly and handle
 * its event-based Server-Sent Events (SSE) streaming format.
 */
export class CustomOpenAIResponsesClient extends BaseOpenAiClient {
  /**
   * Sends a non-streaming request using a raw HTTP POST to the Responses API.
   *
   * @param messages Conversation history sent to the model.
   * @returns The AI response as a single message.
   */
  response = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // https://platform.openai.com/docs/api-reference/responses/create
    // - Prepare headers with authorization and content type
    // - Prepare input messages (use instructions for system prompt)
    // - Execute POST request to the API
    // - Parse the response using this._extractOutputText(result)
    // - Print the response to console
    // - Return an ASSISTANT Message

    // Заголовки — Authorization уже содержит "Bearer <key>" (из BaseOpenAiClient)
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }

    // Тело запроса — Responses API использует "input" и "instructions"
    const body = {
      model: this.modelName,
      instructions: this.systemPrompt,
      input: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    }

    // Выполняем POST запрос к Responses API endpoint
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    // Парсим JSON ответ
    const result = (await response.json()) as Record<string, unknown>

    // Извлекаем текст из output через хелпер
    const text = this._extractOutputText(result)

    // Печатаем ответ в консоль
    console.log(text)

    // Возвращаем сообщение с ролью ASSISTANT
    return new Message(Role.ASSISTANT, text)
  }

  /**
   * Sends a streaming request using raw HTTP with event-based Server-Sent Events (SSE).
   *
   * The Responses API uses named events (e.g. `response.output_text.delta`) followed
   * by a data payload. Each delta is written to stdout immediately as it arrives.
   *
   * @param messages Conversation history sent to the model.
   * @returns The final aggregated AI message after the stream completes.
   */
  streamResponse = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // https://platform.openai.com/docs/api-reference/responses/create (Streaming tab)
    // - Prepare headers with authorization and content type
    // - Prepare input messages (use instructions for system prompt)
    // - Execute POST request with stream: true
    // - Read the SSE stream: track "event: " lines, parse "data: " for 'response.output_text.delta'
    // - Write delta chunks to stdout
    // - Return the assembled ASSISTANT Message

    const SSE_EVENT_PREFIX = 'event: '
    const SSE_DATA_PREFIX = 'data: '

    // Заголовки
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }

    // Тело запроса — добавляем stream: true
    const body = {
      model: this.modelName,
      instructions: this.systemPrompt,
      stream: true,
      input: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    }

    // Выполняем POST запрос
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    // Получаем ReadableStream из тела ответа
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    let fullText = ''
    let buffer = ''
    let currentEvent = ''

    // Читаем стрим чанками
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        // Запоминаем тип текущего события из строки "event: ..."
        if (line.startsWith(SSE_EVENT_PREFIX)) {
          currentEvent = line.slice(SSE_EVENT_PREFIX.length).trim()
          continue
        }

        // Обрабатываем строку "data: ..." только для нужного события
        if (line.startsWith(SSE_DATA_PREFIX)) {
          // Нас интересует только событие с текстовыми дельтами
          if (currentEvent === 'response.output_text.delta') {
            const data = line.slice(SSE_DATA_PREFIX.length)
            const parsed = JSON.parse(data)
            const delta = parsed.delta
            process.stdout.write(delta)
            fullText += delta
          }
        }
      }
    }

    // Перевод строки после завершения стрима
    console.log()

    // Возвращаем собранное сообщение целиком
    return new Message(Role.ASSISTANT, fullText)
  }

  /**
   * Extract text content from the Responses API output.
   *
   * @param data The JSON response data from the API.
   * @returns The extracted text content.
   */
  private _extractOutputText = (data: Record<string, unknown>): string => {
    //TODO:
    // - Iterate through data.output items
    // - For each item, check its content array
    // - Return the text of the first content part with type "output_text"
    // - Throw an error if not found

    // Структура ответа Responses API:
    // { output: [{ type: "message", content: [{ type: "output_text", text: "..." }] }] }
    const output = data.output as Array<{
      content?: Array<{ type: string; text?: string }>
    }>

    for (const item of output) {
      if (!item.content) continue
      for (const part of item.content) {
        if (part.type === 'output_text') {
          return part.text ?? ''
        }
      }
    }

    throw new Error('No output_text found in response')
  }
}
