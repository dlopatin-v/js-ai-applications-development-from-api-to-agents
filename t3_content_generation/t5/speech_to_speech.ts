import * as fs from 'node:fs'
import * as path from 'node:path'

import { OPENAI_API_KEY, OPENAI_HOST } from '../../commons'

// https://developers.openai.com/api/docs/guides/audio#add-audio-to-your-existing-application

//TODO:
// You need to generate an answer in audio format based on an audio message:
//   - Create a client that extracts audio from the response (instead of text content)
//   - Call API
//   - Get response as base64 content, decode and save as .mp3 file
// ---
// Hints:
//   - Use /v1/chat/completions endpoint
//   - Use gpt-4o-audio-preview model
//   - Use modalities: ["text", "audio"]
//   - Use audio: { "voice": "ballad", "format": "mp3" }
//   - Use a similar method to encode audio as you have done for image encoding

// КАК РАБОТАЕТ Speech-to-Speech:
// В отличие от предыдущих заданий здесь используется /v1/chat/completions —
// тот же эндпоинт что и для текстового чата, но с аудио модальностью.
//
// Поток данных:
//   question.mp3 → base64 → JSON → gpt-4o-audio-preview → base64 аудио → mp3 файл
//
// Это принципиально отличается от:
//   Speech-to-Text: аудио → текст (whisper)
//   Text-to-Speech: текст → аудио (tts)
//   Speech-to-Speech: аудио → (модель понимает и думает) → аудио (один шаг!)

// Типизация ответа от /v1/chat/completions с audio модальностью
// Структура отличается от обычного текстового ответа —
// вместо message.content строки там объект с audio данными
interface AudioCompletionResponse {
  choices: {
    message: {
      content: string | null // текстовый ответ (тоже приходит при modalities: ["text", "audio"])
      audio: {
        id: string // уникальный ID аудио ответа
        data: string // base64 encoded MP3 аудио
        expires_at: number // unix timestamp истечения срока хранения
        transcript: string // текстовая расшифровка того что говорится в аудио
      }
    }
  }[]
}

async function main() {
  // ШАГ 1: Читаем аудио файл с вопросом и кодируем в base64
  // question.mp3 — аудио файл с вопросом который задаёт пользователь голосом
  // В отличие от Speech-to-Text (где файл шёл через multipart/form-data),
  // здесь аудио вставляется прямо в JSON как base64 строка
  const audioPath = path.join(__dirname, 'question.mp3')
  const audioBuffer = fs.readFileSync(audioPath)
  const audioBase64 = audioBuffer.toString('base64') // бинарные данные → base64 строка

  // ШАГ 2: Отправляем запрос к /v1/chat/completions
  // Используем тот же эндпоинт что и для текстового чата!
  // Ключевые отличия от обычного текстового запроса:
  //   1. model: "gpt-4o-audio-preview-2024-12-17" — специальная версия с поддержкой аудио
  //   2. modalities: ["text", "audio"] — просим вернуть и текст и аудио
  //   3. audio: { voice, format } — настройки голоса в ответе
  //   4. content — массив объектов с type: "input_audio" вместо строки
  const response = await fetch(`${OPENAI_HOST}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-audio-preview', // модель с поддержкой аудио ввода и вывода
      modalities: ['text', 'audio'], // указываем что хотим получить оба формата ответа:
      // "text" — текстовый ответ в message.content
      // "audio" — аудио ответ в message.audio.data
      audio: {
        voice: 'ballad', // голос для аудио ответа
        // доступны: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
        format: 'mp3' // формат аудио: "mp3", "opus", "aac", "flac", "wav", "pcm16"
      },
      messages: [
        {
          role: 'user',
          content: [
            // Аудио передаётся как элемент массива content с типом "input_audio"
            // Это аналогично тому как мы передавали изображения через "image_url"
            {
              type: 'input_audio', // тип контента — аудио ввод
              input_audio: {
                data: audioBase64, // base64 encoded аудио файл
                format: 'mp3' // формат входного файла
              }
            }
          ]
        }
      ]
    })
  })

  if (response.status !== 200) {
    const error = await response.text()
    throw new Error(`HTTP ${response.status}: ${error}`)
  }

  // ШАГ 3: Парсим ответ и извлекаем аудио данные
  const result = (await response.json()) as AudioCompletionResponse
  const audioMessage = result.choices[0].message.audio

  // Печатаем текстовую расшифровку — полезно для дебага
  console.log('📝 Transcript:', audioMessage.transcript)

  // ШАГ 4: Декодируем base64 аудио и сохраняем как MP3
  // Точно так же как декодировали изображения — Buffer.from(base64, "base64")
  const outputPath = path.join(__dirname, 'answer.mp3')
  fs.writeFileSync(outputPath, Buffer.from(audioMessage.data, 'base64'))

  console.log(`✅ Audio answer saved to: ${outputPath}`)
  console.log(`🎵 Open answer.mp3 to hear the response!`)
}

main().catch(err => console.error('❌ Error:', err))
