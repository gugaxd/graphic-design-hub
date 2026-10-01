import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/* Um único site: o menu na raiz e cada ferramenta numa pasta própria, que vira uma
   página do build (grid-maker/ → /grid-maker/). Ferramenta nova entra aqui e no
   catálogo em src/ferramentas.js. */
const PAGINAS = [
  "grid-maker",
  "bento-maker",
  "gradient-maker",
  "3d-maker",
  "texture-prompts",
  "logo-sizer",
  "font-defining",
];

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        hub: resolve(__dirname, "index.html"),
        ...Object.fromEntries(
          PAGINAS.map((p) => [p, resolve(__dirname, p, "index.html")])
        ),
      },
    },
  },
});
