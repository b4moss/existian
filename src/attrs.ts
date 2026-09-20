import type { CheckAttrs, HttpMethod } from "./types.js";

const METHODS = new Set<string>(["GET", "POST", "PUT", "PATCH", "DELETE"]);

function attrName(prefix: string, suffix: string): string {
  return `${prefix}-${suffix}`;
}

function readRaw(el: Element, prefix: string, suffix: string): string | null {
  const value = el.getAttribute(attrName(prefix, suffix));
  return value;
}

function parseMs(raw: string | null): number | null {
  if (raw === null || raw.trim() === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return n;
}

function parseMethod(raw: string | null): HttpMethod {
  if (raw === null || raw.trim() === "") return "GET";
  const upper = raw.trim().toUpperCase();
  if (METHODS.has(upper)) return upper as HttpMethod;
  return "GET";
}

function parseEvents(raw: string | null): string[] {
  if (raw === null || raw.trim() === "") return ["input"];
  return raw
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Read existian check configuration from a DOM element.
 */
export function readAttrs(el: Element, prefix: string): CheckAttrs {
  const checkRaw = readRaw(el, prefix, "check");
  const check =
    checkRaw === null || checkRaw.trim() === "" ? null : checkRaw;

  const matchRaw = readRaw(el, prefix, "response-match");

  return {
    check,
    method: parseMethod(readRaw(el, prefix, "method")),
    debounceMs: parseMs(readRaw(el, prefix, "debounce")),
    timeoutMs: parseMs(readRaw(el, prefix, "timeout")),
    events: parseEvents(readRaw(el, prefix, "events")),
    state: readRaw(el, prefix, "state"),
    pending: readRaw(el, prefix, "pending"),
    target: readRaw(el, prefix, "target"),
    responseProperty: readRaw(el, prefix, "response-property"),
    responseValue: readRaw(el, prefix, "response-value"),
    responseMatch: matchRaw === null || matchRaw.trim() === "" ? "exact" : matchRaw,
  };
}
