import * as fs from "fs";
import * as path from "path";

export function getFileContent(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return `ERROR: File not found: ${filePath}`;
  }
  if (!fs.statSync(filePath).isFile()) {
    return `ERROR: Not a file: ${filePath}`;
  }
  return fs.readFileSync(filePath, "utf-8");
}