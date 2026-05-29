import Anthropic from '@anthropic-ai/sdk'

import AIClient from '../base_client'

import { Message, Role } from '../../commons'

/**
 * Client for Anthropic's Claude API using the official SDK.
 *
 * This implementation uses the official Anthropic TypeScript library to interact
 * with Claude models, providing both synchronous and streaming response capabilities.
 *
 * Inherits all attributes from AIClient.
 */
export class AnthropicAIClient extends AIClient {
  client!: Anthropic

  /**
   * Initialize the Anthropic client with the official SDK.
   *
   * @param args Constructor parameters inherited from AIClient (endpoint, modelName, apiKey, systemPrompt).
   */
  constructor(...args: ConstructorParameters<typeof AIClient>) {
    super(...args)
    //TODO:
    // - Initialize the Anthropic SDK client https://github.com/anthropics/anthropic-sdk-typescript?tab=readme-ov-file#getting-started
    // Useful links with request/response samples:
    //   - https://docs.anthropic.com/en/api/overview
    //   - https://docs.anthropic.com/en/api/messages

    // Создаём экземпляр Anthropic SDK клиента.
    // apiKey — ключ авторизации, baseURL — endpoint (по умолчанию https://api.anthropic.com)
    this.client = new Anthropic({
      apiKey: this.apiKey,
      baseURL: new URL(this.endpoint).origin
    })
  }

  /**
   * Get a synchronous response from Anthropic's Claude API.
   *
   * @param messages The conversation history.
   * @returns The AI's response message.
   *
   * Note: Claude's API uses a separate 'system' parameter for system instructions.
   * Response content blocks are concatenated into a single text response.
   * The response is printed to stdout before being returned.
   */
  response = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // - Call the SDK client (use system parameter for system prompt)
    // - Print the response to console
    // - Return an ASSISTANT Message

    // Отправляем запрос к Claude API.
    // Важно: system prompt передаётся отдельным параметром "system",
    // а НЕ как сообщение с ролью "system" в массиве messages (отличие от OpenAI).
    const result = await this.client.messages.create({
      model: this.modelName,
      max_tokens: 1024,
      system: this.systemPrompt,
      // Маппим наши Message объекты в формат Anthropic API (role + content)
      messages: messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    })

    // В синхронном ответе всегда один текстовый блок — берём его напрямую
    const textBlock = result.content.find(block => block.type === 'text') as
      | Anthropic.TextBlock
      | undefined
    const text = textBlock?.text ?? ''
    // Печатаем ответ в консоль
    console.log(text)

    // Возвращаем сообщение с ролью ASSISTANT
    return new Message(Role.ASSISTANT, text)
  }

  /**
   * Get a streaming response from Anthropic's Claude API.
   *
   * The response is streamed using event-based streaming, with text deltas
   * printed immediately as they arrive.
   *
   * @param messages The conversation history.
   * @returns The complete AI response message after all deltas are received.
   *
   * Note: Listens for 'text' events with text deltas.
   * Each delta is printed to stdout as it arrives for real-time display.
   */
  streamResponse = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // - Call the SDK client with streaming (use system parameter for system prompt)
    // - Listen for text events and write to stdout
    // - Return the assembled ASSISTANT Message

    // Создаём стрим — используем .stream() вместо .create().
    // Параметры аналогичны обычному запросу, но ответ приходит частями (дельтами).
    const stream = this.client.messages.stream({
      model: this.modelName,
      max_tokens: 1024,
      system: this.systemPrompt,
      messages: messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    })

    // Переменная для сборки полного текста из дельт
    let fullText = ''

    // Подписываемся на событие "text" — каждый раз приходит кусочек текста (delta).
    // Сразу пишем его в stdout для real-time отображения (без перевода строки).
    stream.on('text', text => {
      process.stdout.write(text)
      fullText += text
    })

    // Ждём завершения стрима — finalMessage() резолвится когда все дельты получены
    await stream.finalMessage()

    // Перевод строки после завершения стрима
    console.log()

    // Возвращаем собранное сообщение целиком
    return new Message(Role.ASSISTANT, fullText)
  }
}
