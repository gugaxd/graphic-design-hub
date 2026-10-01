/* ============================================================
   prompt.js — montagem do prompt
   ------------------------------------------------------------
   O prompt é montado em partes nomeadas (material, detalhes,
   atributos, cena) e só no fim é formatado para o modelo
   escolhido. A ordem segue a anatomia:

   material → detalhes → atributos → cor → luz → fundo →
   estilo → composição

   O prompt descreve só a aparência: nenhum objeto é nomeado,
   para o material poder ser pedido sobre o que o usuário quiser.

   Todo fragmento existe em inglês e em português. O idioma sai
   do que o usuário escreve (detectarIdioma) ou é fixado à mão.
   ============================================================ */

export const MODELOS = [
  { id: "grok", nome: "Grok" },
  { id: "midjourney", nome: "Midjourney" },
  { id: "gpt", nome: "GPT Image" },
  { id: "gemini", nome: "Gemini/Flow" },
  { id: "flux", nome: "Flux / SD" },
  { id: "firefly", nome: "Firefly" },
];

export const PROPORCOES = ["1:1", "4:5", "3:2", "16:9", "9:16"];

export const IDIOMAS = [
  { id: "auto", nome: "Automático" },
  { id: "pt", nome: "Português" },
  { id: "en", nome: "Inglês" },
];

/* Nomes de cor para o seletor: o modelo de imagem entende "azul cobalto" muito
   melhor que um hexadecimal solto, então o seletor escreve o nome e deixa o
   código ao lado, para quem precisa da cor exata. */
export const CORES = [
  { hex: "#000000", pt: "preto", en: "black" },
  { hex: "#2B2B2B", pt: "grafite", en: "charcoal gray" },
  { hex: "#808080", pt: "cinza médio", en: "mid gray" },
  { hex: "#C8C8C8", pt: "cinza claro", en: "light gray" },
  { hex: "#FFFFFF", pt: "branco", en: "white" },
  { hex: "#F2E8DC", pt: "branco quente", en: "warm off-white" },
  { hex: "#E8DCC8", pt: "areia", en: "sand" },
  { hex: "#C8A882", pt: "bege", en: "beige" },
  { hex: "#8B6B47", pt: "castanho", en: "walnut brown" },
  { hex: "#5A3A28", pt: "marrom escuro", en: "dark brown" },
  { hex: "#B05A2A", pt: "terracota", en: "terracotta" },
  { hex: "#D2691E", pt: "âmbar queimado", en: "burnt amber" },
  { hex: "#E8A33D", pt: "mostarda", en: "mustard yellow" },
  { hex: "#F5C518", pt: "amarelo ouro", en: "golden yellow" },
  { hex: "#F7E96B", pt: "amarelo claro", en: "pale yellow" },
  { hex: "#C9A227", pt: "ouro velho", en: "antique gold" },
  { hex: "#FF7F3F", pt: "laranja", en: "orange" },
  { hex: "#E04E2A", pt: "laranja queimado", en: "burnt orange" },
  { hex: "#C8102E", pt: "vermelho", en: "red" },
  { hex: "#8B1A2B", pt: "vinho", en: "wine red" },
  { hex: "#F2A0A0", pt: "rosa claro", en: "blush pink" },
  { hex: "#E0218A", pt: "magenta", en: "magenta" },
  { hex: "#8B3A9E", pt: "roxo", en: "purple" },
  { hex: "#5B3A8E", pt: "violeta profundo", en: "deep violet" },
  { hex: "#3A4A9E", pt: "azul índigo", en: "indigo blue" },
  { hex: "#1B4FA0", pt: "azul cobalto", en: "cobalt blue" },
  { hex: "#1E3A5F", pt: "azul marinho", en: "navy blue" },
  { hex: "#3F8FD2", pt: "azul claro", en: "sky blue" },
  { hex: "#00A9CE", pt: "ciano", en: "cyan" },
  { hex: "#2E8B8B", pt: "azul petróleo", en: "teal" },
  { hex: "#2E6B4F", pt: "verde escuro", en: "deep green" },
  { hex: "#4CAF50", pt: "verde", en: "green" },
  { hex: "#8BA888", pt: "verde-sálvia", en: "sage green" },
  { hex: "#A8C83C", pt: "verde-limão", en: "lime green" },
  { hex: "#5A5F4A", pt: "verde oliva", en: "olive green" },
  { hex: "#B8B8C0", pt: "prata", en: "silver" },
  { hex: "#B08D57", pt: "bronze", en: "bronze" },
  { hex: "#D4AF37", pt: "dourado", en: "gold" },
];

