import { resolve } from "node:path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

const entry = resolve(import.meta.dirname, "src/index.ts");

export default defineConfig({
  plugins: [
    dts({
      include: ["src"],
      exclude: ["src/**/*.test.ts", "src/cdn.ts"],
      rollupTypes: true,
    }),
  ],
  build: {
    emptyOutDir: true,
    lib: {
      entry,
      name: "Existian",
      formats: ["es", "cjs"],
      fileName: (format) =>
        format === "es" ? "existian.js" : "existian.cjs",
    },
    minify: false,
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/cdn.ts", "src/types.ts"],
      reporter: ["text", "lcov", "json-summary"],
      thresholds: {
        lines: 50,
      },
    },
  },
});
