import { resolve } from "node:path";
import { defineConfig } from "vite";

const entry = resolve(import.meta.dirname, "src/cdn.ts");

export default defineConfig(({ mode }) => {
  const minify = mode === "minify";
  return {
    build: {
      emptyOutDir: false,
      lib: {
        entry,
        name: "Existian",
        formats: ["iife"],
        fileName: () =>
          minify ? "existian.iife.min.js" : "existian.iife.js",
      },
      minify: minify ? "oxc" : false,
    },
  };
});
