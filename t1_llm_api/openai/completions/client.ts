import { OpenAI } from 'openai'

import { BaseOpenAiClient } from '../base'

import { Message, Role } from '../../../commons'
/**
 * Client for OpenAI Chat Completions API using the official SDK.
 */
export class OpenAIClient extends BaseOpenAiClient {
  client!: OpenAI

  constructor(...args: ConstructorParameters<typeof BaseOpenAiClient>) {
    super(...args)

    // TODO ✓ Инициализация SDK-клиента OpenAI
    // this.apiKey уже содержит "Bearer sk-xxx" (добавлено в BaseOpenAiClient),
    // но SDK сам добавляет "Bearer", поэтому срезаем префикс чтобы не было дублирования.
    this.client = new OpenAI({ apiKey: this.apiKey.replace(/^Bearer /, '') })
  }

  /**
   * Отправка НЕ-стримового запроса к Chat Completions API.
   */
  response = async (messages: Array<Message>): Promise<Message> => {
    // TODO ✓ Формируем массив сообщений для API.
    // Первым всегда идёт system prompt — инструкция модели, как себя вести.
    // Затем вся история диалога (user/assistant сообщения).
    const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.systemPrompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ]

    // TODO ✓ Вызываем API — метод create возвращает полный ответ целиком (не стрим).
    // modelName — какую модель использовать (gpt-4o, gpt-4o-mini и т.д.)
    const completion = await this.client.chat.completions.create({
      model: this.modelName,
      messages: chatMessages
    })

    // TODO ✓ Извлекаем текст ответа из структуры ответа API.
    // choices[0] — первый (и обычно единственный) вариант ответа.
    // message.content — сам текст, может быть null, поэтому фоллбэк на пустую строку.
    const content = completion.choices[0].message.content ?? ''

    // Печатаем ответ в консоль (base_app.ts уже напечатал "AI: " перед вызовом)
    process.stdout.write(content)

    // TODO ✓ Возвращаем Message с ролью ASSISTANT — он будет добавлен в историю диалога
    return new Message(Role.ASSISTANT, content)
  }

  /**
   * Отправка стримового запроса — токены приходят по одному в реальном времени.
   */
  streamResponse = async (messages: Array<Message>): Promise<Message> => {
    // TODO ✓ Формируем сообщения — точно так же как в response()
    const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.systemPrompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ]

    // TODO ✓ Вызываем API со stream: true.
    // Вместо полного ответа получаем асинхронный итератор чанков (кусочков).
    const stream = await this.client.chat.completions.create({
      model: this.modelName,
      messages: chatMessages,
      stream: true
    })

    // TODO ✓ Собираем полный ответ из чанков.
    // Каждый чанк содержит delta.content — один или несколько токенов.
    let fullContent = ''

    for await (const chunk of stream) {
      // delta — разница с предыдущим состоянием; content может быть undefined/null
      const token = chunk.choices[0]?.delta?.content ?? ''
      // Печатаем токен сразу — пользователь видит ответ "по мере генерации"
      process.stdout.write(token)
      // Накапливаем в строку для итогового Message
      fullContent += token
    }

    // TODO ✓ Возвращаем собранное сообщение целиком
    return new Message(Role.ASSISTANT, fullContent)
  }
}
