import { OPENAI_API_KEY, OPENAI_HOST } from "../../commons";
import * as fs from "node:fs";
import * as path from "node:path";

// https://platform.openai.com/docs/guides/audio#add-audio-to-your-existing-application

class _OpenAIClient {
  private _apiKey: string;
  private _endpoint: string;

  constructor() {
    // TODO:
    // 1. Check that OPENAI_API_KEY is present; if not, throw an error
    // 2. Set this._apiKey = "Bearer " + OPENAI_API_KEY
    // 3. Set this._endpoint = OPENAI_HOST + "/v1/chat/completions"
    throw new Error("Not implemented");
  }

  async call(printRequest = true, printResponse = true, kwargs: Record<string, unknown> = {}): Promise<void> {
    // TODO:
    // 1. Set up headers: Authorization: this._apiKey, Content-Type: "application/json"
    // 2. If printRequest: console.log(JSON.stringify(kwargs, null, 2))
    // 3. Make a POST request to this._endpoint:
    //    - headers: headers
    //    - body: JSON.stringify(kwargs)
    // 4. If response.ok (status 200):
    //    - Parse response JSON, assign to `data`
    //    - If printResponse: console.log(JSON.stringify(data, null, 2))
    //    - Drill into: data?.choices?.[0]?.message?.audio?.data
    //    - If audio data is present:
    //        - Decode it: Buffer.from(audioData, "base64")
    //        - Create outputFile = `${new Date().toISOString()}.mp3`
    //        - Write buffer to outputFile using fs.writeFileSync
    //        - console.log(`Audio saved to ${outputFile}`)
    // 5. Otherwise: throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    throw new Error("Not implemented");
  }
}

function encodeAudio(audioFilePath: string): string {
  // TODO:
  // Function to encode audio to base64 (works the same way as image encoding)
  // 1. Read the file as a Buffer using fs.readFileSync(audioFilePath)
  // 2. Convert to base64 string using buffer.toString("base64")
  // 3. Return the base64 string
  throw new Error("Not implemented");
}

const client = new _OpenAIClient();
client.call(
  // TODO:
  // - printRequest: true
  // - printResponse: true
  // - kwargs: {
  //     model: "gpt-4o-audio-preview",
  //     modalities: ["text", "audio"],
  //     audio: { voice: "ballad", format: "mp3" },
  //     messages: [
  //       {
  //         role: "user",
  //         content: [
  //           {
  //             type: "input_audio",
  //             input_audio: {
  //               data: encodeAudio(path.join(__dirname, "question.mp3")),
  //               format: "mp3"
  //             }
  //           }
  //         ]
  //       }
  //     ]
  //   }
  // ---
  // Optional: Instead of input_audio you can send text and the model will generate an audio response.
  true,
  true,
  {}
);
