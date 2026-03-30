# AI Guardrails

A hands-on security task where you will first act as an **attacker** trying to steal PII from an AI system,
then progressively harden that system using different guardrail techniques.

The scenario: a colleague directory assistant has access to a user profile with sensitive PII. Your job is to
break it — and then protect it.

> **Important:** Guardrails do not eliminate the possibility of being hacked. They raise the cost and difficulty
> of an attack and reduce the attack surface — but a determined attacker with enough creativity can often find
> a way through. The goal is to make your AI application significantly harder to exploit, not perfectly invulnerable.

**Run any file with:** `npm run ts <path/to/file.ts>`

## Learning Goals

- Understand real prompt injection attack vectors and why they work
- Craft and iteratively harden a system prompt as the first line of defense
- Experience the attacker's perspective before building defenses
- Implement input validation to block malicious prompts before they reach the LLM
- Implement output validation to catch PII leaks after the LLM responds
- Build real-time streaming filters for sensitive data redaction
- Understand the trade-offs and limitations of each guardrail layer

---

## Task 1: System Prompt Hardening [t1/prompt_injection.ts](t1/prompt_injection.ts)

A system prompt is the **first and most fundamental guardrail** in any AI application. Before adding any
technical layer (validators, filters, firewalls), you need a well-crafted system prompt that clearly defines
what the model is and is not allowed to do. Everything else builds on top of this foundation.

Open [t1/prompt_injection.ts](t1/prompt_injection.ts). The file contains a `SYSTEM_PROMPT` and a `PROFILE` with Amanda Grace Johnson's
sensitive data. Run the assistant.

**Part A — Attack.** Try to steal PII (credit card, SSN, address, bank account, etc.) from the profile.
Use the attacks from [prompt_injections.md](prompt_injections.md) as a starting point, then invent your own variants. Note which
attacks succeed and which fail.

**Part B — Defend.** Edit `SYSTEM_PROMPT` to make it harder to steal PII. Then go back to attacking your
own prompt. Iterate until you reach a point where most attacks from [prompt_injections.md](prompt_injections.md) and your own
variants consistently fail to extract sensitive data.

> A strong system prompt is necessary but not sufficient, which is exactly why the next tasks exist.

---

## Task 2: Input Validation Guardrail [t2/input_llm_based_validation.ts](t2/input_llm_based_validation.ts)

An LLM-based guardrail that inspects every user message **before** it reaches the assistant. Suspicious
inputs are blocked and never processed.

- A separate validation LLM call classifies the input as safe or malicious
- Uses structured output (`zodResponseFormat`) to return a `Validation` result with a `valid` flag and `description`
- Blocked inputs receive an immediate rejection without touching the assistant

**Task:** Repeat attacks from Task 1. Observe which are blocked. Try to craft inputs that slip past the
input validator while still tricking the assistant.

**Pros:** Stops most known attack patterns before they reach the LLM; easy to tune the validation prompt
**Cons:** Adds latency and cost; creative or indirect attacks may bypass it; false positives on legitimate queries

---

## Task 3: Output Validation Guardrail [t3/output_llm_based_validation.ts](t3/output_llm_based_validation.ts)

A guardrail that inspects the **assistant's response** for PII leaks after the LLM has already replied.
Operates in two modes controlled by the `softResponse` flag.

- Hard mode (`softResponse = false`): blocks the response entirely and appends a rejection to history
- Soft mode (`softResponse = true`): routes the leaking response through a PII-filtering LLM that redacts
  sensitive fields with placeholders (e.g. `[CREDIT CARD REDACTED]`) before showing it to the user

**Pros:** Catches leaks that bypassed input validation; soft mode preserves usefulness while redacting PII
**Cons:** Adds a second LLM call per response; clever obfuscation in the output may evade the validator

---

## Task 4: Streaming PII Guardrail [t4/streaming_pii_guardrail.ts](t4/streaming_pii_guardrail.ts)

A real-time filter that redacts PII **as tokens stream in**, without waiting for the full response.

- **`StreamingPIIGuardrail`** — regex-based: buffers incoming chunks and applies PII patterns (SSN, credit
  card, address, dates, CVV, etc.) before flushing safe content to the user
- Uses a sliding buffer with a safety margin to handle PII that may be split across chunk boundaries

**Pros:** Low latency — safe chunks are shown in real time; no extra LLM calls needed
**Cons:** Regex patterns require maintenance; PII split in unusual ways across chunks may slip through

---

**Congratulations! You've seen both sides — attacking and defending. Now you understand why security
is a layered problem: no single guardrail is enough, and each layer catches what the others miss!**
