import { ANTHROPIC_API_KEY, ANTHROPIC_ENDPOINT, DEFAULT_SYSTEM_PROMPT } from "../../commons";
import { start } from "../base_app";
import { AnthropicAIClient } from "./client";
import { CustomAnthropicAIClient } from "./custom_client";

const anthropicClient = new AnthropicAIClient(
  ANTHROPIC_ENDPOINT,
  'claude-sonnet-4-5',
  ANTHROPIC_API_KEY,
  DEFAULT_SYSTEM_PROMPT,
);

const anthropicCustomClient = new CustomAnthropicAIClient(
  ANTHROPIC_ENDPOINT,
  'claude-sonnet-4-5',
  ANTHROPIC_API_KEY,
  DEFAULT_SYSTEM_PROMPT,
);

start(true, anthropicClient);