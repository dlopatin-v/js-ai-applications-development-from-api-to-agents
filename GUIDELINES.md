# JS Course — Development Guidelines

> Conventions and patterns for authoring and extending the TypeScript/Node.js course materials.
> Read alongside `CONTEXT.md` and `RULES.md` at the workspace root.

---

## 1. Course Philosophy

This course is **API-first**. Students must understand the raw HTTP mechanics before using SDKs or frameworks. Every topic either exposes the wire protocol directly or builds on a previous topic's foundation. When adding new topics, always preserve this escalation: raw → SDK → framework → from scratch.

---

## 2. Project Layout

```
js-ai-applications-development-from-api-to-agents/
  package.json              ← single package for the whole repo
  commons/                  ← shared utilities (do not duplicate these)
  t1_llm_api/
  t2_llms_output_tuning/
  t3_content_generation/
  t4_rag_fundamentals/
  t5_rag_advanced/
  t6_grounding/
  ...
```

Each topic lives in its own `tN_<slug>/` directory. Sub-tasks inside a topic use numbered sub-directories (`t1/`, `t2/`, …).

---

## 3. Running Files

```bash
npm run ts <path/to/file.ts>
```

`tsx` is the TypeScript executor — no compilation step needed. There is no separate `tsconfig.json`; `tsx` handles this transparently.

---

## 4. Environment Variables

Never commit API keys. All secrets are exported as OS-level environment variables:

| Variable | Provider |
|---|---|
| `OPENAI_API_KEY` | OpenAI (all topics) |
| `ANTHROPIC_API_KEY` | Anthropic |
| `GEMINI_API_KEY` | Google Gemini |

Access them via `process.env.<VAR>` — see `commons/constants.ts` for the canonical import point.

---

## 5. `commons/` — Shared Utilities

Import shared utilities from `commons/index.ts`. Never copy-paste these into topic directories.

| Export | Purpose |
|---|---|
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` | API keys from env |
| `OPENAI_CHAT_COMPLETIONS_ENDPOINT`, `OPENAI_RESPONSES_ENDPOINT`, `OPENAI_EMBEDDINGS_ENDPOINT` | OpenAI base URLs |
| `ANTHROPIC_ENDPOINT` | Anthropic messages URL |
| `GEMINI_ENDPOINT` | Gemini base URL |
| `USER_SERVICE_ENDPOINT` | `http://localhost:8041` |
| `DEFAULT_SYSTEM_PROMPT` | Default assistant system prompt |
| `Role` (enum) | `SYSTEM`, `USER`, `ASSISTANT`, `TOOL` |
| `Message` (class) | `role`, `content`, optional `toolCallId`, `name`, `toolCalls` |
| `Conversation` (class) | `id` (UUID v4), `messages[]`, `addMessage()` |
| `UserServiceClient` | HTTP client for the mock User Service |
| `UserInfo`, `UserCreate`, `UserUpdate`, `UserSearchRequest` | User service types |

> **Exception:** Topics that explicitly teach a concept from scratch (e.g., t3 sub-topics, t5 `ChatCompletionClient`) may define their own inline clients. Inline clients should be self-contained within that file.

---

## 6. Client Architecture

### t1 Pattern — Dual Implementation (SDK + Raw HTTP)

Every AI provider must have **two client files**:

| File | Class | Approach |
|---|---|---|
| `client.ts` | `<Provider>Client` | Uses the official SDK |
| `custom_client.ts` | `Custom<Provider>Client` | Raw `fetch` only, no SDK |

Both extend the base client (`base_client.ts`) which declares:
- `response(messages): Promise<Message>` — full response
- `streamResponse(messages): Promise<Message>` — SSE streaming, writes to `process.stdout`

Base constructor parameters: `endpoint`, `modelName`, `apiKey`, `systemPrompt`.

**OpenAI specifics:** Wrap the API key as `Bearer ${apiKey}` in a `BaseOpenAiClient` subclass.

**Anthropic specifics:** Header is `x-api-key: <raw key>` + `anthropic-version: 2023-06-01`.

