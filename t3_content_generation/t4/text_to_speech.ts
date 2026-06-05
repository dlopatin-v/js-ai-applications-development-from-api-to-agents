import * as fs from 'node:fs'
import * as path from 'node:path'

import { OPENAI_API_KEY, OPENAI_HOST } from '../../commons'

enum Voice {
  ALLOY = 'alloy',
  ASH = 'ash',
  BALLAD = 'ballad',
  CORAL = 'coral',
  ECHO = 'echo',
  FABLE = 'fable',
  NOVA = 'nova',
  ONYX = 'onyx',
  SAGE = 'sage',
  SHIMMER = 'shimmer'
}

// https://developers.openai.com/api/docs/guides/text-to-speech
// Request:
// curl https://api.openai.com/v1/audio/speech \
//   -H "Authorization: Bearer $OPENAI_API_KEY" \
//   -H "Content-Type: application/json" \
//   -d '{
//     "model": "gpt-4o-mini-tts",
//     "input": "Why can'\''t we say that black is white?",
//     "voice": "coral",
//     "instructions": "Speak in a cheerful and positive tone."
//   }'
// Response:
//   bytes with audio

//TODO:
// You need to convert text to speech:
//   - Create a client that will go to OpenAI speech API
//   - Call API
//   - Get response and save as .mp3 file
// ---
// Hints:
//   - Use /v1/audio/speech endpoint
//   - Use gpt-4o-mini-tts model

// ВАЖНОЕ ОТЛИЧИЕ от Speech-to-Text:
// Speech-to-Text: файл → multipart/form-data → API → JSON с текстом
// Text-to-Speech: JSON с текстом → API → бинарные байты аудио (не JSON!)
// Ответ — это сырые байты MP3, их нельзя парсить как JSON — только сохранить в файл.

async function main() {
  // ШАГ 1: Отправляем JSON запрос к /v1/audio/speech
  // Этот эндпоинт принимает обычный JSON (не multipart/form-data)
  const response = await fetch(`${OPENAI_HOST}/v1/audio/speech`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json' // обычный JSON запрос
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts', // модель TTS от OpenAI
      input:
        "Why can't we say that black is white? " +
        'Because light and perception are deeply intertwined. ' +
        'White is what we see when all wavelengths of visible light reach our eyes together, ' +
        'and black is the absence of that light entirely!',
      voice: Voice.CORAL, // голос — попробуй разные из enum выше:
      // ALLOY — нейтральный
      // ASH   — спокойный
      // BALLAD — мягкий, певучий
      // CORAL  — дружелюбный, женский
      // ECHO   — мужской, чёткий
      // NOVA   — энергичный, женский
      // ONYX   — глубокий, мужской
      // SAGE   — мудрый, спокойный
      // SHIMMER — лёгкий, женский
      instructions: 'Speak in a cheerful and positive tone.' // стиль речи
      // Другие варианты для экспериментов:
      // "Speak slowly and clearly, like a teacher"
      // "Speak dramatically, like a movie trailer narrator"
      // "Speak in a calm, meditative tone"
      // Опциональные параметры:
      // response_format: "mp3",          // формат: "mp3"(default), "opus", "aac", "flac"
      // speed: 1.0,                      // скорость речи: 0.25 - 4.0 (default: 1.0)
    })
  })

  if (response.status !== 200) {
    const error = await response.text()
    throw new Error(`HTTP ${response.status}: ${error}`)
  }

  // ШАГ 2: Получаем бинарные данные аудио
  // response.arrayBuffer() читает тело ответа как бинарный буфер.
  // Это НЕ JSON — это сырые байты MP3 файла!
  // Нельзя делать response.json() — получишь ошибку парсинга.
  const audioBuffer = await response.arrayBuffer()

  // ШАГ 3: Конвертируем ArrayBuffer в Node.js Buffer и сохраняем
  // Buffer.from(arrayBuffer) — обёртка Node.js для работы с бинарными данными
  // fs.writeFileSync записывает бинарные данные напрямую в файл
  const outputPath = path.join(__dirname, 'output.mp3')
  fs.writeFileSync(outputPath, Buffer.from(audioBuffer))

  console.log(`✅ Audio saved to: ${outputPath}`)
  console.log(`🎵 Open the file to listen!`)
}

main().catch(err => console.error('❌ Error:', err))
