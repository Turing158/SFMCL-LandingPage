import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: { port: 1174, strictPort: true },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        launcher: "embed/sfmcl-ui/index.html",
      },
    },
  },
});
