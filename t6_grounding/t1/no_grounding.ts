import * as readline from 'node:readline/promises'

import { OpenAI } from 'openai'

import { UserServiceClient } from '../user_service_client'

import { OPENAI_API_KEY, Role, UserInfo } from '../../commons'

// TODO:
// Define BATCH_SYSTEM_PROMPT - instructs the LLM to act as a user search assistant:
//   - Analyze the search criteria from the user question
//   - Examine each user in the provided list and determine if they match
//   - Return full details of matching users in their original format
//   - Return exactly "NO_MATCHES_FOUND" if no users match

// Промпт для обработки одного батча пользователей.
// Модель получит список пользователей и вопрос — должна найти совпадения.
// Если совпадений нет — строго "NO_MATCHES_FOUND" (чтобы легко фильтровать программно).
const BATCH_SYSTEM_PROMPT = `You are a user search assistant.
Your task is to:
1. Analyze the search criteria from the user question
2. Examine each user in the provided list and determine if they match the criteria
3. Return the full details of matching users in their original format
4. Return exactly "NO_MATCHES_FOUND" if no users match the criteria`

// TODO:
// Define FINAL_SYSTEM_PROMPT - instructs the LLM to compile final search results:
//   - Review all batch search results
//   - Combine and deduplicate matching users found across batches
//   - Present results in a clear, organized manner

// Финальный промпт — получает объединённые результаты всех батчей.
// Дедуплицирует (один пользователь мог попасть в несколько батчей) и красиво форматирует.
const FINAL_SYSTEM_PROMPT = `You are a user search results compiler.
Your task is to:
1. Review all batch search results provided
2. Combine and deduplicate matching users found across all batches
3. Present the final results in a clear, organized manner`

// TODO:
// Define USER_PROMPT template with two placeholders:
//   - {context} - the formatted user data
//   - {query}   - the user's search question

// Шаблон промпта — {context} заменится на список пользователей,
// {query} — на вопрос пользователя. Подстановка идёт через .replace()
const USER_PROMPT = `Users data:
{context}

Question: {query}`

class TokenTracker {
  // TODO:
  // - Initialize totalTokens counter to 0
  // - Initialize batchTokens as an empty array to store per-batch token counts

  // totalTokens — суммарное кол-во токенов по всем запросам
  // batchTokens — массив токенов по каждому отдельному батчу (для анализа)
  private totalTokens: number = 0
  private batchTokens: number[] = []

  addTokens(tokens: number) {
    // TODO:
    // - Add tokens to the totalTokens counter
    // - Append tokens to the batchTokens array

    // Добавляем токены текущего запроса к общему счётчику
    // и сохраняем отдельно для статистики по батчам
    this.totalTokens += tokens
    this.batchTokens.push(tokens)
  }

  getSummary() {
    // TODO:
    // - Return an object with:
    //   - totalTokens: total accumulated tokens
    //   - batchCount: number of batches processed (length of batchTokens array)
    //   - batchTokens: array of tokens per batch

    // Возвращаем полную статистику:
    // batchCount = сколько параллельных запросов было сделано
    return {
      totalTokens: this.totalTokens,
      batchCount: this.batchTokens.length,
      batchTokens: this.batchTokens
    }
  }
}

const llmClient = new OpenAI({ apiKey: OPENAI_API_KEY })
const tokenTracker = new TokenTracker()
const userService = new UserServiceClient()

function joinContext(context: Array<Record<string, unknown>>): string {
  // TODO:
  // - Initialize an empty string for the result
  // - Iterate through each user in the context array
  // - For each user, add a "User:" header line
  // - For each key-value pair in the user object, add an indented "  key: value" line
  // - Add a blank line after each user for readability
  // - Return the formatted string

  // Форматируем массив объектов-пользователей в читаемый текст для LLM.
  // Каждый пользователь: заголовок "User:" → поля с отступом → пустая строка.
  // Пример:
  //   User:
  //     id: 1
  //     name: John
  //     email: john@mail.com
  //
  let result = ''
  for (const user of context) {
    result += 'User:\n'
    for (const [key, value] of Object.entries(user)) {
      result += `  ${key}: ${value}\n`
    }
    result += '\n' // пустая строка между пользователями
  }
  return result
}

