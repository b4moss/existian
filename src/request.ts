import type { CheckAttrs, ErrorKind, HttpMethod } from "./types.js";

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
};

export type CreateCheckRunnerOptions = {
  attrs: CheckAttrs;
  onResult: (result: CheckResult) => void;
  onStart?: () => void;
  fetchImpl?: typeof fetch;
};

function buildUrl(check: string, value: string, method: HttpMethod): string {
  if (method !== "GET" && method !== "DELETE") return check;
  const url = new URL(
    check,
    typeof location !== "undefined" ? location.href : "http://localhost/",
  );
  url.searchParams.set("value", value);
  // Prefer relative when check was relative
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

/**
 * Serial check runner with generation tracking, timeout, and error kinds.
 */
export function createCheckRunner(
  options: CreateCheckRunnerOptions,
): CheckRunner {
  const { attrs, onResult } = options;
  const fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);

  let inFlight = false;
  let pendingValue: string | null = null;
  let generation = 0;
  let activeController: AbortController | null = null;

  const emit = (result: CheckResult): void => {
    if (result.generation !== generation) return;
    onResult(result);
  };

  const run = async (value: string): Promise<void> => {
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
    const url = buildUrl(attrs.check ?? "", value, method);
    const init: RequestInit = {
      method,
      signal: controller.signal,
    };
    if (method === "POST" || method === "PUT" || method === "PATCH") {
      init.headers = { "Content-Type": "application/json" };
      init.body = JSON.stringify({ value });
    }

    try {
      const fetchPromise = fetchImpl(url, init).then(
        (response) => ({ kind: "response" as const, response }),
        (err: unknown) => ({ kind: "error" as const, err }),
      );

      const raced = timeoutPromise
        ? await Promise.race([fetchPromise, timeoutPromise.then(() => ({ kind: "timeout" as const }))])
        : await fetchPromise;

      if (timeoutId !== null) clearTimeout(timeoutId);

      if (gen !== generation) return;

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
        if (gen !== generation) return;
        emit({
          ok: false,
          errorKind: "http",
          httpStatus: response.status,
          generation: gen,
        });
        return;
      }

      if (gen !== generation) return;
      emit({ ok: true, body, generation: gen });
    } finally {
      if (timeoutId !== null) clearTimeout(timeoutId);
      if (activeController === controller) {
        activeController = null;
      }
      inFlight = false;
      if (pendingValue !== null) {
        const next = pendingValue;
        pendingValue = null;
        void run(next);
      }
    }
  };

  return {
    schedule(value: string): void {
      if (inFlight) {
        pendingValue = value;
        return;
      }
      void run(value);
    },
  };
}
