export class Message {
  constructor(
    public role: string,
    public content: string,
    public toolCallId?: string,
    public name?: string,
    public toolCalls?: Array<Record<string, unknown>>
  ) {}
}
