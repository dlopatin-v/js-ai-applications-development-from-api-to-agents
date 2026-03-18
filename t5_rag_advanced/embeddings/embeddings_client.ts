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

  private formData = (inputs: Array<{ index: 0, embedding: Array<number>, object: 'string' }>): EmbeddingList => {
    const structuredEmbeddings: EmbeddingList = {};
    inputs.forEach(({ embedding, index }) => {
      structuredEmbeddings[index] = embedding;
    });
    return structuredEmbeddings;
  }

  // TODO:
  //  Implement `getEmbeddings(inputs, dimensions, printResponse)` that:
  //  - Sends a POST request to the Embeddings API
  //  - Builds the request body with: input, model, dimensions
  //  - Returns an indexed map of embedding vectors: { 0: [...], 1: [...], ... }
  //
  // https://platform.openai.com/docs/api-reference/embeddings/create
  //
  // Request example:
  //   POST https://api.openai.com/v1/embeddings
  //   { "input": "Your text", "model": "text-embedding-3-small", "dimensions": 384 }
  //
  // Response JSON:
  //   {
  //     "data": [
  //       { "embedding": [0.196, ...], "index": 0, "object": "embedding" }
  //     ], ...
  //   }

}
