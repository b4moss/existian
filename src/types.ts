export type CheckStatus =
  | "idle"
  | "pending"
  | "success"
  | "invalid"
  | "error";

export type ErrorKind = "network" | "http" | "timeout";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ResponseMatchMode = "exact" | "regex";

export type CheckAttrs = {
  check: string | null;
  method: HttpMethod;
  debounceMs: number | null;
  timeoutMs: number | null;
  events: string[];
  state: string | null;
  pending: string | null;
  target: string | null;
  responseProperty: string | null;
  responseValue: string | null;
  responseMatch: ResponseMatchMode | string;
};

export type BuildRequestContext = {
  value: string;
  element: Element;
  attrs: CheckAttrs;
  url: string;
  init: RequestInit;
};

export type BuildRequestResult = {
  url?: string;
  init?: RequestInit;
};

export type ExistianHandle = {
  unbind(element: Element): void;
  destroy(): void;
  refresh(): void;
};

export type InitOptions = {
  prefix?: string;
  root?: ParentNode;
  buildRequest?: (ctx: BuildRequestContext) => BuildRequestResult | void;
  fetch?: typeof fetch;
};
