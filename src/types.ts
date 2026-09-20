export type InitOptions = {
  prefix?: string;
  root?: ParentNode;
};

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
