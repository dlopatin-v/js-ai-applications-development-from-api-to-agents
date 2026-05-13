import * as fs from "fs";
import * as path from "node:path";

import { OpenAIClientT3 } from "../_openai_client";

import { OPENAI_HOST } from "../../commons";

// https://developers.openai.com/api/reference/resources/images/methods/generate
// ---
// Request:
// curl -X POST "https://api.openai.com/v1/images/generations" \
//     -H "Authorization: Bearer $OPENAI_API_KEY" \
//     -H "Content-type: application/json" \
//     -d '{
//          "model": "gpt-image-2",
//          "prompt": "smiling catdog."
//     }'
// Response:
// {
//   "created": 1699900000,
//   "data": [
//   {
//     "b64_json": Qt0n6ArYAEABGOhEoYgVAJFdt8jM79uW2DO...,
//   }
// ]
// }

interface GptImageParams {
  n?: number;
  size?: string;
  quality?: string;
}

function main(modelName: string, request: string, args?: GptImageParams) {
  const client = new OpenAIClientT3(OPENAI_HOST + "/v1/images/generations");

  client.call({
    model: modelName,
    prompt: request,
    ...( args || {} )
  }).then((response) => {
    const imageBase64 = (response["data"] as { b64_json: string }[])[0].b64_json;
    const imageBytes = Buffer.from(imageBase64, "base64");
    const filename = `${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
    fs.writeFileSync(path.join(__dirname, filename), imageBytes);
    console.log(`Image saved as ${filename}`);
  });
}

main("gpt-image-2", "smiling catdog");