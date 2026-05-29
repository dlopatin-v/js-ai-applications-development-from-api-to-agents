import AIClient from '../base_client'

import { Message, Role } from '../../commons'

/**
 * Custom HTTP client for Anthropic's Claude API.
 *
 * This implementation uses raw HTTP requests instead of the official SDK,
 * demonstrating how to interact with Claude's API directly
 * and handle its Server-Sent Events (SSE) streaming format.
 */
export class CustomAnthropicAIClient extends AIClient {
  /**
   * Get a synchronous response using a raw HTTP POST request.
   *
   * @param messages The conversation history.
   * @returns The AI's response message.
   *
   * Note: Requires 'x-api-key' header and 'anthropic-version' header.
   * Claude's API returns content as an array of content blocks.
   * The response is printed to stdout before being returned.
   */
  response = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // https://docs.anthropic.com/en/api/messages-examples
    // - Prepare headers with x-api-key, anthropic-version, and content type
    // - Build request body with system prompt, messages, and max_tokens
    // - Execute POST request to the API (use fetch)
    // - Parse the response (content blocks)
    // - Print the response to console
    // - Return an ASSISTANT Message

    // Заголовки для Anthropic API:
    // - x-api-key: ключ авторизации (НЕ Bearer, как у OpenAI)
    // - anthropic-version: обязательный заголовок с версией API
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01'
    }

    // Тело запроса — system prompt отдельным полем, как и в SDK
    const body = {
      model: this.modelName,
      max_tokens: 1024,
      system: this.systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    }

    // Выполняем POST запрос к /v1/messages
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    // Парсим JSON ответ
    const result = (await response.json()) as {
      content: Array<{ type: string; text?: string }>
    }

    const textBlock = result.content.find(block => block.type === 'text')
    const text = textBlock?.text ?? ''

    // Печатаем ответ в консоль
    console.log(text)

    // Возвращаем сообщение с ролью ASSISTANT
    return new Message(Role.ASSISTANT, text)
  }

  /**
   * Get a streaming response using raw HTTP with Server-Sent Events (SSE).
   *
   * The response is streamed using Anthropic's SSE format, with text deltas
   * printed immediately as they arrive.
   *
   * @param messages The conversation history.
   * @returns The complete AI response message after all deltas are received.
   *
   * Note: Uses Server-Sent Events (SSE) format where each line starts with "data: ".
   * Listens for 'content_block_delta' events with 'text_delta' type.
   * Stops processing when 'message_stop' event is received.
   * Each delta is printed to stdout as it arrives.
   */
  streamResponse = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // https://docs.anthropic.com/en/docs/build-with-claude/streaming
    // - Prepare headers with x-api-key, anthropic-version, and content type
    // - Build request body with system prompt, messages, max_tokens, and stream: true
    // - Execute POST request to the API (use fetch)
    // - Read the SSE stream: parse "data: " lines for 'content_block_delta' events
    // - Write text deltas to stdout
    // - Break out of the loop on 'message_stop' event
    // - Return the assembled ASSISTANT Message
    const SSE_DATA_PREFIX = 'data: '
    // Те же заголовки что и для синхронного запроса
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01'
    }

    // Тело запроса — добавляем stream: true для включения SSE стриминга
    const body = {
      model: this.modelName,
      max_tokens: 1024,
      system: this.systemPrompt,
      stream: true,
      messages: messages.map(m => ({
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
    let stopped = false

    // Читаем стрим чанками
    while (!stopped) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith(SSE_DATA_PREFIX)) continue

        const data = line.slice(SSE_DATA_PREFIX.length)
        const event = JSON.parse(data)

        // Останавливаемся когда получили событие message_stop
        if (event.type === 'message_stop') {
          stopped = true
          break
        }

        // Ищем события content_block_delta с типом text_delta — это наши кусочки текста
        if (
          event.type === 'content_block_delta' &&
          event.delta?.type === 'text_delta'
        ) {
          const delta = event.delta.text
          process.stdout.write(delta)
          fullText += delta
        }
      }
    }

    // Перевод строки после завершения стрима
    console.log()

    // Возвращаем собранное сообщение целиком
    return new Message(Role.ASSISTANT, fullText)
  }
}
