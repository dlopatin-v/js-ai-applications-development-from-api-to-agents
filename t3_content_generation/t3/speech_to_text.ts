import { OPENAI_HOST, OPENAI_API_KEY } from "../../commons";
import fs from "node:fs";
import path from "node:path";

// https://platform.openai.com/docs/guides/speech-to-text

class _OpenAIClient {
  private _apiKey: string;
  private _endpoint: string;

  constructor() {
    // TODO:
    // 1. Check that OPENAI_API_KEY is present; if not, throw an error
    // 2. Set this._apiKey = "Bearer " + OPENAI_API_KEY
    // 3. Set this._endpoint = OPENAI_HOST + "/v1/audio/transcriptions"
    throw new Error("Not implemented");
  }

  async call(audioFilePath: string, printResponse = true, kwargs: Record<string, string> = {}): Promise<void> {
    // TODO:
    // 1. Build a FormData object:
    //    - append "file" with fs.createReadStream(audioFilePath) and the filename
    //    - append each key/value pair from kwargs (e.g. model, language)
    // 2. Set up headers:
    //    - Authorization: this._apiKey
    //    - (do NOT set Content-Type manually — fetch/FormData sets it with the boundary automatically)
    // 3. Make a POST request to this._endpoint with the FormData as the body
    // 4. If response.ok (status 200):
    //    - parse response as JSON
    //    - if printResponse: console.log(JSON.stringify(data, null, 2))
    // 5. Otherwise: throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    throw new Error("Not implemented");
  }
}

const client = new _OpenAIClient();
client.call(
  // TODO:
  // - audioFilePath: path.join(__dirname, "audio_sample.mp3")
  // - kwargs: { model: "whisper-1" }  or  { model: "gpt-4o-transcribe" }
  // - Optional: try audio in different languages
  path.join(__dirname, "audio_sample.mp3"),
  true,
  {}
);
