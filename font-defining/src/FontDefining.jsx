import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

/* Servido pelo hub em /font-defining/ — o menu é a raiz do mesmo site. */
const HUB_URL = "/";

/* ---------------------------------------------------------------
   font defining — tamanho de tipo por nível, a partir do formato,
   da distância de leitura e da quantidade de texto
   Sistema visual: tokens do gri.d.maker (design-system.md + tokens.css)
----------------------------------------------------------------*/

const CSS = `
:root{
  --gm-sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Helvetica,Arial,sans-serif;
  --gm-mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;
  --gm-size-titulo:13px; --gm-size-base:13px; --gm-size-rotulo:11.5px;
  --gm-size-valor:11px; --gm-size-status:10.5px; --gm-size-nota:10px; --gm-size-secao:9.5px;
  --gm-track-titulo:.14em; --gm-track-secao:.18em; --gm-track-sub:.08em;
  --gm-track-status:.06em; --gm-track-nota:.03em; --gm-lh-nota:1.6;
  --gm-radius:2px; --gm-gap-sm:6px; --gm-gap-md:8px;
  --gm-pad-secao:16px 18px; --gm-pad-cabecalho:18px 18px 14px;
  --gm-pad-botao:7px 8px; --gm-pad-campo:3px 5px; --gm-pad-palco:34px;
  --gm-espaco-controle:14px; --gm-largura-painel:312px; --gm-altura-barra:46px;
  --gm-trilho:2px; --gm-polegar:13px; --gm-foco:2px; --gm-xadrez:16px;
}
[data-tema="escuro"]{
  --gm-ink:#0a0a0a; --gm-ink2:#101010; --gm-ink3:#1c1c1c; --gm-line:#2b2b2b;
  --gm-text:#e8e8e8; --gm-muted:#8c8c8c;
  --gm-cyan:#00a9ce; --gm-mag:#e0218a; --gm-sobre-cyan:#08181c; --gm-sobre-mag:#fff;
  --gm-mag-btn:#d01a7c; --gm-mag-hover:#b81068;
  --gm-stage:#0a0a0a; --gm-stage-alt:#141414; --gm-sombra:rgba(0,0,0,.6);
  --gm-arte-bg:#101010; --gm-arte-tinta:#e8e8e8;
}
[data-tema="claro"]{
  --gm-ink:#e9e9e9; --gm-ink2:#f4f4f4; --gm-ink3:#e1e1e1; --gm-line:#d2d2d2;
  --gm-text:#161616; --gm-muted:#6b6b6b;
  --gm-cyan:#00768f; --gm-mag:#c4136e; --gm-sobre-cyan:#fff; --gm-sobre-mag:#fff;
  --gm-mag-btn:#c4136e; --gm-mag-hover:#9c0e54;
  --gm-stage:#ececec; --gm-stage-alt:#e2e2e2; --gm-sombra:rgba(0,0,0,.13);
  --gm-arte-bg:#f4f4f4; --gm-arte-tinta:#161616;
}

.fs-app{display:flex;min-height:100vh;background:var(--gm-ink);color:var(--gm-text);
  font-family:var(--gm-sans);font-size:var(--gm-size-base)}
.fs-app *{box-sizing:border-box}
.fs-app button{font-family:inherit;cursor:pointer}

/* Cabeçalho: o nome encolhe antes de encostar nos botões, e a barra de rolagem
   do painel é fina para não roubar largura do nome. */
.gm-cabecalho .gm-marca{gap:9px}
header.gm-cabecalho{gap:8px}
.gm-cabecalho .gm-acoes{gap:4px}
.gm-marca{flex:0 1 auto;min-width:0}
.gm-marca-nome{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-painel{scrollbar-width:thin;scrollbar-color:var(--gm-line) transparent}
.gm-painel::-webkit-scrollbar{width:8px}
.gm-painel::-webkit-scrollbar-thumb{background:var(--gm-line);border-radius:var(--gm-radius)}
.gm-painel::-webkit-scrollbar-track{background:transparent}

.gm-painel{width:var(--gm-largura-painel);flex:none;background:var(--gm-ink2);
  border-right:1px solid var(--gm-line);overflow-y:auto;max-height:100vh}
.gm-cabecalho{padding:var(--gm-pad-cabecalho);border-bottom:1px solid var(--gm-line);
  position:sticky;top:0;background:var(--gm-ink2);z-index:5;
  display:flex;align-items:center;justify-content:space-between;gap:10px}
.gm-marca{display:flex;align-items:center;gap:11px;min-width:0;text-decoration:none}
a.gm-marca:focus-visible{outline:var(--gm-foco) solid var(--gm-cyan);outline-offset:4px}
.gm-acoes{display:flex;gap:var(--gm-gap-sm);flex:none}
.gm-risco{width:1px;align-self:stretch;margin:1px 0;background:var(--gm-line);flex:none}
.gm-marca-nome{margin:0;font-family:"Host Grotesk",var(--gm-sans);font-size:19px;
  font-weight:600;letter-spacing:-.005em;text-transform:lowercase;line-height:1;color:var(--gm-text)}
.gm-logo{height:20px;width:auto;color:var(--gm-text);flex:none;display:block}
.gm-tema{flex:0 0 auto;display:block;width:30px;height:30px;padding:6px;background:var(--gm-ink);
  border:1px solid var(--gm-line);border-radius:var(--gm-radius);cursor:pointer;color:var(--gm-muted)}
.gm-tema:hover{background:var(--gm-cyan);border-color:var(--gm-cyan);color:var(--gm-sobre-cyan)}
.gm-tema:focus-visible{outline:var(--gm-foco) solid var(--gm-cyan);outline-offset:1px}
.gm-tema svg{width:100%;height:100%;display:block;fill:none;stroke:currentColor;stroke-width:1.7}

.gm-rodape{padding:16px 18px;border-top:1px solid var(--gm-line);background:var(--gm-ink2);
  display:flex;flex-wrap:wrap;gap:8px 16px}
.gm-rodape a{font-family:var(--gm-mono);font-size:var(--gm-size-status);letter-spacing:.04em;
  color:var(--gm-muted);text-decoration:none}
.gm-rodape a:hover{color:var(--gm-cyan)}
.gm-rodape a:focus-visible{outline:var(--gm-foco) solid var(--gm-cyan);outline-offset:2px}

.gm-secao{padding:var(--gm-pad-secao);border-bottom:1px solid var(--gm-line)}
.gm-secao-titulo{display:flex;align-items:center;gap:var(--gm-gap-md);margin:0 0 12px;
  font-family:var(--gm-mono);font-size:var(--gm-size-secao);letter-spacing:var(--gm-track-secao);
  text-transform:uppercase;color:var(--gm-cyan);font-weight:400}
.gm-secao-titulo::after{content:"";flex:1;height:1px;background:var(--gm-line)}

.gm-controle{margin-bottom:var(--gm-espaco-controle)}
.gm-controle:last-child{margin-bottom:0}
.gm-linha{display:flex;align-items:center;justify-content:space-between;gap:var(--gm-gap-md);margin-bottom:6px}
.gm-rotulo{font-size:var(--gm-size-rotulo);letter-spacing:.01em;color:var(--gm-text)}
.gm-campo{display:flex;align-items:baseline;gap:4px}
.gm-valor{width:58px;font-family:var(--gm-mono);font-size:var(--gm-size-valor);text-align:right;
  background:var(--gm-ink);border:1px solid var(--gm-line);color:var(--gm-text);
  padding:var(--gm-pad-campo);border-radius:var(--gm-radius)}
.gm-valor:focus-visible{outline:var(--gm-foco) solid var(--gm-cyan);outline-offset:1px}
.gm-unidade{font-family:var(--gm-mono);font-size:var(--gm-size-secao);color:var(--gm-muted)}
.gm-nota{font-family:var(--gm-mono);font-size:var(--gm-size-nota);line-height:var(--gm-lh-nota);
  letter-spacing:var(--gm-track-nota);color:var(--gm-muted);margin:8px 0 0}
.gm-nota--alerta{color:var(--gm-mag)}

.gm-slider{width:100%;-webkit-appearance:none;appearance:none;height:var(--gm-trilho);
  background:var(--gm-line);border-radius:var(--gm-radius);display:block}
.gm-slider::-webkit-slider-thumb{-webkit-appearance:none;width:var(--gm-polegar);height:var(--gm-polegar);
  border-radius:50%;background:var(--gm-acento,var(--gm-cyan));border:2px solid var(--gm-ink2);cursor:grab}
.gm-slider::-moz-range-thumb{width:var(--gm-polegar);height:var(--gm-polegar);border-radius:50%;
  background:var(--gm-acento,var(--gm-cyan));border:2px solid var(--gm-ink2);cursor:grab}
.gm-slider:focus-visible{outline:var(--gm-foco) solid var(--gm-cyan);outline-offset:4px}

.gm-botao{background:var(--gm-ink);border:1px solid var(--gm-line);color:var(--gm-text);
  font-family:var(--gm-mono);font-size:var(--gm-size-valor);padding:var(--gm-pad-botao);
  border-radius:var(--gm-radius);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm-botao:hover:not(:disabled){background:var(--gm-cyan);border-color:var(--gm-cyan);color:var(--gm-sobre-cyan)}
.gm-botao:focus-visible{outline:var(--gm-foco) solid var(--gm-cyan);outline-offset:1px}
.gm-botao:disabled{opacity:.4;cursor:default}
.gm-botao[aria-pressed="true"]{background:var(--gm-cyan);border-color:var(--gm-cyan);color:var(--gm-sobre-cyan)}
.gm-botao--mag:hover:not(:disabled){background:var(--gm-mag);border-color:var(--gm-mag);color:var(--gm-sobre-mag)}
.gm-botao--mag[aria-pressed="true"]{background:var(--gm-mag);border-color:var(--gm-mag);color:var(--gm-sobre-mag)}
.gm-botao--primario{background:var(--gm-mag-btn);border-color:var(--gm-mag-btn);color:var(--gm-sobre-mag);
  font-weight:600;letter-spacing:.05em}
.gm-botao--primario:hover:not(:disabled){background:var(--gm-mag-hover);border-color:var(--gm-mag-hover);color:var(--gm-sobre-mag)}

.gm-grade{display:grid;gap:var(--gm-gap-md)}
.gm-grade--2{grid-template-columns:1fr 1fr}
.gm-grade--3{grid-template-columns:1fr 1fr 1fr}
.gm-grade--4{grid-template-columns:1fr 1fr 1fr 1fr}

.gm-select,.gm-texto{width:100%;background:var(--gm-ink);border:1px solid var(--gm-line);
  color:var(--gm-text);font-family:var(--gm-mono);font-size:var(--gm-size-valor);
  padding:var(--gm-pad-botao);border-radius:var(--gm-radius)}
.gm-select{-webkit-appearance:none;appearance:none;cursor:pointer;padding-right:24px;
  background-image:linear-gradient(45deg,transparent 50%,currentColor 50%),
    linear-gradient(135deg,currentColor 50%,transparent 50%);
  background-position:calc(100% - 13px) 13px,calc(100% - 9px) 13px;
  background-size:4px 4px,4px 4px;background-repeat:no-repeat}
.gm-select:hover{border-color:var(--gm-cyan)}
.gm-select:focus-visible,.gm-texto:focus-visible{outline:var(--gm-foco) solid var(--gm-cyan);outline-offset:1px}
.gm-texto{font-family:var(--gm-sans);font-size:var(--gm-size-rotulo)}

.gm-check{display:flex;align-items:center;gap:var(--gm-gap-md);font-size:var(--gm-size-rotulo);
  margin-bottom:10px;cursor:pointer}
.gm-check:last-child{margin-bottom:0}
.gm-check input{accent-color:var(--gm-mag);width:13px;height:13px}
.gm-check input:focus-visible{outline:var(--gm-foco) solid var(--gm-cyan);outline-offset:1px}

.fs-nivel{margin-bottom:var(--gm-espaco-controle)}
.fs-nivel:last-child{margin-bottom:0}
.fs-nivel-topo{display:flex;align-items:center;justify-content:space-between;gap:var(--gm-gap-md);margin-bottom:6px}
.fs-etiqueta{font-family:var(--gm-mono);font-size:var(--gm-size-secao);letter-spacing:var(--gm-track-secao);
  text-transform:uppercase;color:var(--gm-muted)}
.fs-conta{font-family:var(--gm-mono);font-size:var(--gm-size-nota);color:var(--gm-muted)}
.fs-nivel[data-off="1"] .gm-texto{opacity:.4}

.fs-main{flex:1;display:flex;flex-direction:column;min-width:0}
.gm-barra{height:var(--gm-altura-barra);flex:none;display:flex;align-items:center;
  justify-content:space-between;gap:var(--gm-gap-md);padding:0 18px;
  background:var(--gm-ink2);border-bottom:1px solid var(--gm-line);
  font-family:var(--gm-mono);font-size:var(--gm-size-status);letter-spacing:var(--gm-track-status);
  text-transform:uppercase;color:var(--gm-muted)}
.gm-barra>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-barra-acoes{display:flex;align-items:center;gap:var(--gm-gap-md);flex:none}

.gm-palco{flex:1;padding:var(--gm-pad-palco);overflow:auto;display:flex;align-items:center;
  justify-content:center;background-color:var(--gm-stage);
  background-image:linear-gradient(45deg,var(--gm-stage-alt) 25%,transparent 25%,transparent 75%,var(--gm-stage-alt) 75%),
    linear-gradient(45deg,var(--gm-stage-alt) 25%,transparent 25%,transparent 75%,var(--gm-stage-alt) 75%);
  background-size:var(--gm-xadrez) var(--gm-xadrez);
  background-position:0 0,calc(var(--gm-xadrez)/2) calc(var(--gm-xadrez)/2)}
.gm-documento{position:relative;flex:none;background:var(--gm-arte-bg);
  color:var(--gm-arte-tinta);box-shadow:0 0 0 1px var(--gm-line),0 20px 60px var(--gm-sombra)}
.gm-registro{position:absolute;width:13px;height:13px;pointer-events:none}
.gm-registro::before,.gm-registro::after{content:"";position:absolute;background:var(--gm-cyan);opacity:.85}
.gm-registro::before{left:6px;top:0;width:1px;height:13px}
.gm-registro::after{top:6px;left:0;height:1px;width:13px}

.fs-mancha{position:absolute;inset:0;overflow:hidden}
.fs-margem{position:absolute;pointer-events:none;border:1px dashed var(--gm-cyan);opacity:.45}
.fs-goteira{position:absolute;pointer-events:none;background:var(--gm-mag);opacity:.14}
.fs-bloco{position:absolute;pointer-events:none}
.fs-txt{margin:0;white-space:pre}
.fs-marca{position:absolute;pointer-events:none;font-family:var(--gm-mono);color:var(--gm-mag);
  text-transform:uppercase;letter-spacing:var(--gm-track-sub);white-space:nowrap;opacity:.9}

.gm-tira{flex:none;padding:12px 18px 14px;background:var(--gm-ink2);border-top:1px solid var(--gm-line);
  max-height:40vh;overflow:auto}
.fs-tabela{width:100%;border-collapse:collapse;font-family:var(--gm-mono);font-size:var(--gm-size-valor)}
.fs-tabela th{font-weight:400;font-size:var(--gm-size-secao);letter-spacing:var(--gm-track-sub);
  text-transform:uppercase;color:var(--gm-muted);text-align:right;padding:0 0 6px}
.fs-tabela td{padding:5px 0;border-top:1px solid var(--gm-line);text-align:right;color:var(--gm-text)}
.fs-tabela th:first-child,.fs-tabela td:first-child{text-align:left}
.fs-tabela td:first-child{color:var(--gm-cyan);text-transform:uppercase;
  letter-spacing:var(--gm-track-sub);font-size:var(--gm-size-secao)}
.fs-tabela td.fs-cel-txt{color:var(--gm-muted);text-align:left;max-width:0;width:34%;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fs-tabela tr[data-apertado="1"] td{color:var(--gm-mag)}

@media (max-width:860px){
  .fs-app{flex-direction:column}
  .gm-painel{width:100%;max-height:none;border-right:0;border-bottom:1px solid var(--gm-line)}
  .gm-palco{min-height:320px}
}
@media (prefers-reduced-motion:reduce){
  .fs-app *,.fs-app *::before,.fs-app *::after{transition:none!important;animation:none!important}
}
`;

