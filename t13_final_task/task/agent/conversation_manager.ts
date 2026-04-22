import { createClient } from "redis";
import { v4 as uuidv4 } from "uuid";
import { Message } from "commons/models/message";
import { Role } from "commons/models/role";
import { UMSAgent } from "./ums_agent.js";

const CONVERSATION_PREFIX = "conversation:";
const CONVERSATION_LIST_KEY = "conversations:list";

export interface ConversationRecord {
  id: string;
  title: string | null;
  messages: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
}

export interface ConversationSummary {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
}

/** Serialise a Message to a plain JSON-safe object for Redis storage. */
function messageToDict(msg: Message): Record<string, unknown> {
  const obj: Record<string, unknown> = { role: msg.role, content: msg.content };
  if (msg.tool_call_id !== undefined) obj.tool_call_id = msg.tool_call_id;
  if (msg.name !== undefined) obj.name = msg.name;
  if (msg.tool_calls !== undefined) obj.tool_calls = msg.tool_calls;
  return obj;
}

/** Rehydrate a plain dict back into a Message. */
function dictToMessage(obj: Record<string, unknown>): Message {
  return new Message(
    obj.role as string,
    (obj.content as string) ?? "",
    obj.tool_call_id as string | undefined,
    obj.name as string | undefined,
    obj.tool_calls as (Record<string, unknown>)[] | undefined,
  );
}

export class ConversationManager {
  private readonly _agent: UMSAgent;
  private readonly _redis: ReturnType<typeof createClient>;
  private readonly _systemPrompt: string;

  constructor(
    agent: UMSAgent,
    redis: ReturnType<typeof createClient>,
    systemPrompt: string,
  ) {
    this._agent = agent;
    this._redis = redis;
    this._systemPrompt = systemPrompt;
  }

  /** Create a new conversation and persist it to Redis. */
  async createConversation(title?: string): Promise<ConversationRecord> {
    // TODO:
    // 1. Generate `id = uuidv4()` (convert to string) and `now = new Date().toISOString()`
    // 2. Build `conversation: ConversationRecord` with keys: `id`, `title` (use `title ?? null`),
    //    `messages: []`, `created_at: now`, `updated_at: now`
    // 3. Persist via `await this._saveConversation(conversation)`
    // 4. Return `conversation`
    throw new Error("Not implemented");
  }

  /** List all conversations sorted by last update (newest first). */
  async listConversations(): Promise<ConversationSummary[]> {
    // TODO:
    // 1. Fetch all IDs with `await this._redis.zRange(CONVERSATION_LIST_KEY, 0, -1, { REV: true })`
    // 2. For each `id`, fetch raw data: `await this._redis.get(\`${CONVERSATION_PREFIX}${id}\`)` and skip if null
    // 3. Parse with `JSON.parse(raw) as ConversationRecord` and push a summary:
    //    `{ id, title, created_at, updated_at, message_count: conv.messages.length }`
    // 4. Return the summaries list
    throw new Error("Not implemented");
  }

  /** Get a specific conversation by id, or null if not found. */
  async getConversation(conversationId: string): Promise<ConversationRecord | null> {
    // TODO:
    // 1. Fetch raw data: `await this._redis.get(\`${CONVERSATION_PREFIX}${conversationId}\`)`
    // 2. If nothing returned, return `null`
    // 3. Return `JSON.parse(raw) as ConversationRecord`
    throw new Error("Not implemented");
  }

  /** Delete a conversation. Returns false if it did not exist. */
  async deleteConversation(conversationId: string): Promise<boolean> {
    // TODO:
    // 1. `deleted = await this._redis.del(\`${CONVERSATION_PREFIX}${conversationId}\`)`
    // 2. If `deleted === 0`, return `false`
    // 3. `await this._redis.zRem(CONVERSATION_LIST_KEY, conversationId)`
    // 4. Return `true`
    throw new Error("Not implemented");
  }

  /**
   * Process a chat message.
   * Returns an async generator (stream=true) or a plain result object (stream=false).
   */
  async chat(
    userMessage: Message,
    conversationId: string,
    stream: boolean = false,
  ): Promise<AsyncGenerator<string> | { content: string; conversation_id: string }> {
    // TODO:
    // 1. Load conversation: `const conversation = await this.getConversation(conversationId)`
    //    If not found: `throw new Error(\`Conversation with id ${conversationId} not found\`)`
    // 2. Deserialize messages: `const messages: Message[] = conversation.messages.map(dictToMessage)`
    // 3. If `messages.length === 0`: prepend `new Message(Role.SYSTEM, this._systemPrompt)`
    // 4. Push `userMessage` to `messages`
    // 5. If `stream`: return `this._streamChat(conversationId, messages)` (not awaited — it's an async generator)
    //    Else: return `await this._nonStreamChat(conversationId, messages)`
    throw new Error("Not implemented");
  }

  /** Streaming chat — yields SSE chunks then persists the conversation. */
  async *_streamChat(
    conversationId: string,
    messages: Message[],
  ): AsyncGenerator<string> {
    // TODO:
    // 1. Yield conversation_id as first SSE event:
    //    `\`data: ${JSON.stringify({ conversation_id: conversationId })}\n\n\``
    // 2. `yield* this._agent.streamResponse(messages)`
    // 3. `await this._saveConversationMessages(conversationId, messages)`
    throw new Error("Not implemented");
  }

  /** Non-streaming chat — returns the reply object then persists the conversation. */
  async _nonStreamChat(
    conversationId: string,
    messages: Message[],
  ): Promise<{ content: string; conversation_id: string }> {
    // TODO:
    // 1. `const aiMessage = await this._agent.response(messages)`
    // 2. `await this._saveConversationMessages(conversationId, messages)`
    // 3. Return `{ content: aiMessage.content ?? "", conversation_id: conversationId }`
    throw new Error("Not implemented");
  }

  /** Persist the updated message list back to Redis. */
  private async _saveConversationMessages(
    conversationId: string,
    messages: Message[],
  ): Promise<void> {
    // TODO:
    // 1. Fetch raw: `await this._redis.get(\`${CONVERSATION_PREFIX}${conversationId}\`)` and return early if null
    // 2. Parse with `JSON.parse(raw) as ConversationRecord`
    // 3. Update `conversation.messages = messages.map(messageToDict)`
    // 4. Update `conversation.updated_at = new Date().toISOString()`
    // 5. `await this._saveConversation(conversation)`
    throw new Error("Not implemented");
  }

  /** Write a conversation object to Redis (key + sorted-set membership). */
  private async _saveConversation(conversation: ConversationRecord): Promise<void> {
    // TODO:
    // 1. `await this._redis.set(\`${CONVERSATION_PREFIX}${conversation.id}\`, JSON.stringify(conversation))`
    // 2. `await this._redis.zAdd(CONVERSATION_LIST_KEY, { score: Date.now() / 1000, value: conversation.id })`
    throw new Error("Not implemented");
  }
}
