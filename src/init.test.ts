import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { init } from "./init.js";

describe("init", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("binds input events into the check pipeline", async () => {
    document.body.innerHTML = `<input id="u" data-ex-check="/api/users" />`;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ exists: true }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    init();
    const input = document.querySelector("#u") as HTMLInputElement;
    input.value = "alice";
    input.dispatchEvent(new Event("input"));
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalled();
    expect(input.getAttribute("data-ex-status")).toBe("success");
  });

  it("respects custom prefix", async () => {
    document.body.innerHTML = `
      <input id="a" data-ex-check="/api/ex" />
      <input id="b" data-my-check="/api/my" />
    `;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    init({ prefix: "data-my" });
    const a = document.querySelector("#a") as HTMLInputElement;
    const b = document.querySelector("#b") as HTMLInputElement;
    a.value = "x";
    a.dispatchEvent(new Event("input"));
    b.value = "y";
    b.dispatchEvent(new Event("input"));
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]![0])).toContain("/api/my");
  });

  it("limits binding to the provided root", async () => {
    document.body.innerHTML = `
      <div id="inner"><input id="in" data-ex-check="/api/in" /></div>
      <input id="out" data-ex-check="/api/out" />
    `;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    init({ root: document.querySelector("#inner")! });
    const inner = document.querySelector("#in") as HTMLInputElement;
    const outer = document.querySelector("#out") as HTMLInputElement;
    inner.value = "1";
    inner.dispatchEvent(new Event("input"));
    outer.value = "2";
    outer.dispatchEvent(new Event("input"));
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]![0])).toContain("/api/in");
  });

  it("does not throw when nothing to bind", () => {
    document.body.innerHTML = `<input type="text" />`;
    expect(() => init()).not.toThrow();
  });

  it("ignores inputs without check attribute", async () => {
    document.body.innerHTML = `<input id="plain" type="text" />`;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    init();
    const input = document.querySelector("#plain") as HTMLInputElement;
    input.dispatchEvent(new Event("input"));
    await vi.runAllTimersAsync();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to default prefix when empty", async () => {
    document.body.innerHTML = `<input id="u" data-ex-check="/api/x" />`;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    expect(() => init({ prefix: "" })).not.toThrow();
    const input = document.querySelector("#u") as HTMLInputElement;
    input.value = "z";
    input.dispatchEvent(new Event("input"));
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalled();
  });

  it("does not double-bind on repeated init", async () => {
    document.body.innerHTML = `<input id="u" data-ex-check="/api/x" data-ex-debounce="0" />`;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    init();
    init();
    const input = document.querySelector("#u") as HTMLInputElement;
    input.value = "once";
    input.dispatchEvent(new Event("input"));
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