**Gemini specifics:** Header is `x-goog-api-key: <raw key>`. URL pattern: `${endpoint}/${modelName}:generateContent`.

### t2 Pattern — Parameter Tuning Clients

Extended base adds `printRequest`, `printOnlyContent`, and an optional `args?: any` parameter:

```typescript
response(messages, printRequest, printOnlyContent, args?): Promise<Message>
```

`args` is spread directly into the request body (`{ ...requestData, ...(args || {}) }`). This lets students pass any provider-specific parameter without changing the client.

- **OpenAI Chat Completions:** `args` spreads at top level
- **OpenAI Responses API:** `args` spreads at top level alongside `input`
- **Anthropic:** `args?.["max_tokens"] || 1024` default; rest of `args` spread at top level
- **Gemini:** `args?.["generationConfig"]` and `args?.["safetySettings"]` with fallbacks

`_printRequest()` must redact the API key (show only first 8 + last 4 characters).

### t3 Pattern — Standalone Inline Clients

Multimodal sub-topics use self-contained inline classes in each file. The shared `_openai_client.ts` covers sub-topics 1–2 (image-based). Sub-topics 3–5 (audio) each define their own inline `OpenAIClient` because the transport or response shape differs significantly.

---

## 7. Streaming (SSE) Implementation

### OpenAI Chat Completions SSE

```
data: {"choices":[{"delta":{"content":"token"}}]}
data: [DONE]
```

Parse each line, skip non-`data: ` lines, skip `[DONE]`, extract `choices[0].delta.content`.

### OpenAI Responses API SSE

Two-line format per event:
```
event: response.output_text.delta
data: {"delta":"token"}
```
Track the current event type and only process `response.output_text.delta` events.

### Anthropic SSE

```
event: content_block_delta
data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"token"}}
```
Filter for `type === 'content_block_delta'` and `delta.type === 'text_delta'`. Break on `type === 'message_stop'`.

### Gemini SSE

```
data: {"candidates":[{"content":{"parts":[{"text":"token"}]}}]}
```
Append URL parameter `?alt=sse`. Parse `candidates[0].content.parts[].text`.

---

## 8. Message Conversion

When building request bodies, convert the internal `Message[]` to provider-specific shapes:

| Provider | Role mapping | System prompt location |
|---|---|---|
| OpenAI Chat Completions | `role` maps 1:1 | Prepend `{ role: "system", content: systemPrompt }` to messages array |
| OpenAI Responses API | Use `input` field | `instructions` field |
| Anthropic | Filter out system messages from array | `system` top-level field |
| Gemini | `user`/`model` roles (not `assistant`) | `system_instruction: { parts: [{ text }] }` |

For Gemini, filter out `Role.SYSTEM` messages when converting, and map `Role.ASSISTANT` → `"model"`.

---

## 9. Topic Entry Points

| Type | Entry point | How to run |
|---|---|---|
| Conversation loop | `<topic>_app.ts` or `app.ts` | `npm run ts <file>` |
| Task / experiment | `<provider>_task.ts` | `npm run ts <file>` |
| Sub-topic | `tN/<name>.ts` | `npm run ts <file>` |

Multi-topic folders use `_main.ts` as the shared runner (see t2).

---

## 10. TODO Conventions

Student task comments follow this exact format:

```typescript
// TODO: <task description>
// 1. Step one
// 2. Step two
```

Or for inline action items inside existing code:

```typescript
// @TODO <brief note>
```

**Rules for TODOs:**
- `main` branch: high-level task description only (1–3 lines)
- `main-detailed` branch: full step-by-step instructions
- `completed` branch: no TODOs — fully implemented code
- Never remove or reword TODOs on `main` or `main-detailed`
- `@TODO` items on `completed` must be surfaced to a human for review

---

## 11. Adding a New Topic

Follow this checklist when creating a new topic (e.g., t7, t8, …):

