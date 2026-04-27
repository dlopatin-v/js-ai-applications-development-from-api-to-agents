import { createClient } from "redis";
import { v4 as uuidv4 } from "uuid";
import { Message } from "../../../commons/models/message.js";
import { Role } from "../../../commons/models/role.js";
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
    // - Build conversation dict: id (uuidv4), title, messages=[], created_at, updated_at (ISO)
    // - Persist via _saveConversation() and return the conversation
    throw new Error("Not implemented");
  }

  /** List all conversations sorted by last update (newest first). */
  async listConversations(): Promise<ConversationSummary[]> {
    // TODO:
    // - Get all conversation ids via zRange on CONVERSATION_LIST_KEY (reversed)
    // - For each id fetch from Redis, parse, append summary (id, title, created_at, updated_at, message_count)
    // - Return list of summaries
    throw new Error("Not implemented");
  }

  /** Get a specific conversation by id, or null if not found. */
  async getConversation(conversationId: string): Promise<ConversationRecord | null> {
    // TODO:
    // - Get from Redis by key, return null if missing
    // - Return parsed ConversationRecord
    throw new Error("Not implemented");
  }

  /** Delete a conversation. Returns false if it did not exist. */
  async deleteConversation(conversationId: string): Promise<boolean> {
    // TODO:
    // - Delete from Redis by key; return false if deleted === 0
    // - Remove from sorted set via zRem
    // - Return true
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
    // - Load conversation via getConversation(); throw Error if not found
    // - Deserialize messages; if empty inject system prompt (Role.SYSTEM) first
    // - Append userMessage
    // - If stream: return _streamChat() (not awaited), else return await _nonStreamChat()
    throw new Error("Not implemented");
  }

  /** Streaming chat — yields SSE chunks then persists the conversation. */
  async *_streamChat(
    conversationId: string,
    messages: Message[],
  ): AsyncGenerator<string> {
    // TODO:
    // - Yield conversation_id as first SSE event
    // - Yield each chunk from this._agent.streamResponse(messages)
    // - Save messages via _saveConversationMessages()
    throw new Error("Not implemented");
  }

  /** Non-streaming chat — returns the reply object then persists the conversation. */
  async _nonStreamChat(
    conversationId: string,
    messages: Message[],
  ): Promise<{ content: string; conversation_id: string }> {
    // TODO:
    // - Get ai_message via this._agent.response(messages)
    // - Save messages via _saveConversationMessages()
    // - Return { content, conversation_id }
    throw new Error("Not implemented");
  }

  /** Persist the updated message list back to Redis. */
  private async _saveConversationMessages(
    conversationId: string,
    messages: Message[],
  ): Promise<void> {
    // TODO:
    // - Fetch existing conversation from Redis, update messages (messageToDict) and updated_at
    // - Persist via _saveConversation()
    throw new Error("Not implemented");
  }

  /** Write a conversation object to Redis (key + sorted-set membership). */
  private async _saveConversation(conversation: ConversationRecord): Promise<void> {
    // TODO:
    // - redis.set conversation by key (JSON.stringify)
    // - redis.zAdd to sorted list with current timestamp score
    throw new Error("Not implemented");
  }
}
