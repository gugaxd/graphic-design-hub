/* Catálogo do hub. Ferramenta nova entra aqui — o menu se monta sozinho.
   `url: null` mostra o card como "em breve", sem link. */
export const FERRAMENTAS = [
  {
    id: "grid",
    nome: "grid maker",
    descricao:
      "Grids modulares com formas, ocupação de várias células e escalonamento progressivo. Exporta SVG vetorial e PNG.",
    formatos: ["SVG", "PNG"],
    url: "https://gridmaker-iota.vercel.app/",
    repo: "https://github.com/gugaxd/gri.d.maker",
  },
  {
    id: "bento",
    nome: "bento maker",
    descricao:
      "Layouts bento com as suas imagens: arraste do computador, ajuste os blocos na malha e exporte.",
    formatos: ["PNG", "JPG", "SVG", "PDF"],
    url: "https://bento-maker-three.vercel.app/",
    repo: "https://github.com/gugaxd/bento-maker",
  },
  {
    id: "gradient",
    nome: "gradient maker",
    descricao:
      "Gradientes estáticos e animados com mesh warp e granulação, em loop sem emenda.",
    formatos: ["PNG", "SVG", "vídeo", "CSS"],
    url: "https://gradient-maker-peach.vercel.app/",
    repo: "https://github.com/gugaxd/gradient-maker",
  },
  {
    id: "logo",
    nome: "logo sizer",
    descricao:
      "Padroniza opticamente o tamanho de várias logos lado a lado, compensando o peso visual de cada uma.",
    formatos: ["SVG", "PNG", "JPG"],
    url: "/logo-sizer/", // servido pelo próprio hub (pasta logo-sizer/)
    repo: null,
  },
];

export const LINKS_RODAPE = [
  { label: "github.com/gugaxd", href: "https://github.com/gugaxd" },
];
