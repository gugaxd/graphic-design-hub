/* ============================================================
   prompt.js — montagem do prompt
   ------------------------------------------------------------
   O prompt é montado em partes nomeadas (assunto, material,
   detalhes, atributos, cena) e só no fim é formatado para o
   modelo escolhido. A ordem segue a anatomia do exemplo de
   referência:

   assunto → "the X form made of" material → detalhes →
   atributos → cor → luz → fundo → estilo → composição

   Todo fragmento existe em inglês e em português. O idioma sai
   do que o usuário escreve (detectarIdioma) ou é fixado à mão.
   ============================================================ */

export const MODELOS = [
  { id: "grok", nome: "Grok" },
  { id: "midjourney", nome: "Midjourney" },
  { id: "gpt", nome: "GPT Image" },
  { id: "flux", nome: "Flux / SD" },
  { id: "firefly", nome: "Firefly" },
];

export const PROPORCOES = ["1:1", "4:5", "3:2", "16:9", "9:16"];

export const IDIOMAS = [
  { id: "auto", nome: "Automático" },
  { id: "pt", nome: "Português" },
  { id: "en", nome: "Inglês" },
];

/* `forma` entra em "the folder form made of…"; `formaPt` já vem com a
   contração certa para "a forma da pasta feita de…" */
export const ASSUNTOS = [
  { id: "pasta", nome: "Pasta", texto: "a folder icon shaped as a modern file folder", forma: "folder",
    pt: "um ícone de pasta no formato de uma pasta de arquivos moderna", formaPt: "da pasta" },
  { id: "esfera", nome: "Esfera", texto: "a perfect sphere", forma: "sphere",
    pt: "uma esfera perfeita", formaPt: "da esfera" },
  { id: "letra", nome: "Letra", texto: "the capital letter A as a bold 3D typographic form", forma: "letter",
    pt: "a letra A maiúscula como uma forma tipográfica 3D robusta", formaPt: "da letra" },
  { id: "logo", nome: "Símbolo", texto: "an abstract minimalist logo symbol", forma: "symbol",
    pt: "um símbolo de logo abstrato e minimalista", formaPt: "do símbolo" },
  { id: "app", nome: "Ícone de app", texto: "a rounded square app icon", forma: "icon",
    pt: "um ícone de app quadrado com cantos arredondados", formaPt: "do ícone" },
  { id: "blob", nome: "Forma orgânica", texto: "an abstract organic sculptural blob", forma: "blob",
    pt: "uma forma escultural orgânica e abstrata", formaPt: "da escultura" },
  { id: "cubo", nome: "Cubo", texto: "a cube with softly rounded edges", forma: "cube",
    pt: "um cubo com arestas suavemente arredondadas", formaPt: "do cubo" },
  { id: "frasco", nome: "Frasco", texto: "a minimalist cosmetic bottle", forma: "bottle",
    pt: "um frasco de cosmético minimalista", formaPt: "do frasco" },
];

export const presetDe = (texto) => {
  const t = texto.trim();
  return ASSUNTOS.find((a) => a.texto === t || a.pt === t);
};

export const LUZES = [
  { id: "auto", nome: "Sugerida pelo material" },
  { id: "estudio", nome: "Estúdio minimalista", txt: "minimalist studio lighting",
    pt: "iluminação de estúdio minimalista" },
  { id: "softbox", nome: "Softbox difusa", txt: "large softbox lighting with soft diffused shadows",
    pt: "iluminação de softbox grande com sombras suaves e difusas" },
  { id: "rasante", nome: "Rasante", txt: "low-angle raking light emphasizing the surface relief",
    pt: "luz rasante de ângulo baixo realçando o relevo da superfície" },
  { id: "janela", nome: "Luz de janela", txt: "soft natural window light",
    pt: "luz natural suave de janela" },
  { id: "sol", nome: "Sol a pino", txt: "bright overhead sunlight",
    pt: "luz do sol intensa vinda de cima" },
  { id: "golden", nome: "Golden hour", txt: "warm golden hour sunlight with long soft shadows",
    pt: "luz quente de golden hour com sombras longas e suaves" },
  { id: "contraluz", nome: "Contraluz", txt: "dramatic rim lighting from behind with glowing edges",
    pt: "contraluz dramática com bordas brilhantes" },
  { id: "lowkey", nome: "Low-key dramática", txt: "low-key dramatic lighting, single spotlight, deep shadows",
    pt: "iluminação low-key dramática, um único spot, sombras profundas" },
  { id: "neon", nome: "Neon", txt: "colored neon gel lighting with magenta and cyan accents",
    pt: "iluminação neon colorida com acentos magenta e ciano" },
];

