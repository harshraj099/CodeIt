import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// In development, /api is proxied to the Spring Boot backend so the auth cookie stays same-origin.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:8080",
        changeOrigin: true,
        // Sends X-Forwarded-Host/Proto so the backend treats proxied requests as same-origin.
        xfwd: true,
      },
    },
  },
});
