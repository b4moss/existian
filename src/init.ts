import { readAttrs } from "./attrs.js";
import { createDebouncer, type Debouncer } from "./debounce.js";
import { matchResponse } from "./match.js";
import { createCheckRunner, type CheckRunner } from "./request.js";
import { applyStatus } from "./state.js";
import type { ExistianHandle, InitOptions } from "./types.js";

const boundElements = new WeakSet<Element>();

type Binding = {
  element: Element;
  events: string[];
  listener: EventListener;
  debouncer: Debouncer<[string]>;
  runner: CheckRunner;
};

function normalizePrefix(prefix: string | undefined): string {
  if (prefix === undefined || prefix.trim() === "") return "data-ex";
  return prefix.trim();
}

function readValue(el: Element): string {
  if ("value" in el && typeof (el as HTMLInputElement).value === "string") {
    return (el as HTMLInputElement).value;
  }
  return el.textContent ?? "";
}

function normalizeBuildRequest(
  value: InitOptions["buildRequest"],
): InitOptions["buildRequest"] {
  return typeof value === "function" ? value : undefined;
}

function normalizeFetch(value: InitOptions["fetch"]): typeof fetch | undefined {
  return typeof value === "function" ? value : undefined;
}

/**
 * Scan `root` for declarative check elements and bind the async pipeline.
 */
export function init(options?: InitOptions): ExistianHandle {
  const prefix = normalizePrefix(options?.prefix);
  const root: ParentNode = options?.root ?? document;
  const buildRequest = normalizeBuildRequest(options?.buildRequest);
  const fetchImpl = normalizeFetch(options?.fetch);

  const bindings = new Map<Element, Binding>();

  const unbindOne = (el: Element): void => {
    const binding = bindings.get(el);
    if (!binding) return;

    for (const eventName of binding.events) {
      binding.element.removeEventListener(eventName, binding.listener);
    }
    binding.debouncer.cancel();
    binding.runner.dispose();
    bindings.delete(el);
    boundElements.delete(el);
  };

  const bindElement = (el: Element): void => {
    if (boundElements.has(el)) return;

    const attrs = readAttrs(el, prefix);
    if (attrs.check === null) return;

    boundElements.add(el);

    applyStatus({
      prefix,
      source: el,
      attrs,
      status: "idle",
    });

    const runner = createCheckRunner({
      attrs,
      element: el,
      fetchImpl,
      buildRequest,
      onStart: () => {
        applyStatus({ prefix, source: el, attrs, status: "pending" });
      },
      onResult: (result) => {
        if (!result.ok) {
          applyStatus({
            prefix,
            source: el,
            attrs,
            status: "error",
            errorKind: result.errorKind,
            httpStatus: result.httpStatus,
          });
          return;
        }

        const matched = matchResponse(result.body, {
          property: attrs.responseProperty,
          value: attrs.responseValue,
          match: attrs.responseMatch,
        });
        applyStatus({
          prefix,
          source: el,
          attrs,
          status: matched.status,
        });
      },
    });

    const waitMs = attrs.debounceMs ?? 0;
    const debouncer = createDebouncer(waitMs, (value: string) => {
      runner.schedule(value);
    });

    const listener: EventListener = () => {
      debouncer.schedule(readValue(el));
    };

    for (const eventName of attrs.events) {
      el.addEventListener(eventName, listener);
    }

    bindings.set(el, {
      element: el,
      events: [...attrs.events],
      listener,
      debouncer,
      runner,
    });
  };

  const scan = (): void => {
    let nodes: NodeListOf<Element>;
    try {
      nodes = root.querySelectorAll(`[${prefix}-check]`);
    } catch {
      return;
    }
    for (const el of nodes) {
      bindElement(el);
    }
  };

  scan();

  return {
    unbind(element: Element): void {
      unbindOne(element);
    },
    destroy(): void {
      for (const el of [...bindings.keys()]) {
        unbindOne(el);
      }
    },
    refresh(): void {
      scan();
    },
  };
}
