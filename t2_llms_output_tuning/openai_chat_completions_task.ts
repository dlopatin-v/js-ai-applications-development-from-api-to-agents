import { OpenAIClient } from './_clients/openai_chat_completions_client'
import { run } from './_main'

// TODO 1: n — number of completions to generate per request. Default: 1
//  ⚠️ Note: NOT available in Responses API
//  Query: "Give me a name for a coffee shop"
//  Try: n=3 — returns 3 different completions in choices[]
//
// КАК РАБОТАЕТ: модель генерирует N независимых ответов на один и тот же prompt.
// Результат приходит в массиве choices[], каждый элемент — отдельный вариант.
//
// Пример ответа от API:
// {
//   "choices": [
//     { "message": { "content": "Brew & Bean" } },    ← вариант 1
//     { "message": { "content": "Morning Sip" } },    ← вариант 2
//     { "message": { "content": "The Daily Grind" } } ← вариант 3
//   ]
// }
//
// ПРИМЕНЕНИЕ: генерация нескольких вариантов названий, слоганов, идей —
// чтобы выбрать лучший без нескольких отдельных HTTP-запросов.
//
// run(new OpenAIClient('gpt-5.2'), true, false, {
//   n: 3 // запрашиваем 3 разных варианта за один запрос
// })

// TODO 2: temperature — controls randomness. Range: 0.0-2.0, default: 1.0
//  Lower = more deterministic, higher = more creative
//  Query: "Why white is white?"
//  Try: temperature=0.0 vs temperature=2.0, compare outputs
//  ⚠️ Note: it is okay that after temperature=1.5 you get some odd characters in output 😅
//
// КАК РАБОТАЕТ: temperature влияет на распределение вероятностей токенов.
//   temperature=0.0 → модель ВСЕГДА выбирает токен с максимальной вероятностью
//                     (greedy decoding). Детерминированный, предсказуемый ответ.
//   temperature=1.0 → поведение по умолчанию, сбалансированная случайность.
//   temperature=2.0 → сильно "размывает" распределение, все токены почти равновероятны.
//                     Ответы становятся хаотичными, могут появляться странные символы.
//
// МАТЕМАТИКА: P(token) = softmax(logits / temperature)
//   При T→0: победитель забирает всё (argmax) — один и тот же ответ каждый раз.
//   При T→∞: равномерное распределение по всем токенам — полный хаос.
//
// --- temperature=0.0: строгий, академичный, повторяемый ответ ---
// run(new OpenAIClient('gpt-5.2'), true, true, {
//   temperature: 2.0 // почти детерминированный режим — один и тот же ответ каждый раз
// })
//
// --- temperature=2.0: хаотичный, могут появляться странные обороты и символы ---
// run(
//   new OpenAIClient("gpt-5.2"),
//   true,
//   false,
//   {
//     temperature: 2.0, // максимальная случайность — ответы каждый раз разные
//   }
// );

// TODO 3: top_p — nucleus sampling, keeps tokens within cumulative probability. Range: 0.0-1.0, default: 1.0
//  Lower = fewer token choices, more focused output
//  Query: "List 5 alternative uses for a paperclip"
//  Try: top_p=0.1 vs top_p=0.9
//
// КАК РАБОТАЕТ: вместо изменения вероятностей (как temperature), top_p ОБРЕЗАЕТ
// список кандидатов. Модель берёт минимальное подмножество токенов, чья суммарная
// вероятность >= top_p, и выбирает только из них.
//
//   top_p=0.1 → берём только топ-10% самых вероятных токенов.
//               Ответы очень фокусированные, предсказуемые, консервативные.
//   top_p=0.9 → берём токены, покрывающие 90% вероятности.
//               Ответы разнообразные, но без совсем случайных токенов.
//   top_p=1.0 → все токены участвуют в выборке (поведение по умолчанию).
//
// ⚠️ Рекомендация: используй либо temperature, либо top_p, но не оба сразу.
//    Их одновременное использование — "двойная фильтрация", результат непредсказуем.
//
// --- top_p=0.1: очень предсказуемые, "безопасные" идеи ---
// run(new OpenAIClient('gpt-5.2'), true, true, {
//   top_p: 0.1 // только самые очевидные токены — ответ будет банальным, но чётким
// })
//
// --- top_p=0.9: разнообразные, нестандартные идеи ---
// run(
//   new OpenAIClient("gpt-5.2"),
//   true,
//   false,
//   {
//     top_p: 0.9, // широкая выборка — ответ креативнее и неожиданнее
//   }
// );

