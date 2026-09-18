import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/* O hub também serve ferramentas que não têm deploy próprio: cada uma é uma página extra
   do build, numa pasta com o nome do caminho (logo-sizer/ → /logo-sizer/). */
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        hub: resolve(__dirname, "index.html"),
        "logo-sizer": resolve(__dirname, "logo-sizer/index.html"),
      },
    },
  },
});
