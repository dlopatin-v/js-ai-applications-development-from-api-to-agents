import { BaseOpenAiClient } from '../base'

import { Message, Role } from '../../../commons'

/**
 * Custom HTTP client for OpenAI Chat Completions API.
 * Работаем через голый fetch — без SDK, чтобы видеть что происходит под капотом.
 */
export class CustomOpenAIClient extends BaseOpenAiClient {
  /**
   * НЕ-стримовый запрос через fetch.
   */
  response = async (messages: Array<Message>): Promise<Message> => {
    // TODO ✓ Заголовки запроса:
    // Authorization — наш Bearer-токен (уже с префиксом из BaseOpenAiClient)
    // Content-Type — говорим серверу что тело запроса в JSON
    const headers = {
      Authorization: this.apiKey,
      'Content-Type': 'application/json'
    }

    // TODO ✓ Тело запроса — формируем JSON по спецификации OpenAI API.
    // model — какую модель вызвать
    // messages — system prompt + история диалога
    const body = JSON.stringify({
      model: this.modelName,
      messages: [
        { role: 'system', content: this.systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ]
    })

    // TODO ✓ Отправляем POST-запрос к API.
    // this.endpoint — URL вида "https://api.openai.com/v1/chat/completions"
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body
    })

    // TODO ✓ Парсим JSON-ответ.
    // Структура: { choices: [{ message: { content: "..." } }] }
    const json = (await res.json()) as {
      choices: { message: { content: string } }[]
    }
    const content = json.choices[0].message.content ?? ''

    // Печатаем ответ (base_app уже вывел "AI: ")
    process.stdout.write(content)

    // TODO ✓ Возвращаем Message для сохранения в истории
    return new Message(Role.ASSISTANT, content)
  }

  /**
   * Стримовый запрос — читаем SSE вручную.
   */
  streamResponse = async (messages: Array<Message>): Promise<Message> => {
    // TODO ✓ Те же заголовки
    const headers = {
      Authorization: this.apiKey,
      'Content-Type': 'application/json'
    }

    // TODO ✓ Тело — то же самое, но добавляем stream: true
    // Это скажет серверу отвечать в формате SSE, а не одним JSON
    const body = JSON.stringify({
      model: this.modelName,
      messages: [
        { role: 'system', content: this.systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
      stream: true
    })

    // TODO ✓ Отправляем запрос
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body
    })

    // TODO ✓ Получаем readable stream из тела ответа.
    // response.body — это ReadableStream байтов, приходящих по мере генерации.
    const reader = res.body!.getReader()
    // TextDecoder — превращает байты (Uint8Array) в строку
    const decoder = new TextDecoder()

    let fullContent = ''
    // Буфер нужен потому что TCP может разрезать данные посередине строки.
    // Один chunk из reader может содержать половину SSE-сообщения.
    let buffer = ''

    // TODO ✓ Читаем поток порциями
    while (true) {
      // read() возвращает { value: Uint8Array, done: boolean }
      // done = true когда сервер закрыл соединение (FIN)
      const { value, done } = await reader.read()
      if (done) break

      // Добавляем полученные байты (декодированные в строку) в буфер
      buffer += decoder.decode(value, { stream: true })

      // TODO ✓ Разбиваем буфер по строкам.
      // SSE-формат: каждое сообщение оканчивается \n\n, внутри — "data: ..."
      const lines = buffer.split('\n\n')
      // Последний элемент может быть неполной строкой — оставляем в буфере
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        // Пропускаем пустые строки (разделители между SSE-сообщениями)
        if (!line.trim()) continue

        // TODO ✓ Проверяем маркер конца потока
        if (line === 'data: [DONE]') break

        // TODO ✓ Убираем префикс "data: " и парсим содержимое
        if (line.startsWith('data: ')) {
          const data = line.slice(6) // отрезаем "data: " (6 символов)
          const token = this._getContentSnippet(data)
          process.stdout.write(token)
          fullContent += token
        }
      }
    }

    // TODO ✓ Возвращаем собранное сообщение
    return new Message(Role.ASSISTANT, fullContent)
  }

  /**
   * Извлекает текст из одного SSE-чанка.
   */
  private _getContentSnippet = (data: string): string => {
    // TODO ✓ Парсим JSON-строку чанка.
    // Формат: {"choices":[{"delta":{"content":"текст"}}]}
    // delta.content может отсутствовать (например в первом чанке приходит только role)
    const parsed = JSON.parse(data)
    return parsed.choices[0]?.delta?.content ?? ''
  }
}
