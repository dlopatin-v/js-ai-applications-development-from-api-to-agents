import { OPENAI_CHAT_COMPLETIONS_ENDPOINT } from "../../../commons/constants";
import { Message } from "../../../commons/models/message";
import { Role } from "../../../commons/models/role";
import { BaseTool } from "../tools/base";
import { BaseAgent } from "./_base";

export class OpenAIBasedAgent extends BaseAgent {
  private readonly _toolsSchemas: Record<string, unknown>[];
  private readonly _endpoint: string;

  constructor(
    model: string,
    apiKey: string,
    tools: BaseTool[] = [],
    systemPrompt?: string,
  ) {
    super(model, apiKey, tools, systemPrompt);
    this._toolsSchemas = tools.map((t) => t.openaiSchema);
    this._endpoint = OPENAI_CHAT_COMPLETIONS_ENDPOINT;

    console.log(this._endpoint);
    console.log(JSON.stringify(this._toolsSchemas, null, 4));
  }

  async getResponse(messages: Message[], printRequest = true): Promise<Message> {
    //TODO:
    // 1. Build requestMessages: if this._systemPrompt is set, prepend
    //    new Message(Role.SYSTEM, this._systemPrompt) to messages, otherwise use messages as-is
    // 2. Serialize each Message to a plain object: { role, content }
    //    For TOOL messages also include: tool_call_id and name
    //    For ASSISTANT messages with tool_calls also include: tool_calls
    // 3. Build headers: { Authorization: `Bearer ${this._apiKey}`, Content-Type: application/json }
    // 4. Build body: { model: this._model, messages: <serialized>, tools: this._toolsSchemas }
    // 5. If printRequest: log this._endpoint and the request messages
    // 6. POST to this._endpoint; on non-ok status throw: new Error(`HTTP ${response.status}: ${text}`)
    // 7. Parse response JSON, get choices[0]; if printRequest: log it
    //    Extract content and tool_calls from choices[0].message
    //    Build: new Message(Role.ASSISTANT, content, undefined, undefined, tool_calls)
    //    If choices[0].finish_reason === "tool_calls":
    //      - Append ai_response to messages
    //      - Process tool calls: tool_messages = await this._processToolCalls(tool_calls)
    //      - Extend messages with tool_messages
    //      - Recursively call this.getResponse(messages, printRequest) and return result
    //    Otherwise return ai_response
    //    If no choices: throw new Error("No Choice has been present in the response")
    throw new Error("Not implemented");
  }

  private async _processToolCalls(
    toolCalls: Array<Record<string, unknown>>,
  ): Promise<Message[]> {
    //TODO:
    // For each toolCall in toolCalls:
    // 1. Extract tool_call_id = toolCall["id"]
    // 2. Extract function = toolCall["function"], functionName = function["name"]
    // 3. Parse arguments: JSON.parse(function["arguments"])
    // 4. Call this._callTool(functionName, arguments) to get toolExecutionResult
    // 5. Build: new Message(Role.TOOL, toolExecutionResult, tool_call_id, functionName)
    // 6. Print: `FUNCTION '${functionName}'\n${toolExecutionResult}\n${"-".repeat(50)}`
    // Return the list of tool messages
    throw new Error("Not implemented");
  }

  private async _callTool(
    functionName: string,
    args: Record<string, unknown>,
  ): Promise<string> {
    //TODO:
    // 1. Look up the tool in this._toolsDict by functionName
    // 2. If found, call await tool.execute(args) and return the result
    // 3. If not found, return `Unknown function: ${functionName}`
    throw new Error("Not implemented");
  }
}
