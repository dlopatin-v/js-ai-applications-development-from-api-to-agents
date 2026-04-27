import { OPENAI_HOST } from "../../commons/index.js";
import { OpenAIClientT3 } from "../_openai_client";

/**
 * The size of the generated image.
 */
enum Size {
  Square = '1024x1024',
  HeightRectangle = '1024x1792',
  WidthRectangle = '1792x1024'
}

/**
 * The style of the generated image. Must be one of vivid or natural.
 *  - Vivid causes the model to lean towards generating hyper-real and dramatic images.
 *  - Natural causes the model to produce more natural, less hyper-real looking images.
 */
enum Style {
  Natural = 'natural',
  Vivid = 'vivid'
}

/**
 * The quality of the image that will be generated.
 *  - ‘hd’ creates images with finer details and greater consistency across the image.
 */
enum Quality {
  Standard = 'standard',
  HD = 'hd'
}

function main(modelName: string, request: string, size = Size.Square, style = Style.Natural, quality = Quality.Standard) {
  const client = new OpenAIClientT3(OPENAI_HOST + "/v1/images/generations");

  client.call({
    model: modelName,
    prompt: request,
    size,
    style,
    quality,
  });
}

main("dall-e-3", "smiling catdog");