export const FUNDOS = [
  { id: "auto", nome: "Sugerido pelo material" },
  { id: "claro", nome: "Liso claro", txt: "isolated on a clean plain background",
    pt: "isolado em um fundo liso e limpo" },
  { id: "escuro", nome: "Liso escuro", txt: "isolated on a deep matte black background",
    pt: "isolado em um fundo preto fosco profundo" },
  { id: "gradiente", nome: "Degradê suave", txt: "on a soft seamless gradient backdrop",
    pt: "sobre um fundo infinito em degradê suave" },
  { id: "pastel", nome: "Pastel", txt: "on a soft pastel colored backdrop",
    pt: "sobre um fundo em tom pastel suave" },
  { id: "recorte", nome: "Branco para recorte", txt: "isolated on a pure white background, easy to cut out",
    pt: "isolado em fundo branco puro, fácil de recortar" },
];

export const ESTILOS = [
  { id: "render", nome: "Render 3D ultrarrealista", txt: "ultra realistic high-detail 3D render",
    pt: "render 3D ultrarrealista e altamente detalhado" },
  { id: "produto", nome: "Foto de produto", txt: "professional product photography, 100mm macro lens",
    pt: "fotografia de produto profissional, lente macro 100mm" },
  { id: "macro", nome: "Macrofotografia", txt: "extreme macro photography, shallow depth of field",
    pt: "macrofotografia extrema, profundidade de campo rasa" },
  { id: "octane", nome: "Octane / ray tracing", txt: "octane render, physically based rendering, ray-traced reflections",
    pt: "render Octane, renderização baseada em física, reflexos com ray tracing" },
  { id: "icone", nome: "Ícone 3D estilizado", txt: "stylized 3D icon render, clean and minimal",
    pt: "render de ícone 3D estilizado, limpo e minimalista" },
];

export const COMPOSICOES = [
  { id: "centro", nome: "Centralizada", txt: "object-centered composition",
    pt: "composição centralizada no objeto" },
  { id: "tresquartos", nome: "Três quartos", txt: "three-quarter perspective view",
    pt: "vista em perspectiva três quartos" },
  { id: "frontal", nome: "Frontal", txt: "straight-on front view",
    pt: "vista frontal direta" },
  { id: "close", nome: "Close", txt: "tight close-up filling the frame",
    pt: "close fechado preenchendo o quadro" },
  { id: "flutuando", nome: "Flutuando", txt: "floating in mid-air with a soft contact shadow below",
    pt: "flutuando no ar com uma sombra de contato suave abaixo" },
];

/* Cada atributo vira uma frase por faixa: [limite, inglês, português].
   Faixa sem frase (null) some do prompt. */
export const ATRIBUTOS = [
  {
    id: "acabamento", nome: "Acabamento", min: "fosco", max: "espelhado",
    faixas: [
      [15, "fully matte finish with no reflections", "acabamento totalmente fosco, sem reflexos"],
      [40, "satin finish with a soft diffuse sheen", "acabamento acetinado com brilho suave e difuso"],
      [65, "semi-gloss finish", "acabamento semibrilho"],
      [88, "glossy finish with crisp specular highlights", "acabamento brilhante com realces especulares nítidos"],
      [101, "polished glossy surface with mirror-like reflections", "superfície polida e brilhante com reflexos espelhados"],
    ],
  },
  {
    id: "desgaste", nome: "Desgaste", min: "novo", max: "envelhecido",
    faixas: [
      [10, "pristine flawless condition", "estado impecável, sem defeitos"],
      [35, "subtle signs of use, faint micro-scratches", "sinais sutis de uso, micro-riscos leves"],
      [65, "visibly worn with scuffs, scratches and patina", "visivelmente gasto, com marcas, riscos e pátina"],
      [101, "heavily weathered and aged, distressed, cracked and stained", "muito desgastado e envelhecido, rachado e manchado"],
    ],
  },
  {
    id: "detalhe", nome: "Microdetalhe", min: "liso", max: "intenso",
    faixas: [
      [25, "clean smooth surface with minimal texture", "superfície lisa e limpa com textura mínima"],
      [60, "fine surface detail", "detalhe fino de superfície"],
      [85, "rich tactile surface detail", "rico detalhe tátil de superfície"],
      [101, "intricate micro-detail with every grain and pore visible", "microdetalhe intrincado, com cada grão e poro visível"],
    ],
  },
  {
    id: "iridescencia", nome: "Iridescência", min: "nenhuma", max: "holográfica",
    faixas: [
      [1, null, null],
      [30, "faint iridescent sheen", "leve brilho iridescente"],
      [60, "subtle iridescent and pearlescent reflections", "reflexos iridescentes e perolados sutis"],
      [85, "vivid iridescent and pearlescent reflections", "reflexos iridescentes e perolados vívidos"],
      [101, "intense holographic rainbow iridescence with prismatic dispersion", "iridescência holográfica de arco-íris intensa, com dispersão prismática"],
    ],
  },
];

