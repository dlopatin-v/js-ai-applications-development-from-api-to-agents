import * as fs from "node:fs";
import * as path from "node:path";
import { OpenAIClientT3 } from "../_openai_client";
import { OPENAI_HOST } from "../../commons";

// https://platform.openai.com/docs/guides/vision?format=url
// https://platform.openai.com/docs/guides/vision?format=base64-encoded

// @TODO:
// You need to analyse these 2 images:
//   - https://a-z-animals.com/media/2019/11/Elephant-male-1024x535.jpg
//   - in this folder we have 'logo.png', load it as encoded data (see documentation)
// ---
// Hints:
//   - Use OpenAIClientT3 to connect to OpenAI API
//   - Use /v1/chat/completions endpoint
//   - Function to encode image to base64 you can find in documentation
// ---
// In the end load both images (url and base64 encoded 'logo.png'), ask "Generate poem based on images" and see what will happen?