// TODO 4: max_tokens — max number of tokens in the response. Default: model-dependent
//  ⚠️ Note: Will work for models like gpt-4o. For gpt-5+ - `max_completion_tokens`.
//  Query: "Explain quantum computing"
//  Try: max_tokens=50 vs max_tokens=2048
//
// КАК РАБОТАЕТ: жёстко обрезает ответ по достижении лимита.
// Токен ≈ 0.75 слова (примерно 4 символа для английского текста).
// Примеры: "quantum" = 1 токен, "Hello, world!" ≈ 4 токена.
//
//   max_tokens=50   → очень короткий ответ (~37 слов), ответ обрежется на полуслове.
//   max_tokens=2048 → длинный развёрнутый ответ (несколько абзацев с примерами).
//
// КОГДА ИСПОЛЬЗОВАТЬ: контроль затрат (каждый токен = деньги),
// форматирование вывода, защита от "бесконечных" ответов.
//
// --- max_tokens=50: ответ будет ОБРЕЗАН посередине предложения ---
// run(new OpenAIClient('gpt-5.2'), true, false, {
//   max_completion_tokens: 50 // ~37 слов — квантовые вычисления за 50 токенов, обрежется
// })
//
// --- max_tokens=2048: полный развёрнутый ответ ---
// run(new OpenAIClient('gpt-5.2'), true, false, {
//   max_completion_tokens: 2048 // достаточно для подробного объяснения с примерами
// })

// TODO 5: stop — list of strings (up to 4) that stop generation when encountered
//  ⚠️ Note: Will work for models like gpt-4o
//  Query: "Count from 1 to 20, comma separated"
//  Try: stop=["5"] — generation stops before reaching 5
//
// КАК РАБОТАЕТ: как только модель генерирует один из указанных токенов/строк,
// генерация НЕМЕДЛЕННО останавливается. Сама стоп-строка в ответ НЕ включается.
//
// Пример:
//   Query: "Count from 1 to 20, comma separated"
//   stop=["5"]
//   Ответ: "1, 2, 3, 4, " ← остановился ПЕРЕД "5", пятёрки в ответе нет
//
// ПРИМЕНЕНИЕ:
//   - Остановить генерацию кода на определённой строке: stop=["```"]
//   - Ограничить диалог до первого ответа ассистента: stop=["\nUser:"]
//   - Контролировать формат вывода списков и перечислений
//
// run(new OpenAIClient('gpt-4o'), true, false, {
//   stop: ['5'] // остановит генерацию как только модель "захочет" написать "5"
// })

// TODO 6: response_format — enforce structured output format
//  "text" (default) or "json_schema" with a schema definition
//  Query: "List 3 programming languages with their year of creation"
//  Try: response_format={"type": "json_schema", "json_schema": {"name": "languages", "strict": true, "schema": {"type": "object", "properties": {"languages": {"type": "array", "items": {"type": "object", "properties": {"name": {"type": "string"}, "year": {"type": "integer"}}, "required": ["name", "year"], "additionalProperties": false}}}, "required": ["languages"], "additionalProperties": false}}}
//
// КАК РАБОТАЕТ: вместо свободного текста модель обязана вернуть валидный JSON,
// строго соответствующий указанной JSON Schema. Это называется "Structured Outputs".
//
// Типы response_format:
//   { "type": "text" }        → обычный текст (по умолчанию)
//   { "type": "json_object" } → любой валидный JSON (старый способ, менее надёжный)
//   { "type": "json_schema" } → строгое соответствие схеме ✅ (рекомендуемый способ)
//
// Пример ответа при json_schema:
// {
//   "languages": [
//     { "name": "Python",     "year": 1991 },
//     { "name": "JavaScript", "year": 1995 },
//     { "name": "Rust",       "year": 2010 }
//   ]
// }
//
// ЗАЧЕМ: парсинг ответа в коде без риска сломать JSON.parse().
//        Идеально для API, баз данных, автоматизации пайплайнов.
//
// run(new OpenAIClient('gpt-5.2'), true, false, {
//   response_format: {
//     type: 'json_schema',
//     json_schema: {
//       name: 'languages', // имя схемы (для логов и дебага на стороне OpenAI)
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
//         additionalProperties: false // запрет лишних полей в корневом объекте
//       }
//     }
//   }
// })