/* ---------- catálogo ---------- */

/* `fis` é a largura física presumida em mm — num impresso é a própria largura;
   numa tela é o tamanho em que a peça costuma ser vista (celular, monitor, projeção).
   É ela que liga o pixel à distância de leitura. `dist` é a distância padrão em mm. */
const FORMATOS = [
  { g: "impresso", id: "a6", nome: "A6 · 105×148", w: 105, h: 148, u: "mm", dist: 350 },
  { g: "impresso", id: "a5", nome: "A5 · 148×210", w: 148, h: 210, u: "mm", dist: 400 },
  { g: "impresso", id: "a4", nome: "A4 · 210×297", w: 210, h: 297, u: "mm", dist: 400 },
  { g: "impresso", id: "a3", nome: "A3 · 297×420", w: 297, h: 420, u: "mm", dist: 550 },
  { g: "impresso", id: "a2", nome: "A2 · 420×594", w: 420, h: 594, u: "mm", dist: 900 },
  { g: "impresso", id: "a1", nome: "A1 · 594×841", w: 594, h: 841, u: "mm", dist: 1500 },
  { g: "impresso", id: "a0", nome: "A0 · 841×1189", w: 841, h: 1189, u: "mm", dist: 2200 },
  { g: "impresso", id: "cartaz", nome: "cartaz · 500×700", w: 500, h: 700, u: "mm", dist: 1200 },
  { g: "impresso", id: "dl", nome: "flyer DL · 100×210", w: 100, h: 210, u: "mm", dist: 350 },
  { g: "impresso", id: "carta", nome: "carta · 216×279", w: 216, h: 279, u: "mm", dist: 400 },
  { g: "impresso", id: "cartao", nome: "cartão · 90×50", w: 90, h: 50, u: "mm", dist: 300 },
  { g: "impresso", id: "banner", nome: "banner · 800×2000", w: 800, h: 2000, u: "mm", dist: 2500 },
  { g: "tela", id: "ig-post", nome: "instagram post · 1080²", w: 1080, h: 1080, u: "px", fis: 70, dist: 350 },
  { g: "tela", id: "ig-story", nome: "instagram story · 1080×1920", w: 1080, h: 1920, u: "px", fis: 70, dist: 350 },
  { g: "tela", id: "mobile", nome: "tela de celular · 390×844", w: 390, h: 844, u: "px", fis: 70, dist: 350 },
  { g: "tela", id: "slide", nome: "slide 16:9 · 1920×1080", w: 1920, h: 1080, u: "px", fis: 2400, dist: 4500 },
  { g: "tela", id: "slide43", nome: "slide 4:3 · 1600×1200", w: 1600, h: 1200, u: "px", fis: 2000, dist: 4500 },
  { g: "tela", id: "web", nome: "web desktop · 1440×900", w: 1440, h: 900, u: "px", fis: 340, dist: 600 },
  { g: "tela", id: "thumb", nome: "thumbnail · 1280×720", w: 1280, h: 720, u: "px", fis: 150, dist: 500 },
  { g: "tela", id: "tv", nome: "painel/TV · 1920×1080", w: 1920, h: 1080, u: "px", fis: 1200, dist: 3000 },
];

