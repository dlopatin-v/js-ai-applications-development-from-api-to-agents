import * as fs from "node:fs";
import * as path from "node:path";

import { Client, ClientConfig } from "pg";

import { EmbeddingsClient } from "./embeddings_client";
import { chunkText } from "../utils/text";

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

  private async getConnection() {
    await this.client.connect();
  }

  // TODO:
  //  Implement `processTextFile(filePath, chunkSize, overlap, dimensions, truncateTable?)` that:
  //  - Validates chunkSize (≥ 10) and overlap (0 ≤ overlap < chunkSize)
  //  - Optionally truncates the `vectors` table
  //  - Reads the file, chunks the content with `chunkText()`, generates embeddings,
  //    and inserts each chunk + embedding into PostgreSQL
  //  Hint: embeddings must be saved as a string wrapped in `[...]` and cast to `::vector`

  // TODO:
  //  Implement `search(searchMode, userRequest, topK, scoreThreshold, dimensions)` that:
  //  - Validates topK (≥ 1) and scoreThreshold (0 ≤ x ≤ 1)
  //  - Embeds the userRequest and searches the DB for similar vectors
  //  - Returns an array of matching text chunks ordered by descending similarity
  //  Hint 1: Euclidean distance `<->`, Cosine distance `<=>`
  //  Hint 2: Filter by distance in WHERE clause; ORDER BY distance LIMIT topK
  //
}

// SELECT text, embedding <-> '[0.23, -0.45, ...]'::vector AS distance
// FROM vectors
// WHERE embedding <-> '[0.23, -0.45, ...]'::vector <= {maxDistance}
// ORDER BY distance
// LIMIT {topK};