// TODO 7: frequency_penalty — penalizes tokens based on how often they appeared so far. Range: -2.0 to 2.0, default: 0
//  ⚠️ Note: Will work for models like gpt-4o
//  Positive = reduces repetition, negative = encourages repetition
//  Query: "Write a paragraph about the ocean"
//  Try: frequency_penalty=0.0 vs frequency_penalty=1.5
//
// КАК РАБОТАЕТ: каждый раз когда токен уже был использован в ответе, его вероятность
// снижается пропорционально тому, СКОЛЬКО РАЗ он уже появился.
//
//   frequency_penalty=0.0  → нет штрафа, слова могут повторяться сколько угодно
//   frequency_penalty=1.5  → сильный штраф → разнообразная лексика,
//                            модель ищет синонимы и новые обороты речи
//   frequency_penalty=-1.0 → поощрение повторов → модель намеренно повторяет слова
//
// РАЗНИЦА с presence_penalty:
//   frequency_penalty — штраф РАСТЁТ с каждым повтором (2й раз = х2, 3й раз = х3...)
//   presence_penalty  — штраф ОДИНАКОВЫЙ независимо от количества повторов
//
// --- frequency_penalty=0.0: естественная речь, возможны повторы ---
// run(new OpenAIClient('gpt-5.2'), true, false, {
//   frequency_penalty: 0.0 // без штрафов — модель пишет как обычно
// })
//
// --- frequency_penalty=1.5: богатый словарный запас, минимум повторов ---

// TODO 8: presence_penalty — penalizes tokens based on whether they appeared at all. Range: -2.0 to 2.0, default: 0
//  ⚠️ Note: Will work for models like gpt-4o
//  Positive = encourages new topics, negative = stays on topic
//  Query: "Write a paragraph about the ocean"
//  Try: presence_penalty=0.0 vs presence_penalty=1.5
//
// КАК РАБОТАЕТ: если токен уже появился в ответе хотя бы раз — он получает
// фиксированный штраф (не зависит от количества повторов, в отличие от frequency_penalty).
//
//   presence_penalty=0.0  → нет штрафа (по умолчанию)
//   presence_penalty=1.5  → модель избегает уже упомянутых концепций →
//                           переключается на новые темы, идеи, аспекты
//   presence_penalty=-1.0 → модель "зацикливается" на уже упомянутом
//
// ПРИМЕНЕНИЕ:
//   Высокий presence_penalty → brainstorming, исследование темы с разных сторон
//   Низкий presence_penalty  → глубокое погружение в одну тему без отклонений
//
// --- presence_penalty=0.0: сфокусированный текст про океан ---
// run(
//   new OpenAIClient("gpt-5.2"),
//   true,
//   false,
//   {
//     presence_penalty: 0.0, // модель остаётся в рамках одной темы
//   }
// );
//
// --- presence_penalty=1.5: текст уходит от океана к экологии, климату и т.д. ---
// run(new OpenAIClient('gpt-5.2'), true, false, {
//   presence_penalty: 1.5 // модель постоянно вводит новые концепции и темы
// })

