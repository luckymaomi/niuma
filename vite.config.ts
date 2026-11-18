import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsInlineLimit: 1024 * 1024,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["ref/**", "node_modules/**", "dist/**"],
  },
});
