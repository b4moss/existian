export type MatchConfig = {
  property?: string | null;
  value?: string | null;
  match?: string | null;
};

export type MatchResult = {
  status: "success" | "invalid";
};

function stringifyValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }
  if (value === null || value === undefined) return "";
  return String(value);
}

/**
 * Compare a JSON body field against configured match rules.
 */
export function matchResponse(
  body: unknown,
  config: MatchConfig,
): MatchResult {
  const property = config.property ?? null;
  if (property === null || property === "") {
    return { status: "success" };
  }

  if (body === null || typeof body !== "object") {
    return { status: "invalid" };
  }

  const record = body as Record<string, unknown>;
  if (!(property in record)) {
    return { status: "invalid" };
  }

  const actual = stringifyValue(record[property]);
  const expected = config.value ?? "";
  const mode = config.match ?? "exact";

  if (mode === "exact") {
    return { status: actual === expected ? "success" : "invalid" };
  }

  if (mode === "regex") {
    try {
      const re = new RegExp(expected);
      return { status: re.test(actual) ? "success" : "invalid" };
    } catch {
      return { status: "invalid" };
    }
  }

  return { status: "invalid" };
}
