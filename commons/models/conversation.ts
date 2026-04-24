import { v4 as uuidV4 } from "uuid";
import { Message } from "./message";

export class Conversation<T> {
  id: string = uuidV4();
  messages: Message<T>[] = []

  addMessage = (message: Message<T>) => {
    this.messages.push(message);
  }
}