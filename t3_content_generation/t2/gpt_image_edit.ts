import * as fs from "node:fs";
import * as path from "node:path";

import { OPENAI_HOST, OPENAI_API_KEY } from "../../commons";

// https://developers.openai.com/api/reference/resources/images/methods/edit
// ---
// Request (multipart/form-data, NOT json):
// curl -X POST "https://api.openai.com/v1/images/edits" \
//     -H "Authorization: Bearer $OPENAI_API_KEY" \
//     -F "model=gpt-image-1" \
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

class OpenAIClient {
  constructor(
    public endpoint: string,
  ) {
    if (!OPENAI_API_KEY) {
      throw new Error("API key cannot be null or empty");
    }

    this.apiKey = `Bearer ${OPENAI_API_KEY}`;
  }

  apiKey: string;

  call = async ({
    imagePath, model, prompt, ...extras
  }: {
    imagePath: string;
    model: string;
    prompt: string;
    n?: number;
    size?: string;
    quality?: string;
  }): Promise<ImageEditResponse> => {
    const headers = {
      "Authorization": this.apiKey,
    };

    const fileContent = fs.readFileSync(imagePath);
    const form = new FormData();
    form.append("model", model);
    form.append("prompt", prompt);
    form.append("image", new Blob([fileContent], { type: "image/png" }), path.basename(imagePath));
    for (const [key, value] of Object.entries(extras)) {
      if (value !== undefined) {
        form.append(key, String(value));
      }
    }

    const response = await fetch(this.endpoint, { headers, method: "POST", body: form });

    if (response.status === 200) {
      return (await response.json()) as ImageEditResponse;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}


const client = new OpenAIClient(OPENAI_HOST + "/v1/images/edits");

client.call({
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