import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:8000",
      "/sanctum": "http://127.0.0.1:8000",
    },
  },
  build: { outDir: "dist", emptyOutDir: true, assetsDir: "app/assets" },
});
