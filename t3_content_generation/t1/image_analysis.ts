import * as fs from 'node:fs'
import * as path from 'node:path'

import { OpenAIClientT3 } from '../_openai_client'

import { OPENAI_HOST } from '../../commons'

// https://platform.openai.com/docs/guides/vision?format=url
// https://platform.openai.com/docs/guides/vision?format=base64-encoded

//TODO:
// You need to analyse these 2 images:
//   - https://a-z-animals.com/media/2019/11/Elephant-male-1024x535.jpg
//   - in this folder we have 'logo.png', load it as encoded data (see documentation)
// ---
// Hints:
//   - Use OpenAIClientT3 to connect to OpenAI API
//   - Use /v1/chat/completions endpoint
//   - Function to encode image to base64 you can find in documentation
// ---
// In the end load both images (url and base64 encoded 'logo.png'), ask "Generate poem based on images" and see what will happen?

// ШАГ 1: Функция для кодирования локального файла в base64
// Зачем base64? API принимает только текст (JSON), а изображение — бинарные данные.
// Base64 превращает бинарные данные в текстовую строку которую можно вставить в JSON.
// Пример: бинарный файл 100KB → строка из символов A-Z, a-z, 0-9, +, / длиной ~133KB
function encodeImageToBase64(imagePath: string): string {
  // fs.readFileSync читает файл в бинарном виде (Buffer)
  // .toString("base64") конвертирует Buffer в base64 строку
  const imageBuffer = fs.readFileSync(imagePath)
  return imageBuffer.toString('base64')
}

// ШАГ 2: Определяем путь до локального файла logo.png
// __dirname — папка где находится текущий файл (t1/)
// path.join корректно собирает путь для любой ОС (Windows/Mac/Linux)
const logoPath = path.join(__dirname, 'logo.png')

// ШАГ 3: Кодируем logo.png в base64
const logoBase64 = encodeImageToBase64(logoPath)

// ШАГ 4: Создаём клиент с эндпоинтом Chat Completions
// Vision (анализ изображений) работает через обычный /v1/chat/completions —
// просто в message добавляются image_url объекты вместе с текстом
const client = new OpenAIClientT3(`${OPENAI_HOST}/v1/chat/completions`)

// ШАГ 5: Отправляем запрос
// В OpenAI Vision API контент сообщения — это массив объектов (а не просто строка).
// Каждый объект имеет type: "text" или type: "image_url"
client.call({
  model: 'gpt-4o', // gpt-4o умеет "видеть" изображения (multimodal модель)
  messages: [
    {
      role: 'user',
      content: [
        // --- Изображение 1: по URL ---
        // Модель сама скачивает изображение по URL во время обработки запроса.
        // Плюс: не нужно загружать файл, просто даёшь ссылку.
        // Минус: URL должен быть публично доступен (не требует авторизации).
        {
          type: 'image_url',
          image_url: {
            url: 'https://a-z-animals.com/media/2019/11/Elephant-male-1024x535.jpg'
            // detail: "low"  ← можно добавить для экономии токенов (менее детальный анализ)
            // detail: "high" ← максимальная детализация (больше токенов, дороже)
            // detail: "auto" ← модель сама решает (по умолчанию)
          }
        },

        // --- Изображение 2: base64 encoded (локальный файл) ---
        // Формат: "data:<mime_type>;base64,<base64_string>"
        // image/png — MIME тип для PNG файлов
        // Поддерживаемые форматы: image/png, image/jpeg, image/gif, image/webp
        // Плюс: работает с локальными файлами, не нужен публичный URL.
        // Минус: увеличивает размер запроса (~33% overhead от base64 кодирования).
        {
          type: 'image_url',
          image_url: {
            url: `data:image/png;base64,${logoBase64}` // data URL формат
          }
        },

        // --- Текстовый запрос ---
        // Идёт после изображений — просим написать стихотворение по обоим картинкам
        {
          type: 'text',
          text: 'Generate poem based on images'
        }
      ]
    }
  ],
  printRequest: true, // показываем запрос в консоли (увидишь огромную base64 строку!)
  printResponse: true // показываем полный JSON ответ
})