const FAMILIAS = [
  { id: "sans", l: "sans", css: '-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Helvetica,Arial,sans-serif' },
  { id: "serifa", l: "serifa", css: 'Georgia,"Times New Roman",Times,serif' },
  { id: "estreita", l: "estreita", css: '"Arial Narrow","Helvetica Neue",Impact,Haettenschweiler,sans-serif' },
  { id: "mono", l: "mono", css: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace' },
];

/* Razões clássicas. "auto" deriva a razão do próprio conteúdo. */
const RAZOES = [
  { v: 0, l: "auto" },
  { v: 1.2, l: "1,200" },
  { v: 1.25, l: "1,250" },
  { v: 1.333, l: "1,333" },
  { v: 1.5, l: "1,500" },
  { v: 1.618, l: "1,618" },
];

const NOMES_RAZAO = [
  [1.067, "segunda menor"],
  [1.125, "segunda maior"],
  [1.2, "terça menor"],
  [1.25, "terça maior"],
  [1.333, "quarta justa"],
  [1.414, "trítono"],
  [1.5, "quinta justa"],
  [1.618, "áurea"],
  [1.778, "sexta maior"],
  [2, "oitava"],
];

/* Ângulo visual mínimo da altura de caixa alta, em graus. Abaixo disso o nível
   deixa de ser confortável na distância informada. */
const ANGULO = { corpo: 0.36, legenda: 0.28 };

const PT_MM = 25.4 / 72;

const PALAVRAS = ("tipografia composição leitura entrelinha coluna margem hierarquia " +
  "contraste peso escala medida ritmo mancha papel tinta prova cor traço forma " +
  "espaço linha página título texto imagem grade ponto corpo fonte caixa versal " +
  "desenho projeto estudo sistema proporção módulo").split(" ");

/* ---------- medição ---------- */

const MED = 100;
const medCv = typeof document !== "undefined" ? document.createElement("canvas") : null;
const medCtx = medCv ? medCv.getContext("2d") : null;

function fonteCss(fam, peso, px) {
  return peso + " " + px + "px " + fam.css;
}

/** larguras em "em" (múltiplos do corpo), medidas na fonte real */
function medirTexto(txt, fam, peso) {
  const palavras = String(txt).trim().split(/\s+/).filter(Boolean);
  if (!medCtx) return { palavras: palavras.map((t) => ({ t, w: t.length * 0.5 })), esp: 0.26 };
  medCtx.font = fonteCss(fam, peso, MED);
  return {
    palavras: palavras.map((t) => ({ t, w: medCtx.measureText(t).width / MED })),
    esp: medCtx.measureText(" ").width / MED,
  };
}

/** métricas da fonte: altura de caixa alta e largura média de caractere, em "em" */
function metricas(fam, peso) {
  const padrao = { cap: 0.7, medio: 0.5 };
  if (!medCtx) return padrao;
  medCtx.font = fonteCss(fam, peso, MED);
  const amostra = "Uma vez que o tipo é lido, a forma desaparece por trás da palavra";
  const medio = medCtx.measureText(amostra).width / MED / amostra.length;
  let cap = padrao.cap;
  try {
    const m = medCtx.measureText("H");
    if (m.actualBoundingBoxAscent) cap = m.actualBoundingBoxAscent / MED;
  } catch (e) {
    /* navegador sem métricas detalhadas — fica o padrão */
  }
  return { cap: cap > 0.4 && cap < 1 ? cap : padrao.cap, medio: medio > 0.2 ? medio : padrao.medio };
}

/** a palavra mais larga do texto, em "em" */
function maiorPalavra(med) {
  return med && med.palavras.length ? Math.max(...med.palavras.map((p) => p.w)) : 0;
}

/** quebra gulosa; `larguraEm` é a largura da caixa dividida pelo corpo */
function quebrar(med, larguraEm) {
  const linhas = [];
  let atual = null;
  let larg = 0;
  let maior = 0;
  for (const p of med.palavras) {
    if (atual === null) {
      atual = p.t;
      larg = p.w;
    } else if (larg + med.esp + p.w <= larguraEm) {
      atual += " " + p.t;
      larg += med.esp + p.w;
    } else {
      linhas.push({ t: atual, w: larg });
      maior = Math.max(maior, larg);
      atual = p.t;
      larg = p.w;
    }
  }
  if (atual !== null) {
    linhas.push({ t: atual, w: larg });
    maior = Math.max(maior, larg);
  }
  return { linhas, maior };
}

/** maior corpo em que o texto cabe na caixa com no máximo `maxLinhas` linhas */
function caber(med, larg, alt, maxLinhas, lh) {
  if (!med.palavras.length || larg <= 0 || alt <= 0) return null;
  let lo = 0.01;
  let hi = Math.min(alt / lh, larg * 3);
  let melhor = null;
  for (let i = 0; i < 34; i++) {
    const mid = (lo + hi) / 2;
    const q = quebrar(med, larg / mid);
    const ok = q.linhas.length <= maxLinhas && q.maior * mid <= larg + 1e-9 && q.linhas.length * lh * mid <= alt + 1e-9;
    if (ok) {
      melhor = { corpo: mid, linhas: q.linhas };
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return melhor;
}

/** melhor entre 1 e `teto` linhas — o maior corpo vence, empate vai pra menos linhas */
function caberAuto(med, larg, alt, teto, lh) {
  let melhor = null;
  for (let n = 1; n <= teto; n++) {
    const r = caber(med, larg, alt, n, lh);
    if (r && (!melhor || r.corpo > melhor.corpo * 1.001)) melhor = r;
  }
  return melhor;
}

/* ---------- utilidades ---------- */

/* `num` é para a interface — vírgula decimal. `dec` é para arquivo (SVG, CSS, JSON),
   onde o separador tem que ser ponto. */
const dec = (v, casas = 3) => {
  const n = Math.round(v * Math.pow(10, casas)) / Math.pow(10, casas);
  return String(n);
};

const num = (v, casas = 1) => dec(v, casas).replace(".", ",");

const piso = (v, passo) => (passo > 0 ? Math.floor(v / passo + 1e-9) * passo : v);

function nomeRazao(r) {
  let melhor = NOMES_RAZAO[0];
  let dist = Infinity;
  for (const par of NOMES_RAZAO) {
    const d = Math.abs(Math.log(r / par[0]));
    if (d < dist) {
      dist = d;
      melhor = par;
    }
  }
  return dist < 0.045 ? melhor[1] : null;
}

function baixar(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function copiar(txt) {
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(txt);
  const ta = document.createElement("textarea");
  ta.value = txt;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  return Promise.resolve();
}

/* ---------- componentes ---------- */

function Controle({ rotulo, valor, onChange, min, max, step = 1, unidade, acento = "cyan", nota }) {
  return (
    <div className="gm-controle">
      <div className="gm-linha">
        <span className="gm-rotulo">{rotulo}</span>
        <span className="gm-campo">
          <input
            className="gm-valor"
            type="number"
            value={valor}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
            }}
          />
          {unidade && <span className="gm-unidade">{unidade}</span>}
        </span>
      </div>
      <input
        className="gm-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={valor}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ "--gm-acento": acento === "mag" ? "var(--gm-mag)" : "var(--gm-cyan)" }}
      />
      {nota && <p className="gm-nota">{nota}</p>}
    </div>
  );
}

function Secao({ titulo, children }) {
  return (
    <section className="gm-secao">
      <h2 className="gm-secao-titulo">{titulo}</h2>
      {children}
    </section>
  );
}

function Opcoes({ opcoes, valor, onChange, colunas, acento = "cyan" }) {
  const n = colunas || (opcoes.length > 3 ? 4 : opcoes.length > 2 ? 3 : 2);
  return (
    <div className={"gm-grade gm-grade--" + n}>
      {opcoes.map((o) => (
        <button
          key={String(o.v)}
          className={"gm-botao" + (acento === "mag" ? " gm-botao--mag" : "")}
          aria-pressed={valor === o.v}
          onClick={() => onChange(o.v)}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function Nivel({ etiqueta, texto, onTexto, ligado, onLigar, conta }) {
  return (
    <div className="fs-nivel" data-off={ligado ? "0" : "1"}>
      <div className="fs-nivel-topo">
        <label className="gm-check" style={{ margin: 0 }}>
          {onLigar ? (
            <input type="checkbox" checked={ligado} onChange={(e) => onLigar(e.target.checked)} />
          ) : null}
          <span className="fs-etiqueta">{etiqueta}</span>
        </label>
        <span className="fs-conta">{conta}</span>
      </div>
      <input
        className="gm-texto"
        type="text"
        value={texto}
        disabled={!ligado}
        onChange={(e) => onTexto(e.target.value)}
        aria-label={"Texto do " + etiqueta}
      />
    </div>
  );
}

/* ---------- app ---------- */

export default function FontDefining() {
  const [tema, setTema] = useState("escuro");

  /* formato */
  const [fmtId, setFmtId] = useState("a4");
  const [retrato, setRetrato] = useState(true);
  const [larg, setLarg] = useState(210);
  const [alt, setAlt] = useState(297);
  const [margem, setMargem] = useState(9);
  const [colunas, setColunas] = useState(1);
  const [medianiz, setMedianiz] = useState(2.5);

  /* leitura */
  const [dist, setDist] = useState(40);
  const [cpl, setCpl] = useState(66);
  const [fisica, setFisica] = useState(70);
  const [prioridade, setPrioridade] = useState("medida");

  /* conteúdo */
  const [t1, setT1] = useState("Festival de inverno na serra");
  const [t2, setT2] = useState("Três noites de música e cinema ao ar livre");
  const [t3, setT3] = useState("Praça central · entrada gratuita");
  const [palavrasCorpo, setPalavrasCorpo] = useState(90);
  const [tLeg, setTLeg] = useState("Realização: prefeitura municipal e coletivo serra viva");
  const [usa2, setUsa2] = useState(true);
  const [usa3, setUsa3] = useState(true);
  const [usaCorpo, setUsaCorpo] = useState(true);
  const [usaLeg, setUsaLeg] = useState(true);
  const [linhasT1, setLinhasT1] = useState(0);

  /* escala */
  const [razaoFixa, setRazaoFixa] = useState(0);
  const [famId, setFamId] = useState("sans");
  const [pesoTit, setPesoTit] = useState(700);
  const [lhTit, setLhTit] = useState(1.08);
  const [lhCorpo, setLhCorpo] = useState(1.45);

  /* saída */
  const [unidade, setUnidade] = useState("pt");
  const [dpi, setDpi] = useState(300);
  const [arred, setArred] = useState(0.5);
  const [guias, setGuias] = useState(true);
  const [aviso, setAviso] = useState("");

  const fmt = useMemo(() => FORMATOS.find((f) => f.id === fmtId) || FORMATOS[2], [fmtId]);
  const fam = useMemo(() => FAMILIAS.find((f) => f.id === famId) || FAMILIAS[0], [famId]);
  const impresso = fmt.u === "mm";

  /* troca de formato: dimensões, distância e unidade de saída acompanham */
  const aplicarFormato = useCallback((id) => {
    const f = FORMATOS.find((x) => x.id === id);
    if (!f) return;
    setFmtId(id);
    setRetrato(f.h >= f.w);
    setLarg(f.w);
    setAlt(f.h);
    setDist(Math.round(f.dist / 10));
    setUnidade(f.u === "mm" ? "pt" : "px");
    setArred(f.u === "mm" ? 0.5 : 1);
    if (f.fis) setFisica(f.fis);
  }, []);

  const trocarOrientacao = useCallback(
    (novoRetrato) => {
      if (novoRetrato === retrato) return;
      setRetrato(novoRetrato);
      setLarg(alt);
      setAlt(larg);
    },
    [retrato, larg, alt]
  );

  /* mm por unidade do documento: 1 no impresso; na tela, o pixel só vira medida
     física depois de saber em que tamanho a peça é vista */
  const mmPorU = useMemo(() => (impresso ? 1 : Math.max(10, fisica) / Math.max(1, larg)), [impresso, fisica, larg]);

  const uni = impresso ? "mm" : "px";

  /* conversão do corpo calculado (em unidade do documento) para a unidade de saída */
  const paraSaida = useCallback(
    (v) => {
      if (unidade === "mm") return v * mmPorU;
      if (unidade === "pt") return (v * mmPorU) / PT_MM;
      if (unidade === "rem") return (impresso ? (v * mmPorU * dpi) / 25.4 : v) / 16;
      return impresso ? (v * mmPorU * dpi) / 25.4 : v;
    },
    [unidade, mmPorU, impresso, dpi]
  );

  const daSaida = useCallback(
    (v) => {
      if (unidade === "mm") return v / mmPorU;
      if (unidade === "pt") return (v * PT_MM) / mmPorU;
      if (unidade === "rem") return impresso ? (v * 16 * 25.4) / dpi / mmPorU : v * 16;
      return impresso ? (v * 25.4) / dpi / mmPorU : v;
    },
    [unidade, mmPorU, impresso, dpi]
  );

  /* arredonda na unidade de saída e volta pra unidade do documento, pra tela
     mostrar exatamente o número que o export entrega */
  const fixar = useCallback((v) => daSaida(piso(paraSaida(v), arred)), [daSaida, paraSaida, arred]);

  /* ------------------------------------------------------------------
     o cálculo
  ------------------------------------------------------------------ */
  const calc = useMemo(() => {
    const W = Math.max(10, larg);
    const H = Math.max(10, alt);
    const m = (Math.min(W, H) * margem) / 100;
    const areaW = Math.max(1, W - 2 * m);
    const areaH = Math.max(1, H - 2 * m);
    const nCol = Math.max(1, Math.min(4, colunas));
    const gut = (Math.min(W, H) * medianiz) / 100;
    const colW = Math.max(1, (areaW - (nCol - 1) * gut) / nCol);

    const met = metricas(fam, 400);
    const distMm = Math.max(50, dist * 10);
    const rad = Math.PI / 180;
    /* piso de legibilidade: altura de caixa alta sob o ângulo visual mínimo */
    const pisoU = (ang) => (distMm * Math.tan(ang * rad)) / met.cap / mmPorU;
    const pisoCorpo = pisoU(ANGULO.corpo);
    const pisoLegenda = pisoU(ANGULO.legenda);

    /* duas estratégias para o corpo, as duas defensáveis:
       medida  — parte dos caracteres por linha e deixa o corpo seguir a coluna;
       leitura — parte do mínimo legível na distância e deixa a linha seguir o corpo. */
    const porMedida = colW / (cpl * met.medio);
    const tetoMedida = colW / (45 * met.medio);
    let corpo =
      prioridade === "leitura"
        ? Math.max(pisoCorpo, colW / (95 * met.medio))
        : Math.min(Math.max(porMedida, pisoCorpo), Math.max(tetoMedida, pisoCorpo));
    corpo = fixar(Math.max(corpo, 0.2));

    /* teto de largura: nenhuma palavra pode passar da margem. A quebra gulosa
       põe a palavra sozinha na linha mesmo quando ela não cabe, então o corpo
       desce até a maior palavra caber na caixa. Só desce, nunca sobe. */
    const naCaixa = (corpoN, med, caixa) => {
      const larga = maiorPalavra(med);
      if (corpoN == null || larga <= 0) return corpoN;
      const teto = fixar(caixa / larga);
      return Math.min(corpoN, teto > 0 ? teto : caixa / larga);
    };

    /* corpo de texto: quebra real das palavras de amostra */
    const medCorpo = medirTexto(
      Array.from({ length: Math.max(0, Math.round(palavrasCorpo)) }, (_, i) => PALAVRAS[i % PALAVRAS.length]).join(" "),
      fam,
      400
    );
    corpo = naCaixa(corpo, medCorpo, colW);
    /* os diagnósticos leem o corpo já limitado pela caixa */
    const cplCorpo = Math.round(colW / (corpo * met.medio));
    const apertado = cplCorpo < 45;
    const linhaLonga = cplCorpo > 85;
    const qCorpo = usaCorpo && medCorpo.palavras.length ? quebrar(medCorpo, colW / corpo) : { linhas: [], maior: 0 };
    const linhasCol = Math.ceil(qCorpo.linhas.length / nCol);
    const corpoH = linhasCol * lhCorpo * corpo;

    /* legenda: um degrau abaixo do corpo, sem furar o próprio piso */
    const medLeg = usaLeg ? medirTexto(tLeg, fam, 400) : { palavras: [], esp: 0.26 };
    let legenda = Math.max(corpo / 1.25, pisoLegenda);
    legenda = Math.min(legenda, corpo);
    legenda = naCaixa(fixar(legenda), medLeg, areaW);
    const qLeg = medLeg.palavras.length ? quebrar(medLeg, areaW / legenda) : { linhas: [], maior: 0 };
    const legH = qLeg.linhas.length * lhCorpo * legenda;

    /* o que sobra da área de texto é o orçamento dos títulos */
    const blocos = 1 + (usa2 ? 1 : 0) + (usa3 ? 1 : 0) + (usaCorpo ? 1 : 0) + (usaLeg ? 1 : 0);
    const respiro = areaH * 0.045 * Math.max(0, blocos - 1);
    let folga = areaH - corpoH - legH - respiro;
    const estourou = folga < areaH * 0.12;
    folga = Math.max(folga, areaH * 0.12);

    const fatia = usa2 && usa3 ? [0.56, 0.27, 0.17] : usa2 ? [0.68, 0.32, 0] : usa3 ? [0.68, 0, 0.32] : [0.95, 0, 0];

    const med1 = medirTexto(t1, fam, pesoTit);
    const teto1 = linhasT1 > 0 ? linhasT1 : 4;
    const r1 =
      linhasT1 > 0
        ? caber(med1, areaW, folga * fatia[0], linhasT1, lhTit)
        : caberAuto(med1, areaW, folga * fatia[0], teto1, lhTit);

    /* h2 e h3 saem no peso do título, então é nele que se mede — medir em 400
       daria linhas mais estreitas do que as desenhadas, e o texto furaria a margem */
    const med2 = usa2 ? medirTexto(t2, fam, pesoTit) : null;
    const r2 = med2 ? caberAuto(med2, areaW, folga * fatia[1], 3, lhTit) : null;
    const med3 = usa3 ? medirTexto(t3, fam, pesoTit) : null;
    const r3 = med3 ? caberAuto(med3, areaW, folga * fatia[2], 3, lhTit) : null;

    let h1 = fixar(r1 ? r1.corpo : corpo * 2);
    const teto2 = r2 ? r2.corpo : h1;
    const teto3 = r3 ? r3.corpo : h1;

    /* razão: a automática é a que liga o h1 ao menor nível ativo em passos iguais.
       Só há escala quando existe mais de um nível — com h1 sozinho, não há razão. */
    const menor = usaCorpo ? corpo : usaLeg ? legenda : null;
    const degraus = (usa2 ? 1 : 0) + (usa3 ? 1 : 0) + (menor != null ? 1 : 0);
    const temEscala = degraus > 0;
    const razaoAuto = temEscala && menor != null && h1 > menor ? Math.pow(h1 / menor, 1 / degraus) : 1.25;
    const razao = razaoFixa > 0 ? razaoFixa : razaoAuto;

    let h2 = null;
    let h3 = null;
    if (usa2) h2 = Math.min(h1 / razao, teto2);
    if (usa3) h3 = Math.min((usa2 ? h2 : h1) / razao, teto3);
    /* a hierarquia não pode inverter: cada nível fica acima do seguinte */
    if (usa3) h3 = Math.max(h3, corpo * 1.02);
    if (usa2) h2 = Math.max(h2, (usa3 ? h3 : corpo) * 1.02);
    h1 = Math.max(h1, (usa2 ? h2 : usa3 ? h3 : corpo) * 1.02);
    if (usa2) h2 = fixar(h2);
    if (usa3) h3 = fixar(h3);
    h1 = fixar(h1);

    /* o arredondamento pode empatar dois níveis vizinhos; um degrau separa de novo,
       sem sair da grade de arredondamento */
    const passo = arred > 0 ? daSaida(arred) : 0;
    const acima = (v, base) => (v > base + 1e-9 ? v : passo > 0 ? base + passo : base * 1.02);
    if (usa3) h3 = acima(h3, corpo);
    if (usa2) h2 = acima(h2, usa3 ? h3 : corpo);
    h1 = acima(h1, usa2 ? h2 : usa3 ? h3 : corpo);

    /* nenhum título pode furar a margem; se o teto baixar o h1, os níveis
       abaixo acompanham, para a hierarquia não inverter */
    h1 = naCaixa(h1, med1, areaW);
    if (usa2) h2 = Math.min(naCaixa(h2, med2, areaW), h1);
    if (usa3) h3 = Math.min(naCaixa(h3, med3, areaW), usa2 ? h2 : h1);

    /* quebra final, já no tamanho arredondado */
    const quebra = (med, corpoFinal) => (med && corpoFinal ? quebrar(med, areaW / corpoFinal) : { linhas: [], maior: 0 });
    const q1 = quebra(med1, h1);
    const q2 = usa2 ? quebra(med2, h2) : { linhas: [], maior: 0 };
    const q3 = usa3 ? quebra(med3, h3) : { linhas: [], maior: 0 };

    const niveis = [];
    const push = (id, rotulo, corpoN, q, lh, texto) => {
      if (corpoN == null) return;
      const emColunas = id === "corpo" ? nCol : 1;
      const larguraCaixa = id === "corpo" ? colW : areaW;
      niveis.push({
        id,
        rotulo,
        corpo: corpoN,
        lh,
        linhas: q.linhas,
        emColunas,
        larguraCaixa,
        alturaBloco: Math.ceil(q.linhas.length / emColunas) * lh * corpoN,
        cpl: Math.round(larguraCaixa / (corpoN * met.medio)),
        texto,
        apertado: (corpoN * met.cap * mmPorU) / distMm < Math.tan(ANGULO.legenda * rad),
      });
    };
    push("h1", "h1", h1, q1, lhTit, t1);
    if (usa2) push("h2", "h2", h2, q2, lhTit, t2);
    if (usa3) push("h3", "h3", h3, q3, lhTit, t3);
    if (usaCorpo) push("corpo", "corpo", corpo, qCorpo, lhCorpo, Math.round(palavrasCorpo) + " palavras");
    if (usaLeg) push("legenda", "legenda", legenda, qLeg, lhCorpo, tLeg);

    /* empilhamento no documento, com respiro proporcional entre blocos.
       `fluxos` é o caminho único de desenho: preview, PNG e SVG leem daqui. */
    const gap = areaH * 0.045;
    let y = m;
    const layout = niveis.map((n) => {
      const porCol = Math.ceil(n.linhas.length / n.emColunas) || 0;
      const fluxos = Array.from({ length: n.emColunas }, (_, c) => ({
        x: m + c * (colW + gut),
        y,
        largura: n.larguraCaixa,
        linhas: n.linhas.slice(porCol * c, porCol * (c + 1)),
      })).filter((f) => f.linhas.length);
      const bloco = { ...n, y, x: m, fluxos };
      y += n.alturaBloco + gap;
      return bloco;
    });
    const totalH = y - gap - m;

    return {
      W, H, m, areaW, areaH, colW, nCol, gut, met, razao, razaoAuto, temEscala, corpo, apertado, linhaLonga,
      cplCorpo, estourou, transbordou: totalH > areaH + 1e-6,
      niveis: layout, totalH, ocupacao: totalH / areaH, pisoCorpo, distMm,
      linhasCorpo: qCorpo.linhas.length,
    };
  }, [
    larg, alt, margem, colunas, medianiz, dist, cpl, prioridade, t1, t2, t3, tLeg, palavrasCorpo,
    usa2, usa3, usaCorpo, usaLeg, linhasT1, razaoFixa, fam, pesoTit, lhTit, lhCorpo, mmPorU, fixar, daSaida, arred,
  ]);

  /* cor da arte: sai dos tokens do tema ativo, nunca de valor solto no componente */
  const appRef = useRef(null);
  const corArte = useCallback(() => {
    const el = appRef.current;
    const cs = el ? getComputedStyle(el) : null;
    const ler = (n) => (cs ? cs.getPropertyValue(n).trim() : "");
    return { bg: ler("--gm-arte-bg") || "#ffffff", tinta: ler("--gm-arte-tinta") || "#000000" };
  }, []);

  /* escala do preview */
  const palcoRef = useRef(null);
  const [caixa, setCaixa] = useState({ w: 900, h: 600 });
  useEffect(() => {
    const el = palcoRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      setCaixa({ w: el.clientWidth - 68, h: el.clientHeight - 68 });
    });
    ro.observe(el);
    setCaixa({ w: el.clientWidth - 68, h: el.clientHeight - 68 });
    return () => ro.disconnect();
  }, []);
  const escala = Math.max(0.02, Math.min(caixa.w / calc.W, caixa.h / calc.H, impresso ? 4 : 1.2));

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(""), 2600);
    return () => clearTimeout(t);
  }, [aviso]);

  /* ---------- saída ---------- */

  const rotuloUnidade = unidade;
  const casasSaida = unidade === "px" ? 0 : unidade === "rem" ? 3 : 2;
  const fmtSaida = (v) => num(paraSaida(v), casasSaida);
  const decSaida = (v) => dec(paraSaida(v), casasSaida);

  const linhasCss = () => {
    const l = [];
    l.push("/* font defining — " + fmt.nome + (impresso ? "" : " · " + fmt.fis + " mm de largura física"));
    l.push("   área de texto " + num(calc.areaW, 1) + "×" + num(calc.areaH, 1) + " " + uni +
      " · " + calc.nCol + " col · distância " + dist + " cm · razão " + num(calc.razao, 3) + " */");
    l.push(":root{");
    for (const n of calc.niveis) {
      l.push("  --fs-" + n.id + ": " + decSaida(n.corpo) + rotuloUnidade +
        "; --lh-" + n.id + ": " + dec(n.lh, 2) + ";");
    }
    l.push("}");
    for (const n of calc.niveis) {
      const sel = n.id === "corpo" ? "p, li" : n.id === "legenda" ? ".legenda, figcaption, small" : n.id;
      l.push(sel + "{font-size:var(--fs-" + n.id + ");line-height:var(--lh-" + n.id + ");}");
    }
    return l.join("\n");
  };

  const json = () => {
    const o = {
      formato: { id: fmt.id, nome: fmt.nome, largura: calc.W, altura: calc.H, unidade: uni },
      area: { largura: calc.areaW, altura: calc.areaH, margem: calc.m, colunas: calc.nCol, medianiz: calc.gut },
      leitura: { distancia_cm: dist, cpl_alvo: cpl, familia: fam.id },
      escala: { razao: Number(dec(calc.razao, 3)), modo: razaoFixa > 0 ? "fixa" : "auto" },
      unidade_saida: rotuloUnidade,
      niveis: calc.niveis.map((n) => ({
        nivel: n.id,
        tamanho: Number(decSaida(n.corpo)),
        entrelinha: Number(dec(n.lh, 2)),
        linhas: n.linhas.length,
        cpl: n.cpl,
      })),
    };
    return JSON.stringify(o, null, 2);
  };

  /* desenha o documento num canvas — mesma quebra de linha do preview */
  const pintar = (ctx, k) => {
    const cor = corArte();
    ctx.fillStyle = cor.bg;
    ctx.fillRect(0, 0, calc.W * k, calc.H * k);
    ctx.fillStyle = cor.tinta;
    ctx.textBaseline = "alphabetic";
    for (const n of calc.niveis) {
      const peso = n.id.startsWith("h") ? pesoTit : 400;
      ctx.font = fonteCss(fam, peso, n.corpo * k);
      for (const f of n.fluxos) {
        f.linhas.forEach((ln, i) => {
          ctx.fillText(ln.t, f.x * k, (f.y + n.lh * n.corpo * (i + 0.76)) * k);
        });
      }
    }
  };

  const exportarPng = () => {
    const k = impresso ? dpi / 25.4 : 1;
    const cv = document.createElement("canvas");
    cv.width = Math.round(calc.W * k);
    cv.height = Math.round(calc.H * k);
    const ctx = cv.getContext("2d");
    pintar(ctx, k);
    cv.toBlob((b) => b && baixar(b, "font-defining-" + fmt.id + ".png"), "image/png");
    setAviso("png exportado");
  };

  const svg = () => {
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const uSvg = impresso ? "mm" : "px";
    const cor = corArte();
    const p = [];
    p.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + calc.W + uSvg + '" height="' + calc.H + uSvg +
      '" viewBox="0 0 ' + calc.W + " " + calc.H + '">');
    p.push('<rect width="' + calc.W + '" height="' + calc.H + '" fill="' + cor.bg + '"/>');
    const tinta = cor.tinta;
    for (const n of calc.niveis) {
      const peso = n.id.startsWith("h") ? pesoTit : 400;
      p.push('<g font-family="' + esc(fam.css.replace(/"/g, "'")) + '" font-size="' + dec(n.corpo) +
        '" font-weight="' + peso + '" fill="' + tinta + '">');
      for (const f of n.fluxos) {
        f.linhas.forEach((ln, i) => {
          const y = f.y + n.lh * n.corpo * (i + 0.76);
          p.push('  <text x="' + dec(f.x) + '" y="' + dec(y) + '">' + esc(ln.t) + "</text>");
        });
      }
      p.push("</g>");
    }
    p.push("</svg>");
    return p.join("\n");
  };

  /* ---------- render ---------- */

  const status = [
    fmt.nome.split(" · ")[0] + " " + num(calc.W, 0) + "×" + num(calc.H, 0) + " " + uni,
    "área " + num(calc.areaW, 0) + "×" + num(calc.areaH, 0),
    calc.nCol + (calc.nCol > 1 ? " colunas" : " coluna"),
    calc.temEscala ? "razão " + num(calc.razao, 3) + (nomeRazao(calc.razao) ? " " + nomeRazao(calc.razao) : "") : "nível único",
    "ocupação " + Math.round(calc.ocupacao * 100) + "%",
  ].join(" · ");

  return (
    <div className="fs-app" data-tema={tema} ref={appRef}>
      <style>{CSS}</style>

      <aside className="gm-painel">
        <Header
          tool="font defining"
          homeHref={HUB_URL}
          tema={tema}
          onToggleTema={() => setTema((t) => (t === "escuro" ? "claro" : "escuro"))}
        />

        <Secao titulo="Formato">
          <div className="gm-controle">
            <select className="gm-select" value={fmtId} onChange={(e) => aplicarFormato(e.target.value)} aria-label="Formato">
              <optgroup label="impresso · mm">
                {FORMATOS.filter((f) => f.g === "impresso").map((f) => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </optgroup>
              <optgroup label="tela · px">
                {FORMATOS.filter((f) => f.g === "tela").map((f) => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="gm-controle">
            <Opcoes
              opcoes={[{ v: true, l: "retrato" }, { v: false, l: "paisagem" }]}
              valor={retrato}
              onChange={trocarOrientacao}
            />
          </div>

          <div className="gm-controle">
            <div className="gm-linha">
              <span className="gm-rotulo">Largura</span>
              <span className="gm-campo">
                <input className="gm-valor" type="number" min={10} max={10000} value={larg}
                  onChange={(e) => setLarg(Math.max(10, parseFloat(e.target.value) || 10))} />
                <span className="gm-unidade">{uni}</span>
              </span>
            </div>
            <div className="gm-linha" style={{ marginBottom: 0 }}>
              <span className="gm-rotulo">Altura</span>
              <span className="gm-campo">
                <input className="gm-valor" type="number" min={10} max={10000} value={alt}
                  onChange={(e) => setAlt(Math.max(10, parseFloat(e.target.value) || 10))} />
                <span className="gm-unidade">{uni}</span>
              </span>
            </div>
          </div>

          <Controle rotulo="Margem" valor={margem} onChange={setMargem} min={0} max={25} step={0.5} unidade="%"
            nota={"área de texto " + num(calc.areaW, 1) + " × " + num(calc.areaH, 1) + " " + uni} />
          <Controle rotulo="Colunas" valor={colunas} onChange={setColunas} min={1} max={4} unidade="col" />
          {colunas > 1 && (
            <Controle rotulo="Medianiz" valor={medianiz} onChange={setMedianiz} min={0.5} max={10} step={0.5} unidade="%"
              nota={"coluna de " + num(calc.colW, 1) + " " + uni} />
          )}
        </Secao>

        <Secao titulo="Leitura">
          {!impresso && (
            <Controle rotulo="Largura física" valor={fisica} onChange={setFisica} min={40} max={4000} step={10} unidade="mm"
              nota={"Em que largura a peça é vista: celular 70, monitor 340, projeção 2400. " +
                "É o que liga o pixel à distância — " + num(1 / mmPorU, 1) + " px/mm."} />
          )}
          <Controle rotulo="Distância" valor={dist} onChange={setDist} min={10} max={1500} unidade="cm" acento="mag"
            nota={"corpo mínimo legível: " + fmtSaida(calc.pisoCorpo) + " " + rotuloUnidade} />
          <div className="gm-controle">
            <Opcoes
              opcoes={[{ v: 30, l: "mão" }, { v: 60, l: "mesa" }, { v: 150, l: "parede" }, { v: 500, l: "rua" }]}
              valor={dist}
              onChange={setDist}
              colunas={4}
              acento="mag"
            />
          </div>
          <div className="gm-controle">
            <span className="gm-rotulo" style={{ display: "block", marginBottom: 6 }}>Corpo puxado pela</span>
            <Opcoes
              opcoes={[{ v: "medida", l: "medida" }, { v: "leitura", l: "leitura" }]}
              valor={prioridade}
              onChange={setPrioridade}
            />
            <p className="gm-nota">
              {prioridade === "medida"
                ? "A coluna manda: o corpo cresce até entregar os caracteres por linha pedidos."
                : "A distância manda: o corpo fica no mínimo legível e a linha estica até 95 caracteres."}
              {" Resultado: " + calc.cplCorpo + " caracteres por linha."}
            </p>
          </div>
          {prioridade === "medida" && (
            <Controle rotulo="Caracteres por linha" valor={cpl} onChange={setCpl} min={35} max={95} unidade="cpl"
              nota="45 a 75 é a faixa confortável em texto corrido." />
          )}
          <div className="gm-controle">
            <span className="gm-rotulo" style={{ display: "block", marginBottom: 6 }}>Família de medição</span>
            <Opcoes opcoes={FAMILIAS.map((f) => ({ v: f.id, l: f.l }))} valor={famId} onChange={setFamId} colunas={4} />
            <p className="gm-nota">
              O cálculo mede a fonte real: largura média {num(calc.met.medio, 3)} em, caixa alta {num(calc.met.cap, 3)} em.
            </p>
          </div>
        </Secao>

        <Secao titulo="Conteúdo">
          <Nivel etiqueta="h1" texto={t1} onTexto={setT1} ligado
            conta={t1.trim().split(/\s+/).filter(Boolean).length + " pal · " + t1.length + " car"} />
          <Nivel etiqueta="h2" texto={t2} onTexto={setT2} ligado={usa2} onLigar={setUsa2}
            conta={t2.trim().split(/\s+/).filter(Boolean).length + " pal · " + t2.length + " car"} />
          <Nivel etiqueta="h3" texto={t3} onTexto={setT3} ligado={usa3} onLigar={setUsa3}
            conta={t3.trim().split(/\s+/).filter(Boolean).length + " pal · " + t3.length + " car"} />

          <div className="fs-nivel" data-off={usaCorpo ? "0" : "1"}>
            <div className="fs-nivel-topo">
              <label className="gm-check" style={{ margin: 0 }}>
                <input type="checkbox" checked={usaCorpo} onChange={(e) => setUsaCorpo(e.target.checked)} />
                <span className="fs-etiqueta">corpo</span>
              </label>
              <span className="fs-conta">{calc.linhasCorpo} linhas</span>
            </div>
            <Controle rotulo="Palavras" valor={palavrasCorpo} onChange={setPalavrasCorpo} min={0} max={1200} step={10}
              unidade="pal" acento="mag" />
          </div>

          <Nivel etiqueta="legenda" texto={tLeg} onTexto={setTLeg} ligado={usaLeg} onLigar={setUsaLeg}
            conta={tLeg.trim().split(/\s+/).filter(Boolean).length + " pal"} />

          <div className="gm-controle" style={{ marginTop: "var(--gm-espaco-controle)" }}>
            <span className="gm-rotulo" style={{ display: "block", marginBottom: 6 }}>Linhas do h1</span>
            <Opcoes
              opcoes={[{ v: 0, l: "auto" }, { v: 1, l: "1" }, { v: 2, l: "2" }, { v: 3, l: "3" }]}
              valor={linhasT1}
              onChange={setLinhasT1}
              colunas={4}
            />
            <p className="gm-nota">
              Em auto, a ferramenta testa de 1 a 4 linhas e fica com a que permite o maior corpo.
            </p>
          </div>
        </Secao>

        <Secao titulo="Escala">
          <div className="gm-controle">
            <span className="gm-rotulo" style={{ display: "block", marginBottom: 6 }}>Razão</span>
            <Opcoes opcoes={RAZOES} valor={razaoFixa} onChange={setRazaoFixa} colunas={3} />
            <p className="gm-nota">
              {!calc.temEscala
                ? "Só o h1 está ativo — sem segundo nível não há escala a derivar."
                : razaoFixa > 0
                ? "Fixa em " + num(razaoFixa, 3) + (nomeRazao(razaoFixa) ? " · " + nomeRazao(razaoFixa) : "") +
                  ". Um nível encolhe se não couber na caixa."
                : "Derivada do conteúdo: " + num(calc.razaoAuto, 3) +
                  (nomeRazao(calc.razaoAuto) ? " · perto da " + nomeRazao(calc.razaoAuto) : "") + "."}
            </p>
          </div>
          <div className="gm-controle">
            <span className="gm-rotulo" style={{ display: "block", marginBottom: 6 }}>Peso dos títulos</span>
            <Opcoes
              opcoes={[{ v: 400, l: "400" }, { v: 600, l: "600" }, { v: 700, l: "700" }, { v: 800, l: "800" }]}
              valor={pesoTit}
              onChange={setPesoTit}
              colunas={4}
            />
          </div>
          <Controle rotulo="Entrelinha título" valor={lhTit} onChange={setLhTit} min={0.85} max={1.5} step={0.01} unidade="×" acento="mag" />
          <Controle rotulo="Entrelinha corpo" valor={lhCorpo} onChange={setLhCorpo} min={1.1} max={2} step={0.01} unidade="×" acento="mag" />
        </Secao>

        <Secao titulo="Saída">
          <div className="gm-controle">
            <span className="gm-rotulo" style={{ display: "block", marginBottom: 6 }}>Unidade</span>
            <Opcoes
              opcoes={impresso
                ? [{ v: "pt", l: "pt" }, { v: "mm", l: "mm" }, { v: "px", l: "px" }]
                : [{ v: "px", l: "px" }, { v: "rem", l: "rem" }, { v: "pt", l: "pt" }]}
              valor={unidade}
              onChange={setUnidade}
              colunas={3}
            />
          </div>
          {impresso && (
            <Controle rotulo="Resolução" valor={dpi} onChange={setDpi} min={72} max={600} step={1} unidade="dpi" />
          )}
          <div className="gm-controle">
            <span className="gm-rotulo" style={{ display: "block", marginBottom: 6 }}>Arredondamento</span>
            <Opcoes
              opcoes={[{ v: 0, l: "livre" }, { v: 0.5, l: "0,5" }, { v: 1, l: "1" }, { v: 2, l: "2" }]}
              valor={arred}
              onChange={setArred}
              colunas={4}
            />
          </div>
          <label className="gm-check">
            <input type="checkbox" checked={guias} onChange={(e) => setGuias(e.target.checked)} />
            <span>Guias de margem e coluna</span>
          </label>
          <div className="gm-grade gm-grade--2" style={{ marginTop: "var(--gm-espaco-controle)" }}>
            <button className="gm-botao" onClick={() => copiar(linhasCss()).then(() => setAviso("css copiado"))}>
              copiar css
            </button>
            <button className="gm-botao" onClick={() => copiar(json()).then(() => setAviso("json copiado"))}>
              copiar json
            </button>
            <button className="gm-botao" onClick={() => baixar(new Blob([svg()], { type: "image/svg+xml" }), "font-defining-" + fmt.id + ".svg")}>
              svg
            </button>
            <button className="gm-botao gm-botao--primario" onClick={exportarPng}>
              png
            </button>
          </div>
          <p className="gm-nota">
            {"png em " + Math.round(calc.W * (impresso ? dpi / 25.4 : 1)) + " × " +
              Math.round(calc.H * (impresso ? dpi / 25.4 : 1)) + " px · svg vetorial · css e json na medida de saída."}
          </p>
          {calc.apertado && (
            <p className="gm-nota gm-nota--alerta">
              A coluna é estreita demais para essa distância: o corpo mínimo legível entrega {calc.cplCorpo} caracteres
              por linha. Alargue a coluna, reduza a margem ou aproxime a leitura.
            </p>
          )}
          {calc.linhaLonga && (
            <p className="gm-nota gm-nota--alerta">
              Linha de {calc.cplCorpo} caracteres — longa para texto corrido. Suba a margem, divida em colunas
              ou puxe o corpo pela medida.
            </p>
          )}
          {(calc.estourou || calc.transbordou) && (
            <p className="gm-nota gm-nota--alerta">
              O conteúdo ocupa {Math.round(calc.ocupacao * 100)}% da área de texto e sobra pouco para os títulos.
              Reduza as palavras do corpo, suba a margem ou aumente o formato.
            </p>
          )}
        </Secao>

        <Footer
          links={[
            { label: "logo sizer", href: "https://github.com/gugaxd" },
            { label: "grid maker", href: "https://github.com/gugaxd/gri.d.maker" },
          ]}
        />
      </aside>

      <main className="fs-main">
        <div className="gm-barra">
          <span>{status}</span>
          <span className="gm-barra-acoes">
            {aviso ? aviso : "escala " + Math.round(escala * 100) + "%"}
          </span>
        </div>

        <div className="gm-palco" ref={palcoRef}>
          <div className="gm-documento" style={{ width: calc.W * escala, height: calc.H * escala }}>
            <i className="gm-registro" style={{ left: -19, top: -19 }} />
            <i className="gm-registro" style={{ right: -19, top: -19 }} />
            <i className="gm-registro" style={{ left: -19, bottom: -19 }} />
            <i className="gm-registro" style={{ right: -19, bottom: -19 }} />

            <div className="fs-mancha">
            {guias && (
              <>
                <span
                  className="fs-margem"
                  style={{
                    left: calc.m * escala,
                    top: calc.m * escala,
                    width: calc.areaW * escala,
                    height: calc.areaH * escala,
                  }}
                />
                {/* a medianiz só existe onde o texto corre em colunas */}
                {calc.niveis
                  .filter((n) => n.emColunas > 1)
                  .map((n) =>
                    Array.from({ length: n.emColunas - 1 }, (_, i) => (
                      <span
                        key={n.id + i}
                        className="fs-goteira"
                        style={{
                          left: (calc.m + (i + 1) * calc.colW + i * calc.gut) * escala,
                          top: n.y * escala,
                          width: calc.gut * escala,
                          height: n.alturaBloco * escala,
                        }}
                      />
                    ))
                  )}
              </>
            )}

            {calc.niveis.map((n) =>
              n.fluxos.map((f, c) => (
                <div
                  key={n.id + "-" + c}
                  className="fs-bloco"
                  style={{
                    left: f.x * escala,
                    top: f.y * escala,
                    width: f.largura * escala,
                    fontFamily: fam.css,
                    fontWeight: n.id.startsWith("h") ? pesoTit : 400,
                    fontSize: n.corpo * escala,
                    lineHeight: n.lh,
                  }}
                >
                  {f.linhas.map((ln, i) => (
                    <p key={i} className="fs-txt">
                      {ln.t}
                    </p>
                  ))}
                </div>
              ))
            )}
            </div>
          </div>
        </div>

        <div className="gm-tira">
          <table className="fs-tabela">
            <thead>
              <tr>
                <th>nível</th>
                <th>texto</th>
                <th>tamanho</th>
                <th>entrelinha</th>
                <th>linhas</th>
                <th>cpl</th>
                <th>bloco</th>
              </tr>
            </thead>
            <tbody>
              {calc.niveis.map((n) => (
                <tr key={n.id} data-apertado={n.apertado ? "1" : "0"}>
                  <td>{n.rotulo}</td>
                  <td className="fs-cel-txt">{n.texto}</td>
                  <td>
                    {fmtSaida(n.corpo)} {rotuloUnidade}
                  </td>
                  <td>
                    {fmtSaida(n.corpo * n.lh)} {rotuloUnidade} · {num(n.lh, 2)}×
                  </td>
                  <td>{n.linhas.length}</td>
                  <td>{n.cpl}</td>
                  <td>
                    {num(n.alturaBloco, 1)} {uni}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
