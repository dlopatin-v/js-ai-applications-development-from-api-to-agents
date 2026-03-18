import { OPENAI_API_KEY, OPENAI_HOST } from "../../commons";
import * as fs from "node:fs";
import * as path from "node:path";

// https://platform.openai.com/docs/guides/audio#add-audio-to-your-existing-application

// @TODO:
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
