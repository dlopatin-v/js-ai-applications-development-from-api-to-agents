#!/usr/bin/env node
/**
 * Safe math expression evaluator (vanilla Node.js, no dependencies).
 * No eval() on raw strings — only a hand-written recursive-descent parser
 * over a whitelisted grammar.
 * Usage: node calculate.js "<expression>"
 */

"use strict";

const SAFE_NAMES = {
  sqrt: Math.sqrt,
  abs: Math.abs,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  log: Math.log,
  log10: Math.log10,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  pi: Math.PI,
  e: Math.E,
};

class ZeroDivisionError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ZeroDivisionError";
  }
}

/**
 * Tokenises and evaluates a math expression using a recursive-descent parser.
 * Supports: +, -, *, /, **, ^, %, //, unary +/-, parentheses, and the
 * functions/constants listed in SAFE_NAMES.
 */
function safeEval(raw) {
  const expr = raw.replace(/\^/g, "**");
  let pos = 0;

  function peek() {
    while (pos < expr.length && expr[pos] === " ") pos++;
    return expr[pos] ?? "";
  }

  function consume(ch) {
    while (pos < expr.length && expr[pos] === " ") pos++;
    if (expr[pos] !== ch) throw new Error(`Expected '${ch}' at position ${pos}`);
    pos++;
  }

  function parseExpr() {
    return parseAddSub();
  }

  function parseAddSub() {
    let left = parseMulDiv();
    while (true) {
      const ch = peek();
      if (ch === "+") { pos++; left += parseMulDiv(); }
      else if (ch === "-") { pos++; left -= parseMulDiv(); }
      else break;
    }
    return left;
  }

  function parseMulDiv() {
    let left = parsePow();
    while (true) {
      const ch = peek();
      if (ch === "*" && expr[pos + 1] !== "*") {
        pos++;
        left *= parsePow();
      } else if (ch === "/" && expr[pos + 1] === "/") {
        pos += 2;
        const right = parsePow();
        if (right === 0) throw new ZeroDivisionError("Division by zero");
        left = Math.floor(left / right);
      } else if (ch === "/") {
        pos++;
        const right = parsePow();
        if (right === 0) throw new ZeroDivisionError("Division by zero");
        left /= right;
      } else if (ch === "%") {
        pos++;
        left %= parsePow();
      } else {
        break;
      }
    }
    return left;
  }

  function parsePow() {
    const base = parseUnary();
    if (peek() === "*" && expr[pos + 1] === "*") {
      pos += 2;
      const exp = parseUnary();
      return Math.pow(base, exp);
    }
    return base;
  }

  function parseUnary() {
    const ch = peek();
    if (ch === "-") { pos++; return -parseUnary(); }
    if (ch === "+") { pos++; return parseUnary(); }
    return parseAtom();
  }

  function parseAtom() {
    const ch = peek();

    // Parenthesised expression
    if (ch === "(") {
      consume("(");
      const val = parseExpr();
      consume(")");
      return val;
    }

    // Number literal
    if ((ch >= "0" && ch <= "9") || ch === ".") {
      let s = "";
      while (
        pos < expr.length &&
        (
          (expr[pos] >= "0" && expr[pos] <= "9") ||
          expr[pos] === "." ||
          expr[pos] === "e" ||
          expr[pos] === "E" ||
          (expr[pos] === "-" && (expr[pos - 1] === "e" || expr[pos - 1] === "E"))
        )
      ) {
        s += expr[pos++];
      }
      const n = Number(s);
      if (Number.isNaN(n)) throw new Error(`Invalid number: ${s}`);
      return n;
    }

    // Identifier (function or constant)
    if (/[a-zA-Z_]/.test(ch)) {
      let name = "";
      while (pos < expr.length && /[a-zA-Z_0-9]/.test(expr[pos])) {
        name += expr[pos++];
      }
      const lower = name.toLowerCase();
      if (!(lower in SAFE_NAMES)) throw new Error(`Unknown name '${name}'`);
      const entry = SAFE_NAMES[lower];
      if (typeof entry === "number") return entry;
      // It's a function — expect parentheses
      consume("(");
      const arg = parseExpr();
      consume(")");
      return entry(arg);
    }

    throw new Error(`Unexpected character '${ch}' at position ${pos}`);
  }

  while (pos < expr.length && expr[pos] === " ") pos++;
  const result = parseExpr();
  while (pos < expr.length && expr[pos] === " ") pos++;
  if (pos < expr.length) {
    throw new Error(`Unexpected characters after expression: '${expr.slice(pos)}'`);
  }
  return result;
}

function fmtResult(result) {
  if (Number.isInteger(result)) return String(result);
  // Up to 10 significant digits, strip trailing zeros
  return result.toPrecision(10).replace(/\.?0+$/, "");
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node calculate.js "<expression>"');
    process.exit(1);
  }

  const expression = args.join(" ");
  try {
    const result = safeEval(expression);
    console.log(`Expression: ${expression}`);
    console.log(`Result: ${fmtResult(result)}`);
  } catch (e) {
    if (e instanceof ZeroDivisionError) {
      console.log(`Error: Division by zero in: ${expression}`);
    } else {
      console.log(`Error: ${e.message}`);
    }
    process.exit(1);
  }
}

main();
