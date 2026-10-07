import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const apiTarget = env.VITE_API_TARGET || "http://127.0.0.1:5200";
  return {
    plugins: [react()],
    build: {
      manifest: true,
      rollupOptions: {
        input: {
          dashboard: fileURLToPath(new URL("./index.html", import.meta.url)),
          login: fileURLToPath(new URL("./src/login-main.jsx", import.meta.url)),
        },
      },
    },
    server: {
      port: Number(env.VITE_DEV_PORT || 5173),
      strictPort: true,
      proxy: { "/api": apiTarget },
    },
    preview: { proxy: { "/api": apiTarget } },
  };
});