// TODO 9: seed — attempts deterministic output. Same seed + same input = same output (best effort)
//  ⚠️ Note: Will work for models like gpt-4o
//  Query: "Give me a name for a coffee shop"
//  Try: seed=42 — run twice with the same seed and compare outputs
//
// КАК РАБОТАЕТ: при одинаковых seed + одинаковый prompt → максимально похожий ответ.
// Это "best effort" — гарантии 100% идентичности нет, но на практике ответы очень
// похожи или идентичны (особенно в комбинации с temperature=0).
//
// ЗАЧЕМ НУЖЕН:
//   - Воспроизводимость результатов (научные эксперименты, тесты)
//   - Дебаггинг (зафиксировать поведение модели для сравнения)
//   - A/B тестирование с контролируемой переменной
//
// Попробуй: запусти дважды с seed=42 → ответы должны быть (почти) одинаковыми.
//           Затем запусти с seed=43 → ответ будет другим.
//
// run(new OpenAIClient('gpt-4o'), true, true, {
//   seed: 43 // любое целое число — "ключ" для генератора случайных чисел модели
//   // Запусти дважды — сравни ответы. Они должны быть идентичны или очень похожи.
// })

// TODO 10: reasoning_effort — controls how much thinking the model does. Values: "low", "medium", "high" (default)
//  Lower effort = faster, cheaper responses; higher = more thorough reasoning
//  ⚠️ Note: does NOT work with non-default temperature (must omit temperature or set to 1.0)
//  Query: "How many r's are in the word strawberry?"
//  Try: reasoning_effort="low" vs reasoning_effort="high"
//
// КАК РАБОТАЕТ: модели нового поколения (o1, o3, gpt-5+) имеют внутренний
// "цепочка рассуждений" (chain-of-thought), который происходит ДО финального ответа.
// reasoning_effort управляет тем, сколько токенов тратится на это внутреннее мышление.
//
//   "low"    → минимум размышлений → быстро, дёшево, подходит для простых задач
//   "medium" → балансировка скорости и качества
//   "high"   → максимум размышлений → медленно, дорого, но точнее для сложных задач
//
// Пример разницы на вопросе "сколько букв r в слове strawberry":
//   low  → может ошибиться (быстрый ответ без тщательного подсчёта)
//   high → тщательно считает каждую букву →правильный ответ: 3 буквы "r"
//          s-t-[R]-a-w-b-e-[R]-[R]-y → позиции 3, 8, 9
//
// ⚠️ ВАЖНО: reasoning_effort НЕ работает вместе с нестандартной temperature!
//    Если используешь reasoning_effort → убери temperature или оставь temperature=1.0
//
// --- reasoning_effort="low": быстрый ответ, возможна ошибка ---
run(new OpenAIClient('gpt-5.2'), true, false, {
  reasoning_effort: 'high' // минимум токенов на "обдумывание" — быстро и дёшево
  // ⚠️ temperature НЕ указываем (или оставляем 1.0)
})
//
// --- reasoning_effort="high": медленнее, но точнее ---
// run(
//   new OpenAIClient("gpt-5.2"),
//   true,
//   false,
//   {
//     reasoning_effort: "high", // максимум токенов на "обдумывание" → правильный ответ
//     // ⚠️ temperature НЕ указываем (или оставляем 1.0)
//   }
// );

// =============================================================================
// АКТИВНЫЙ ЗАПУСК — раскомментируй нужный блок run() выше для тестирования
// конкретного TODO, или добавляй параметры прямо сюда для быстрых экспериментов
// =============================================================================
// run(
//   new OpenAIClient('gpt-5.2'),
//   true, // true = показывать полный запрос в консоли (endpoint, headers, body)
//   false // false = показывать полный JSON ответ; true = только текст ответа
//   // Примеры параметров для быстрого теста:
//   // { n: 3 }
//   // { temperature: 0.0 }
//   // { top_p: 0.1 }
//   // { max_tokens: 50 }
//   // { stop: ["5"] }
//   // { reasoning_effort: "high" }
//)
