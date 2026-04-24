import { OPENAI_API_KEY, OPENAI_HOST } from "../../commons";
import * as fs from "node:fs";
import * as path from "node:path";

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

// @TODO:
// You need to convert text to speech:
//   - Create a client that will go to OpenAI speech API
//   - Call API
//   - Get response and save as .mp3 file
// ---
// Hints:
//   - Use /v1/audio/speech endpoint
//   - Use gpt-4o-mini-tts model