/* hexadecimal escrito pelo usuário, em qualquer formato: #abc, abc, #AABBCC */
export const RE_HEX = /#?\b([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/;

export function acharHex(txt) {
  const m = String(txt || "").match(RE_HEX);
  if (!m) return null;
  const h = m[1];
  return "#" + (h.length === 3 ? h.split("").map((c) => c + c).join("") : h).toUpperCase();
}

const rgbDe = (hex) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** nome da cor mais próxima do hexadecimal, no idioma pedido */
export function nomeDaCor(hex, idioma) {
  const [r, g, b] = rgbDe(hex);
  let melhor = CORES[0];
  let dist = Infinity;
  for (const c of CORES) {
    const [r2, g2, b2] = rgbDe(c.hex);
    /* pesos aproximando a sensibilidade do olho — verde pesa mais que azul */
    const d = 2 * (r - r2) ** 2 + 4 * (g - g2) ** 2 + 3 * (b - b2) ** 2;
    if (d < dist) {
      dist = d;
      melhor = c;
    }
  }
  return idioma === "pt" ? melhor.pt : melhor.en;
}

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

/* Com um hexadecimal na mão, a cor deixa de ser sugestão: o prompt pede a cor
   exata e admite o limite do material — vidro e metal sempre distorcem o matiz.
   O nome entra junto porque vários modelos leem nome melhor que código. */
function fraseCor(txt, idioma) {
  const t = String(txt || "").trim();
  if (!t) return null;
  const hex = acharHex(t);
  if (!hex) return idioma === "pt" ? `cor dominante ${t}` : `dominant color ${t}`;
  const resto = t.replace(RE_HEX, "").replace(/[(),]/g, " ").replace(/\s+/g, " ").trim();
  const nome = resto || nomeDaCor(hex, idioma);
  return idioma === "pt"
    ? `cor dominante ${nome}, exatamente o hexadecimal ${hex}, fiel a essa cor o quanto o material permitir`
    : `dominant color ${nome}, exactly hex ${hex}, color-matched as closely as the material allows`;
}

const NEG_CORRIGIR_COR = {
  en: ["color shift", "wrong hue", "desaturated color"],
  pt: ["desvio de cor", "matiz trocado", "cor dessaturada"],
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
  const cor = cfg.cor.trim();

  const luz = cfg.luz === "auto"
    ? tile ? TILE[idioma].luz : txt(achar(LUZES, mat.luz), idioma)
    : txt(achar(LUZES, cfg.luz), idioma);

  const negMat = (pt ? mat.negPt : mat.neg) || mat.neg;
  return {
    idioma,
    tile,
    material: pt ? va.pt.material : va.material,
    detalhes: pt ? va.pt.detalhes : va.detalhes,
    atributos,
    cor: fraseCor(cor, idioma),
    extra: cfg.extra.trim() || null,
    luz,
    fundo: tile ? null : txt(cfg.fundo === "auto" ? achar(FUNDOS, mat.fundo) : achar(FUNDOS, cfg.fundo), idioma),
    estilo: tile ? TILE[idioma].estilo : txt(achar(ESTILOS, cfg.estilo), idioma),
    composicao: tile ? TILE[idioma].composicao : txt(achar(COMPOSICOES, cfg.composicao), idioma),
    proporcao: cfg.proporcao,
    /* na textura contínua, repetir é o objetivo — esse negativo sairia contra */
    negativo: [
      ...negMat.filter((n) => !(tile && /repetiti/i.test(n))),
      ...NEG_BASE[idioma],
      /* pedir a cor exata só adianta se o negativo também cobrar */
      ...(acharHex(cor) ? NEG_CORRIGIR_COR[idioma] : []),
    ],
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

/* abertura: o material, e só — nenhum objeto é nomeado.
   Em textura contínua, dito como padrão sem emenda. */
function abertura(p, natural) {
  if (p.idioma === "pt") {
    if (p.tile) return natural ? `uma textura contínua sem emendas de ${p.material}` : `textura contínua sem emendas (seamless) de ${p.material}`;
    return p.material;
  }
  if (p.tile) return natural ? `a seamless tileable texture of ${p.material}` : `seamless tileable texture of ${p.material}`;
  return p.material;
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
    case "gemini":
      /* Gemini e Flow leem prosa; a proporção vai escrita, porque no Gemini não
         há parâmetro, e no Flow a interface manda sobre o texto */
      return { texto: natural(p, true), negativo: null };
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

export const MODELO_ACEITA_NEGATIVO = { grok: false, midjourney: true, gpt: true, gemini: false, flux: true, firefly: true };
