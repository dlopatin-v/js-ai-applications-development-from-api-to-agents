import { Request, Response } from "express";

export const API_KEY = "dev-secret-key";

export function checkApiKey(req: Request, res: Response): boolean {
  //TODO:
  // 1. Read req.headers["x-api-key"]
  // 2. If it matches API_KEY, return true
  // 3. Otherwise write 401 JSON: { error: "Unauthorized", detail: "Invalid or missing API key" }
  //    and return false
  throw new Error("Not implemented.");
}
