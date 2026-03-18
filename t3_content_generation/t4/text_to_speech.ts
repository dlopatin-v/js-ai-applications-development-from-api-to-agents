import { OPENAI_API_KEY, OPENAI_HOST } from "../../commons";
import * as fs from "node:fs";
import * as path from "node:path";

enum Voice {
  ALLOY = 'alloy',
  ASH = 'ash',
  BALLAD = 'ballad',
  CORAL = 'coral',
  ECHO = 'echo',
  FABLE = 'fable',
  NOVA = 'nova',
  ONYX = 'onyx',
  SAGE = 'sage',
  SHIMMER = 'shimmer'
}

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
      [key: string]: any;
    }) => {

    const headers = {
      "Authorization": this.apiKey,
      "Content-Type": "application/json"
    };

    const filename = `${new Date().getTime()}.mp3`;

    if (args.printRequest) {
      console.log(JSON.stringify(args, null, 2));
    }

    const response = await fetch(this.endpoint, {headers, method: "POST", body: JSON.stringify(args)});

    if (response.status === 200) {
      const reader = response.body.getReader();
      fs.writeFileSync(path.join(__dirname, filename), reader.read().toString());
      console.log("Audio content saved to " + filename);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}

const client = new OpenAIClient(OPENAI_HOST + "/v1/audio/speech");

client.call({
  model: "gpt-4o-mini-tts",
  input: "Why can't we say that black is white?",
  voice: Voice.CORAL,
  instructions: "Speak in a cheerful and positive tone."
});
