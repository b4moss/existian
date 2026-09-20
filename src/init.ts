import { readAttrs } from "./attrs.js";
import { createDebouncer } from "./debounce.js";
import { matchResponse } from "./match.js";
import { createCheckRunner } from "./request.js";
import { applyStatus } from "./state.js";
import type { InitOptions } from "./types.js";

const boundElements = new WeakSet<Element>();

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

/**
 * Scan `root` for declarative check elements and bind the async pipeline.
 */
export function init(options?: InitOptions): void {
  const prefix = normalizePrefix(options?.prefix);
  const root: ParentNode = options?.root ?? document;

  let nodes: NodeListOf<Element>;
  try {
    nodes = root.querySelectorAll(`[${prefix}-check]`);
  } catch {
    return;
  }

  for (const el of nodes) {
    if (boundElements.has(el)) continue;

    const attrs = readAttrs(el, prefix);
    if (attrs.check === null) continue;

    boundElements.add(el);

    applyStatus({
      prefix,
      source: el,
      attrs,
      status: "idle",
    });

    const runner = createCheckRunner({
      attrs,
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

    for (const eventName of attrs.events) {
      el.addEventListener(eventName, () => {
        debouncer.schedule(readValue(el));
      });
    }
  }
}
