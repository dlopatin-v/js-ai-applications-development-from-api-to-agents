import * as fs from "node:fs";
import * as path from "node:path";

import { OPENAI_API_KEY, OPENAI_HOST } from "../../commons";

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

// https://platform.openai.com/docs/guides/text-to-speech
// Request:
// curl https://api.openai.com/v1/audio/speech \
//   -H "Authorization: Bearer $OPENAI_API_KEY" \
//   -H "Content-Type: application/json" \
//   -d '{
//     "model": "gpt-4o-mini-tts",
//     "input": "Why can'\''t we say that black is white?",
//     "voice": "coral",
//     "instructions": "Speak in a cheerful and positive tone."
//   }'
// Response:
//   bytes with audio

class _OpenAIClient {
  private _apiKey: string;
  private _endpoint: string;

  constructor() {
    // TODO:
    // 1. Check that OPENAI_API_KEY is present; if not, throw an error
    // 2. Set this._apiKey = "Bearer " + OPENAI_API_KEY
    // 3. Set this._endpoint = OPENAI_HOST + "/v1/audio/speech"
    throw new Error("Not implemented");
  }

  async call(printRequest = true, kwargs: Record<string, unknown> = {}): Promise<void> {
    // TODO:
    // 1. Set up headers: Authorization: this._apiKey, Content-Type: "application/json"
    // 2. Create outputFile name as `${new Date().toISOString()}.mp3`
    // 3. If printRequest: console.log(JSON.stringify(kwargs, null, 2))
    // 4. Make a POST request to this._endpoint:
    //    - headers: headers
    //    - body: JSON.stringify(kwargs)
    // 5. If response.ok (status 200):
    //    - Get the response as an ArrayBuffer: await response.arrayBuffer()
    //    - Convert to Buffer: Buffer.from(arrayBuffer)
    //    - Write to outputFile using fs.writeFileSync(outputFile, buffer)
    //    - console.log(`Audio saved to ${outputFile}`)
    // 6. Otherwise: throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    throw new Error("Not implemented");
  }
}

const client = new _OpenAIClient();
client.call(
  // TODO:
  // - printRequest: true
  // - kwargs: {
  //     model: "gpt-4o-mini-tts",
  //     input: "Why can't we say that black is white?",
  //     voice: Voice.CORAL,
  //     instructions: "Speak in a cheerful and positive tone."
  //   }
  // - Play with different Voice values
  true,
  {}
);
