/* Catálogo do hub. Ferramenta nova entra aqui — o menu se monta sozinho.
   Toda ferramenta é uma pasta deste projeto e abre como caminho do mesmo site;
   registre a página também em vite.config.js. `url: null` mostra "em breve". */
export const FERRAMENTAS = [
  {
    id: "grid",
    nome: "grid maker",
    descricao:
      "Grids modulares com formas, ocupação de várias células e escalonamento progressivo. Exporta SVG vetorial e PNG.",
    formatos: ["SVG", "PNG"],
    url: "/grid-maker/",
    repo: "https://github.com/gugaxd/gri.d.maker",
  },
  {
    id: "bento",
    nome: "bento maker",
    descricao:
      "Layouts bento com as suas imagens: arraste do computador, ajuste os blocos na malha e exporte.",
    formatos: ["PNG", "JPG", "SVG", "PDF"],
    url: "/bento-maker/",
    repo: "https://github.com/gugaxd/bento-maker",
  },
  {
    id: "gradient",
    nome: "gradient maker",
    descricao:
      "Gradientes estáticos e animados com mesh warp e granulação, em loop sem emenda.",
    formatos: ["PNG", "SVG", "vídeo", "CSS"],
    url: "/gradient-maker/",
    repo: "https://github.com/gugaxd/gradient-maker",
  },
  {
    id: "tres-d",
    nome: "3d maker",
    descricao:
      "Formas 3D paramétricas ou extrudadas do seu SVG, com material, animação e exportação com fundo transparente.",
    formatos: ["PNG", "SVG", "WebM"],
    url: "/3d-maker/",
    repo: "https://github.com/gugaxd/3d-maker",
  },
  {
    id: "textura",
    nome: "texture prompts",
    descricao:
      "Prompts de textura e material para IA de imagem: escolha o material na biblioteca e ajuste atributos e cena.",
    formatos: ["prompt", "amostra"],
    url: "/texture-prompts/",
    repo: "https://github.com/gugaxd/texture-prompts",
  },
  {
    id: "logo",
    nome: "logo sizer",
    descricao:
      "Padroniza opticamente o tamanho de várias logos lado a lado, compensando o peso visual de cada uma.",
    formatos: ["SVG", "PNG", "JPG"],
    url: "/logo-sizer/",
    repo: null,
  },
  {
    id: "font",
    nome: "font defining",
    descricao:
      "Tamanho de tipo por nível a partir do formato, da distância de leitura e da quantidade de texto.",
    formatos: ["CSS", "JSON", "SVG", "PNG"],
    url: "/font-defining/",
    repo: null,
  },
];

export const LINKS_RODAPE = [
  { label: "github.com/gugaxd", href: "https://github.com/gugaxd" },
];
