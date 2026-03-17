import { OpenAIClientT3 } from "../_openai_client";
import { OPENAI_HOST } from "../../commons";

// https://platform.openai.com/docs/guides/image-generation?image-generation-model=gpt-image-1&api=image&multi-turn=imageid
// ---
// Request:
// curl -X POST "https://api.openai.com/v1/images/generations" \
//     -H "Authorization: Bearer $OPENAI_API_KEY" \
//     -H "Content-type: application/json" \
//     -d '{
//          "model": "gpt-image-1",
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

function main(modelName: string, request: string, args?: any) {
  const client = new OpenAIClientT3(OPENAI_HOST + "/v1/images/generations");

  client.call({
    model: modelName,
    prompt: request,
    ...( args || {} )
  });
}

main("gpt-image-1", "smiling catdog");