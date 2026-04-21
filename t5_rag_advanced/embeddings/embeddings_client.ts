type EmbeddingList = Record<number, Array<number>>;

/**
 * Client for generating text embeddings via the OpenAI Embeddings API.
 * Wraps raw HTTP requests and structures the indexed response.
 */
export class EmbeddingsClient {
  constructor(
    public endpoint: string,
    public modelName: string,
    public apiKey: string
  ) {
    if  (!apiKey) {
      throw new Error("API key cannot be null or empty");
    }

    this.apiKey = `Bearer ${apiKey}`;
  }

  /**
   * Transform the raw `data` array from the Embeddings API response into an
   * index-keyed map.
   *
   * @param inputs - The `data` array from the API response.
   * @returns A map of `{ index: embeddingVector }` pairs.
   */
  private formData = (inputs: Array<{ index: 0, embedding: Array<number>, object: 'string' }>): EmbeddingList => {
    const structuredEmbeddings: EmbeddingList = {};
    inputs.forEach(({ embedding, index }) => {
      structuredEmbeddings[index] = embedding;
    });
    return structuredEmbeddings;
  }

  /**
   * Generate an indexed map of embeddings for one or more input texts.
   *
   * Maps input indices to their embedding vectors:
   *   inputs[0](text) -> [0][embedding]
   *   inputs[1](text) -> [1][embedding]
   *   ...
   *
   * @param inputs - A single text string or array of strings to embed.
   * @param dimensions - Desired vector dimensionality (e.g. 384 for text-embedding-3-small).
   * @param printResponse - When true, pretty-prints the full API response to console.
   * @returns A map of `{ index: embeddingVector }` pairs.
   */
  async getEmbeddings(inputs: string | Array<string>, dimensions: number, printResponse = true): Promise<EmbeddingList> {
    console.log(`Creating embeddings for \`${inputs}\` \nAnd such dimensions: ${dimensions}\n📋Results:\n`);

    const headers = {
      "Content-Type": "application/json",
      "Authorization": this.apiKey
    };

    const requestData = {
      // TODO: add:
      //  - input: inputs
      //  - model: this.modelName
      //  - dimensions
      //  https://platform.openai.com/docs/api-reference/embeddings/create
    };

    const response = await fetch(this.endpoint, { method: "POST", body: JSON.stringify(requestData), headers });

    if (response.status === 200) {
        // TODO: Get response:
        //  Response JSON:
        //  {
        //     "data": [
        //         {
        //             "embedding": [
        //                 0.19686688482761383,
        //                 ...
        //             ],
        //             "index": 0,
        //             "object": "embedding"
        //         }
        //     ],
        //     ...
        //  }
        const data = null; // TODO: Parse to json (await response.json())
        if (printResponse) {
          console.log("=".repeat(50) + "RESPONSE" + "=".repeat(50));
          console.log(JSON.stringify(data, null, 2));
          console.log("=".repeat(108));
        }
        throw new Error("Not implemented");
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

  }



}
