import { describe, expect, it } from "vitest";
import { readAttrs } from "./attrs.js";

function el(html: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.innerHTML = html.trim();
  return wrap.firstElementChild as HTMLElement;
}

describe("readAttrs", () => {
  it("parses check-only element with defaults", () => {
    const node = el('<input data-ex-check="/api/x" />');
    const attrs = readAttrs(node, "data-ex");
    expect(attrs.check).toBe("/api/x");
    expect(attrs.method).toBe("GET");
    expect(attrs.events).toEqual(["input"]);
    expect(attrs.responseMatch).toBe("exact");
    expect(attrs.debounceMs).toBeNull();
    expect(attrs.timeoutMs).toBeNull();
  });

  it("parses all supported attributes", () => {
    const node = el(`<input
      data-ex-check="/api/users"
      data-ex-method="POST"
      data-ex-debounce="300"
      data-ex-timeout="5000"
      data-ex-events="input change"
      data-ex-state="username"
      data-ex-pending="busy"
      data-ex-target="#msg"
      data-ex-response-property="exists"
      data-ex-response-value="true"
      data-ex-response-match="regex"
    />`);
    const attrs = readAttrs(node, "data-ex");
    expect(attrs).toMatchObject({
      check: "/api/users",
      method: "POST",
      debounceMs: 300,
      timeoutMs: 5000,
      events: ["input", "change"],
      state: "username",
      pending: "busy",
      target: "#msg",
      responseProperty: "exists",
      responseValue: "true",
      responseMatch: "regex",
    });
  });

  it("uses custom prefix and ignores other prefixes", () => {
    const node = el(
      '<input data-ex-check="/ignored" data-my-check="/api/my" data-my-method="PUT" />',
    );
    const attrs = readAttrs(node, "data-my");
    expect(attrs.check).toBe("/api/my");
    expect(attrs.method).toBe("PUT");
  });

  it("returns null check when attribute is missing", () => {
    const node = el("<input type=\"text\" />");
    expect(readAttrs(node, "data-ex").check).toBeNull();
  });

  it("treats non-numeric debounce as unset", () => {
    const node = el(
      '<input data-ex-check="/api/x" data-ex-debounce="abc" />',
    );
    expect(readAttrs(node, "data-ex").debounceMs).toBeNull();
    const empty = el(
      '<input data-ex-check="/api/x" data-ex-debounce="" />',
    );
    expect(readAttrs(empty, "data-ex").debounceMs).toBeNull();
  });

  it("falls back to GET when method is empty", () => {
    const node = el(
      '<input data-ex-check="/api/x" data-ex-method="" />',
    );
    expect(readAttrs(node, "data-ex").method).toBe("GET");
  });

  it("passes through unknown response-match without throwing", () => {
    const node = el(
      '<input data-ex-check="/api/x" data-ex-response-match="fuzzy" />',
    );
    expect(readAttrs(node, "data-ex").responseMatch).toBe("fuzzy");
  });
});
