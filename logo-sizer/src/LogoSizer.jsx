import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import Header from "./components/Header.jsx";

/* Servido pelo hub em /logo-sizer/ — o menu é a raiz do mesmo site. */
const HUB_URL = "/";

/* ---------------------------------------------------------------
   logo sizer — padroniza opticamente o tamanho de várias logos
   Sistema visual: tokens do gri.d.maker (design-system.md + tokens.css)
----------------------------------------------------------------*/

const ANALYSIS_MAX = 512;

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
  --gm-arte-bg:#101010;
}
[data-tema="claro"]{
  --gm-ink:#e9e9e9; --gm-ink2:#f4f4f4; --gm-ink3:#e1e1e1; --gm-line:#d2d2d2;
  --gm-text:#161616; --gm-muted:#6b6b6b;
  --gm-cyan:#00768f; --gm-mag:#c4136e; --gm-sobre-cyan:#fff; --gm-sobre-mag:#fff;
  --gm-mag-btn:#c4136e; --gm-mag-hover:#9c0e54;
  --gm-stage:#ececec; --gm-stage-alt:#e2e2e2; --gm-sombra:rgba(0,0,0,.13);
  --gm-arte-bg:#f4f4f4;
}

.ls-app{display:flex;min-height:100vh;background:var(--gm-ink);color:var(--gm-text);
  font-family:var(--gm-sans);font-size:var(--gm-size-base)}
.ls-app *{box-sizing:border-box}
.ls-app button{font-family:inherit;cursor:pointer}

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
.gm-valor{width:52px;font-family:var(--gm-mono);font-size:var(--gm-size-valor);text-align:right;
  background:var(--gm-ink);border:1px solid var(--gm-line);color:var(--gm-text);
  padding:var(--gm-pad-campo);border-radius:var(--gm-radius)}
.gm-valor:focus-visible{outline:var(--gm-foco) solid var(--gm-cyan);outline-offset:1px}
.gm-unidade{font-family:var(--gm-mono);font-size:var(--gm-size-secao);color:var(--gm-muted)}
.gm-nota{font-family:var(--gm-mono);font-size:var(--gm-size-nota);line-height:var(--gm-lh-nota);
  letter-spacing:var(--gm-track-nota);color:var(--gm-muted);margin:8px 0 0}

.gm-slider{width:100%;-webkit-appearance:none;appearance:none;height:var(--gm-trilho);
  background:var(--gm-line);border-radius:var(--gm-radius);display:block}
.gm-slider::-webkit-slider-thumb{-webkit-appearance:none;width:var(--gm-polegar);height:var(--gm-polegar);
  border-radius:50%;background:var(--gm-acento,var(--gm-cyan));border:2px solid var(--gm-ink2);cursor:grab}
.gm-slider::-moz-range-thumb{width:var(--gm-polegar);height:var(--gm-polegar);border-radius:50%;
  background:var(--gm-acento,var(--gm-cyan));border:2px solid var(--gm-ink2);cursor:grab}
.gm-slider:focus-visible{outline:var(--gm-foco) solid var(--gm-cyan);outline-offset:4px}

.gm-botao{background:var(--gm-ink);border:1px solid var(--gm-line);color:var(--gm-text);
  font-family:var(--gm-mono);font-size:var(--gm-size-valor);padding:var(--gm-pad-botao);
  border-radius:var(--gm-radius);text-align:center}
.gm-botao:hover:not(:disabled){background:var(--gm-cyan);border-color:var(--gm-cyan);color:var(--gm-sobre-cyan)}
.gm-botao:focus-visible{outline:var(--gm-foco) solid var(--gm-cyan);outline-offset:1px}
.gm-botao:disabled{opacity:.4;cursor:default}
.gm-botao[aria-pressed="true"]{background:var(--gm-cyan);border-color:var(--gm-cyan);color:var(--gm-sobre-cyan)}
.gm-botao--primario{background:var(--gm-mag-btn);border-color:var(--gm-mag-btn);color:var(--gm-sobre-mag);
  font-weight:600;letter-spacing:.05em}
