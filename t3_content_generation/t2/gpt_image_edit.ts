import * as fs from 'node:fs'
import * as path from 'node:path'

import { OPENAI_HOST, OPENAI_API_KEY } from '../../commons'

// https://developers.openai.com/api/reference/resources/images/methods/edit

//TODO:
// You need to edit 'logo.png' by adding magical sparkles and a glowing aura:
//   - Create a client that will go to OpenAI image edits API
//   - Call API and provide the image file (pay attention that you work with 'multipart/form-data', NOT json)
//   - Get response with the edited image as base64
//   - Decode the base64 and save the edited image to disk
// ---
// Hints:
//   - Use /v1/images/edits endpoint
//   - Use gpt-image-1 model
//   - Request fields: model, image (file), prompt, and optionally n, size, quality
//   - Response shape: { created: number, data: [{ b64_json: string }] }
//   - Suggested prompt:
//       "Transform this DIALX Community logo by adding magical sparkles,
//        glowing stars, and a soft mystical aura around the letters.
//        Keep the original text and shape clearly readable."

// Типизация ответа от /v1/images/edits
// Структура идентична /v1/images/generations
interface ImageEditResponse {
  created: number
  data: { b64_json: string }[]
}

async function main() {
  // ШАГ 1: Читаем локальный файл logo.png как бинарные данные
  // __dirname — папка где лежит текущий файл (t2/)
  // logo.png находится в папке t1/ — поднимаемся на уровень выше
  const logoPath = path.join(__dirname, '../t1/logo.png')
  const imageBuffer = fs.readFileSync(logoPath)

  // ШАГ 2: Создаём Blob из буфера
  // Blob — бинарный объект, нужен для FormData.
  // type: "image/png" — указываем MIME тип чтобы сервер знал формат файла
  const imageBlob = new Blob([imageBuffer], { type: 'image/png' })

  // ШАГ 3: Собираем FormData
  // FormData — специальный объект для отправки файлов через HTTP.
  // В отличие от JSON, FormData умеет передавать бинарные данные (файлы).
  //
  // Структура multipart/form-data запроса выглядит так:
  // --boundary
  // Content-Disposition: form-data; name="model"
  // gpt-image-1
  // --boundary
  // Content-Disposition: form-data; name="image"; filename="logo.png"
  // Content-Type: image/png
  // <бинарные данные файла>
  // --boundary
  // Content-Disposition: form-data; name="prompt"
  // Transform this logo...
  // --boundary--
  const formData = new FormData()
  formData.append('model', 'gpt-image-1') // модель редактирования
  formData.append('image', imageBlob, 'logo.png') // файл изображения
  formData.append(
    'prompt',
    'Transform this DIALX Community logo by adding magical sparkles, ' +
      'glowing stars, and a soft mystical aura around the letters. ' +
      'Keep the original text and shape clearly readable.'
  )
  // Опциональные параметры:
  // formData.append("n", "1");              // количество вариантов
  // formData.append("size", "1024x1024");   // размер результата
  // formData.append("quality", "standard"); // качество: "standard" или "hd"

  // ШАГ 4: Отправляем запрос
  // ⚠️ ВАЖНО: НЕ указываем "Content-Type" в headers!
  // При использовании FormData браузер/Node.js сам выставит:
  // "Content-Type: multipart/form-data; boundary=----FormBoundaryXXXX"
  // Если указать вручную — boundary не будет и сервер не сможет распарсить тело.
  const response = await fetch(`${OPENAI_HOST}/v1/images/edits`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}` // только авторизация, без Content-Type!
    },
    body: formData
  })

  if (response.status !== 200) {
    const error = await response.text()
    throw new Error(`HTTP ${response.status}: ${error}`)
  }

  // ШАГ 5: Парсим ответ и извлекаем base64 изображение
  const result = (await response.json()) as ImageEditResponse
  const base64Image = result.data[0].b64_json

  // ШАГ 6: Декодируем base64 и сохраняем отредактированное изображение
  // Buffer.from(base64, "base64") — конвертирует base64 строку обратно в бинарные данные
  const outputPath = path.join(__dirname, 'logo_magical.png')
  fs.writeFileSync(outputPath, Buffer.from(base64Image, 'base64'))

  console.log(`✅ Edited image saved to: ${outputPath}`)
}

main()
