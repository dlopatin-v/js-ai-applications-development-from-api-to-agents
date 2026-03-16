import { v4 as uuidV4 } from "uuid";
import { Message } from "./message";

export class Conversation {
  id: string = uuidV4();
  messages: Array<Message> = []

  addMessage = (message: Message) => {
    this.messages.push(message);
  }
}
