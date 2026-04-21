import { Client, ClientConfig } from "pg";
import { chunkText } from "../utils/text";
import * as fs from "node:fs";
import * as path from "node:path";
import { EmbeddingsClient } from "./embeddings_client";

export enum SearchMode {
  EUCLIDIAN_DISTANCE = "euclidean", // Euclidean distance (<->)
  COSINE_DISTANCE = "cosine"  // Cosine distance (<=>)
}

/** Processor for text documents that handles chunking, embedding, storing, and retrieval. */
export class TextProcessor {
  constructor(
    private embeddingClient: EmbeddingsClient,
    dbConfig: ClientConfig
  ) {
    this.client = new Client(dbConfig);
    this.getConnection();
  }

  client: Client;

  /** Open the PostgreSQL connection. Called once during construction. */
  private async getConnection() {
    await this.client.connect();
  }

  /** Truncate the `vectors` table, removing all stored embeddings. */
  private async truncateTable() {
    // TODO:
    //  1. Execute query `TRUNCATE TABLE vectors` via `this.client.query()`
    //  2. Log: "Table has been successfully truncated."
  }

  /**
   * Save a single text chunk with its embedding vector to the database.
   *
   * @param embedding - The embedding vector for the chunk.
   * @param chunk - The raw text chunk.
   * @param documentName - Source document identifier stored alongside the chunk.
   */
  private async saveChunk(embedding: Array<number>, chunk: string, documentName: string) {
    // TODO:
    //  1. Convert the embedding array to pgvector string format:
    //       const vectorString = `[${embedding.join(',')}]`;
    //  2. Write the INSERT query:
    //       const query = "INSERT INTO vectors (document_name, text, embedding) VALUES ($1, $2, $3::vector)";
    //       const values = [documentName, chunk, vectorString];
    //  3. Execute the query via `this.client.query(query, values)`
    //  4. Log: `Stored chunk from document: ${documentName}`
  }

  /**
   * Build the pgvector similarity-search SQL query for the given distance metric.
   *
   * @param mode - The distance metric to use (`EUCLIDIAN_DISTANCE` or `COSINE_DISTANCE`).
   * @returns A parameterised SQL string with `$1` (vector), `$2` (max distance), `$3` (limit).
   */
  private getSearchQuery(mode: SearchMode) {
    const searchMode = mode === SearchMode.EUCLIDIAN_DISTANCE ? '<->' : '<=>';
    return `SELECT text, embedding ${searchMode} $1::vector AS distance
            FROM vectors
            WHERE embedding ${searchMode} $1::vector <= $2
            ORDER BY distance
            LIMIT $3
    `;
  }

  /**
   * Load content from a file, chunk it, generate embeddings, and persist them to the DB.
   *
   * @param filePath - Path to the source text file (resolved relative to `__dirname`).
   * @param chunkSize - Size of each text chunk in characters (minimum 10).
   * @param overlap - Number of characters shared between consecutive chunks (must be < `chunkSize`).
   * @param dimensions - Desired embedding vector dimensionality.
   * @param truncateTable - When `true`, clears the `vectors` table before inserting new data.
   */
  async processTextFile(filePath: string, chunkSize: number, overlap: number, dimensions: number, truncateTable = false) {
    if (chunkSize < 10) {
      throw new Error("chunkSize must be at least 10 characters");
    }
    if (overlap < 0) {
      throw new Error("overlap must be at least 0");
    }
    if (overlap >= chunkSize) {
      throw new Error("overlap should be lower than chunkSize");
    }

    // TODO:
    //  1. If truncateTable is true, call `this.truncateTable()`
    //  2. Read file content:
    //       const fileContent = fs.readFileSync(path.join(__dirname, filePath)).toString();
    //  3. Chunk the content using `chunkText(fileContent, chunkSize, overlap)` → assign to `chunks`
    //  4. Generate embeddings for all chunks via `this.embeddingClient.getEmbeddings(chunks, dimensions)` → assign to `embeddings`

    console.log(`Processing document: ${filePath}`);
    // console.log(`Total embeddings: ${Object.keys(embeddings).length}`);
    // console.log(`Total chunks: ${chunks.length}`);

    // TODO:
    //  1. Iterate over chunks with index: `chunks.map(async (chunk, i) => { ... })`
    //  2. For each chunk, call `this.saveChunk(embeddings[i], chunk, filePath)`
  }

  /**
   * Perform a vector similarity search against the stored embeddings.
   *
   * @param searchMode - Distance metric to use (`COSINE_DISTANCE` or `EUCLIDIAN_DISTANCE`).
   * @param userRequest - The user's query text; will be embedded on the fly.
   * @param topK - Maximum number of results to return (minimum 1).
   * @param scoreThreshold - Minimum similarity score in the range `[0.0 … 0.99]`.
   * @param dimensions - Dimensionality used when embedding the query
   *   (must match the dimensionality of the stored vectors).
   * @returns An array of matching text chunks ordered by descending similarity.
   */
  async search(searchMode: SearchMode, userRequest: string, topK: number, scoreThreshold: number, dimensions: number): Promise<Array<string>> {
    if (topK < 1) {
      throw new Error("top_k must be at least 1");
    }
    if (scoreThreshold < 0 || scoreThreshold > 1) {
      throw new Error("scoreThreshold must be in [0.0..., 0.99...] range");
    }

    // TODO:
    //  1. Embed the userRequest via `this.embeddingClient.getEmbeddings(userRequest, dimensions)`
    //       → assign result to `queryEmbedding`
    //  2. Convert the embedding to a pgvector string:
    //       - Access the vector via Object.keys(queryEmbedding) and iterate
    //       - Wrap with `[${vectorString}]`
    //       → assign to `vectorString`

    let maxDistance: number;
    if (searchMode === SearchMode.COSINE_DISTANCE) {
      maxDistance = 1.0 - scoreThreshold;
    } else {
      maxDistance = scoreThreshold === 0 ? Infinity : (1.0 / scoreThreshold) - 1.0;
    }

    const retrievedChunks: Array<string> = [];
    const result = await this.client.query(
      this.getSearchQuery(searchMode),
      // TODO:
      //  Pass the query parameters: [vectorString, maxDistance, topK]
      []
    );

    result.rows.forEach((row) => {
      let similarity: number;
      if (searchMode == SearchMode.COSINE_DISTANCE) {
        similarity = 1.0 - row.distance;
      } else {
        similarity = 1.0 / (1.0 + row.distance);
      }

      console.log(`---Similarity score: ${similarity}---`);
      console.log(`Data: ${row.text}\n`);
      retrievedChunks.push(row.text);
    });

    return retrievedChunks;
  }

}