.gm-botao--primario:hover:not(:disabled){background:var(--gm-mag-hover);border-color:var(--gm-mag-hover);color:var(--gm-sobre-mag)}

.gm-grade{display:grid;gap:var(--gm-gap-md)}
.gm-grade--2{grid-template-columns:1fr 1fr}
.gm-grade--3{grid-template-columns:1fr 1fr 1fr}

.gm-check{display:flex;align-items:center;gap:var(--gm-gap-md);font-size:var(--gm-size-rotulo);
  margin-bottom:10px;cursor:pointer}
.gm-check:last-child{margin-bottom:0}
.gm-check input{accent-color:var(--gm-mag);width:13px;height:13px}
.gm-check input:focus-visible{outline:var(--gm-foco) solid var(--gm-cyan);outline-offset:1px}

.ls-main{flex:1;display:flex;flex-direction:column;min-width:0}
.gm-barra{height:var(--gm-altura-barra);flex:none;display:flex;align-items:center;
  justify-content:space-between;gap:var(--gm-gap-md);padding:0 18px;
  background:var(--gm-ink2);border-bottom:1px solid var(--gm-line);
  font-family:var(--gm-mono);font-size:var(--gm-size-status);letter-spacing:var(--gm-track-status);
  text-transform:uppercase;color:var(--gm-muted)}
.gm-barra-acoes{display:flex;align-items:center;gap:var(--gm-gap-md)}

.gm-palco{flex:1;padding:var(--gm-pad-palco);overflow:auto;display:flex;align-items:center;
  justify-content:center;background-color:var(--gm-stage);
  background-image:linear-gradient(45deg,var(--gm-stage-alt) 25%,transparent 25%,transparent 75%,var(--gm-stage-alt) 75%),
    linear-gradient(45deg,var(--gm-stage-alt) 25%,transparent 25%,transparent 75%,var(--gm-stage-alt) 75%);
  background-size:var(--gm-xadrez) var(--gm-xadrez);
  background-position:0 0,calc(var(--gm-xadrez)/2) calc(var(--gm-xadrez)/2)}
.gm-documento{position:relative;flex:none;box-shadow:0 0 0 1px var(--gm-line),0 20px 60px var(--gm-sombra)}
.gm-registro{position:absolute;width:13px;height:13px;pointer-events:none}
.gm-registro::before,.gm-registro::after{content:"";position:absolute;background:var(--gm-cyan);opacity:.85}
.gm-registro::before{left:6px;top:0;width:1px;height:13px}
.gm-registro::after{top:6px;left:0;height:1px;width:13px}

.ls-guia{position:absolute;left:0;right:0;height:1px;background:var(--gm-cyan);pointer-events:none}
.ls-item{position:absolute;cursor:pointer}
.ls-item img{position:absolute;max-width:none;user-select:none;-webkit-user-drag:none}
.ls-item[data-sel="1"]{outline:1px solid var(--gm-mag);outline-offset:2px}
.ls-item[data-caixa="1"]{outline:1px dashed var(--gm-cyan);outline-offset:0}

.ls-vazio{text-align:center;max-width:44ch;font-family:var(--gm-mono);font-size:var(--gm-size-nota);
  line-height:1.65;letter-spacing:var(--gm-track-nota);color:var(--gm-muted)}

.gm-tira{flex:none;display:flex;flex-wrap:wrap;gap:var(--gm-gap-sm);padding:10px 18px;
  background:var(--gm-ink2);border-top:1px solid var(--gm-line)}
.gm-chip{display:flex;align-items:center;gap:var(--gm-gap-sm);background:var(--gm-ink);
  border:1px solid var(--gm-line);border-radius:var(--gm-radius);padding:4px 6px;
  font-family:var(--gm-mono);font-size:var(--gm-size-valor);color:var(--gm-text)}
