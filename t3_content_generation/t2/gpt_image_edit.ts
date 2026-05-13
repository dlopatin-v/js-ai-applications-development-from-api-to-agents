import * as fs from "node:fs";
import * as path from "node:path";

import { OPENAI_HOST, OPENAI_API_KEY } from "../../commons";

// https://developers.openai.com/api/reference/resources/images/methods/edit

//TODO:
// You need to edit 'logo.png' by adding magical sparkles and a glowing aura:
//   - Create a client that will go to OpenAI image edits API
//   - Call API and provide the image file (pay attention that you work with 'multipart/form-data', NOT json)
//   - Get response with the edited image as base64
//   - Decode the base64 and save the edited image to disk
// ---
// Hints:
//   - Use /v1/images/edits endpoint
//   - Use gpt-image-1 model
//   - Request fields: model, image (file), prompt, and optionally n, size, quality
//   - Response shape: { created: number, data: [{ b64_json: string }] }
//   - Suggested prompt:
//       "Transform this DIALX Community logo by adding magical sparkles,
//        glowing stars, and a soft mystical aura around the letters.
//        Keep the original text and shape clearly readable."