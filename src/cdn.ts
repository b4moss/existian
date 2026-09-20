import { init } from "./init.js";

const g = globalThis as typeof globalThis & {
  Existian?: { init: typeof init };
};

g.Existian = { init };
