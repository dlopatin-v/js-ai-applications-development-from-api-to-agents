import { start } from "../../base_app";
import { OpenAIClient } from "./client";
import { CustomOpenAIClient } from "./custom_client";
import { OPENAI_API_KEY, OPENAI_CHAT_COMPLETIONS_ENDPOINT, DEFAULT_SYSTEM_PROMPT } from "../../../commons";

const openAIClient = new OpenAIClient(
  OPENAI_CHAT_COMPLETIONS_ENDPOINT,
  'gpt-5.2',
  OPENAI_API_KEY,
  DEFAULT_SYSTEM_PROMPT,
);

const openAICustomClient = new CustomOpenAIClient(
  OPENAI_CHAT_COMPLETIONS_ENDPOINT,
  'gpt-5.2',
  OPENAI_API_KEY,
  DEFAULT_SYSTEM_PROMPT,
);

start(true, openAICustomClient);