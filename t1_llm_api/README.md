# Work with AI APIs

In this task, you will work with APIs from different AI vendors. The goal is to understand how to make calls to
different models, how to parse responses, how to work with streaming, and how these features work under the hood in the
libraries we commonly use.

---

## Prerequisites

**API Keys** to work with different models (you will need to pay ~5-10$ credits):

- **OpenAI API Key** (we will be primarily working with OpenAI
  models). [Generate it here](https://platform.openai.com/settings/organization/api-keys) and set up as environment
  variable with name `OPENAI_API_KEY`
- **Anthropic API Key** [Generate it here](https://platform.claude.com/settings/keys) and set up as environment variable
  with name `ANTHROPIC_API_KEY`
- **Gemini API Key** [Generate it here](https://aistudio.google.com/app/api-keys) and set up as environment variable
  with name `GEMINI_API_KEY`

---

## Task:

1. [Import](https://learning.postman.com/docs/getting-started/importing-and-exporting/importing-data) in
   Postman [collection](dial-ai-course.postman_collection.json). It will be quite useful for the further tasks. In the
   collection present OPENAI_API_KEY, ANTHROPIC_API_KEY and GEMINI_API_KEY environment
   variables, [here you can find how to configure environment in Portman](https://learning.postman.com/docs/sending-requests/variables/managing-environments)
2. Open [base_app.ts](base_app.ts) and implement it according TODO
3. Open [base_client.ts](base_client.ts) and review it — this is the abstract base class all AI clients extend

### OpenAI Chat Completions

4. Open [openai/base.ts](openai/base.ts) and implement TODO — validate `apiKey` and call super with Bearer-formatted key
5. Open [openai/completions/client.ts](openai/completions/client.ts) and implement all TODOs (SDK client)
6. Run [openai_chat_completions_app.ts](openai/completions/openai_chat_completions_app.ts) with `openAIClient` and test:
   ```bash
   npm run t1:openai-chat
   ```
7. Open [openai/completions/custom_client.ts](openai/completions/custom_client.ts) and implement all TODOs (raw HTTP client)
8. In [openai_chat_completions_app.ts](openai/completions/openai_chat_completions_app.ts) switch to `openAICustomClient` and test

### OpenAI Responses API

9. Open [openai/responses/client.ts](openai/responses/client.ts) and implement all TODOs (SDK client)
10. Run [openai_responses_app.ts](openai/responses/openai_responses_app.ts) with `openAIClient` and test:
    ```bash
    npm run t1:openai-responses
    ```
11. Open [openai/responses/custom_client.ts](openai/responses/custom_client.ts) and implement all TODOs (raw HTTP client)
12. In [openai_responses_app.ts](openai/responses/openai_responses_app.ts) switch to `openAICustomClient` and test

### Anthropic

13. Open [anthropic/client.ts](anthropic/client.ts) and implement all TODOs (SDK client)
14. Run [anthropic_app.ts](anthropic/anthropic_app.ts) with `anthropicClient` and test:
    ```bash
    npm run t1:anthropic
    ```
15. Open [anthropic/custom_client.ts](anthropic/custom_client.ts) and implement all TODOs (raw HTTP client)
16. In [anthropic_app.ts](anthropic/anthropic_app.ts) switch to `anthropicCustomClient` and test

### Gemini

17. Open [gemini/client.ts](gemini/client.ts) and implement all TODOs (SDK client)
18. Run [gemini_app.ts](gemini/gemini_app.ts) with `geminiClient` and test:
    ```bash
    npm run t1:gemini
    ```
19. Open [gemini/custom_client.ts](gemini/custom_client.ts) and implement all TODOs (raw HTTP client)
20. In [gemini_app.ts](gemini/gemini_app.ts) switch to `geminiCustomClient` and test

---

On top of that, you can explore Grok, DeepSeek, QWEN, LLAMA, and other OpenAI-compatible models using the OpenAI client
😵‍💫

**Congratulations 🎉 It wasn't easy, but now you know that AI APIs are not magic — they are plain REST (with SSE for
streaming)!**