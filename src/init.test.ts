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

  it("returns a handle with lifecycle methods", () => {
    document.body.innerHTML = `<input data-ex-check="/api/x" />`;
    const handle = init();
    expect(typeof handle.unbind).toBe("function");
    expect(typeof handle.destroy).toBe("function");
    expect(typeof handle.refresh).toBe("function");
  });

  it("applies buildRequest through init", async () => {
    document.body.innerHTML = `<input id="u" data-ex-check="/api/x" data-ex-method="POST" />`;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    init({
      buildRequest: (ctx) => ({
        init: {
          body: JSON.stringify({ username: ctx.value }),
          headers: { "Content-Type": "application/json" },
        },
      }),
    });
    const input = document.querySelector("#u") as HTMLInputElement;
    input.value = "bob";
    input.dispatchEvent(new Event("input"));
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(fetchMock.mock.calls[0]![1]?.body).toBe(
      JSON.stringify({ username: "bob" }),
    );
  });

  it("unbind stops events and allows refresh rebind", async () => {
    document.body.innerHTML = `<input id="u" data-ex-check="/api/x" />`;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const handle = init();
    const input = document.querySelector("#u") as HTMLInputElement;
    handle.unbind(input);
    input.value = "a";
    input.dispatchEvent(new Event("input"));
    await vi.runAllTimersAsync();
    expect(fetchMock).not.toHaveBeenCalled();
    handle.refresh();
    input.value = "b";
    input.dispatchEvent(new Event("input"));
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("ignores in-flight result after unbind", async () => {
    document.body.innerHTML = `<input id="u" data-ex-check="/api/x" />`;
    let resolveLate!: (v: Response) => void;
    const late = new Promise<Response>((r) => {
      resolveLate = r;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => late),
    );
    const handle = init();
    const input = document.querySelector("#u") as HTMLInputElement;
    input.value = "x";
    input.dispatchEvent(new Event("input"));
    await Promise.resolve();
    handle.unbind(input);
    resolveLate(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    for (let i = 0; i < 10; i++) await Promise.resolve();
    expect(input.getAttribute("data-ex-status")).not.toBe("success");
  });

  it("destroy stops all bindings and refresh restores them", async () => {
    document.body.innerHTML = `
      <input id="a" data-ex-check="/api/a" />
      <input id="b" data-ex-check="/api/b" />
    `;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const handle = init();
    handle.destroy();
    const a = document.querySelector("#a") as HTMLInputElement;
    const b = document.querySelector("#b") as HTMLInputElement;
    a.dispatchEvent(new Event("input"));
    b.dispatchEvent(new Event("input"));
    await vi.runAllTimersAsync();
    expect(fetchMock).not.toHaveBeenCalled();
    handle.refresh();
    a.value = "1";
    a.dispatchEvent(new Event("input"));
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalled();
  });

  it("refresh binds newly added elements only once for existing", async () => {
    document.body.innerHTML = `<div id="root"><input id="a" data-ex-check="/api/a" /></div>`;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const handle = init({ root: document.querySelector("#root")! });
    document.querySelector("#root")!.insertAdjacentHTML(
      "beforeend",
      `<input id="b" data-ex-check="/api/b" />`,
    );
    handle.refresh();
    const a = document.querySelector("#a") as HTMLInputElement;
    const b = document.querySelector("#b") as HTMLInputElement;
    a.value = "1";
    a.dispatchEvent(new Event("input"));
    b.value = "2";
    b.dispatchEvent(new Event("input"));
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    fetchMock.mockClear();
    handle.refresh();
    a.dispatchEvent(new Event("input"));
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps handles independent", async () => {
    document.body.innerHTML = `
      <div id="r1"><input id="a" data-ex-check="/api/a" /></div>
      <div id="r2"><input id="b" data-ex-check="/api/b" /></div>
    `;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const h1 = init({ root: document.querySelector("#r1")! });
    const h2 = init({ root: document.querySelector("#r2")! });
    h1.destroy();
    const b = document.querySelector("#b") as HTMLInputElement;
    b.value = "x";
    b.dispatchEvent(new Event("input"));
    await vi.runAllTimersAsync();
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]![0])).toContain("/api/b");
    h2.destroy();
  });

  it("unbind/destroy no-ops do not throw", () => {
    document.body.innerHTML = `<input id="u" data-ex-check="/api/x" />`;
    const handle = init();
    const input = document.querySelector("#u") as HTMLInputElement;
    expect(() => {
      handle.unbind(document.createElement("input"));
      handle.unbind(input);
      handle.unbind(input);
      handle.destroy();
      handle.destroy();
      handle.unbind(input);
    }).not.toThrow();
  });
});
