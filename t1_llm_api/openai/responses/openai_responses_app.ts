import { start } from "../../base_app";
import { OpenAIResponsesClient } from "./client";
import { CustomOpenAIResponsesClient } from "./custom_client";
import { DEFAULT_SYSTEM_PROMPT, OPENAI_API_KEY, OPENAI_RESPONSES_ENDPOINT } from "../../../commons/index.js";

const openAIClient = new OpenAIResponsesClient(
  OPENAI_RESPONSES_ENDPOINT,
  'gpt-5.2',
  OPENAI_API_KEY,
  DEFAULT_SYSTEM_PROMPT,
);

const openAICustomClient = new CustomOpenAIResponsesClient(
  OPENAI_RESPONSES_ENDPOINT,
  'gpt-5.2',
  OPENAI_API_KEY,
  DEFAULT_SYSTEM_PROMPT,
);

start(true, openAIClient);