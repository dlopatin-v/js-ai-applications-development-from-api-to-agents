import { OpenAI } from 'openai'

import { BaseOpenAiClient } from '../base'

import { Message, Role } from '../../../commons'

/**
 * Client for OpenAI Responses API using the official SDK.
 *
 * This implementation uses the official OpenAI library to interact with the
 * Responses API, which uses `instructions` instead of system messages and
 * `input` instead of messages.
 *
 * @property client The OpenAI SDK client instance.
 */
export class OpenAIResponsesClient extends BaseOpenAiClient {
  client!: OpenAI

  constructor(...args: ConstructorParameters<typeof BaseOpenAiClient>) {
    super(...args)
    //TODO:
    // - Initialize the OpenAI SDK client https://github.com/openai/openai-node
    // Note: `this.apiKey` already contains the 'Bearer ' prefix (added by BaseOpenAiClient).
    //       The OpenAI SDK adds its own 'Bearer ' prefix, so strip it first:
    //       `this.client = new OpenAI({ apiKey: this.apiKey.replace(/^Bearer /, '') })`

    // Инициализируем OpenAI SDK клиент.
    // this.apiKey уже содержит "Bearer " префикс (добавлен в BaseOpenAiClient),
    // но SDK сам добавляет "Bearer " — поэтому срезаем его, чтобы не было дублирования.
    this.client = new OpenAI({ apiKey: this.apiKey.replace(/^Bearer /, '') })
  }

  /**
   * Sends a non-streaming request to the OpenAI Responses API.
   *
   * @param messages Conversation history sent to the model.
   * @returns The AI response as a single message.
   */
  response = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // - Prepare input messages
    // - Call the SDK client (use instructions for system prompt)
    // - Print the response to console
    // - Return an ASSISTANT Message

    // Responses API использует "input" вместо "messages" и "instructions" вместо system message.
    // Формат input — массив объектов с role и content.
    const input = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))

    // Вызываем Responses API — instructions это system prompt
    const result = await this.client.responses.create({
      model: this.modelName,
      instructions: this.systemPrompt,
      input
    })

    // Извлекаем текст из output — ищем блок типа "message" с ролью assistant
    const text = result.output_text

    // Печатаем ответ в консоль
    console.log(text)

    // Возвращаем сообщение с ролью ASSISTANT
    return new Message(Role.ASSISTANT, text)
  }

  /**
   * Sends a streaming request to the OpenAI Responses API.
   *
   * The response is streamed using event-based streaming, with each delta
   * written to stdout immediately as it arrives.
   *
   * @param messages Conversation history sent to the model.
   * @returns The final aggregated AI message after the stream completes.
   */
  streamResponse = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // - Prepare input messages
    // - Call the SDK client with streaming enabled
    // - Listen for 'response.output_text.delta' events and write to stdout
    // - Return the assembled ASSISTANT Message

    // Подготавливаем input сообщения
    const input = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))

    // Вызываем Responses API со стримингом
    const stream = await this.client.responses.create({
      model: this.modelName,
      instructions: this.systemPrompt,
      input,
      stream: true
    })

    let fullText = ''

    // Слушаем события — 'response.output_text.delta' содержит кусочки текста
    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        const delta = event.delta
        process.stdout.write(delta)
        fullText += delta
      }
    }

    // Перевод строки после завершения стрима
    console.log()

    // Возвращаем собранное сообщение целиком
    return new Message(Role.ASSISTANT, fullText)
  }
}
