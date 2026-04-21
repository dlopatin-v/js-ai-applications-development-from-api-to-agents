/**
 * Split text into overlapping chunks of a fixed character size.
 *
 * Example: For `"Hello World Programming"` with `chunkSize=8` and `overlap=3`:
 *   - Chunk 1: `"Hello Wo"` (positions 0–7)
 *   - Chunk 2: `"o World "` (positions 5–12, overlapping `"o W"`)
 *   - Chunk 3: `"ld Progr"` (positions 10–17, overlapping `"ld "`)
 *   - …and so on
 *
 * @param text - The source text to split.
 * @param chunkSize - Maximum number of characters per chunk.
 * @param overlap - Number of characters from the end of each chunk carried over to the start of the next.
 * @returns An array of text chunks; an empty array if `text` is falsy.
 */
export function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  if(!text) {
    return [];
  }

  if (text.length <= chunkSize ) {
    return [text];
  }

  const chunks = [];
  let currentPosition = 0;
  while (currentPosition < text.length) {
    const endPosition = Math.min(currentPosition + chunkSize, text.length);
    const chunk = text.substring(currentPosition, endPosition);
    chunks.push(chunk);

    currentPosition = endPosition -  overlap;
    if (currentPosition >= text.length - overlap && endPosition === text.length) {
      break;
    }
  }

  return chunks;
}