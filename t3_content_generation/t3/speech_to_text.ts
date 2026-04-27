import { OPENAI_HOST, OPENAI_API_KEY } from "../../commons/index.js";
import * as fs from "node:fs";
import * as path from "node:path";

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

  call = async ({
    audioFilePath, ...args
  }: {
    audioFilePath: string;
    model: string;
    language?: string;
    prompt?: string;
    response_format?: string;
    temperature?: number;
  }) => {

    const headers = {
      "Authorization": this.apiKey,
    };

    const fileContent = fs.readFileSync(audioFilePath);
    const form = new FormData();
    form.append("file", new Blob([fileContent]), audioFilePath);
    form.append("model", args.model);
    const response = await fetch(this.endpoint, {headers, method: "POST", body: form});

    if (response.status === 200) {
      interface TranscriptionResponse { text: string }
      const result = await response.json() as TranscriptionResponse;
      if (result) {
        console.log(JSON.stringify(result, null, 2));
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}


const client = new OpenAIClient(OPENAI_HOST + "/v1/audio/transcriptions");

client.call({
  model: "gpt-4o-transcribe", // Use whisper-1 or gpt-4o-transcribe
  audioFilePath: path.join(__dirname, "audio_sample.mp3"),
});
