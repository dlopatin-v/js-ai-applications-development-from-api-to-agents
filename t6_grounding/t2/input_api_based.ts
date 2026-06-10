import * as readline from 'node:readline/promises'

import { OpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

import { UserServiceClient } from '../user_service_client'

import {
  OPENAI_API_KEY,
  Role,
  UserInfo,
  UserSearchRequest
} from '../../commons'

// TODO:
// Define QUERY_ANALYSIS_PROMPT - instructs the LLM to act as a query analysis system

// Промпт для ПЕРВОГО LLM вызова — не для ответа пользователю,
// а для извлечения параметров поиска из вопроса.
// LLM должна вернуть структурированный JSON (через Zod схему).
// ВАЖНО: "Only extract values that are clearly stated" — не додумывать!
const QUERY_ANALYSIS_PROMPT = `You are a query analysis system that extracts search parameters from user questions.

Available search fields: name, surname, email

Your task:
- Analyze the user question and extract explicit search values
- Map extracted values to the appropriate search fields
- Only extract values that are clearly stated - do not infer or assume

Examples:
- "Who is John?" → name: "John"
- "Find John Smith" → name: "John", surname: "Smith"
- "Find user with email test@test.com" → email: "test@test.com"`

// TODO:
// Define SYSTEM_PROMPT - instructs the LLM to act as a RAG-powered assistant

// Промпт для ВТОРОГО LLM вызова — финальный ответ пользователю.
// Модель получит RAG CONTEXT (найденных пользователей) и вопрос.
// "Answer ONLY based on RAG CONTEXT" — это и есть Input Grounding!
const SYSTEM_PROMPT = `You are a RAG-powered assistant that answers questions about users.

The user message contains two sections: RAG CONTEXT and USER QUESTION.

Rules:
- Answer ONLY based on the provided RAG CONTEXT and conversation history
- If no relevant information exists in RAG CONTEXT, state that the question cannot be answered based on available data
- Format user information clearly when presenting it`

// TODO:
// Define USER_PROMPT template with two placeholders:
//   - {context} - the retrieved user data formatted as text
//   - {query}   - the user's original question

// Шаблон промпта — чётко разделяем RAG CONTEXT и USER QUESTION.
// Так LLM точно знает что является источником данных, а что вопросом.
const USER_PROMPT = `RAG CONTEXT:
{context}

USER QUESTION:
{query}`

// Zod схемы для структурированного вывода LLM.
// SearchField — только три допустимых поля поиска.
// SearchRequest — одна пара поле+значение.
// SearchRequests — массив пар (можно искать по нескольким полям сразу).
const SearchField = z.enum(['name', 'surname', 'email'])
const SearchRequest = z.object({
  searchField: SearchField,
  searchValue: z.string()
})
const SearchRequests = z.object({
  searchRequestParams: z.array(SearchRequest)
})

const llmClient = new OpenAI({ apiKey: OPENAI_API_KEY })
const userService = new UserServiceClient()

async function retrieveContext(
  userQuestion: string
): Promise<Record<string, unknown>[]> {
  // Используем обычный create с response_format для структурированного вывода,
  // затем вручную парсим JSON через Zod схему
  const response = await llmClient.chat.completions.create({
    model: 'gpt-4.1-nano',
    temperature: 0,
    messages: [
      { role: Role.SYSTEM, content: QUERY_ANALYSIS_PROMPT },
      { role: Role.USER, content: userQuestion }
    ],
    response_format: zodResponseFormat(SearchRequests, 'searchRequests')
  })

  // Парсим JSON из строки и валидируем через Zod схему
  const content = response.choices[0].message.content ?? '{}'
  const { searchRequestParams } = SearchRequests.parse(JSON.parse(content))

  if (searchRequestParams.length > 0) {
    const searchParams = searchRequestParams.reduce(
      (
        acc: UserSearchRequest,
        { searchField, searchValue }: z.infer<typeof SearchRequest>
      ) => ({
        ...acc,
        [searchField]: searchValue
      }),
      {} as UserSearchRequest
    )

    console.log('Searching with parameters:', searchParams)
    return userService.searchUsers(searchParams)
  }

  console.log('No specific search parameters found!')
  return []
}

async function augmentPrompt(
  userQuestion: string,
  context: Record<string, unknown>[]
): Promise<string> {
  // TODO:
  // Форматируем найденных пользователей в читаемый текст
  // и вставляем в шаблон USER_PROMPT — это и есть "Augmentation"

  // Форматируем каждого пользователя как текстовый блок
  let formattedContext = ''
  for (const user of context) {
    formattedContext += 'User:\n'
    for (const [key, value] of Object.entries(user)) {
      formattedContext += `  ${key}: ${value}\n`
    }
    formattedContext += '\n'
  }

  // Подставляем контекст и вопрос в шаблон
  const augmentedPrompt = USER_PROMPT.replace(
    '{context}',
    formattedContext
  ).replace('{query}', userQuestion)

  console.log(augmentedPrompt)
  return augmentedPrompt
}

async function generateAnswer(augmentedPrompt: string): Promise<string> {
  // TODO:
  // Финальный LLM вызов — модель отвечает ТОЛЬКО на основе
  // контекста из augmentedPrompt (найденных пользователей).
  // gpt-4.1-mini — чуть мощнее nano для качественного финального ответа.
  const response = await llmClient.chat.completions.create({
    model: 'gpt-4.1-mini',
    temperature: 0,
    messages: [
      { role: Role.SYSTEM, content: SYSTEM_PROMPT },
      { role: Role.USER, content: augmentedPrompt }
    ]
  })

  return response.choices[0].message.content ?? ''
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  console.log('Query samples:')
  console.log(' - I need user emails that filled with hiking and psychology')
  console.log(' - Who is John?')
  console.log(' - Find users with surname Adams')
  console.log(' - Do we have smbd with name John that love painting?')

  while (true) {
    const userQuestion = await rl.question(`➡️ `)

    if (userQuestion.toLowerCase() === 'exit') {
      console.log('👋 Goodbye')
      rl.close()
      process.exit(0)
    }

    // Полный флоу Input Grounding:
    // retrieveContext  → LLM извлекает параметры → API запрос → живые данные
    // augmentPrompt    → форматируем данные + вставляем в шаблон
    // generateAnswer   → LLM отвечает на основе ТОЛЬКО найденного контекста
    console.log('\n--- Retrieving context ---')
    const context = await retrieveContext(userQuestion)

    if (context.length > 0) {
      console.log('\n--- Augmenting prompt ---')
      const augmentedPrompt = await augmentPrompt(userQuestion, context)

      console.log('\n--- Generating answer ---')
      const answer = await generateAnswer(augmentedPrompt)
      console.log(`\nAnswer: ${answer}\n`)
    } else {
      console.log('\n--- No relevant information found ---')
    }
  }
}

main()

// The problems with API based Grounding approach are:
//   - We need a Pre-Step to figure out what field should be used for search (Takes time)
//   - Values for search should be correct (✅ John -> ❌ Jonh)
//   - Is not so flexible
// Benefits are:
//   - We fetch actual data (new users added and deleted every 5 minutes)
//   - Costs reduce
