import { OPENAI_HOST } from "../../commons";
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
 *  - 'hd' creates images with finer details and greater consistency across the image.
 */
enum Quality {
  Standard = 'standard',
  HD = 'hd'
}

// https://platform.openai.com/docs/guides/image-generation
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

// @TODO:
// You need to create some images with `dall-e-3` model:
//   - Generate an image with 'Smiling catdog'
//   - Play with configurations (size, style, quality)
// ---
// Hints:
//   - Use OpenAIClientT3 to connect to OpenAI API
//   - Use /v1/images/generations endpoint
//   - The link with generated image will be returned in response