async function generateResponse(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  console.log('Processing...')

  // TODO:
  // - Build a messages array with systemPrompt as system and userMessage as user
  // - Call llmClient.chat.completions.create with:
  //   - model: 'gpt-4.1-nano'
  //   - temperature: 0
  //   - messages
  // - Extract total_tokens from response.usage (default to 0 if usage is null)
  // - Track tokens using tokenTracker.addTokens(...)
  // - Extract the content string from response.choices[0].message.content (default to "")
  // - Print the response content and token count to console
  // - Return the content string

  // Формируем массив сообщений в формате OpenAI Chat Completions
  const messages = [
    { role: Role.SYSTEM as const, content: systemPrompt },
    { role: Role.USER as const, content: userMessage }
  ]

  // temperature: 0 — детерминированный ответ, важно для поиска (нет случайности)
  // gpt-4.1-nano — лёгкая и дешёвая модель, достаточна для поиска по тексту
  const response = await llmClient.chat.completions.create({
    model: 'gpt-4.1-nano',
    temperature: 0,
    messages
  })

  // Считаем токены — ?? 0 на случай если usage вдруг null
  const totalTokens = response.usage?.total_tokens ?? 0
  tokenTracker.addTokens(totalTokens)

  // Извлекаем текст ответа
  const content = response.choices[0].message.content ?? ''
  console.log(content)
  console.log(`[Tokens used: ${totalTokens}]`)

  return content
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  console.log('Query samples:')
  console.log(' - Do we have someone with name John that loves traveling?')

  const userQuestion = await rl.question(`➡️ `)
  if (!userQuestion) return

  // TODO:
  // 1. FETCH & BATCH USERS
  // 2. PARALLEL BATCH SEARCH
  // 3. FILTER RESULTS
  // 4. FINAL GENERATION
  // 5. PRINT PERFORMANCE SUMMARY

  // --- 1. FETCH & BATCH USERS ---
  // Загружаем ВСЕХ пользователей и разбиваем на батчи по 100.
  // Почему 100? Компромисс между размером контекста и кол-вом запросов.
  // Слишком большой батч → переполнение контекста LLM.
  // Слишком маленький → слишком много параллельных запросов.
  console.log('\n--- Searching user database ---')
  const users = await userService.getAllUsers()

  const batches: UserInfo[][] = []
  for (let i = 0; i < users.length; i += 100) {
    batches.push(users.slice(i, i + 100))
  }

  // --- 2. PARALLEL BATCH SEARCH ---
  // Для каждого батча создаём промис с запросом к LLM.
  // Promise.all запускает ВСЕ запросы параллельно — экономим время.
  // Каждый батч получает свой кусок пользователей + вопрос пользователя.
  const batchPromises = batches.map(batch =>
    generateResponse(
      BATCH_SYSTEM_PROMPT,
      USER_PROMPT.replace('{context}', joinContext(batch)).replace(
        '{query}',
        userQuestion
      )
    )
  )
  const batchResults = await Promise.all(batchPromises)

  // --- 3. FILTER RESULTS ---
  // Отфильтровываем батчи где не нашлось совпадений.
  // LLM вернула строго "NO_MATCHES_FOUND" — легко проверить программно.
  // Остаются только батчи с реальными совпадениями.
  console.log('\n--- Compiling results ---')
  const relevantResults = batchResults.filter(
    result => result.trim() !== 'NO_MATCHES_FOUND'
  )

  // --- 4. FINAL GENERATION ---
  // Если нашлись совпадения — объединяем все релевантные батчи
  // и отдаём финальной LLM для дедупликации и красивого форматирования.
  console.log('\n=== SEARCH RESULTS ===')
  if (relevantResults.length > 0) {
    const combinedResults = relevantResults.join('\n\n')
    await generateResponse(
      FINAL_SYSTEM_PROMPT,
      `${combinedResults}\n\nQuestion: ${userQuestion}`
    )
  } else {
    console.log('No users found matching your search criteria.')
    console.log('Try refining your search with different keywords.')
  }

  // --- 5. PRINT PERFORMANCE SUMMARY ---
  // Показываем сколько API вызовов было (батчи + финальный)
  // и суммарное кол-во токенов = понимаем стоимость запроса.
  const summary = tokenTracker.getSummary()
  console.log('\n=== Performance ===')
  console.log(`Total API calls: ${summary.batchCount}`)
  console.log(`Total tokens used: ${summary.totalTokens}`)

  rl.close()
}

main()

// The problems with No Grounding approach are:
//   - If we load whole users as context in one request to LLM we will hit context window
//   - Huge token usage == Higher price per request
//   - Added + one chain in flow where original user data can be changed by LLM (before final generation)
// User Question -> Get all users -> ‼️parallel search of possible candidates‼️ -> probably changed original context -> final generation