1. **Mirror the Python topic** in structure and learning goal. Adapt to TypeScript idioms but keep the same concept flow.
2. **Create `tN_<slug>/`** at the repo root.
3. **Create a `README.md`** in the topic folder describing: goal, subtasks, required Docker services, how to run.
4. **Use `commons/`** for shared constants, models, and user service client.
5. **Follow the client pattern** appropriate to the topic (see Section 6).
6. **Student files** (task files) contain only TODO comments and imports — no implementation.
7. **`completed` branch** has full implementations; `main` has high-level TODOs; `main-detailed` has step-by-step TODOs.
8. **Apply changes to all three branches** (`completed`, `main`, `main-detailed`) consistently.
9. **Add Docker Compose** if the topic requires external services. Follow the pattern in t5 or t6.
10. **Update `CONTEXT.md`** at the workspace root with the new topic's details.

---

## 12. TypeScript Conventions

- **No `any` except in `args?` parameters** of t2-style tuning clients where deliberate flexibility is required.
- **Classes over plain objects** for clients and data models with behaviour.
- **`type` aliases over `interface`** for plain data shapes (see `UserInfo`, `UserCreate`).
- **`enum` for fixed string sets** (`Role`, `Voice`, `SearchMode`, `Size`, `Style`, `Quality`).
- **`async/await`** everywhere — no raw `.then()` chains.
- **`readonly ready: Promise<void>`** for async initialization in classes (see `MicrowaveRAG` in t4).
- **`export default`** for singleton instances (e.g., `UserServiceClient`); **named exports** for everything else.
- **`process.stdout.write()`** for streaming output to avoid newlines between tokens; `console.log()` for structured logs.

---

## 13. Docker Services

Spin up required services with `docker-compose up` from the topic directory.

| Topic | Services | Ports |
|---|---|---|
| t5 | `ankane/pgvector` + `ollama/ollama` + `ollama-init` | 5433, 11434 |
| t6, t8, t9, t10 | `khshanovskyi/mockuserservice` | 8041 |
| t11 | `khshanovskyi/mockuserservice` + `quay.io/keycloak/keycloak:26.3` | 8041, 8089 |
| t12 | `khshanovskyi/python-code-interpreter-mcp-server` | 8050 |

Mock User Service Swagger UI: `http://localhost:8041/docs`

---

## 14. pgvector / t5 Specifics

- Vector dimensions: **384** (matches `nomic-embed-text` and `text-embedding-3-small` with `dimensions: 384`)
- Distance operators: `<->` for Euclidean, `<=>` for cosine
- `SearchMode.EUCLIDIAN_DISTANCE` → threshold to `maxDistance` conversion: `(1 / threshold) - 1`
- `SearchMode.COSINE_DISTANCE` → threshold to `maxDistance` conversion: `1.0 - threshold`
- Intentional breakage experiments (dimension mismatch, model mismatch) are learning exercises — keep them

---

## 15. RAG Score Conventions

| Library | Return type | Similarity direction |
|---|---|---|
| Python LangChain FAISS | Normalised relevance score (0–1) | Higher = more similar |
| JS LangChain FAISS (`similaritySearchWithScore`) | Raw L2 distance | **Lower = more similar** |
| pgvector Euclidean (`<->`) | Raw L2 distance | Lower = more similar |
| pgvector Cosine (`<=>`) | Cosine distance (0–2) | Lower = more similar |

Always document the score direction in comments when implementing retrieval.

---

## 16. Grounding Pattern (t6)

Three strategies in escalating efficiency:

| Sub-topic | Strategy | Approach |
|---|---|---|
| t1 | No grounding | Load all users → parallel batch LLM calls → combine |
| t2a | Input API-based | LLM extracts search params → targeted API call |
| t2b | Input vector-based | Embed query → FAISS semantic user search |
| t3 | Input-Output grounding | Vector search → structured LLM output → live API fetch |

The `no_grounding.ts` reference in t1 shows the `TokenTracker` pattern for measuring cost of the brute-force approach — reference this when implementing t2/t3 to demonstrate the efficiency gain.
