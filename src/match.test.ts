import { describe, expect, it } from "vitest";
import { matchResponse } from "./match.js";

describe("matchResponse", () => {
  it("returns success for exact boolean string match", () => {
    expect(
      matchResponse(
        { exists: true },
        { property: "exists", value: "true", match: "exact" },
      ),
    ).toEqual({ status: "success" });
  });

  it("returns invalid when exact value differs", () => {
    expect(
      matchResponse(
        { exists: true },
        { property: "exists", value: "false", match: "exact" },
      ),
    ).toEqual({ status: "invalid" });
  });

  it("returns success when property is omitted", () => {
    expect(matchResponse({ exists: true }, {})).toEqual({
      status: "success",
    });
  });

  it("supports regex match", () => {
    expect(
      matchResponse(
        { code: "AB-12" },
        { property: "code", value: "^AB-", match: "regex" },
      ),
    ).toEqual({ status: "success" });
  });

  it("returns invalid when property is missing", () => {
    expect(
      matchResponse({}, { property: "exists", value: "true" }),
    ).toEqual({ status: "invalid" });
  });

  it("returns invalid for bad regex without throwing", () => {
    expect(
      matchResponse(
        { code: "x" },
        { property: "code", value: "(", match: "regex" },
      ),
    ).toEqual({ status: "invalid" });
  });

  it("returns invalid for non-object body with property", () => {
    expect(
      matchResponse(null, { property: "exists", value: "true" }),
    ).toEqual({ status: "invalid" });
    expect(
      matchResponse("nope", { property: "exists", value: "true" }),
    ).toEqual({ status: "invalid" });
  });

  it("returns invalid for unknown match mode", () => {
    expect(
      matchResponse(
        { exists: true },
        { property: "exists", value: "true", match: "fuzzy" },
      ),
    ).toEqual({ status: "invalid" });
  });
});
