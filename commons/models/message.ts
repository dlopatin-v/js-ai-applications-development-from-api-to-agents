export class Message<T = unknown> {
  constructor(
    public role: string,
    public content: string,
    public tool_call_id?: string,
    public name?: string,
    public tool_calls?: T[]
  ) {}
}