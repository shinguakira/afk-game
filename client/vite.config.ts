import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The client talks to the save server through /api/*, proxied here in dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
