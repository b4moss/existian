import { describe, expect, it } from "vitest";
import { init } from "./init.js";

describe("init (bootstrap smoke)", () => {
  it("does not throw without options", () => {
    expect(() => init()).not.toThrow();
  });
});
