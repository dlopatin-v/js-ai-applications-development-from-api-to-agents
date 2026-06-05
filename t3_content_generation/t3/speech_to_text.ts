import * as fs from 'node:fs'
import * as path from 'node:path'

import { OPENAI_HOST, OPENAI_API_KEY } from '../../commons'

// https://developers.openai.com/api/docs/guides/speech-to-text

//TODO:
// You need to transcribe 'audio_sample.mp3':
//   - Create a client that will go to OpenAI transcriptions API
//   - Call API and provide file (pay attention that you work with 'multipart/form-data')
//   - Get response with transcription
// ---
// Hints:
//   - Use /v1/audio/transcriptions endpoint
//   - Use whisper-1 or gpt-4o-transcribe model

// Типизация ответа от /v1/audio/transcriptions
// API возвращает просто объект с текстом транскрипции
interface TranscriptionResponse {
  text: string // расшифрованный текст из аудио
}

async function main() {
  // ШАГ 1: Читаем аудио файл как бинарные данные
  // audio_sample.mp3 лежит в той же папке t3/
  const audioPath = path.join(__dirname, 'audio_sample.mp3')
  const audioBuffer = fs.readFileSync(audioPath)

  // ШАГ 2: Создаём Blob из буфера
  // audio/mpeg — MIME тип для MP3 файлов
  // Поддерживаемые форматы: mp3, mp4, mpeg, mpga, m4a, wav, webm
  const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })

  // ШАГ 3: Собираем FormData
  // Так же как в image edits — файл нельзя передать через JSON,
  // только через multipart/form-data
  const formData = new FormData()
  formData.append('model', 'whisper-1') // модель транскрипции
  formData.append('file', audioBlob, 'audio_sample.mp3') // аудио файл
  // Опциональные параметры (раскомментируй для экспериментов):
  // formData.append("language", "en");       // язык аудио (ускоряет транскрипцию)
  // formData.append("response_format", "text");  // "json"(default), "text", "srt", "vtt"
  // formData.append("temperature", "0");     // 0 = детерминированный результат
  // formData.append("prompt", "...");        // подсказка модели о контексте аудио

  // ШАГ 4: Отправляем запрос
  // ⚠️ Content-Type НЕ указываем — fetch сам добавит boundary для multipart/form-data
  const response = await fetch(`${OPENAI_HOST}/v1/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: formData
  })

  if (response.status !== 200) {
    const error = await response.text()
    throw new Error(`HTTP ${response.status}: ${error}`)
  }

  // ШАГ 5: Получаем и печатаем транскрипцию
  const result = (await response.json()) as TranscriptionResponse
  console.log('📝 Transcription (whisper-1):')
  console.log(result.text)
}

main().catch(err => console.error('❌ Error:', err))
