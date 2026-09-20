import type {
  BuildRequestContext,
  BuildRequestResult,
  CheckAttrs,
  ErrorKind,
  HttpMethod,
} from "./types.js";

export type CheckSuccess = {
  ok: true;
  body: unknown;
  generation: number;
};

export type CheckFailure = {
  ok: false;
  errorKind: ErrorKind;
  httpStatus?: number;
  generation: number;
};

export type CheckResult = CheckSuccess | CheckFailure;

export type CheckRunner = {
  schedule: (value: string) => void;
  dispose: () => void;
};

export type CreateCheckRunnerOptions = {
  attrs: CheckAttrs;
  element: Element;
  onResult: (result: CheckResult) => void;
  onStart?: () => void;
  fetchImpl?: typeof fetch;
  buildRequest?: (ctx: BuildRequestContext) => BuildRequestResult | void;
};

function buildUrl(check: string, value: string, method: HttpMethod): string {
  if (method !== "GET" && method !== "DELETE") return check;
  const url = new URL(
    check,
    typeof location !== "undefined" ? location.href : "http://localhost/",
  );
  url.searchParams.set("value", value);
  if (check.startsWith("http://") || check.startsWith("https://")) {
    return url.toString();
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (err instanceof Error && err.name === "AbortError")
  );
}

function isBuildRequestResult(value: unknown): value is BuildRequestResult {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function resolveRequest(
  ctx: BuildRequestContext,
  signal: AbortSignal,
  buildRequest?: (ctx: BuildRequestContext) => BuildRequestResult | void,
): { url: string; init: RequestInit } {
  if (typeof buildRequest !== "function") {
    return { url: ctx.url, init: { ...ctx.init, signal } };
  }

  let raw: BuildRequestResult | void;
  try {
    raw = buildRequest(ctx);
  } catch (err) {
    throw err;
  }

  if (!isBuildRequestResult(raw)) {
    return { url: ctx.url, init: { ...ctx.init, signal } };
  }

  const url = typeof raw.url === "string" ? raw.url : ctx.url;
  const init: RequestInit = {
    ...ctx.init,
    ...(raw.init ?? {}),
    signal,
  };
  return { url, init };
}

/**
 * Serial check runner with generation tracking, timeout, and error kinds.
 */
export function createCheckRunner(
  options: CreateCheckRunnerOptions,
): CheckRunner {
  const { attrs, element, onResult } = options;
  const fetchImpl =
    typeof options.fetchImpl === "function"
      ? options.fetchImpl
      : fetch.bind(globalThis);

  let inFlight = false;
  let pendingValue: string | null = null;
  let generation = 0;
  let disposed = false;
  let activeController: AbortController | null = null;

  const emit = (result: CheckResult): void => {
    if (disposed) return;
    if (result.generation !== generation) return;
    onResult(result);
  };

  const run = async (value: string): Promise<void> => {
    if (disposed) return;
    inFlight = true;
    const gen = ++generation;
    const controller = new AbortController();
    activeController = controller;
    options.onStart?.();

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise =
      attrs.timeoutMs !== null && attrs.timeoutMs >= 0
        ? new Promise<"timeout">((resolve) => {
            timeoutId = setTimeout(() => {
              controller.abort();
              resolve("timeout");
            }, attrs.timeoutMs);
          })
        : null;

    const method = attrs.method;
    const defaultUrl = buildUrl(attrs.check ?? "", value, method);
    const defaultInit: RequestInit = {
      method,
      signal: controller.signal,
    };
    if (method === "POST" || method === "PUT" || method === "PATCH") {
      defaultInit.headers = { "Content-Type": "application/json" };
      defaultInit.body = JSON.stringify({ value });
    }

    const ctx: BuildRequestContext = {
      value,
      element,
      attrs,
      url: defaultUrl,
      init: defaultInit,
    };

    let url: string;
    let init: RequestInit;
    try {
      ({ url, init } = resolveRequest(ctx, controller.signal, options.buildRequest));
    } catch {
      if (timeoutId !== null) clearTimeout(timeoutId);
      emit({ ok: false, errorKind: "network", generation: gen });
      inFlight = false;
      if (!disposed && pendingValue !== null) {
        const next = pendingValue;
        pendingValue = null;
        void run(next);
      }
      return;
    }

    try {
      const fetchPromise = fetchImpl(url, init).then(
        (response) => ({ kind: "response" as const, response }),
        (err: unknown) => ({ kind: "error" as const, err }),
      );

      const raced = timeoutPromise
        ? await Promise.race([
            fetchPromise,
            timeoutPromise.then(() => ({ kind: "timeout" as const })),
          ])
        : await fetchPromise;

      if (timeoutId !== null) clearTimeout(timeoutId);
      if (disposed || gen !== generation) return;

      if (raced.kind === "timeout") {
        emit({ ok: false, errorKind: "timeout", generation: gen });
        return;
      }

      if (raced.kind === "error") {
        if (isAbortError(raced.err)) {
          emit({ ok: false, errorKind: "timeout", generation: gen });
          return;
        }
        emit({ ok: false, errorKind: "network", generation: gen });
        return;
      }

      const response = raced.response;

      if (!response.ok) {
        emit({
          ok: false,
          errorKind: "http",
          httpStatus: response.status,
          generation: gen,
        });
        return;
      }

      let body: unknown;
      try {
        body = await response.json();
      } catch {
        if (disposed || gen !== generation) return;
        emit({
          ok: false,
          errorKind: "http",
          httpStatus: response.status,
          generation: gen,
        });
        return;
      }

      if (disposed || gen !== generation) return;
      emit({ ok: true, body, generation: gen });
    } finally {
      if (timeoutId !== null) clearTimeout(timeoutId);
      if (activeController === controller) {
        activeController = null;
      }
      inFlight = false;
      if (!disposed && pendingValue !== null) {
        const next = pendingValue;
        pendingValue = null;
        void run(next);
      }
    }
  };

  return {
    schedule(value: string): void {
      if (disposed) return;
      if (inFlight) {
        pendingValue = value;
        return;
      }
      void run(value);
    },
    dispose(): void {
      disposed = true;
      pendingValue = null;
      generation += 1;
      activeController?.abort();
      activeController = null;
    },
  };
}