.gm-chip[data-sel="1"]{background:var(--gm-ink3);border-color:var(--gm-mag)}
.gm-chip input{accent-color:var(--gm-mag);width:12px;height:12px}
.gm-chip button{background:none;border:0;color:inherit;font-family:inherit;font-size:inherit;padding:0}
.gm-chip .ls-nome{max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-chip .ls-x{color:var(--gm-muted);padding:0 2px}
.gm-chip .ls-x:hover{color:var(--gm-mag)}
.gm-chip button:focus-visible{outline:var(--gm-foco) solid var(--gm-cyan);outline-offset:1px}

.ls-cor{width:100%;height:26px;padding:0;background:var(--gm-ink);border:1px solid var(--gm-line);
  border-radius:var(--gm-radius);cursor:pointer}
.ls-solta{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
  background:rgba(0,0,0,.66);color:#fff;font-family:var(--gm-mono);font-size:var(--gm-size-status);
  letter-spacing:var(--gm-track-status);text-transform:uppercase;pointer-events:none;z-index:9}

@media (max-width:860px){
  .ls-app{flex-direction:column}
  .gm-painel{width:100%;max-height:none;border-right:0;border-bottom:1px solid var(--gm-line)}
  .gm-palco{min-height:320px}
}
@media (prefers-reduced-motion:reduce){
  .ls-app *,.ls-app *::before,.ls-app *::after{transition:none!important;animation:none!important}
}
`;

/* ---------- utilidades ---------- */

function loadImage(src) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });
}

function normalizeSvgText(txt) {
  try {
    const doc = new DOMParser().parseFromString(txt, "image/svg+xml");
    const svg = doc.documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== "svg") return null;
    let vbAttr = svg.getAttribute("viewBox");
    let w = parseFloat(svg.getAttribute("width"));
    let h = parseFloat(svg.getAttribute("height"));
    if (!vbAttr && w && h) {
      vbAttr = "0 0 " + w + " " + h;
      svg.setAttribute("viewBox", vbAttr);
    }
    let vb = [0, 0, w || 300, h || 300];
    if (vbAttr) {
      const p = vbAttr.trim().split(/[\s,]+/).map(Number);
      if (p.length === 4 && p.every((n) => !isNaN(n))) vb = p;
      if (!w || !h) {
        svg.setAttribute("width", String(vb[2]));
        svg.setAttribute("height", String(vb[3]));
      }
    }
    return { text: new XMLSerializer().serializeToString(svg), vb };
  } catch (e) {
    return null;
  }
}

/** mede a caixa de conteúdo e a área de tinta de uma imagem carregada */
function analyzeEl(el, trimLight) {
  const nw = el.naturalWidth || 300;
  const nh = el.naturalHeight || 300;
  const k = ANALYSIS_MAX / Math.max(nw, nh);
  const aw = Math.max(1, Math.round(nw * k));
  const ah = Math.max(1, Math.round(nh * k));
  const cv = document.createElement("canvas");
  cv.width = aw;
  cv.height = ah;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(el, 0, 0, aw, ah);
  let d;
  try {
    d = ctx.getImageData(0, 0, aw, ah).data;
  } catch (e) {
    return { aw, ah, bx: 0, by: 0, bw: aw, bh: ah, ink: aw * ah };
  }
  let minX = aw, minY = ah, maxX = -1, maxY = -1, ink = 0;
  for (let y = 0; y < ah; y++) {
    for (let x = 0; x < aw; x++) {
      const i = (y * aw + x) * 4;
      if (d[i + 3] < 16) continue;
      if (trimLight) {
        const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        if (lum > 238) continue;
      }
      ink++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return { aw, ah, bx: 0, by: 0, bw: aw, bh: ah, ink: aw * ah };
  return { aw, ah, bx: minX, by: minY, bw: maxX - minX + 1, bh: maxY - minY + 1, ink };
}

function baixar(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const slug = (s) =>
  s.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "logo";

/* ---------- componentes ---------- */

function Controle({ rotulo, valor, onChange, min, max, step = 1, unidade, acento = "cyan" }) {
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

function Opcoes({ opcoes, valor, onChange }) {
  return (
    <div className={"gm-grade gm-grade--" + (opcoes.length > 2 ? 3 : 2)}>
      {opcoes.map((o) => (
        <button
          key={o.v}
          className="gm-botao"
          aria-pressed={valor === o.v}
          onClick={() => onChange(o.v)}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

/* ---------- app ---------- */

export default function LogoSizer() {
  const [tema, setTema] = useState("escuro");
  const [logos, setLogos] = useState([]);
  const [sel, setSel] = useState(null);
  const [baseH, setBaseH] = useState(120);
  const [comp, setComp] = useState(60);
  const [gap, setGap] = useState(48);
  const [pad, setPad] = useState(24);
  const [align, setAlign] = useState("centro");
  const [fundo, setFundo] = useState("nenhum");
  const [cor, setCor] = useState("#ffffff");
  const [semBranco, setSemBranco] = useState(false);
  const [guias, setGuias] = useState(true);
  const [caixas, setCaixas] = useState(false);
  const [esc, setEsc] = useState(2);
  const [arrastando, setArrastando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const fileRef = useRef(null);
  const idRef = useRef(0);

  const adicionar = useCallback(
    async (files) => {
      const arr = Array.from(files).filter((f) => /^image\//.test(f.type));
      if (!arr.length) return;
      setCarregando(true);
      const novos = [];
      for (const f of arr) {
        try {
          let src, svgText = null, vb = null;
          if (f.type === "image/svg+xml") {
            const n = normalizeSvgText(await f.text());
            if (!n) continue;
            svgText = n.text;
            vb = n.vb;
            src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(n.text);
          } else {
            src = await new Promise((r) => {
              const fr = new FileReader();
              fr.onload = () => r(fr.result);
              fr.readAsDataURL(f);
            });
          }
          const el = await loadImage(src);
          novos.push({
            id: ++idRef.current,
            name: f.name,
            src,
            el,
            svgText,
            vb,
            a: analyzeEl(el, semBranco),
            on: true,
            escala: 100,
            dx: 0,
            dy: 0,
          });
        } catch (e) {
          /* arquivo ignorado */
        }
      }
      setLogos((p) => [...p, ...novos]);
      setCarregando(false);
    },
    [semBranco]
  );

  useEffect(() => {
    setLogos((p) => p.map((l) => ({ ...l, a: analyzeEl(l.el, semBranco) })));
  }, [semBranco]);

  /* ----- normalização óptica ----- */
  const itens = useMemo(() => {
    const vis = logos.filter((l) => l.on);
    if (!vis.length) return [];
    const base = vis.map((l) => {
      const sh = baseH / l.a.bh;
      return { l, sh, area: l.a.ink * sh * sh };
    });
    const aRef = Math.exp(
      base.reduce((s, b) => s + Math.log(Math.max(b.area, 1)), 0) / base.length
    );
    const w = comp / 100;
    return base.map((b) => {
      const f = Math.sqrt(aRef / Math.max(b.area, 1));
      const s = b.sh * Math.pow(f, w) * (b.l.escala / 100);
      return {
        l: b.l,
        s,
        w: b.l.a.bw * s,
        h: b.l.a.bh * s,
        offX: -b.l.a.bx * s,
        offY: -b.l.a.by * s,
        fullW: b.l.a.aw * s,
        fullH: b.l.a.ah * s,
      };
    });
  }, [logos, baseH, comp]);

  const rowH = useMemo(
    () => itens.reduce((m, i) => Math.max(m, i.h + Math.abs(i.l.dy)), baseH),
    [itens, baseH]
  );

  const layout = useCallback(
    (k) => {
      const p = pad * k;
      const g = gap * k;
      const h = rowH * k;
      let x = p;
      const pecas = itens.map((it) => {
        const y =
          (align === "topo" ? 0 : align === "base" ? h - it.h * k : (h - it.h * k) / 2) + it.l.dy * k;
        const o = { it, x: x + it.l.dx * k, y: p + y };
        x += it.w * k + g;
        return o;
      });
      return { pecas, W: Math.round(x - (itens.length ? g : 0) + p), H: Math.round(h + p * 2) };
    },
    [itens, pad, gap, rowH, align]
  );

  const doc = useMemo(() => layout(1), [layout]);

  const upd = (id, patch) => setLogos((p) => p.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const remover = (id) => {
    setLogos((p) => p.filter((l) => l.id !== id));
    setSel((s) => (s === id ? null : s));
  };

  /* ----- exportação ----- */

  const pngUm = (it) =>
    new Promise((r) => {
      const k = esc;
      const p = pad * k;
      const cv = document.createElement("canvas");
      cv.width = Math.ceil(it.w * k + p * 2);
      cv.height = Math.ceil(it.h * k + p * 2);
      const ctx = cv.getContext("2d");
      if (fundo === "cor") {
        ctx.fillStyle = cor;
        ctx.fillRect(0, 0, cv.width, cv.height);
      }
      ctx.drawImage(it.l.el, p + it.offX * k, p + it.offY * k, it.fullW * k, it.fullH * k);
      cv.toBlob((b) => {
        baixar(b, slug(it.l.name) + "-" + Math.round(it.h) + "px.png");
        r();
      }, "image/png");
    });

  const corpoSvg = (it, x, y) => {
    const { l } = it;
    if (l.svgText && l.vb) {
      const root = new DOMParser().parseFromString(l.svgText, "image/svg+xml").documentElement;
      const [vx, vy, vw, vh] = l.vb;
      const bxU = vx + (l.a.bx / l.a.aw) * vw;
      const byU = vy + (l.a.by / l.a.ah) * vh;
      const bwU = Math.max((l.a.bw / l.a.aw) * vw, 0.0001);
      const kk = it.w / bwU;
      const fill = root.getAttribute("fill");
      return (
        '<g transform="translate(' + x + " " + y + ") scale(" + kk + ") translate(" + -bxU + " " + -byU + ')"' +
        (fill ? ' fill="' + fill + '"' : "") + ">" + root.innerHTML + "</g>"
      );
    }
    return (
      '<image href="' + it.l.src + '" x="' + (x + it.offX) + '" y="' + (y + it.offY) +
      '" width="' + it.fullW + '" height="' + it.fullH + '"/>'
    );
  };

  const envelope = (W, H, corpo) =>
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' +
    W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '">' +
    (fundo === "cor" ? '<rect width="' + W + '" height="' + H + '" fill="' + cor + '"/>' : "") +
    corpo + "</svg>";

  const svgUm = (it) => {
    const W = +(it.w + pad * 2).toFixed(2);
    const H = +(it.h + pad * 2).toFixed(2);
    baixar(new Blob([envelope(W, H, corpoSvg(it, pad, pad))], { type: "image/svg+xml" }), slug(it.l.name) + ".svg");
  };

  const lockupPng = () => {
    const k = esc;
    const { pecas, W, H } = layout(k);
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d");
    if (fundo === "cor") {
      ctx.fillStyle = cor;
      ctx.fillRect(0, 0, W, H);
    }
    pecas.forEach(({ it, x, y }) =>
      ctx.drawImage(it.l.el, x + it.offX * k, y + it.offY * k, it.fullW * k, it.fullH * k)
    );
    cv.toBlob((b) => baixar(b, "lockup-" + itens.length + "-logos.png"), "image/png");
  };

  const lockupSvg = () => {
    const { pecas, W, H } = layout(1);
    const corpo = pecas.map(({ it, x, y }) => corpoSvg(it, x, y)).join("");
    baixar(new Blob([envelope(W, H, corpo)], { type: "image/svg+xml" }), "lockup-" + itens.length + "-logos.svg");
  };

  const todosPng = async () => {
    for (const it of itens) {
      await pngUm(it);
      await new Promise((r) => setTimeout(r, 150));
    }
  };
  const todosSvg = async () => {
    for (const it of itens) {
      svgUm(it);
      await new Promise((r) => setTimeout(r, 150));
    }
  };

  const selIt = itens.find((i) => i.l.id === sel);
  const selLogo = logos.find((l) => l.id === sel);

  return (
    <div
      className="ls-app"
      data-tema={tema}
      onDragOver={(e) => {
        e.preventDefault();
        setArrastando(true);
      }}
      onDragLeave={() => setArrastando(false)}
      onDrop={(e) => {
        e.preventDefault();
        setArrastando(false);
        adicionar(e.dataTransfer.files);
      }}
    >
      <style>{CSS}</style>

      <aside className="gm-painel">
        <Header
          tool="logo sizer"
          homeHref={HUB_URL}
          tema={tema}
          onToggleTema={() => setTema((t) => (t === "escuro" ? "claro" : "escuro"))}
        />

        <Secao titulo="Conjunto">
          <Controle rotulo="Altura de referência" valor={baseH} onChange={setBaseH} min={24} max={400} unidade="px" />
          <Controle rotulo="Compensação óptica" valor={comp} onChange={setComp} min={0} max={100} unidade="%" acento="mag" />
          <Controle rotulo="Espaçamento" valor={gap} onChange={setGap} min={0} max={200} unidade="px" />
          <Controle rotulo="Margem" valor={pad} onChange={setPad} min={0} max={160} unidade="px" />
          <p className="gm-nota">
            Em 0% todas ficam com a mesma altura medida. Ao subir, logos redondas e altas crescem e
            marcas largas encolhem até terem o mesmo peso visual.
          </p>
        </Secao>

        <Secao titulo="Alinhamento">
          <Opcoes
            opcoes={[
              { v: "topo", l: "topo" },
              { v: "centro", l: "centro" },
              { v: "base", l: "base" },
            ]}
            valor={align}
            onChange={setAlign}
          />
        </Secao>

        <Secao titulo="Fundo">
          <Opcoes
            opcoes={[
              { v: "nenhum", l: "transparente" },
              { v: "cor", l: "cor sólida" },
            ]}
            valor={fundo}
            onChange={setFundo}
          />
          {fundo === "cor" && (
            <input
              className="ls-cor"
              type="color"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              style={{ marginTop: "var(--gm-gap-md)" }}
              aria-label="Cor do fundo"
            />
          )}
        </Secao>

        <Secao titulo="Exibição">
          <label className="gm-check">
            <input type="checkbox" checked={guias} onChange={(e) => setGuias(e.target.checked)} />
            Guias de alinhamento
          </label>
          <label className="gm-check">
            <input type="checkbox" checked={caixas} onChange={(e) => setCaixas(e.target.checked)} />
            Caixa de cada logo
          </label>
          <label className="gm-check">
            <input type="checkbox" checked={semBranco} onChange={(e) => setSemBranco(e.target.checked)} />
            Fundo branco do arquivo ignorado
          </label>
        </Secao>

        <Secao titulo="Seleção">
          {!selLogo ? (
            <p className="gm-nota" style={{ margin: 0 }}>
              Nenhuma logo selecionada. Clique numa logo no palco para afinar só ela.
            </p>
          ) : (
            <>
              <p className="gm-nota" style={{ margin: "0 0 12px" }}>
                {selLogo.name}
                {selIt ? " · " + Math.round(selIt.w) + "×" + Math.round(selIt.h) + " px" : ""}
              </p>
              <Controle rotulo="Escala" valor={selLogo.escala} onChange={(v) => upd(selLogo.id, { escala: v })} min={20} max={300} unidade="%" acento="mag" />
              <Controle rotulo="Deslocamento vertical" valor={selLogo.dy} onChange={(v) => upd(selLogo.id, { dy: v })} min={-120} max={120} unidade="px" acento="mag" />
              <Controle rotulo="Deslocamento horizontal" valor={selLogo.dx} onChange={(v) => upd(selLogo.id, { dx: v })} min={-120} max={120} unidade="px" acento="mag" />
              <div className="gm-grade gm-grade--3">
                <button className="gm-botao" onClick={() => upd(selLogo.id, { escala: 100, dx: 0, dy: 0 })}>padrão</button>
                <button className="gm-botao" onClick={() => selIt && pngUm(selIt)} disabled={!selIt}>png</button>
                <button className="gm-botao" onClick={() => selIt && svgUm(selIt)} disabled={!selIt}>svg</button>
              </div>
            </>
          )}
        </Secao>

        <Secao titulo="Exportação">
          <div className="gm-grade gm-grade--3" style={{ marginBottom: "var(--gm-espaco-controle)" }}>
            {[1, 2, 3].map((n) => (
              <button key={n} className="gm-botao" aria-pressed={esc === n} onClick={() => setEsc(n)}>
                {n}×
              </button>
            ))}
          </div>
          <div className="gm-grade gm-grade--2">
            <button className="gm-botao" onClick={todosPng} disabled={!itens.length}>pngs</button>
            <button className="gm-botao" onClick={todosSvg} disabled={!itens.length}>svgs</button>
            <button className="gm-botao gm-botao--primario" onClick={lockupPng} disabled={!itens.length}>lockup png</button>
            <button className="gm-botao gm-botao--primario" onClick={lockupSvg} disabled={!itens.length}>lockup svg</button>
          </div>
          <p className="gm-nota">
            SVG de origem sai vetorial. PNG e JPG saem rasterizados na escala escolhida.
          </p>
        </Secao>
      </aside>

      <main className="ls-main">
        <div className="gm-barra">
          <span>
            {carregando
              ? "medindo arquivos"
              : logos.length
              ? itens.length + "/" + logos.length + " logos · " + doc.W + "×" + doc.H + " px · comp " + comp + "%"
              : "nenhum arquivo"}
          </span>
          <span className="gm-barra-acoes">
            <button className="gm-botao gm-botao--primario" onClick={() => fileRef.current && fileRef.current.click()}>
              adicionar logos
            </button>
          </span>
        </div>

        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/svg+xml,image/png,image/jpeg,image/webp"
          style={{ display: "none" }}
          onChange={(e) => {
            adicionar(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="gm-palco">
          {itens.length === 0 ? (
            <p className="ls-vazio">
              Solte os arquivos aqui — SVG, PNG, JPG ou WebP.
              <br />
              Cada logo é medida pela mancha real, ignorando a margem vazia do arquivo.
            </p>
          ) : (
            <div
              className="gm-documento"
              style={{ width: doc.W, height: doc.H, background: fundo === "cor" ? cor : "transparent" }}
            >
              <i className="gm-registro" style={{ left: -19, top: -19 }} />
              <i className="gm-registro" style={{ right: -19, top: -19 }} />
              <i className="gm-registro" style={{ left: -19, bottom: -19 }} />
              <i className="gm-registro" style={{ right: -19, bottom: -19 }} />

              {guias &&
                [pad, pad + rowH / 2, pad + rowH].map((y, i) => (
                  <span key={i} className="ls-guia" style={{ top: y, opacity: i === 1 ? 0.35 : 0.7 }} />
                ))}

              {doc.pecas.map(({ it, x, y }) => (
                <div
                  key={it.l.id}
                  className="ls-item"
                  data-sel={sel === it.l.id ? "1" : "0"}
                  data-caixa={caixas && sel !== it.l.id ? "1" : "0"}
                  style={{ left: x, top: y, width: it.w, height: it.h }}
                  onClick={() => setSel(sel === it.l.id ? null : it.l.id)}
                >
                  <img
                    src={it.l.src}
                    alt={it.l.name}
                    draggable={false}
                    style={{ left: it.offX, top: it.offY, width: it.fullW, height: it.fullH }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {logos.length > 0 && (
          <div className="gm-tira">
            {logos.map((l) => (
              <span key={l.id} className="gm-chip" data-sel={sel === l.id ? "1" : "0"}>
                <input
                  type="checkbox"
                  checked={l.on}
                  onChange={(e) => upd(l.id, { on: e.target.checked })}
                  aria-label={"Incluir " + l.name}
                />
                <button className="ls-nome" onClick={() => setSel(sel === l.id ? null : l.id)}>
                  {l.name}
                </button>
                <button className="ls-x" onClick={() => remover(l.id)} aria-label={"Remover " + l.name}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </main>

      {arrastando && <div className="ls-solta">solte para adicionar</div>}
    </div>
  );
}