export const fraseAtributo = (attr, v, idioma = "en") => {
  const f = attr.faixas.find(([lim]) => v < lim);
  return idioma === "pt" ? f[2] : f[1];
};

const NEG_BASE = {
  en: ["blurry", "low resolution", "watermark", "text", "distorted"],
  pt: ["desfocado", "baixa resolução", "marca d'água", "texto", "distorcido"],
};

const TILE = {
  en: {
    luz: "flat even diffuse lighting, no cast shadows",
    estilo: "high-resolution PBR texture, 4K, photoscanned realism",
    composicao: "top-down orthographic view, seamless tileable edge-to-edge pattern, no perspective, no objects",
  },
  pt: {
    luz: "iluminação difusa, plana e uniforme, sem sombras projetadas",
    estilo: "textura PBR em alta resolução, 4K, realismo de fotoescaneamento",
    composicao: "vista ortográfica de cima, padrão contínuo sem emendas de borda a borda, sem perspectiva, sem objetos",
  },
};

const achar = (lista, id) => lista.find((x) => x.id === id) || lista[1] || lista[0];
const txt = (item, idioma) => (idioma === "pt" ? item.pt : item.txt);

/* ------------------------------------------------------------------ */
/* Detecção de idioma                                                  */
/* ------------------------------------------------------------------ */
/* Pontua palavras típicas de cada língua no que o usuário escreveu.
   Acento conta a favor do português. Sem sinal nenhum → null, e quem
   chama decide o padrão. */
const SO_PT = new Set(("de da do das dos um uma uns umas com para pra em no na nos nas que e é ao à pela pelo " +
  "sobre feito feita forma cor fundo azul vermelho vermelha verde amarelo amarela preto preta branco branca rosa " +
  "roxo roxa laranja dourado dourada prateado prateada cinza marrom ícone icone letra palavra xícara xicara gotas " +
  "água agua superfície superficie não nao sem muito muita mais seu sua meu minha como estilo tom claro clara " +
  "escuro escura brilhante fosco fosca garrafa caneca tênis tenis copo luz sombra madeira vidro papel pedra " +
  "logotipo símbolo simbolo embalagem bolsa cadeira mesa flor folha nuvem coração coracao estrela").split(" "));
const SO_EN = new Set(("the an of with and made shaped on in for to is from by color colour blue red green yellow " +
  "black white pink purple orange golden silver grey gray brown icon letter word cup drops water surface without " +
  "very like style background shape light dark bright matte bottle mug sneaker glass wood paper stone logo symbol " +
  "packaging bag chair table flower leaf cloud heart star tone").split(" "));

