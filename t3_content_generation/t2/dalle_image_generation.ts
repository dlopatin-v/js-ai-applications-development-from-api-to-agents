import { OpenAIClientT3 } from "../_openai_client";

import { OPENAI_HOST } from "../../commons";

// https://platform.openai.com/docs/guides/image-generation?image-generation-model=dall-e-3

enum Size {
  SQUARE = "1024x1024",
  HEIGHT_RECTANGLE = "1024x1792",
  WIDTH_RECTANGLE = "1792x1024",
}

enum Style {
  /** Vivid causes the model to lean towards generating hyper-real and dramatic images. */
  VIVID = "vivid",
  /** Natural causes the model to produce more natural, less hyper-real looking images. */
  NATURAL = "natural",
}

enum Quality {
  STANDARD = "standard",
  /** Creates images with finer details and greater consistency across the image. */
  HD = "hd",
}

// https://platform.openai.com/docs/api-reference/images/create
// Request:
// curl https://api.openai.com/v1/images/generations \
//   -H "Content-Type: application/json" \
//   -H "Authorization: Bearer $OPENAI_API_KEY" \
//   -d '{
//     "model": "dall-e-3",
//     "prompt": "smiling catdog",
//     "size": "1024x1024",
//     "style": "natural",
//     "quality": "standard"
//   }'

async function main(
  modelName: string,
  request: string,
  size: Size = Size.SQUARE,
  style: Style = Style.NATURAL,
  quality: Quality = Quality.STANDARD
) {
  // TODO:
  // 1. Create an OpenAIClientT3 with OPENAI_HOST + "/v1/images/generations" as the endpoint
  // 2. Call client.call() with:
  //    - model: modelName
  //    - prompt: request
  //    - size: size
  //    - style: style
  //    - quality: quality
  throw new Error("Not implemented");
}

main(
  // TODO:
  // - modelName: "dall-e-3"
  // - request: "Smiling catdog"
  // Play with configurations (size, style, quality)
  "dall-e-3",
  ""
);
