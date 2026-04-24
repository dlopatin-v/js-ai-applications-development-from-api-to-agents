# LLMs Output Tuning

In this task, you will experiment with output tuning parameters across different AI providers. The goal is to understand
how parameters like temperature, top_p, structured output, reasoning/thinking, and others affect model responses.

**Run from the repository root:**

| Task | Command |
|---|---|
| OpenAI Chat Completions | `npm run t2:openai-chat` |
| OpenAI Responses API | `npm run t2:openai-responses` |
| Anthropic | `npm run t2:anthropic` |
| Gemini | `npm run t2:gemini` |

---

### If the task in the main branch is hard for you, switch to the `main-detailed` branch

---

## Task

### 1. OpenAI Chat Completions
Open [openai_chat_completions_task.ts](openai_chat_completions_task.ts) and follow TODO 1–10:
- `n`, `temperature`, `top_p`, `max_tokens`, `stop`
- `response_format` (structured JSON output with `json_schema`)
- `frequency_penalty`, `presence_penalty`, `seed`
- `reasoning_effort` (extended thinking)

Parameters are passed as additional arguments to `run()`.

### 2. OpenAI Responses API
Open [openai_responses_task.ts](openai_responses_task.ts) and follow TODO 1–7.

Key differences from Chat Completions:
- `max_tokens` → `max_output_tokens`
- `response_format` → `text` with format object
- `reasoning_effort` → `reasoning={"effort": "..."}`
- New: `truncation`, `metadata`

Parameters are passed as additional arguments to `run()`.

### 3. Anthropic (Optional)
Open [anthropic_task.ts](anthropic_task.ts) and follow TODO 1–6:
- `temperature`, `top_p`, `top_k`, `stop_sequences`
- `output_config` (structured JSON output)
- `thinking` (extended thinking with budget)

Parameters are passed as additional arguments to `run()`.

### 4. Gemini (Optional)
Open [gemini_task.ts](gemini_task.ts) and follow TODO 1–6:
- `temperature`, `topP`, `topK`, `maxOutputTokens`
- `responseMimeType` + `responseSchema` (structured output)
- `thinkingConfig` (extended thinking with budget)

All parameters must be passed inside `generationConfig: {...}`.
