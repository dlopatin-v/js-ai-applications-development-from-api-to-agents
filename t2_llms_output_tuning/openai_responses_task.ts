import { OpenAIResponsesClient } from './_clients/openai_responses_client'
import { run } from './_main'

// Responses API differences from Chat Completions:
//  - "messages" -> "input", "system" message -> "instructions" param
//  - "max_tokens" -> "max_output_tokens"
//  - "response_format" -> "text" param with format object
//  - "stop" is not available in Responses API
//  - built-in conversation state via "store" + "previous_response_id"
//  - "truncation" strategy for long contexts

// TODO 1: temperature — controls randomness. Range: 0.0-2.0, default: 1.0
//  Query: "Give me a name for a coffee shop"
//  Try: temperature=0.0 vs temperature=2.0, compare outputs
//
// КАК РАБОТАЕТ: идентично Chat Completions — temperature управляет распределением
// вероятностей токенов. Разницы в поведении между API нет, только название API другое.
//
//   temperature=0.0 → детерминированный ответ, всегда один и тот же
//   temperature=2.0 → максимальная случайность, могут быть странные символы
//
// ОТЛИЧИЕ ОТ CHAT COMPLETIONS: параметр называется так же, но внутри клиента
// запрос идёт через SDK (this.client.responses.create), а не через сырой fetch.
//
// --- temperature=0.0 ---
// run(new OpenAIResponsesClient('gpt-5.2'), true, false, {
//   temperature: 0.0 // детерминированный режим — один и тот же ответ каждый раз
// })
//
// --- temperature=2.0 ---
// run(new OpenAIResponsesClient('gpt-5.2'), true, false, {
//   temperature: 2.0 // максимальная случайность
// })

// TODO 2: top_p — nucleus sampling. Range: 0.0-1.0, default: 1.0
//  Query: "List 5 alternative uses for a paperclip"
//  Try: top_p=0.1 vs top_p=0.9
//
// КАК РАБОТАЕТ: идентично Chat Completions — обрезает список кандидатов-токенов
// по накопленной вероятности. Поведение одинаковое в обоих API.
//
//   top_p=0.1 → только топ-10% самых вероятных токенов → предсказуемо, консервативно
//   top_p=0.9 → токены покрывающие 90% вероятности → разнообразно, креативно
//
// ⚠️ Не используй top_p и temperature одновременно — двойная фильтрация даёт
//    непредсказуемый результат.
//
// --- top_p=0.1 ---
// run(new OpenAIResponsesClient('gpt-5.2'), true, false, {
//   top_p: 0.1 // только самые очевидные токены — банальные но чёткие идеи
// })
//
// --- top_p=0.9 ---
// run(new OpenAIResponsesClient('gpt-5.2'), true, false, {
//   top_p: 0.9 // широкая выборка — нестандартные и креативные идеи
// })

// TODO 3: max_output_tokens — max tokens in response (was "max_tokens" in Chat Completions)
//  Query: "Explain quantum computing"
//  Try: max_output_tokens=50 vs max_output_tokens=2048
//
// КАК РАБОТАЕТ: жёстко обрезает ответ по достижении лимита токенов.
// Токен ≈ 0.75 слова (примерно 4 символа для английского текста).
//
// КЛЮЧЕВОЕ ОТЛИЧИЕ ОТ CHAT COMPLETIONS:
//   Chat Completions API → параметр называется "max_tokens"
//   Responses API        → параметр называется "max_output_tokens" ← новое название
//
// Если передать "max_tokens" в Responses API — параметр будет проигнорирован или
// вернёт ошибку! Всегда используй правильное название для каждого API.
//
// --- max_output_tokens=50: ответ обрежется на полуслове ---
// run(new OpenAIResponsesClient('gpt-5.2'), true, false, {
//   max_output_tokens: 50 // ~37 слов — квантовые вычисления за 50 токенов
// })
//
// --- max_output_tokens=2048: полный развёрнутый ответ ---
// run(new OpenAIResponsesClient('gpt-5.2'), true, false, {
//   max_output_tokens: 2048 // достаточно для подробного объяснения с примерами
// })

// TODO 4: text — structured output format (replaces "response_format" from Chat Completions)
//  Uses text={"format": {...}} instead of response_format={...}
//  Query: "List 3 programming languages with their year of creation"
//  Try: text={"format": {"type": "json_schema", "name": "languages", "strict": true, "schema": {"type": "object", "properties": {"languages": {"type": "array", "items": {"type": "object", "properties": {"name": {"type": "string"}, "year": {"type": "integer"}}, "required": ["name", "year"], "additionalProperties": false}}}, "required": ["languages"], "additionalProperties": false}}}
//
// КАК РАБОТАЕТ: принудительный структурированный JSON вывод. Концепция та же что
// и response_format в Chat Completions, но структура параметра другая:
//
// СРАВНЕНИЕ двух API:
//
//   Chat Completions:               Responses API:
//   response_format: {              text: {
//     type: "json_schema",            format: {
//     json_schema: {                    type: "json_schema",
//       name: "...",                    name: "...",
//       strict: true,                  strict: true,
//       schema: {...}                  schema: {...}
//     }                             }
//   }                             }
//                ↑                              ↑
//       два уровня вложенности        три уровня вложенности
//
// Модель обязана вернуть валидный JSON строго по схеме (Constrained Decoding).
// Идеально для парсинга ответа в коде без риска сломать JSON.parse().
//
// run(new OpenAIResponsesClient('gpt-5.2'), true, false, {
//   text: {
//     format: {
//       type: 'json_schema',
//       name: 'languages', // имя схемы для логов и дебага
//       strict: true, // строгий режим: никаких лишних полей!
//       schema: {
//         type: 'object',
//         properties: {
//           languages: {
//             type: 'array',
//             items: {
//               type: 'object',
//               properties: {
//                 name: { type: 'string' }, // название языка, например "Python"
//                 year: { type: 'integer' } // год создания, например 1991
//               },
//               required: ['name', 'year'],
//               additionalProperties: false // запрет лишних полей внутри объекта
//             }
//           }
//         },
//         required: ['languages'],
//         additionalProperties: false // запрет лишних полей в корне
//       }
//     }
//   }
// })

