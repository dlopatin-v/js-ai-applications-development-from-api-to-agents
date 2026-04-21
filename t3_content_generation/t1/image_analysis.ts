import * as fs from "node:fs";
import * as path from "node:path";

import { OPENAI_HOST } from "commons";
import { OpenAIClientT3 } from "../_openai_client";

const encodeImage = (path: string): string => {
  const image = fs.readFileSync(path);
  return image.toString("base64");
}

const main = (model: string, imageUrls: string[], request = "What's in this image/s?") => {
  const client = new OpenAIClientT3(OPENAI_HOST + "/v1/chat/completions");

const imgContent: { type: "image_url"; image_url: { url: string } }[] = imageUrls.map((imageUrl) => ({
    "type": "image_url" as const,
    "image_url": {
      "url": imageUrl
    }
  }))

  const messages = [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": request
        },
        ...imgContent
      ]
    }
  ];

  client.call({ model, messages })
}


main(
  "gpt-5.2",
  [
    'https://a-z-animals.com/media/2019/11/Elephant-male-1024x535.jpg',
    `data:image/jpeg;base64,${encodeImage(path.join(__dirname, 'logo.png'))}`
  ],
  "Poem based on images",
);
