import * as fs from 'fs'
import * as path from 'node:path'

import { OpenAIClientT3 } from '../_openai_client'

import { OPENAI_HOST } from '../../commons'

// https://developers.openai.com/api/reference/resources/images/methods/generate
// ---
// Request:
// curl -X POST "https://api.openai.com/v1/images/generations" \
//     -H "Authorization: Bearer $OPENAI_API_KEY" \
//     -H "Content-type: application/json" \
//     -d '{
//          "model": "gpt-image-2",
//          "prompt": "smiling catdog."
//     }'
// Response:
// {
//   "created": 1699900000,
//   "data": [
//   {
//     "b64_json": Qt0n6ArYAEABGOhEoYgVAJFdt8jM79uW2DO...,
//   }
// ]
// }

//TODO:
// You need to create some images with `gpt-image-2` model:
//   - Generate an image with 'Smiling catdog'
//   - Decode and save it locally
// ---
// Hints:
//   - Use OpenAIClientT3 to connect to OpenAI API
//   - Use /v1/images/generations endpoint
//   - The image will be returned in base64 format

// Типизация ответа от /v1/images/generations
// API возвращает массив data где каждый элемент содержит b64_json — base64 строку изображения
interface ImageGenerationResponse {
  created: number // unix timestamp когда было создано изображение
  data: { b64_json: string }[] // массив сгенерированных изображений в base64
}

// ШАГ 1: Создаём клиент с эндпоинтом для генерации изображений
// /v1/images/generations — отдельный эндпоинт, не chat/completions!
// Принимает prompt и возвращает сгенерированное изображение в base64.
const client = new OpenAIClientT3(`${OPENAI_HOST}/v1/images/generations`)

// Оборачиваем в async функцию — top-level await недоступен в CommonJS модулях.
// CommonJS (require/module.exports) vs ES Modules (import/export) —
// tsx использует CommonJS по умолчанию если в tsconfig нет "module": "ESNext"
async function main() {
  // ШАГ 2: Отправляем запрос на генерацию изображения
  const result = (await client.call({
    model: 'gpt-image-2', // модель генерации изображений от OpenAI
    prompt: 'Smiling catdog', // текстовое описание того что нужно нарисовать
    // Опциональные параметры (раскомментируй для экспериментов):
    // n: 1,                    // количество изображений (по умолчанию 1)
    // size: "1024x1024",       // размер: "256x256", "512x512", "1024x1024"
    // quality: "standard",     // качество: "standard" или "hd" (hd дороже)
    // b64_json — изображение сразу в base64 в ответе
    // url — временная ссылка (живёт ~1 час)
    printRequest: true,
    printResponse: false // false — не печатаем ответ (там огромная base64 строка!)
  })) as ImageGenerationResponse

  // ШАГ 3: Извлекаем base64 строку из ответа
  // Структура ответа: { "data": [ { "b64_json": "..." } ] }
  const base64Image = result.data[0].b64_json

  // ШАГ 4: Декодируем base64 и сохраняем как PNG файл
  // Buffer.from(base64String, "base64") — конвертирует base64 строку обратно в бинарные данные
  // fs.writeFileSync сохраняет бинарные данные в файл на диске
  const outputPath = path.join(__dirname, 'catdog.png')
  fs.writeFileSync(outputPath, Buffer.from(base64Image, 'base64'))

  console.log(`✅ Image saved to: ${outputPath}`)
}

main()
