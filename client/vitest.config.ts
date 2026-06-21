import { defineConfig } from "vitest/config";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  test: {
    include: ["test/**/*.test.{ts,tsx}"],
    // setup-dom.ts sets IS_REACT_ACT_ENVIRONMENT=true for component tests
    setupFiles: ["./test/setup-dom.ts"],
  },
});
