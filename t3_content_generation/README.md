# Content Generation

In this task, you will work with multimodal AI APIs to generate and process different types of content — images, speech, 
and audio. The goal is to understand how to work with vision models, image generation models, speech-to-text, text-to-speech, and audio models.

**Run from the repository root:**

| Task | Command |
|---|---|
| Image Analysis | `npm run t3:image-analysis` |
| DALL-E 3 Image Generation | `npm run t3:dalle` |
| GPT Image 1 Generation | `npm run t3:gpt-image` |
| Speech to Text | `npm run t3:speech-to-text` |
| Text to Speech | `npm run t3:text-to-speech` |
| Speech to Speech | `npm run t3:speech-to-speech` |

---

### If the task in the main branch is hard for you, switch to the `main-detailed` branch

---

## Task

### 1. Image Analysis (Vision)
Open [t1/image_analysis.ts](t1/image_analysis.ts) and implement the TODO:
- Analyse two images using `gpt-4o` via `/v1/chat/completions`:
  - A remote image by URL: `https://a-z-animals.com/media/2019/11/Elephant-male-1024x535.jpg`
  - A local image `logo.png` — encode it to base64 (see [docs](https://developers.openai.com/api/docs/guides/images-vision?format=base64-encoded))
- Pass both images in a single message and ask the model to generate a poem based on them

### 2. Image Generation
#### DALL-E 3
Open [t2/dalle_image_generation.ts](t2/dalle_image_generation.ts) and implement the TODO:
- Generate an image of `"Smiling catdog"` using `dall-e-3` via `/v1/images/generations`
- Play with parameters: `size` (square / portrait / landscape), `style` (vivid / natural), `quality` (standard / hd)
- The response contains a URL to the generated image

#### GPT Image 1
Open [t2/gpt_image_generation.ts](t2/gpt_image_generation.ts) and implement the TODO:
- Generate an image of `"Smiling catdog"` using `gpt-image-1` via `/v1/images/generations`
- Decode the base64 response and save the image locally

### 3. Speech to Text
Open [t3/speech_to_text.ts](t3/speech_to_text.ts) and implement the TODO:
- Transcribe `audio_sample.mp3` using the OpenAI `/v1/audio/transcriptions` endpoint
- Send the file as `multipart/form-data`
- Try both `whisper-1` and `gpt-4o-transcribe` models and compare results

### 4. Text to Speech
Open [t4/text_to_speech.ts](t4/text_to_speech.ts) and implement the TODO:
- Convert text to speech using `gpt-4o-mini-tts` via `/v1/audio/speech`
- Experiment with different voices from the `Voice` class (alloy, coral, nova, etc.)
- Use the `instructions` field to set the speaking style (e.g. `"Speak in a cheerful and positive tone."`)
- Save the binary response as an `.mp3` file

### 5. Speech to Speech
Open [t5/speech_to_speech.ts](t5/speech_to_speech.ts) and implement the TODO:
- Use `gpt-4o-audio-preview` via `/v1/chat/completions` to answer an audio question
- Send `question.mp3` encoded as base64 inside the message content
- Set `modalities=["text", "audio"]` and `audio={"voice": "ballad", "format": "mp3"}`
- Decode the base64 audio from the response and save it as an `.mp3` file

---

## Bonus: Gemini Image Generation

Explore Google's image generation capabilities using the Gemini API.

### Gemini Native Image Generation
- [Docs](https://ai.google.dev/gemini-api/docs/image-generation)
- Model: `gemini-2.5-flash-image`
- Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- Set `responseModalities: ["TEXT", "IMAGE"]`
- The response contains interleaved text and inline image data (base64)
- Try generating the same `"Smiling catdog"` prompt and compare with OpenAI results

### Imagen 4
- [Docs](https://ai.google.dev/gemini-api/docs/imagen)
- Models: `imagen-4.0-generate-001`, `imagen-4.0-fast-generate-001`, `imagen-4.0-ultra-generate-001`
- Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:predict`
- Key parameters: `numberOfImages` (1–4), `aspectRatio` (1:1, 9:16, 16:9, ...), `personGeneration`
- All generated images include a SynthID watermark
- `GEMINI_API_KEY` is already available in `constants.ts`

---

**Congratulations 🎉 You can now generate and process images, speech, and audio with AI APIs!**