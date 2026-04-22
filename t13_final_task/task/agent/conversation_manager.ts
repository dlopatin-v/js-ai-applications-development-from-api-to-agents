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
    obj.tool_calls as unknown[] | undefined,
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
    const id = uuidv4();
    const now = new Date().toISOString();

    const conversation: ConversationRecord = {
      id,
      title: title ?? null,
      messages: [],
      created_at: now,
      updated_at: now,
    };

    await this._saveConversation(conversation);
    return conversation;
  }

  /** List all conversations sorted by last update (newest first). */
  async listConversations(): Promise<ConversationSummary[]> {
    const ids = await this._redis.zRange(CONVERSATION_LIST_KEY, 0, -1, { REV: true });

    const summaries: ConversationSummary[] = [];
    for (const id of ids) {
      const raw = await this._redis.get(`${CONVERSATION_PREFIX}${id}`);
      if (!raw) continue;
      const conv: ConversationRecord = JSON.parse(raw);
      summaries.push({
        id: conv.id,
        title: conv.title,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        message_count: conv.messages.length,
      });
    }

    return summaries;
  }

  /** Get a specific conversation by id, or null if not found. */
  async getConversation(conversationId: string): Promise<ConversationRecord | null> {
    const raw = await this._redis.get(`${CONVERSATION_PREFIX}${conversationId}`);
    if (!raw) return null;
    return JSON.parse(raw) as ConversationRecord;
  }

  /** Delete a conversation. Returns false if it did not exist. */
  async deleteConversation(conversationId: string): Promise<boolean> {
    const deleted = await this._redis.del(`${CONVERSATION_PREFIX}${conversationId}`);
    if (deleted === 0) return false;
    await this._redis.zRem(CONVERSATION_LIST_KEY, conversationId);
    return true;
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
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation with id ${conversationId} not found`);
    }

    const messages: Message[] = conversation.messages.map(dictToMessage);

    // Inject system prompt on the very first turn
    if (messages.length === 0) {
      messages.push(new Message(Role.SYSTEM, this._systemPrompt));
    }

    messages.push(userMessage);

    if (stream) {
      return this._streamChat(conversationId, messages);
    }
    return this._nonStreamChat(conversationId, messages);
  }

  /** Streaming chat — yields SSE chunks then persists the conversation. */
  async *_streamChat(
    conversationId: string,
    messages: Message[],
  ): AsyncGenerator<string> {
    yield `data: ${JSON.stringify({ conversation_id: conversationId })}\n\n`;

    yield* this._agent.streamResponse(messages);

    await this._saveConversationMessages(conversationId, messages);
  }

  /** Non-streaming chat — returns the reply object then persists the conversation. */
  async _nonStreamChat(
    conversationId: string,
    messages: Message[],
  ): Promise<{ content: string; conversation_id: string }> {
    const aiMessage = await this._agent.response(messages);
    await this._saveConversationMessages(conversationId, messages);
    return { content: aiMessage.content ?? "", conversation_id: conversationId };
  }

  /** Persist the updated message list back to Redis. */
  private async _saveConversationMessages(
    conversationId: string,
    messages: Message[],
  ): Promise<void> {
    const raw = await this._redis.get(`${CONVERSATION_PREFIX}${conversationId}`);
    if (!raw) return;

    const conversation: ConversationRecord = JSON.parse(raw);
    conversation.messages = messages.map(messageToDict);
    conversation.updated_at = new Date().toISOString();
    await this._saveConversation(conversation);
  }

  /** Write a conversation object to Redis (key + sorted-set membership). */
  private async _saveConversation(conversation: ConversationRecord): Promise<void> {
    await this._redis.set(
      `${CONVERSATION_PREFIX}${conversation.id}`,
      JSON.stringify(conversation),
    );
    await this._redis.zAdd(CONVERSATION_LIST_KEY, {
      score: Date.now() / 1000,
      value: conversation.id,
    });
  }
}
