/**
 * Tiny structured logger that mirrors Python's stdlib `logging` output format:
 *
 *   2026-04-28T12:34:56.789Z - <name> - <LEVEL> - <message> {optional JSON context}
 *
 * Each `getLogger(name)` returns a logger bound to the module name. The optional
 * second argument to each level method is a context object that is JSON-stringified
 * onto the end of the line — this matches Python's `logger.info("msg", extra={...})`.
 *
 * Levels are wired to the matching `console.*` method so they integrate cleanly
 * with Docker logs and devtools level filtering.
 */

export interface Logger {
  debug(message: string, extra?: Record<string, unknown>): void;
  info(message: string, extra?: Record<string, unknown>): void;
  warn(message: string, extra?: Record<string, unknown>): void;
  error(message: string, extra?: Record<string, unknown>): void;
}

function format(name: string, level: string, message: string, extra?: Record<string, unknown>): string {
  const ts = new Date().toISOString();
  const base = `${ts} - ${name} - ${level} - ${message}`;
  if (extra === undefined || Object.keys(extra).length === 0) return base;
  return `${base} ${JSON.stringify(extra)}`;
}

export function getLogger(name: string): Logger {
  return {
    debug(message, extra) { console.debug(format(name, "DEBUG", message, extra)); },
    info(message, extra)  { console.info(format(name, "INFO",  message, extra)); },
    warn(message, extra)  { console.warn(format(name, "WARNING", message, extra)); },
    error(message, extra) { console.error(format(name, "ERROR", message, extra)); },
  };
}