export function detectarIdioma(texto) {
  const palavras = texto.toLowerCase().match(/[a-zà-ÿ']+/g) || [];
  let pt = 0, en = 0;
  for (const p of palavras) {
    if (/[ãõçáéíóúâêôà]/.test(p)) pt += 2;
    if (SO_PT.has(p)) pt += 1;
    if (SO_EN.has(p)) en += 1;
  }
  if (!pt && !en) return null;
  return pt >= en ? "pt" : "en";
}

/* ------------------------------------------------------------------ */
/* Partes                                                              */
/* ------------------------------------------------------------------ */
export function montarPartes(cfg, mat, va) {
  const idioma = cfg.idioma === "pt" ? "pt" : "en";
  const pt = idioma === "pt";
  const tile = cfg.modo === "superficie";
  const atributos = ATRIBUTOS.map((a) => fraseAtributo(a, cfg.attrs[a.id], idioma)).filter(Boolean);
  const preset = presetDe(cfg.assunto);
  const assunto = preset
    ? (pt ? preset.pt : preset.texto)
    : cfg.assunto.trim() || (pt ? "um objeto abstrato" : "an abstract object");
  const forma = preset ? (pt ? preset.formaPt : preset.forma) : null;
  const cor = cfg.cor.trim();

  const luz = cfg.luz === "auto"
    ? tile ? TILE[idioma].luz : txt(achar(LUZES, mat.luz), idioma)
    : txt(achar(LUZES, cfg.luz), idioma);

  const negMat = (pt ? mat.negPt : mat.neg) || mat.neg;
  return {
    idioma,
    tile,
    assunto,
    forma,
    material: pt ? va.pt.material : va.material,
    detalhes: pt ? va.pt.detalhes : va.detalhes,
    atributos,
    cor: cor ? (pt ? `cor dominante ${cor}` : `dominant color ${cor}`) : null,
    extra: cfg.extra.trim() || null,
    luz,
    fundo: tile ? null : txt(cfg.fundo === "auto" ? achar(FUNDOS, mat.fundo) : achar(FUNDOS, cfg.fundo), idioma),
    estilo: tile ? TILE[idioma].estilo : txt(achar(ESTILOS, cfg.estilo), idioma),
    composicao: tile ? TILE[idioma].composicao : txt(achar(COMPOSICOES, cfg.composicao), idioma),
    proporcao: cfg.proporcao,
    /* na textura contínua, repetir é o objetivo — esse negativo sairia contra */
    negativo: [...negMat.filter((n) => !(tile && /repetiti/i.test(n))), ...NEG_BASE[idioma]],
  };
}

/* ------------------------------------------------------------------ */
/* Formatação por modelo                                               */
/* ------------------------------------------------------------------ */
const NOME_AR = {
  en: { "1:1": "square", "4:5": "vertical", "9:16": "vertical", "3:2": "horizontal", "16:9": "widescreen" },
  pt: { "1:1": "quadrada", "4:5": "vertical", "9:16": "vertical", "3:2": "horizontal", "16:9": "panorâmica" },
};
const frasePropocao = (ar, idioma) =>
  idioma === "pt" ? `proporção ${NOME_AR.pt[ar]} ${ar}` : `${NOME_AR.en[ar]} ${ar} aspect ratio`;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* abertura: o assunto e o material que o veste. Assunto livre não tem
   forma conhecida, então vira "toda a forma feita de…" */
function abertura(p, natural) {
  if (p.idioma === "pt") {
    if (p.tile) return natural ? `uma textura contínua sem emendas de ${p.material}` : `textura contínua sem emendas (seamless) de ${p.material}`;
    return `${p.assunto}, ${p.forma ? `a forma ${p.forma}` : "toda a forma"} feita de ${p.material}`;
  }
  if (p.tile) return natural ? `a seamless tileable texture of ${p.material}` : `seamless tileable texture of ${p.material}`;
  return `${p.assunto}, ${p.forma ? `the ${p.forma} form` : "the entire form"} made of ${p.material}`;
}

/* lista corrida, na ordem da anatomia */
function lista(p) {
  return [abertura(p, false), ...p.detalhes, ...p.atributos, p.cor, p.extra, p.luz, p.fundo, p.estilo, p.composicao].filter(Boolean);
}

/* frases completas, para modelos que leem linguagem natural */
function natural(p, comProporcao) {
  const de = p.idioma === "pt" ? "de" : "of";
  const inicio = p.tile ? `${cap(p.estilo)}: ${abertura(p, true)}.` : `${cap(p.estilo)} ${de} ${abertura(p, true)}.`;
  const frases = [
    inicio,
    `${cap(p.detalhes.join(", "))}.`,
    p.atributos.length ? `${cap(p.atributos.join(", "))}.` : null,
    p.cor ? `${cap(p.cor)}.` : null,
    p.extra ? `${cap(p.extra.replace(/\.$/, ""))}.` : null,
    `${cap(p.luz)}${p.fundo ? `, ${p.fundo}` : ""}.`,
    `${cap(p.composicao)}${comProporcao ? `, ${frasePropocao(p.proporcao, p.idioma)}` : ""}.`,
  ];
  return frases.filter(Boolean).join(" ");
}

export function formatar(p, modelo, usarNegativo) {
  const neg = usarNegativo ? p.negativo : [];
  const evite = p.idioma === "pt" ? "Evite" : "Avoid";
  switch (modelo) {
    case "midjourney": {
      const params = [`--ar ${p.proporcao}`, "--style raw", "--v 7"];
      if (p.tile) params.push("--tile");
      if (neg.length) params.push(`--no ${neg.join(", ")}`);
      return { texto: `${lista(p).join(", ")} ${params.join(" ")}`, negativo: null };
    }
    case "gpt":
      return {
        texto: natural(p, true) + (neg.length ? ` ${evite}: ${neg.join(", ")}.` : ""),
        negativo: null,
      };
    case "firefly":
      /* a proporção do Firefly é escolhida na interface dele, não no texto */
      return {
        texto: natural(p, false) + (neg.length ? ` ${evite}: ${neg.join(", ")}.` : ""),
        negativo: null,
      };
    case "flux":
      return {
        texto: [...lista(p), frasePropocao(p.proporcao, p.idioma)].join(", "),
        negativo: neg.length ? neg.join(", ") : null,
      };
    default: /* grok — mesmo formato do exemplo: caixa alta entre chaves */
      return {
        texto: `{${[...lista(p), frasePropocao(p.proporcao, p.idioma)].join(", ").toUpperCase()}}`,
        negativo: null,
      };
  }
}

export const MODELO_ACEITA_NEGATIVO = { grok: false, midjourney: true, gpt: true, flux: true, firefly: true };
