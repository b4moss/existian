#!/usr/bin/env node
import { mkdir, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vendorDir = join(root, "doc-site", "vendor");
const iife = join(root, "dist", "existian.iife.min.js");

await build({
  configFile: join(root, "vite.config.ts"),
  root,
});
await build({
  configFile: join(root, "vite.cdn.config.ts"),
  root,
});
await build({
  configFile: join(root, "vite.cdn.config.ts"),
  root,
  mode: "minify",
});

await mkdir(vendorDir, { recursive: true });
await copyFile(iife, join(vendorDir, "existian.iife.min.js"));
console.log("Staged doc-site/vendor/existian.iife.min.js");
