import * as fs from "fs";
import * as path from "path";

export function getFileContent(filePath: string): string {
  // TODO:
  // 1. If the file does not exist (use fs.existsSync), return `"ERROR: File not found: ${filePath}"`
  // 2. If the path is not a file (use fs.statSync(...).isFile()), return `"ERROR: Not a file: ${filePath}"`
  // 3. Return the file contents as a UTF-8 string (use fs.readFileSync with "utf-8")
  throw new Error("Not implemented");
}
