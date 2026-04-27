import * as fs from "node:fs";
import * as path from "node:path";

import { OPENAI_API_KEY, OPENAI_HOST } from "../../commons/index.js";

class OpenAIClient {
  constructor(
    public endpoint: string,
  ) {
    if (!OPENAI_API_KEY) {
      throw new Error("API key cannot be null or empty")
    }

    this.apiKey = `Bearer ${OPENAI_API_KEY}`
  }

  apiKey: string;

  call = async (
    args: {
      printRequest?: boolean;
      model: string;
      modalities: string[];
      audio: { voice: string; format: string };
      messages: { role: string; content: unknown[] | string }[];
    }) => {

    const headers = {
      "Authorization": this.apiKey,
      "Content-Type": "application/json"
    };

    if (args.printRequest) {
      console.log(JSON.stringify(args, null, 2));
    }

    const filename = `${new Date().getTime()}.mp3`;

    const response = await fetch(this.endpoint, {headers, method: "POST", body: JSON.stringify(args)});

    if (response.status === 200) {
      interface SpeechToSpeechResponse {
        choices: { message: { audio?: { data: string } } }[];
      }
      const data = await response.json() as SpeechToSpeechResponse;
      const audio_data = data.choices[0]?.message?.audio?.data;

      if (audio_data) {
        const audio_bytes = Buffer.from(audio_data, "base64");
        fs.writeFileSync(path.join(__dirname, filename), audio_bytes);
        console.log("Audio content saved to " + filename);
        return;
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}

const client = new OpenAIClient(OPENAI_HOST + "/v1/chat/completions");
const encodeAudio = (filePath: string): string => {
  const fileContent = fs.readFileSync(filePath);
  return fileContent.toString("base64");
}


client.call({
  model: "gpt-audio",
  modalities: ["text", "audio"],
  audio: {"voice": "ballad", "format": "mp3"},
  messages: [
    {
      "role": "user",
      "content": [
        {
          "type": "input_audio",
          "input_audio": {
            "data": encodeAudio(path.join(__dirname, "./question.mp3")),
            "format": "mp3"
          }
        }
      ]
    }
  ]
})