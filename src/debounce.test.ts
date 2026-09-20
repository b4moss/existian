import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDebouncer } from "./debounce.js";

describe("createDebouncer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls callback once with the last args after waitMs", () => {
    const cb = vi.fn();
    const { schedule } = createDebouncer(300, cb);
    schedule("a");
    vi.advanceTimersByTime(100);
    schedule("b");
    vi.advanceTimersByTime(100);
    schedule("c");
    vi.advanceTimersByTime(299);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith("c");
  });

  it("calls callback once after a single schedule", () => {
    const cb = vi.fn();
    const { schedule } = createDebouncer(200, cb);
    schedule(1);
    vi.advanceTimersByTime(200);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(1);
  });

  it("cancel prevents a pending callback", () => {
    const cb = vi.fn();
    const { schedule, cancel } = createDebouncer(100, cb);
    schedule("x");
    cancel();
    vi.advanceTimersByTime(200);
    expect(cb).not.toHaveBeenCalled();
  });

  it("treats negative waitMs as zero", () => {
    const cb = vi.fn();
    const { schedule } = createDebouncer(-10, cb);
    schedule("z");
    vi.advanceTimersByTime(0);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("remains usable after callback throws", () => {
    const cb = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error("boom");
      })
      .mockImplementationOnce(() => undefined);
    const { schedule } = createDebouncer(50, cb);
    schedule(1);
    expect(() => vi.advanceTimersByTime(50)).toThrow("boom");
    schedule(2);
    vi.advanceTimersByTime(50);
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it("cancel can be called multiple times", () => {
    const cb = vi.fn();
    const { cancel } = createDebouncer(100, cb);
    expect(() => {
      cancel();
      cancel();
    }).not.toThrow();
  });
});
