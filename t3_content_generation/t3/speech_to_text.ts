import { OPENAI_HOST, OPENAI_API_KEY } from "../../commons";
import fs from "node:fs";
import path from "node:path";

// https://platform.openai.com/docs/guides/speech-to-text

// @TODO:
// You need to transcribe 'audio_sample.mp3':
//   - Create a client that will go to OpenAI transcriptions API
//   - Call API and provide file (pay attention that you work with 'multipart/form-data')
//   - Get response with transcription
// ---
// Hints:
//   - Use /v1/audio/transcriptions endpoint
//   - Use whisper-1 or gpt-4o-transcribe model
