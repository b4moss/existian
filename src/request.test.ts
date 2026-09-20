import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCheckRunner } from "./request.js";
import type { CheckAttrs } from "./types.js";

function baseAttrs(over: Partial<CheckAttrs> = {}): CheckAttrs {
  return {
    check: "/api/x",
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
    ...over,
  };
}

let element: HTMLInputElement;

describe("createCheckRunner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    element = document.createElement("input");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("sends GET with value query", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const onResult = vi.fn();
    const runner = createCheckRunner({
      attrs: baseAttrs(),
      element,
      onResult,
    });
    runner.schedule("alice");
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("/api/x");
    expect(String(url)).toContain("value=alice");
    expect(init?.method).toBe("GET");
  });

  it("sends POST JSON body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const runner = createCheckRunner({
      attrs: baseAttrs({ method: "POST" }),
      element,
      onResult: vi.fn(),
    });
    runner.schedule("alice");
    await vi.runAllTimersAsync();
    await Promise.resolve();
    const [, init] = fetchMock.mock.calls[0]!;
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({
      "Content-Type": "application/json",
    });
    expect(init?.body).toBe(JSON.stringify({ value: "alice" }));
  });

  it("serializes requests and runs latest pending value", async () => {
    let resolveFirst!: (v: Response) => void;
    const first = new Promise<Response>((r) => {
      resolveFirst = r;
    });
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => first)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const onResult = vi.fn();
    const runner = createCheckRunner({
      attrs: baseAttrs(),
      element,
      onResult,
    });
    runner.schedule("a");
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    runner.schedule("b");
    runner.schedule("c");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveFirst(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    for (let i = 0; i < 20 && fetchMock.mock.calls.length < 2; i++) {
      await Promise.resolve();
    }
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1]![0])).toContain("value=c");
  });

  it("reports network errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    const onResult = vi.fn();
    const runner = createCheckRunner({
      attrs: baseAttrs(),
      element,
      onResult,
    });
    runner.schedule("x");
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ ok: false, errorKind: "network" }),
    );
  });

  it("reports http errors with status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("nope", { status: 500 })),
    );
    const onResult = vi.fn();
    const runner = createCheckRunner({
      attrs: baseAttrs(),
      element,
      onResult,
    });
    runner.schedule("x");
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        errorKind: "http",
        httpStatus: 500,
      }),
    );
  });

  it("times out and ignores late success", async () => {
    let resolveLate!: (v: Response) => void;
    const late = new Promise<Response>((r) => {
      resolveLate = r;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
        const signal = init?.signal;
        return new Promise((resolve, reject) => {
          late.then(resolve, reject);
          signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        });
      }),
    );
    const onResult = vi.fn();
    const runner = createCheckRunner({
      attrs: baseAttrs({ timeoutMs: 100 }),
      element,
      onResult,
    });
    runner.schedule("x");
    await vi.advanceTimersByTimeAsync(100);
    await Promise.resolve();
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ ok: false, errorKind: "timeout" }),
    );
    onResult.mockClear();
    resolveLate(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await Promise.resolve();
    expect(onResult).not.toHaveBeenCalled();
  });

  it("does not apply results from a superseded generation", async () => {
    let resolveFirst!: (v: Response) => void;
    const first = new Promise<Response>((r) => {
      resolveFirst = r;
    });
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => first)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ from: "second" }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const onResult = vi.fn();
    const runner = createCheckRunner({
      attrs: baseAttrs({ timeoutMs: 50 }),
      element,
      onResult,
    });
    runner.schedule("old");
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(50);
    await Promise.resolve();
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ ok: false, errorKind: "timeout" }),
    );
    onResult.mockClear();
    runner.schedule("new");
    for (let i = 0; i < 20 && fetchMock.mock.calls.length < 2; i++) {
      await Promise.resolve();
    }
    expect(fetchMock).toHaveBeenCalledTimes(2);
    resolveFirst(new Response(JSON.stringify({ from: "old" }), { status: 200 }));
    for (let i = 0; i < 10; i++) await Promise.resolve();
    const okCalls = onResult.mock.calls.filter((c) => c[0].ok);
    expect(
      okCalls.every(
        (c) => (c[0] as { body?: { from?: string } }).body?.from === "second",
      ),
    ).toBe(true);
    expect(
      okCalls.some(
        (c) => (c[0] as { body?: { from?: string } }).body?.from === "old",
      ),
    ).toBe(false);
  });

  it("treats non-json 2xx as failure without throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("not-json", { status: 200 })),
    );
    const onResult = vi.fn();
    const runner = createCheckRunner({
      attrs: baseAttrs(),
      element,
      onResult,
    });
    runner.schedule("x");
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ ok: false, errorKind: "http" }),
    );
  });

  it("applies buildRequest body and headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const runner = createCheckRunner({
      attrs: baseAttrs({ method: "POST" }),
      element,
      onResult: vi.fn(),
      buildRequest: (ctx) => ({
        init: {
          body: JSON.stringify({ username: ctx.value, orgId: 1 }),
          headers: {
            "Content-Type": "application/json",
            "X-Token": "t",
          },
        },
      }),
    });
    runner.schedule("alice");
    await vi.runAllTimersAsync();
    await Promise.resolve();
    const [, init] = fetchMock.mock.calls[0]!;
    expect(init?.body).toBe(JSON.stringify({ username: "alice", orgId: 1 }));
    expect(init?.headers).toMatchObject({
      "Content-Type": "application/json",
      "X-Token": "t",
    });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("applies buildRequest url override only", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const runner = createCheckRunner({
      attrs: baseAttrs(),
      element,
      onResult: vi.fn(),
      buildRequest: () => ({ url: "/api/custom" }),
    });
    runner.schedule("x");
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(String(fetchMock.mock.calls[0]![0])).toBe("/api/custom");
    expect(fetchMock.mock.calls[0]![1]?.method).toBe("GET");
  });

  it("uses fetchImpl instead of global fetch", async () => {
    const globalFetch = vi.fn();
    vi.stubGlobal("fetch", globalFetch);
    const customFetch = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    const runner = createCheckRunner({
      attrs: baseAttrs(),
      element,
      onResult: vi.fn(),
      fetchImpl: customFetch,
    });
    runner.schedule("x");
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(customFetch).toHaveBeenCalled();
    expect(globalFetch).not.toHaveBeenCalled();
  });

  it("treats buildRequest throw as network error and stays usable", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const onResult = vi.fn();
    let shouldThrow = true;
    const runner = createCheckRunner({
      attrs: baseAttrs(),
      element,
      onResult,
      buildRequest: () => {
        if (shouldThrow) throw new Error("boom");
        return undefined;
      },
    });
    runner.schedule("a");
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ ok: false, errorKind: "network" }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
    shouldThrow = false;
    onResult.mockClear();
    runner.schedule("b");
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalled();
  });

  it("falls back when buildRequest returns invalid shape", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const runner = createCheckRunner({
      attrs: baseAttrs(),
      element,
      onResult: vi.fn(),
      buildRequest: () => null as unknown as undefined,
    });
    runner.schedule("x");
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(String(fetchMock.mock.calls[0]![0])).toContain("value=x");
  });

  it("ignores results after dispose", async () => {
    let resolveLate!: (v: Response) => void;
    const late = new Promise<Response>((r) => {
      resolveLate = r;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => late),
    );
    const onResult = vi.fn();
    const runner = createCheckRunner({
      attrs: baseAttrs(),
      element,
      onResult,
    });
    runner.schedule("x");
    await Promise.resolve();
    runner.dispose();
    resolveLate(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    for (let i = 0; i < 10; i++) await Promise.resolve();
    expect(onResult).not.toHaveBeenCalled();
  });
});