// TODO 5: truncation — controls how long contexts are handled. Default: "disabled"
//  "auto" = drops older input messages to fit context window
//  Try: truncation="auto"
//
// КАК РАБОТАЕТ: управляет поведением когда история диалога превышает контекстное окно модели.
//
//   truncation="disabled" → (по умолчанию) если контекст переполнен → API вернёт ошибку.
//                           Ты сам управляешь историей и должен её обрезать.
//
//   truncation="auto"     → API сам удаляет СТАРЫЕ сообщения из истории чтобы
//                           вместить новые. Удаляет с начала (самые старые первыми).
//
// ВАЖНО: это параметр ТОЛЬКО Responses API — в Chat Completions его нет!
// В Chat Completions ты должен был сам обрезать messages[] в коде.
//
// КОГДА ИСПОЛЬЗОВАТЬ:
//   truncation="disabled" → когда важна полная история (юридические документы, анализ)
//   truncation="auto"     → длинные чат-сессии где старый контекст менее важен
//
// run(new OpenAIResponsesClient('gpt-5.2'), true, false, {
//   truncation: 'auto' // API сам обрежет старые сообщения если контекст переполнен
// })

// TODO 6: metadata — attach key-value pairs to a response for tracking/filtering. Not available in Chat Completions
//  Up to 16 key-value pairs, keys up to 64 chars, values up to 512 chars
//  Try: metadata={"project": "demo", "user": "student-1"}
//
// КАК РАБОТАЕТ: позволяет прикрепить произвольные метаданные к ответу.
// Эти данные НИКАК не влияют на генерацию — они только сохраняются вместе с ответом
// на стороне OpenAI и доступны при просмотре логов через Dashboard или API.
//
// ВАЖНО: это параметр ТОЛЬКО Responses API — в Chat Completions его нет!
//
// ОГРАНИЧЕНИЯ:
//   - До 16 пар ключ-значение
//   - Ключ: максимум 64 символа
//   - Значение: максимум 512 символов
//
// ПРИМЕНЕНИЕ в продакшене:
//   metadata: {
//     user_id: "usr_123",          // для фильтрации по пользователю
//     session_id: "sess_abc",      // для группировки сообщений сессии
//     feature: "search",           // для аналитики по фичам
//     environment: "production",   // для разделения prod/staging
//   }
//
// run(new OpenAIResponsesClient('gpt-5.2'), false, false, {
//   metadata: {
//     project: 'demo', // название проекта для фильтрации в Dashboard
//     user: 'student-1' // идентификатор пользователя для аналитики
//   }
// })

// TODO 7: reasoning — extended thinking config (replaces "reasoning_effort" from Chat Completions)
//  ⚠️ Note: does NOT work with non-default temperature
//  Query: "How many r's are in the word strawberry?"
//  Try: reasoning={"effort": "high"} vs reasoning={"effort": "low"}
//
// КАК РАБОТАЕТ: управляет глубиной внутреннего "мышления" модели перед ответом.
// Концепция та же что reasoning_effort в Chat Completions, но синтаксис другой:
//
// СРАВНЕНИЕ двух API:
//   Chat Completions:               Responses API:
//   reasoning_effort: "high"   →   reasoning: { effort: "high" }
//
// Значения effort:
//   "low"    → минимум токенов на размышление → быстро и дёшево
//   "medium" → баланс скорости и качества
//   "high"   → максимум токенов на размышление → медленно но точнее
//
// На что смотреть в ответе — поле usage.output_tokens_details.reasoning_tokens:
//   effort="low"  → reasoning_tokens: ~50-200   ← мало думал
//   effort="high" → reasoning_tokens: ~500-2000 ← долго думал
//
// ⚠️ ВАЖНО: reasoning НЕ работает вместе с нестандартной temperature!
//    Если используешь reasoning → убери temperature или оставь temperature=1.0
//
// --- reasoning low: быстрый ответ ---
// run(
//   new OpenAIResponsesClient("gpt-5.2"),
//   true,
//   false,
//   {
//     reasoning: { effort: "low" }, // минимум "обдумывания" — быстро и дёшево
//     // ⚠️ temperature НЕ указываем
//   }
// );
//
// --- reasoning high: тщательный ответ ---
// run(
//   new OpenAIResponsesClient("gpt-5.2"),
//   true,
//   false,
//   {
//     reasoning: { effort: "high" }, // максимум "обдумывания" — точнее для сложных задач
//     // ⚠️ temperature НЕ указываем
//   }
// );

// =============================================================================
// АКТИВНЫЙ ЗАПУСК — раскомментируй нужный блок run() выше для тестирования
// конкретного TODO, или добавляй параметры прямо сюда для быстрых экспериментов
// =============================================================================
run(
  new OpenAIResponsesClient('gpt-5.2'),
  true, // true = показывать полный запрос в консоли (endpoint, headers, body)
  false // false = показывать полный JSON ответ; true = только текст ответа
  // Примеры параметров для быстрого теста:
  // { temperature: 0.0 }
  // { max_output_tokens: 50 }
  // { reasoning: { effort: "high" } }
  // { truncation: "auto" }
  // { metadata: { project: "demo", user: "student-1" } }
)
