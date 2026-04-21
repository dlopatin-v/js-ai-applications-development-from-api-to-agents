import { DEFAULT_SYSTEM_PROMPT, GEMINI_ENDPOINT, GEMINI_API_KEY } from "commons";
import { start } from "../base_app";
import { GeminiAICLient } from "./client";
import { CustomGeminiAIClient } from "./custom_client";

const geminiClient = new GeminiAICLient(
  GEMINI_ENDPOINT,
  'gemini-3-flash-preview',
  GEMINI_API_KEY,
  DEFAULT_SYSTEM_PROMPT,
);

const geminiCustomClient = new CustomGeminiAIClient(
  GEMINI_ENDPOINT,
  'gemini-3-flash-preview',
  GEMINI_API_KEY,
  DEFAULT_SYSTEM_PROMPT,
);

start(false, geminiClient);