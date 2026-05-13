import * as fs from "node:fs";
import * as path from "node:path";

import { OPENAI_HOST, OPENAI_API_KEY } from "../../commons";

// https://developers.openai.com/api/reference/resources/images/methods/edit
// ---
// Request (multipart/form-data, NOT json):
// curl -X POST "https://api.openai.com/v1/images/edits" \
//     -H "Authorization: Bearer $OPENAI_API_KEY" \
//     -F "model=gpt-image-2" \
//     -F "image=@logo.png" \
//     -F "prompt=Add magical sparkles and glowing aura around the logo"
// Response:
// {
//   "created": 1699900000,
//   "data": [
//     {
//       "b64_json": "Qt0n6ArYAEABGOhEoYgVAJFdt8jM79uW2DO..."
//     }
//   ]
// }

interface ImageEditResponse {
  created: number;
  data: { b64_json: string }[];
}

class _OpenAIClient {
  private _apiKey: string;
  private _endpoint: string;

  constructor() {
    //TODO:
    // 1. Check that OPENAI_API_KEY is present; if not, throw an error
    // 2. Set this._apiKey = "Bearer " + OPENAI_API_KEY
    // 3. Set this._endpoint = OPENAI_HOST + "/v1/images/edits"
    throw new Error("Not implemented");
  }

  async call({
    imagePath, model, prompt, ...extras
  }: {
    imagePath: string;
    model: string;
    prompt: string;
    n?: number;
    size?: string;
    quality?: string;
  }): Promise<ImageEditResponse> {
    //TODO:
    // 1. Read the image file from disk:
    //    - const fileContent = fs.readFileSync(imagePath)
    // 2. Build a FormData object:
    //    - append "model" with the model name
    //    - append "prompt" with the prompt text
    //    - append "image" with a new Blob([fileContent], { type: "image/png" }) and path.basename(imagePath) as the filename
    //    - iterate over `extras` (n, size, quality) and append each key/value pair when the value is defined (use String(value))
    // 3. Set up headers:
    //    - Authorization: this._apiKey
    //    - (do NOT set Content-Type manually — fetch/FormData sets it with the boundary automatically)
    // 4. Make a POST request to this._endpoint with the FormData as the body
    // 5. If response.status === 200:
    //    - parse and return the response as ImageEditResponse
    // 6. Otherwise: throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    throw new Error("Not implemented");
  }
}


const client = new _OpenAIClient();

client.call({
  //TODO:
  // - Optional extras: n, size, quality
  model: "gpt-image-2",
  imagePath: path.join(__dirname, "logo.png"),
  prompt:
    "Transform this DIALX Community logo by adding magical sparkles, " +
    "glowing stars, and a soft mystical aura around the letters. " +
    "Keep the original text and shape clearly readable.",
}).then((response) => {
  const imageBase64 = response.data[0].b64_json;
  const imageBytes = Buffer.from(imageBase64, "base64");
  const filename = `edited_${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
  fs.writeFileSync(path.join(__dirname, filename), imageBytes);
  console.log(`Edited image saved as ${filename}`);
});