import type { CheckAttrs, CheckStatus, ErrorKind } from "./types.js";

const STATUSES = new Set<CheckStatus>([
  "idle",
  "pending",
  "success",
  "invalid",
  "error",
]);

export type ApplyStatusOptions = {
  prefix: string;
  source: Element;
  attrs: CheckAttrs;
  status: CheckStatus;
  errorKind?: ErrorKind;
  httpStatus?: number;
};

function collectTargets(
  prefix: string,
  source: Element,
  attrs: CheckAttrs,
): Element[] {
  const nodes = new Set<Element>();
  nodes.add(source);

  if (attrs.state) {
    const stateAttr = `${prefix}-state`;
    const escapedValue = attrs.state.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    for (const node of document.querySelectorAll(
      `[${stateAttr}="${escapedValue}"]`,
    )) {
      nodes.add(node);
    }
  }

  if (attrs.target) {
    try {
      const found = document.querySelector(attrs.target);
      if (found) nodes.add(found);
    } catch {
      // invalid selector — ignore
    }
  }

  return [...nodes];
}

/**
 * Reflect check status onto related DOM nodes via data attributes.
 */
export function applyStatus(options: ApplyStatusOptions): void {
  const { prefix, source, attrs, status, errorKind, httpStatus } = options;
  if (!STATUSES.has(status)) return;

  const statusAttr = `${prefix}-status`;
  const errorAttr = `${prefix}-error`;
  const pendingAttr = `${prefix}-pending-active`;
  const targets = collectTargets(prefix, source, attrs);

  for (const node of targets) {
    node.setAttribute(statusAttr, status);

    if (status === "error") {
      const kind = errorKind ?? "network";
      const value =
        kind === "http" && httpStatus !== undefined
          ? `http:${httpStatus}`
          : kind;
      node.setAttribute(errorAttr, value);
    } else {
      node.removeAttribute(errorAttr);
    }

    if (status === "pending" && attrs.pending) {
      node.setAttribute(pendingAttr, attrs.pending);
    } else {
      node.removeAttribute(pendingAttr);
    }
  }
}
