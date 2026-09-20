import { describe, expect, it } from "vitest";
import { applyStatus } from "./state.js";

describe("applyStatus", () => {
  it("writes status to input and shared state elements", () => {
    document.body.innerHTML = `
      <input id="u" data-ex-check="/api" data-ex-state="username" />
      <p data-ex-state="username"></p>
    `;
    const input = document.querySelector("#u") as HTMLElement;
    applyStatus({
      prefix: "data-ex",
      source: input,
      attrs: {
        check: "/api",
        method: "GET",
        debounceMs: null,
        timeoutMs: null,
        events: ["input"],
        state: "username",
        pending: null,
        target: null,
        responseProperty: null,
        responseValue: null,
        responseMatch: "exact",
      },
      status: "success",
    });
    expect(input.getAttribute("data-ex-status")).toBe("success");
    expect(
      document.querySelector("p")?.getAttribute("data-ex-status"),
    ).toBe("success");
  });

  it("also updates data-ex-target element", () => {
    document.body.innerHTML = `
      <input id="u" data-ex-check="/api" data-ex-target="#msg" />
      <p id="msg"></p>
    `;
    const input = document.querySelector("#u") as HTMLElement;
    applyStatus({
      prefix: "data-ex",
      source: input,
      attrs: {
        check: "/api",
        method: "GET",
        debounceMs: null,
        timeoutMs: null,
        events: ["input"],
        state: null,
        pending: null,
        target: "#msg",
        responseProperty: null,
        responseValue: null,
        responseMatch: "exact",
      },
      status: "invalid",
    });
    expect(input.getAttribute("data-ex-status")).toBe("invalid");
    expect(
      document.querySelector("#msg")?.getAttribute("data-ex-status"),
    ).toBe("invalid");
  });

  it("clears pending hook when leaving pending", () => {
    document.body.innerHTML = `
      <input id="u" data-ex-check="/api" data-ex-pending="busy" />
    `;
    const input = document.querySelector("#u") as HTMLElement;
    const base = {
      prefix: "data-ex",
      source: input,
      attrs: {
        check: "/api",
        method: "GET" as const,
        debounceMs: null,
        timeoutMs: null,
        events: ["input"],
        state: null,
        pending: "busy",
        target: null,
        responseProperty: null,
        responseValue: null,
        responseMatch: "exact",
      },
    };
    applyStatus({ ...base, status: "pending" });
    expect(input.getAttribute("data-ex-pending-active")).toBe("busy");
    applyStatus({ ...base, status: "success" });
    expect(input.getAttribute("data-ex-status")).toBe("success");
    expect(input.hasAttribute("data-ex-pending-active")).toBe(false);
  });

  it("ignores missing target without throwing", () => {
    document.body.innerHTML = `
      <input id="u" data-ex-check="/api" data-ex-target="#missing" />
    `;
    const input = document.querySelector("#u") as HTMLElement;
    expect(() =>
      applyStatus({
        prefix: "data-ex",
        source: input,
        attrs: {
          check: "/api",
          method: "GET",
          debounceMs: null,
          timeoutMs: null,
          events: ["input"],
          state: null,
          pending: null,
          target: "#missing",
          responseProperty: null,
          responseValue: null,
          responseMatch: "exact",
        },
        status: "error",
        errorKind: "network",
      }),
    ).not.toThrow();
    expect(input.getAttribute("data-ex-status")).toBe("error");
    expect(input.getAttribute("data-ex-error")).toBe("network");
  });

  it("updates source even when no shared state nodes exist", () => {
    document.body.innerHTML = `<input id="u" data-ex-check="/api" data-ex-state="solo" />`;
    const input = document.querySelector("#u") as HTMLElement;
    applyStatus({
      prefix: "data-ex",
      source: input,
      attrs: {
        check: "/api",
        method: "GET",
        debounceMs: null,
        timeoutMs: null,
        events: ["input"],
        state: "solo",
        pending: null,
        target: null,
        responseProperty: null,
        responseValue: null,
        responseMatch: "exact",
      },
      status: "idle",
    });
    expect(input.getAttribute("data-ex-status")).toBe("idle");
  });

  it("ignores unknown status without throwing", () => {
    document.body.innerHTML = `<input id="u" data-ex-check="/api" />`;
    const input = document.querySelector("#u") as HTMLElement;
    expect(() =>
      applyStatus({
        prefix: "data-ex",
        source: input,
        attrs: {
          check: "/api",
          method: "GET",
          debounceMs: null,
          timeoutMs: null,
          events: ["input"],
          state: null,
          pending: null,
          target: null,
          responseProperty: null,
          responseValue: null,
          responseMatch: "exact",
        },
        status: "weird" as "idle",
      }),
    ).not.toThrow();
  });

  it("clears error attribute when leaving error", () => {
    document.body.innerHTML = `<input id="u" data-ex-check="/api" />`;
    const input = document.querySelector("#u") as HTMLElement;
    const base = {
      prefix: "data-ex",
      source: input,
      attrs: {
        check: "/api",
        method: "GET" as const,
        debounceMs: null,
        timeoutMs: null,
        events: ["input"],
        state: null,
        pending: null,
        target: null,
        responseProperty: null,
        responseValue: null,
        responseMatch: "exact",
      },
    };
    applyStatus({ ...base, status: "error", errorKind: "timeout" });
    applyStatus({ ...base, status: "success" });
    expect(input.hasAttribute("data-ex-error")).toBe(false);
  });
});
