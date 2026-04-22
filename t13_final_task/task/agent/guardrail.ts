/**
 * UMSDataGuardrail
 *
 * Redacts credit card numbers (num, cvv, exp_date) and salary values from
 * UMS tool results before they are added to the conversation history.
 *
 * UMS returns data in a YAML-like format, e.g.:
 *   salary: 85000
 *   credit_card: {'num': '5047-7145-8294-8166', 'cvv': '259', 'exp_date': '10/2031'}
 *
 * Note: Unlike the Python version which uses Microsoft Presidio (an NLP pipeline),
 * in TypeScript we implement this with pure regex redaction — which is simpler and
 * sufficient for the structured YAML/JSON output format the UMS produces.
 */

const REDACTED = "***";

// Credit card number patterns (Python dict, JSON dict, standalone)
// Each regex is constructed fresh per call via a factory to ensure lastIndex resets.
const CC_PATTERN_SOURCES: Array<[string, string]> = [
  // 'num': '5047-7145-8294-8166'
  [String.raw`(?<='num': ')\d{4}[-\s]\d{4}[-\s]\d{4}[-\s]\d{4}(?=')`, "g"],
  // "num": "5047-7145-8294-8166"
  [String.raw`(?<="num": ")\d{4}[-\s]\d{4}[-\s]\d{4}[-\s]\d{4}(?=")`, "g"],
  // standalone  — run after the lookbehind variants to avoid double-masking
  [String.raw`\b\d{4}[-\s]\d{4}[-\s]\d{4}[-\s]\d{4}\b`, "g"],
  // 'cvv': '259'
  [String.raw`(?<='cvv': ')\d{3,4}(?=')`, "g"],
  // "cvv": "259"
  [String.raw`(?<="cvv": ")\d{3,4}(?=")`, "g"],
  // 'exp_date': '08/2029'
  [String.raw`(?<='exp_date': ')\d{2}\/\d{4}(?=')`, "g"],
  // "exp_date": "08/2029"
  [String.raw`(?<="exp_date": ")\d{2}\/\d{4}(?=")`, "g"],
];

// Salary patterns (YAML, JSON, Python dict, plain text)
const SALARY_PATTERN_SOURCES: Array<[string, string]> = [
  // salary: 85000
  [String.raw`(?<=salary: )\d[\d,]*(?:\.\d+)?`, "g"],
  // "salary": 85000
  [String.raw`(?<="salary": )\d[\d,]*(?:\.\d+)?`, "g"],
  // 'salary': 85000
  [String.raw`(?<='salary': )\d[\d,]*(?:\.\d+)?`, "g"],
  // Annual salary: $85,000  (case-insensitive)
  [String.raw`(?<=salary: )\$?[\d,]+(?:\.\d+)?`, "gi"],
];

export class UMSDataGuardrail {
  /**
   * Redacts credit card and salary data from a tool result string.
   * Applies all CC patterns first, then all salary patterns.
   * Each RegExp is re-created on every call to guarantee a clean lastIndex.
   */
  redact(text: string): string {
    // TODO:
    // - Apply each CC_PATTERN_SOURCES regex to replace matches with REDACTED
    // - Apply each SALARY_PATTERN_SOURCES regex to replace matches with REDACTED
    // - Return the redacted text
    throw new Error("Not implemented");
  }
}
