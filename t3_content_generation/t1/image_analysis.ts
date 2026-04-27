import * as fs from "node:fs";
import * as path from "node:path";

import { OpenAIClientT3 } from "../_openai_client";

import { OPENAI_HOST } from "../../commons";

// https://platform.openai.com/docs/guides/vision?format=url
// https://developers.openai.com/api/docs/guides/images-vision?lang=javascript

function encodeImage(imagePath: string): string {
  // TODO:
  // Function to encode image to base64 you can find in documentation
  // https://developers.openai.com/api/docs/guides/images-vision?lang=javascript
  // 1. Read the file as a Buffer using fs.readFileSync(imagePath)
  // 2. Convert to base64 string using buffer.toString("base64")
  // 3. Return the base64 string
  throw new Error("Not implemented");
}

async function main(modelName: string, imgUrls: string[], request: string = "What's in this image/s?") {
  // TODO:
  // 1. Create an OpenAIClientT3 with OPENAI_HOST + "/v1/chat/completions" as the endpoint
  // 2. Prepare imgContent array:
  //    - iterate through imgUrls and map each to: { type: "image_url", image_url: { url: imgUrl } }
  // 3. Call client.call() with:
  //    - model: modelName
  //    - messages: [{ role: "user", content: [{ type: "text", text: request }, ...imgContent] }]
  throw new Error("Not implemented");
}

main(
  // TODO:
  // - modelName: "gpt-4o-mini"
  // - imgUrls: [
  //     "https://a-z-animals.com/media/2019/11/Elephant-male-1024x535.jpg",
  //     // or base64: `data:image/jpeg;base64,${encodeImage(path.join(__dirname, "logo.png"))}`
  //   ]
  // ---
  // In the end load both images (url and base64 encoded 'logo.png'), ask "Generate poem based on images" and see what will happen?
  "gpt-4o-mini",
  []
);
