import * as fs from "node:fs";
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
//     {
//       "b64_json": "Qt0n6ArYAEABGOhEoYgVAJFdt8jM79uW2DO..."
//     }
//   ]
// }

async function main(modelName: string, request: string) {
  //TODO:
  // 1. Create an OpenAIClientT3 with OPENAI_HOST + "/v1/images/generations" as the endpoint
  // 2. Call client.call() with:
  //    - model: modelName
  //    - prompt: request
  // 3. Parse the response JSON and get data[0].b64_json — assign to `imageBase64`
  // 4. Decode it: Buffer.from(imageBase64, "base64") — assign to `imageBytes`
  // 5. Create filename as `${new Date().toISOString()}.png`
  // 6. Write imageBytes to the file using fs.writeFileSync(filename, imageBytes)
  throw new Error("Not implemented");
}

main(
  //TODO:
  // - request: "Smiling catdog"
  "gpt-image-2",
  ""
);
