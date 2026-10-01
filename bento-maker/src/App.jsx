import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { MONO, SANS } from "./theme.js";

/* Servido pelo hub em /bento-maker/ — o menu é a raiz do mesmo site. */
const HUB_URL = "/";

/* Tokens de cor lidos via var() — o Header e o Footer ficam em sincronia com o
   alternador de tema do próprio .bt, sem duplicar a paleta escuro/claro. */
const CSS_THEME = {
  ink: "var(--ink)", ink2: "var(--ink2)", line: "var(--line)",
  text: "var(--text)", muted: "var(--muted)",
  cyan: "var(--cyan)", sobreCyan: "var(--sobre-cyan)",
};

/* ==========================================================================
   Geometria — o empacotamento é calculado em JS, então tela e exportação
   compartilham exatamente os mesmos números.
   ========================================================================== */

function pack(tiles, cols) {
  const grid = [];
  const ensure = (r) => { while (grid.length <= r) grid.push(new Array(cols).fill(false)); };
  const busy = (r, c) => (grid[r] ? grid[r][c] : false);
  const items = [];

  for (const t of tiles) {
    const cs = Math.min(Math.max(1, t.cs), cols);
    const rs = Math.max(1, t.rs);
    let r = 0, placed = false;
    while (!placed && r < 500) {
      ensure(r + rs - 1);
      for (let c = 0; c + cs <= cols; c++) {
        let ok = true;
        for (let i = 0; i < rs && ok; i++)
          for (let j = 0; j < cs; j++) if (busy(r + i, c + j)) { ok = false; break; }
        if (ok) {
          for (let i = 0; i < rs; i++) for (let j = 0; j < cs; j++) grid[r + i][c + j] = true;
          items.push({ ...t, cs, rs, col: c, row: r });
          placed = true;
          break;
        }
      }
      if (!placed) r++;
    }
    if (!placed) items.push({ ...t, cs, rs, col: 0, row: grid.length });
  }
  return { items, rows: Math.max(1, grid.length) };
}

// Recorte da imagem na célula. Escala uniforme: nunca distorce.
function drawRect(t, w, h) {
  const base = t.fit === "contain" ? Math.min(w / t.iw, h / t.ih) : Math.max(w / t.iw, h / t.ih);
  const s = base * t.zoom;
  const dw = t.iw * s, dh = t.ih * s;
  return { dx: (w - dw) * t.fx, dy: (h - dh) * t.fy, dw, dh };
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const num = (v, d) => (Number.isFinite(v) ? v : d);

const PRESETS = [
  { id: "free", label: "Altura automática" },
  { id: "1080x1080", label: "Quadrado 1080" },
  { id: "1080x1350", label: "Feed 4:5" },
  { id: "1080x1920", label: "Story 9:16" },
  { id: "1920x1080", label: "Tela 16:9" },
  { id: "2560x1440", label: "Tela 2560" },
  { id: "2480x3508", label: "A4 retrato · 300 dpi" },
  { id: "3508x2480", label: "A4 paisagem · 300 dpi" },
  { id: "custom", label: "Personalizado" },
];

const ARTE_BG = { escuro: "#101010", claro: "#f4f4f4" };

/* ==========================================================================
   Tokens — Grid Maker
   ========================================================================== */

const CSS = `
@font-face {
  font-family: "Host Grotesk BM";
  font-weight: 600;
  font-style: normal;
  font-display: block;
  src: url(data:font/woff2;base64,d09GMgABAAAAAASsABAAAAAACMwAAARQAAEAxQAAAAAAAAAAAAAAAAAAAAAAAAAAGiIbIBwqBmA/U1RBVEQAZBEICoYohSsBNgIkAywLGAAEIAWELgcgDAcbIQdIHoVxmxNCqk7jO5N2q1KI57/fz3ftc1/yAbgEwlbVEat6kiQbHak6VWXf6Xj2ZZ0f3tNemgzXDFTSEYUHMIWyS9MDiPaoP5JieA+gKSSWwJQncgeX07sHfpCxAPC/MRbg08bmoAgD6q0B9NriZW2O0riAMIfD6buZ8qwTE0wDShMRTSf6JkQwaVsI5Ly0pAYcdTASEEw6Jg6HmczlUSdrAj8S2XVFVgPYUcM6CS68O/cgNQmgpuwwFONANSCyv3nxUlkNnIB9bPv+7yztY1gAgfziHAGwDxUxrrCMgyM4z9QaFgHuP+40ID4QnXkIZL4aADRR8QUIKDQsQwXLMFeBeW5Q7OtC0aMx2JHY14miZ4Sv9a2wzEILzDM3hDyLyEhziCmwCsySHshdANABSokmokQ4PuM5H4NhWOSym5urz61JVisy0oZPvhuNjLzFnXQhiLvalqwGDJauxXGYHFpDttypm3x9d+i6c9xJV2BwtHOSlQRuD+ds14a7wTuMymZDRlqtttROwABHOsf2MpoRXk6I8yoPrsi2+io++XogvoReWl/XjPfY4RheV0/hKA5ThomaAjWJjgxqU79eLfbP5l8NcT18LZUt97Dw9aNMP3IHTA2tpxCEi+B5EHDJYOEx9/QTnnMlLl4UV9Zb25LAd8pYyzqdEjXEwtTmyVqisowDdB0DY0bJ3e1UgWnioAejK3khLZFub/iSxSFEbETQGbg0lXMrcZ5swI0B8X0rU4tkRlGhpVhZzjQK2zSJgtgoMUFGSQUxiW11TLSEJKPF+NzAd6qY4fPNJaVF/czCEoWpKN8g5vrtLCmLjpTkp0U/i+anBpNRgpsx8ey1Qdf5ytZEWDw7rfSn87TT728MuHH/5G+53EkM5K8BRUxpbGpOZdKQjU28zHY1Qwf0dxGlidMzBKVyGDArShdnpAcJOMtrSyfU8LJaKA4GUJni7Cz5bNibUvbjSyylZRK2P19RbGmL2LJSiaWfWh3zIlqcnl5Kfjbmk++a6kpKog7FivTlka98S3Ifw89kgU9owfdaqnbUgFGjqFFvAzceCMxTAeD5Kwji/Qj819521/z/jij6Dj7btgQA8J3oHPB//i3AtqFX0Vcg/Npk94HAHWPeyZxM1QgIqUTh1QREEfzLQ1IbDWTlIOB/JkOBSDfYJw0Iptzl4BJMyGgjQsNWWdcHeAngcnHKIa7M+sE153zq7TiuZzPJbN+JKC0ImA4jOTduGcb5cMo0Z764WQQitF4DMbTUNFhhUiWXqjRhakCkFDmaWW1DhkFjUQj1UAFQF+5mlgtYsDRoDLMwcdMuY/Uyy8XDo6aNd2XRhdSNZsQjYUAxopiwCDUG6kXhLd/IGTV+W+HqyX4bLSGaQY8qFDULg06MFKRkydLkKVGqTI28hQYTMdY9wzDTopmEuZ2ZBOr9191Q/YUUWJ0MtLpVoRl1MkGB0ZUq079A/u/DpgIAAAA=) format("woff2");
}
.bt {
  --sans: ${SANS};
  --mono: ${MONO};
  --radius: 2px;
  --painel: 312px;
  --trilho: 2px;
  --polegar: 13px;
  --xadrez: 16px;
}
.bt[data-tema="escuro"] {
  --ink:#0a0a0a; --ink2:#101010; --ink3:#1c1c1c; --line:#2b2b2b;
  --text:#e8e8e8; --muted:#8c8c8c;
  --cyan:#00a9ce; --mag:#e0218a; --sobre-cyan:#08181c; --sobre-mag:#fff;
  --mag-btn:#d01a7c; --mag-hover:#b81068;
  --stage:#0a0a0a; --stage-alt:#141414; --sombra:rgba(0,0,0,.6);
}
.bt[data-tema="claro"] {
  --ink:#e9e9e9; --ink2:#f4f4f4; --ink3:#e1e1e1; --line:#d2d2d2;
  --text:#161616; --muted:#6b6b6b;
  --cyan:#00768f; --mag:#c4136e; --sobre-cyan:#fff; --sobre-mag:#fff;
  --mag-btn:#c4136e; --mag-hover:#9c0e54;
  --stage:#ececec; --stage-alt:#e2e2e2; --sombra:rgba(0,0,0,.13);
}

.bt, .bt * { box-sizing: border-box; }
.bt {
  display:flex; flex-direction:column; height:100vh;
  background: var(--ink); color: var(--text);
  font-family: var(--sans); font-size: 13px;
}
.bt button, .bt input, .bt select { font-family: inherit; color: inherit; }

/* --- painéis --- */
.bt .corpo { display:flex; flex:1; min-height:0; }
/* Cabeçalho: o nome encolhe antes de encostar nos botões, e a barra de rolagem
   do painel é fina para não roubar largura do nome. */
.brand .marca{gap:9px}
div.brand{gap:8px}
.brand .acoes{gap:4px}
.marca { flex:0 1 auto; min-width:0; }
.brand h1 { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.bt .painel { scrollbar-width:thin; scrollbar-color: var(--line) transparent; }
.bt .painel::-webkit-scrollbar { width:8px; }
.bt .painel::-webkit-scrollbar-thumb { background: var(--line); border-radius:2px; }
.bt .painel::-webkit-scrollbar-track { background: transparent; }

.bt .painel {
  width: var(--painel); flex:none; overflow-y:auto;
  background: var(--ink2); border-right:1px solid var(--line);
}
.bt .painel.dir { border-right:0; border-left:1px solid var(--line); }
.bt .sec { padding:16px 18px; border-bottom:1px solid var(--line); }
.bt .sec-titulo {
  display:flex; align-items:center; gap:8px; margin:0 0 12px;
  font-family: var(--mono); font-size:9.5px; letter-spacing:.18em;
  text-transform:uppercase; color: var(--cyan); font-weight:400;
}
.bt .sec-titulo::after { content:""; flex:1; height:1px; background: var(--line); }

.bt .linha { display:flex; align-items:center; gap:8px; margin-bottom:14px; }
.bt .linha:last-child { margin-bottom:0; }
.bt .rotulo { flex:1; min-width:0; font-size:11.5px; letter-spacing:.01em; }
.bt .valor {
  width:66px; text-align:right;
  font-family: var(--mono); font-size:11px;
  background: var(--ink); border:1px solid var(--line); color: var(--text);
  padding:3px 5px; border-radius: var(--radius);
}
.bt select.valor { width:auto; text-align:left; max-width:150px; }
.bt .valor:disabled { opacity:.4; }
.bt .unidade {
  font-family: var(--mono); font-size:9.5px; color: var(--muted);
  width:26px; flex:none;
}
.bt .nota {
  font-family: var(--mono); font-size:10px; line-height:1.6;
  letter-spacing:.03em; color: var(--muted); margin:12px 0 0;
}
.bt .medida {
  font-family: var(--mono); font-size:10px; letter-spacing:.03em;
  color: var(--muted); margin:-6px 0 14px;
}

/* --- botões --- */
.bt .botao {
  background: var(--ink); border:1px solid var(--line); color: var(--text);
  font-family: var(--mono); font-size:11px;
  padding:7px 8px; border-radius: var(--radius); cursor:pointer;
}
.bt .botao:hover:not(:disabled) {
  background: var(--cyan); border-color: var(--cyan); color: var(--sobre-cyan);
}
.bt .botao:disabled { opacity:.35; cursor:not-allowed; }
.bt .botao--primario {
  background: var(--mag-btn); border-color: var(--mag-btn); color: var(--sobre-mag);
  font-weight:600; letter-spacing:.05em;
}
.bt .botao--primario:hover:not(:disabled) {
  background: var(--mag-hover); border-color: var(--mag-hover); color: var(--sobre-mag);
}
.bt .botoes { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.bt .botoes .largo { grid-column:1 / -1; }

/* --- seletor segmentado --- */
.bt .seg { display:flex; border:1px solid var(--line); border-radius: var(--radius); overflow:hidden; }
.bt .seg button {
  flex:1; background: var(--ink); border:0; cursor:pointer;
  font-family: var(--mono); font-size:9.5px; letter-spacing:.14em;
  text-transform:uppercase; color: var(--muted); padding:7px 4px;
}
.bt .seg button:hover { color: var(--text); }
.bt .seg button[data-on="1"] {
  background: var(--mag-btn); color: var(--sobre-mag);
}

/* --- slider --- */
.bt .slider {
  flex:1; min-width:0; -webkit-appearance:none; appearance:none;
  height: var(--trilho); background: var(--line); border-radius: var(--radius);
}
.bt .slider::-webkit-slider-thumb {
  -webkit-appearance:none; width: var(--polegar); height: var(--polegar);
  border-radius:50%; background: var(--acento, var(--cyan));
  border:2px solid var(--ink2); cursor:grab;
}
.bt .slider::-moz-range-thumb {
  width: var(--polegar); height: var(--polegar); border-radius:50%;
  background: var(--acento, var(--cyan)); border:2px solid var(--ink2); cursor:grab;
}
.bt .slider:focus-visible { outline:2px solid var(--cyan); outline-offset:4px; }
.bt input[type=checkbox] { accent-color: var(--cyan); width:13px; height:13px; }
.bt input[type=color] {
  width:34px; height:22px; padding:1px; background: var(--ink);
  border:1px solid var(--line); border-radius: var(--radius); cursor:pointer;
}
.bt .botao:focus-visible, .bt .valor:focus-visible,
.bt .seg button:focus-visible, .bt .arquivo:focus-visible {
  outline:2px solid var(--cyan); outline-offset:1px;
}

/* --- área de arquivos --- */
.bt .arquivo {
  display:block; width:100%; text-align:center; cursor:pointer;
  background: var(--ink); border:1px dashed var(--line); border-radius: var(--radius);
  padding:18px 10px; color: var(--muted);
  font-family: var(--mono); font-size:10px; letter-spacing:.03em; line-height:1.6;
}
.bt .arquivo:hover, .bt .arquivo[data-quente="1"] { border-color: var(--cyan); color: var(--text); }
.bt .arquivo b {
  display:block; font-family: var(--sans); font-size:11.5px;
  font-weight:400; color: var(--text); margin-bottom:3px; letter-spacing:0;
}

/* --- palco --- */
.bt .palco {
  flex:1; min-width:0; overflow:auto; padding:34px;
  display:flex; justify-content:center; align-items:flex-start;
  background-color: var(--stage);
  background-image:
    linear-gradient(45deg, var(--stage-alt) 25%, transparent 25%, transparent 75%, var(--stage-alt) 75%),
    linear-gradient(45deg, var(--stage-alt) 25%, transparent 25%, transparent 75%, var(--stage-alt) 75%);
  background-size: var(--xadrez) var(--xadrez);
  background-position: 0 0, calc(var(--xadrez)/2) calc(var(--xadrez)/2);
}
.bt .doc-area { position:relative; flex:none; }
.bt .doc { overflow:hidden; box-shadow: 0 0 0 1px var(--line), 0 20px 60px var(--sombra); }
.bt .registro { position:absolute; width:13px; height:13px; pointer-events:none; }
.bt .registro::before, .bt .registro::after {
  content:""; position:absolute; background: var(--cyan); opacity:.85;
}
.bt .registro::before { left:6px; top:0; width:1px; height:13px; }
.bt .registro::after { top:6px; left:0; height:1px; width:13px; }
.bt .vazio {
  max-width:300px; margin-top:16vh; text-align:center;
  font-family: var(--mono); font-size:10px; line-height:1.65;
  letter-spacing:.03em; color: var(--muted);
}

/* --- blocos --- */
.bt .bloco { position:absolute; overflow:hidden; background-repeat:no-repeat; }
.bt .pega, .bt .alca {
  position:absolute; opacity:0; background: var(--ink2); border:1px solid var(--line);
  color: var(--text); display:grid; place-items:center; padding:0;
}
.bt .bloco:hover .pega, .bt .bloco:hover .alca,
.bt .bloco[data-sel="1"] .pega, .bt .bloco[data-sel="1"] .alca { opacity:1; }
.bt .pega { cursor:grab; }
.bt .pega:hover, .bt .alca:hover { background: var(--cyan); border-color: var(--cyan); color: var(--sobre-cyan); }
.bt .alca { cursor:nwse-resize; }
.bt .guia { position:absolute; pointer-events:none; }

@media (max-width: 860px) {
  .bt { height:auto; }
  .bt .corpo { flex-direction:column; }
  .bt .painel { width:100%; border-right:0; border-bottom:1px solid var(--line); }
  .bt .painel.dir { border-left:0; border-top:1px solid var(--line); }
  .bt .palco { padding:18px; min-height:60vh; }
}
@media (prefers-reduced-motion: reduce) {
  .bt *, .bt *::before, .bt *::after { transition:none !important; animation:none !important; }
}
`;

/* ==========================================================================
   Controles
   ========================================================================== */

function Secao({ titulo, children }) {
  return (
    <div className="sec">
      <h2 className="sec-titulo">{titulo}</h2>
      {children}
    </div>
  );
}

function Campo({ label, value, set, min, max, step = 1, unidade, disabled }) {
  return (
    <div className="linha">
      <label className="rotulo">{label}</label>
      <input
        className="valor" type="number" value={value} min={min} max={max} step={step} disabled={disabled}
        onChange={(e) => { const v = Number(e.target.value); if (Number.isFinite(v)) set(clamp(v, min, max)); }}
      />
      <span className="unidade">{unidade}</span>
    </div>
  );
}

function Deslize({ label, value, set, min, max, step, acento = "var(--mag)" }) {
  return (
    <div className="linha">
      <label className="rotulo">{label}</label>
      <input
        className="slider" type="range" min={min} max={max} step={step} value={value}
        style={{ "--acento": acento }}
        onChange={(e) => set(Number(e.target.value))}
      />
      <span className="unidade">{value.toFixed(2).replace(/0$/, "")}</span>
    </div>
  );
}

/* ==========================================================================
   Ferramenta
   ========================================================================== */

export default function BentoGenerator() {
  const [tema, setTema] = useState("escuro");
  const trocarTema = () => setTema((t) => (t === "escuro" ? "claro" : "escuro"));
  const [cfg, setCfg] = useState({
    preset: "free", docW: 1600, docH: 1200, fixH: false, zoom: "fit",
    cols: 4, rowH: 380, autoRow: true, gap: 16, pad: 24, radius: 2,
    bg: ARTE_BG.escuro, bgCustom: false,
  });
  const [tiles, setTiles] = useState([]);
  const [sel, setSel] = useState(null);
  const [seed, setSeed] = useState(0);
  const [quente, setQuente] = useState(false);
  const [box, setBox] = useState({ w: 900, h: 600 });
  const [busyPdf, setBusyPdf] = useState(false);
  const [escala, setEscala] = useState(2);
  const [guia, setGuia] = useState(null);
  const [live, setLive] = useState(null);

  const palcoRef = useRef(null);
  const fileRef = useRef(null);
  const imgs = useRef({});
  const uid = useRef(0);
  const dragFrom = useRef(null);
  const drag = useRef(null);

  const set = (patch) => setCfg((c) => ({ ...c, ...patch }));
  const updTile = (id, patch) => setTiles((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  // A cor da arte acompanha o tema até o usuário escolher a dele.
  useEffect(() => {
    setCfg((c) => (c.bgCustom ? c : { ...c, bg: ARTE_BG[tema] }));
  }, [tema]);

  useEffect(() => {
    const el = palcoRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => {
    const cols = clamp(num(cfg.cols, 4), 1, 12);
    const docW = clamp(num(cfg.docW, 1600), 200, 8000);
    const gap = clamp(num(cfg.gap, 16), 0, 200);
    const pad = clamp(num(cfg.pad, 24), 0, 400);
    const { items, rows } = pack(tiles, cols);
    const cellW = (docW - pad * 2 - gap * (cols - 1)) / cols;

    let rowH;
    if (cfg.fixH) rowH = (clamp(num(cfg.docH, 1200), 200, 8000) - pad * 2 - gap * (rows - 1)) / rows;
    else if (cfg.autoRow) rowH = cellW;
    else rowH = clamp(num(cfg.rowH, 380), 20, 4000);
    rowH = Math.max(8, rowH);

    const docH = cfg.fixH ? clamp(num(cfg.docH, 1200), 200, 8000) : pad * 2 + rows * rowH + gap * (rows - 1);

    const placed = items.map((t) => ({
      ...t,
      x: pad + t.col * (cellW + gap),
      y: pad + t.row * (rowH + gap),
      w: t.cs * cellW + (t.cs - 1) * gap,
      h: t.rs * rowH + (t.rs - 1) * gap,
    }));
    return { placed, rows, cols, cellW, rowH, docW, docH, gap, pad };
  }, [tiles, cfg]);

  const k = useMemo(() => {
    if (cfg.zoom !== "fit") return Number(cfg.zoom);
    const aw = Math.max(120, box.w - 68), ah = Math.max(120, box.h - 68);
    return Math.min(1, aw / layout.docW, ah / layout.docH);
  }, [cfg.zoom, box, layout.docW, layout.docH]);

  /* --- entrada --- */
  const addFiles = useCallback((list) => {
    const files = [...list].filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    let pending = files.length;
    const made = [];
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        const im = new Image();
        const done = () => { if (--pending === 0) setTiles((ts) => [...ts, ...made]); };
        im.onload = () => {
          const id = ++uid.current;
          imgs.current[id] = im;
          made.push({
            id, name: f.name, src: reader.result,
            iw: im.naturalWidth, ih: im.naturalHeight,
            cs: 1, rs: 1, fit: "cover", fx: 0.5, fy: 0.5, zoom: 1, bg: null,
          });
          done();
        };
        im.onerror = done;
        im.src = reader.result;
      };
      reader.readAsDataURL(f);
    });
  }, []);

  useEffect(() => {
    const over = (e) => { e.preventDefault(); setQuente(true); };
    const leave = (e) => { if (!e.relatedTarget) setQuente(false); };
    const drop = (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        e.preventDefault(); addFiles(e.dataTransfer.files);
      }
      setQuente(false);
    };
    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
    };
  }, [addFiles]);

  const autoLayout = (s = seed) => {
    const cols = layout.cols;
    setTiles((ts) => ts.map((t, i) => {
      const ar = t.iw / t.ih;
      let cs = 1, rs = 1;
      if (ar >= 1.45) cs = Math.min(2, cols);
      else if (ar <= 0.72) rs = 2;
      if (cols >= 3 && (i + s) % 5 === 0) { cs = Math.min(2, cols); rs = 2; }
      if (cols >= 4 && (i + s) % 7 === 3) { cs = Math.min(3, cols); rs = 2; }
      return { ...t, cs: clamp(cs, 1, cols), rs: clamp(rs, 1, 12) };
    }));
  };
  const prevCount = useRef(0);
  useEffect(() => {
    if (tiles.length > prevCount.current) autoLayout();
    prevCount.current = tiles.length;
  }, [tiles.length]);

  /* --- interações --- */
  const startResize = (e, t) => {
    e.stopPropagation(); e.preventDefault();
    const { cellW, rowH, gap, cols } = layout;
    setSel(t.id);
    setLive({ id: t.id, mode: "size" });
    drag.current = { id: t.id, x: e.clientX, y: e.clientY, w: t.w, h: t.h, cs: t.cs, rs: t.rs };
    setGuia({ x: t.x, y: t.y, w: t.w, h: t.h });

    // Zona morta de 55%: sem isso o bloco pisca entre dois tamanhos na fronteira.
    const passo = (raw, cur, max) => (Math.abs(raw - cur) > 0.55 ? clamp(Math.round(raw), 1, max) : cur);

    const move = (ev) => {
      const d = drag.current; if (!d) return;
      const w = Math.max(cellW * 0.35, d.w + (ev.clientX - d.x) / k);
      const h = Math.max(rowH * 0.35, d.h + (ev.clientY - d.y) / k);
      setGuia({ x: t.x, y: t.y, w, h });
      const cs = passo((w + gap) / (cellW + gap), d.cs, cols);
      const rs = passo((h + gap) / (rowH + gap), d.rs, 12);
      if (cs !== d.cs || rs !== d.rs) { d.cs = cs; d.rs = rs; updTile(d.id, { cs, rs }); }
    };
    const up = () => {
      drag.current = null; setGuia(null); setLive(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const startPan = (e, t) => {
    if (sel !== t.id) { setSel(t.id); return; }
    e.preventDefault();
    setLive({ id: t.id, mode: "pan" });
    const d = drawRect(t, t.w, t.h);
    const rx = t.w - d.dw, ry = t.h - d.dh;
    const start = { x: e.clientX, y: e.clientY, fx: t.fx, fy: t.fy };
    const move = (ev) => {
      const dx = (ev.clientX - start.x) / k, dy = (ev.clientY - start.y) / k;
      const patch = {};
      if (Math.abs(rx) > 0.5) patch.fx = clamp(start.fx + dx / rx, 0, 1);
      if (Math.abs(ry) > 0.5) patch.fy = clamp(start.fy + dy / ry, 0, 1);
      updTile(t.id, patch);
    };
    const up = () => {
      setLive(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const reorder = (toId) => {
    const from = dragFrom.current;
    dragFrom.current = null;
    if (from == null || from === toId) return;
    setTiles((ts) => {
      const a = ts.findIndex((t) => t.id === from), b = ts.findIndex((t) => t.id === toId);
      if (a < 0 || b < 0) return ts;
      const copy = [...ts];
      const [m] = copy.splice(a, 1);
      copy.splice(b, 0, m);
      return copy;
    });
  };

  /* --- exportação --- */
  const roundRect = (ctx, x, y, w, h, r) => {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  };

  const toCanvas = (s) => {
    const c = document.createElement("canvas");
    c.width = Math.round(layout.docW * s);
    c.height = Math.round(layout.docH * s);
    const ctx = c.getContext("2d");
    ctx.fillStyle = cfg.bg;
    ctx.fillRect(0, 0, c.width, c.height);
    layout.placed.forEach((t) => {
      const im = imgs.current[t.id];
      if (!im) return;
      const d = drawRect(t, t.w, t.h);
      ctx.save();
      roundRect(ctx, t.x * s, t.y * s, t.w * s, t.h * s, cfg.radius * s);
      ctx.clip();
      if (t.fit === "contain") { ctx.fillStyle = t.bg || cfg.bg; ctx.fill(); }
      ctx.drawImage(im, (t.x + d.dx) * s, (t.y + d.dy) * s, d.dw * s, d.dh * s);
      ctx.restore();
    });
    return c;
  };

  const save = (url, name) => {
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
  };

  const exportRaster = (type) => {
    if (!tiles.length) return;
    const c = toCanvas(escala);
    save(type === "jpg" ? c.toDataURL("image/jpeg", 0.92) : c.toDataURL("image/png"), `bento.${type}`);
  };

  const exportSvg = () => {
    if (!tiles.length) return;
    const W = Math.round(layout.docW), H = Math.round(layout.docH);
    let s = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
    s += `<rect width="100%" height="100%" fill="${cfg.bg}"/><defs>`;
    layout.placed.forEach((t, i) => {
      s += `<clipPath id="c${i}"><rect x="${t.x.toFixed(2)}" y="${t.y.toFixed(2)}" width="${t.w.toFixed(2)}" height="${t.h.toFixed(2)}" rx="${cfg.radius}"/></clipPath>`;
    });
    s += `</defs>`;
    layout.placed.forEach((t, i) => {
      const d = drawRect(t, t.w, t.h);
      s += `<g clip-path="url(#c${i})">`;
      if (t.fit === "contain")
        s += `<rect x="${t.x.toFixed(2)}" y="${t.y.toFixed(2)}" width="${t.w.toFixed(2)}" height="${t.h.toFixed(2)}" fill="${t.bg || cfg.bg}"/>`;
      s += `<image xlink:href="${t.src}" x="${(t.x + d.dx).toFixed(2)}" y="${(t.y + d.dy).toFixed(2)}" width="${d.dw.toFixed(2)}" height="${d.dh.toFixed(2)}" preserveAspectRatio="none"/></g>`;
    });
    s += `</svg>`;
    save(URL.createObjectURL(new Blob([s], { type: "image/svg+xml" })), "bento.svg");
  };

  const exportPdf = async () => {
    if (!tiles.length) return;
    setBusyPdf(true);
    try {
      // Carregado sob demanda: fica num chunk separado, fora do bundle inicial.
      const { jsPDF } = await import("jspdf");
      const c = toCanvas(Math.max(3, escala));
      const wpt = layout.docW * 0.75, hpt = layout.docH * 0.75;
      const pdf = new jsPDF({ unit: "pt", format: [wpt, hpt], orientation: wpt > hpt ? "l" : "p" });
      pdf.addImage(c.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, wpt, hpt);
      pdf.save("bento.pdf");
    } catch (err) {
      alert("Não foi possível gerar o PDF. Exporte em SVG — abre no Illustrator e no InDesign sem perda.");
    } finally {
      setBusyPdf(false);
    }
  };

  const atual = layout.placed.find((t) => t.id === sel) || null;
  const EASE = "cubic-bezier(.2,.7,.3,1)";
  const anim = ["left", "top", "width", "height", "background-size", "background-position"]
    .map((p) => `${p} 190ms ${EASE}`).join(", ");
  const cantos = [
    { top: -26, left: -26 }, { top: -26, right: -26 },
    { bottom: -26, left: -26 }, { bottom: -26, right: -26 },
  ];

  return (
    <div className="bt" data-tema={tema}>
      <style>{CSS}</style>

      <div className="corpo">
        {/* ---------------- painel esquerdo ---------------- */}
        <aside className="painel">
          <Header
            tool="bento maker"
            homeHref={HUB_URL}
            theme={CSS_THEME}
            fontFamily='"Host Grotesk BM", var(--sans)'
            tema={tema}
            onToggleTema={trocarTema}
          />

          <Secao titulo="Imagens">
            <button
              className="arquivo" data-quente={quente ? "1" : "0"}
              onClick={() => fileRef.current && fileRef.current.click()}
            >
              <b>Solte suas imagens aqui</b>
              ou clique para escolher no computador
            </button>
            <input
              ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }}
              onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
            />
            <p className="nota">
              {tiles.length ? `${tiles.length} ${tiles.length > 1 ? "imagens" : "imagem"} no documento` : "Nenhuma imagem"}
            </p>
          </Secao>

          <Secao titulo="Quadro">
            <div className="linha">
              <label className="rotulo">Formato</label>
              <select
                className="valor" value={cfg.preset}
                onChange={(e) => {
                  const id = e.target.value;
                  if (id === "free") set({ preset: id, fixH: false });
                  else if (id === "custom") set({ preset: id, fixH: true });
                  else {
                    const [w, h] = id.split("x").map(Number);
                    set({ preset: id, fixH: true, docW: w, docH: h });
                  }
                }}
              >
                {PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <Campo label="Largura" unidade="px" value={cfg.docW} min={200} max={8000} step={10}
              set={(v) => set({ docW: v, preset: cfg.fixH ? "custom" : "free" })} />
            <Campo label="Altura" unidade="px" value={cfg.docH} min={200} max={8000} step={10} disabled={!cfg.fixH}
              set={(v) => set({ docH: v, preset: "custom" })} />
            <div className="linha">
              <label className="rotulo">Visualização</label>
              <select className="valor" value={cfg.zoom} onChange={(e) => set({ zoom: e.target.value })}>
                <option value="fit">Ajustar</option>
                <option value="1">100%</option>
                <option value="0.75">75%</option>
                <option value="0.5">50%</option>
                <option value="0.25">25%</option>
              </select>
            </div>
          </Secao>

          <Secao titulo="Malha">
            <Campo label="Colunas" unidade="cél" value={cfg.cols} min={1} max={12} set={(v) => set({ cols: v })} />
            <Campo label="Altura da linha" unidade="px" value={Math.round(layout.rowH)} min={20} max={4000} step={2}
              disabled={cfg.fixH || cfg.autoRow} set={(v) => set({ rowH: v })} />
            <div className="linha">
              <label className="rotulo">Linha quadrada</label>
              <input type="checkbox" checked={cfg.autoRow} disabled={cfg.fixH}
                onChange={(e) => set({ autoRow: e.target.checked })} />
              <span className="unidade" />
            </div>
            <Campo label="Espaçamento" unidade="px" value={cfg.gap} min={0} max={200} set={(v) => set({ gap: v })} />
            <Campo label="Margem" unidade="px" value={cfg.pad} min={0} max={400} set={(v) => set({ pad: v })} />
            <Campo label="Cantos" unidade="px" value={cfg.radius} min={0} max={200} set={(v) => set({ radius: v })} />
            <div className="linha">
              <label className="rotulo">Fundo</label>
              <input type="color" value={cfg.bg} onChange={(e) => set({ bg: e.target.value, bgCustom: true })} />
              <span className="unidade" />
            </div>
          </Secao>

          <Secao titulo="Distribuição">
            <div className="botoes">
              <button className="botao" onClick={() => { const s = seed + 1; setSeed(s); autoLayout(s); }} disabled={!tiles.length}>Regenerar</button>
              <button className="botao" onClick={() => setTiles((ts) => ts.map((t) => ({ ...t, cs: 1, rs: 1 })))} disabled={!tiles.length}>Tudo 1×1</button>
              <button className="botao largo" onClick={() => { setTiles([]); setSel(null); }} disabled={!tiles.length}>Limpar documento</button>
            </div>
            <p className="nota">
              Reordenação pelo ⠿. Redimensionamento pelo canto inferior direito, com encaixe na malha.
              Reenquadramento arrastando dentro do bloco selecionado.
            </p>
          </Secao>

          <Secao titulo="Exportar">
            <p className="medida" style={{ marginTop: 0 }}>
              {Math.round(layout.docW)} × {Math.round(layout.docH)} px · {Math.round(layout.cellW)} px/cél · {Math.round(k * 100)}%
            </p>
            <div className="linha">
              <label className="rotulo">Resolução</label>
              <select
                className="valor" value={escala} title="Resolução de exportação"
                onChange={(e) => setEscala(Number(e.target.value))}
              >
                {[1, 2, 3, 4].map((s) => <option key={s} value={s}>{s}×</option>)}
              </select>
              <span className="unidade" />
            </div>
            <div className="botoes">
              <button className="botao" onClick={() => exportRaster("png")} disabled={!tiles.length}>PNG</button>
              <button className="botao" onClick={() => exportRaster("jpg")} disabled={!tiles.length}>JPG</button>
              <button className="botao" onClick={exportSvg} disabled={!tiles.length}>SVG</button>
              <button className="botao botao--primario" onClick={exportPdf} disabled={!tiles.length || busyPdf}>
                {busyPdf ? "···" : "PDF"}
              </button>
            </div>
          </Secao>

          <Footer
            theme={CSS_THEME}
            links={[
              { label: "grid maker", href: "https://gridmaker-iota.vercel.app/" },
              { label: "gradient maker", href: "https://gradient-maker-peach.vercel.app/" },
            ]}
          />
        </aside>

        {/* ---------------- palco ---------------- */}
        <main className="palco" ref={palcoRef}
          onPointerDown={(e) => { if (e.target === e.currentTarget) setSel(null); }}>
          {tiles.length === 0 ? (
            <p className="vazio">
              Adicione imagens para montar o bento. Cada célula recorta ou encaixa a imagem
              mantendo a proporção original — nada é distorcido.
            </p>
          ) : (
            <div className="doc-area" style={{ width: layout.docW * k, height: layout.docH * k }}>
              {cantos.map((c, i) => <span key={i} className="registro" style={c} />)}
              <div className="doc" style={{ width: layout.docW * k, height: layout.docH * k }}>
                <div
                  style={{
                    position: "relative", width: layout.docW, height: layout.docH,
                    background: cfg.bg, transform: `scale(${k})`, transformOrigin: "top left",
                  }}
                >
                  {layout.placed.map((t) => {
                    const d = drawRect(t, t.w, t.h);
                    const isSel = sel === t.id;
                    return (
                      <div
                        key={t.id}
                        className="bloco"
                        data-sel={isSel ? "1" : "0"}
                        onPointerDown={(e) => startPan(e, t)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); reorder(t.id); }}
                        style={{
                          left: t.x, top: t.y, width: t.w, height: t.h,
                          borderRadius: cfg.radius,
                          backgroundColor: t.fit === "contain" ? t.bg || cfg.bg : "#000",
                          backgroundImage: `url(${t.src})`,
                          backgroundSize: `${d.dw}px ${d.dh}px`,
                          backgroundPosition: `${d.dx}px ${d.dy}px`,
                          outline: isSel ? `${2 / k}px solid var(--mag)` : "none",
                          outlineOffset: -2 / k,
                          cursor: isSel ? "move" : "pointer",
                          transition: live && live.id === t.id && live.mode === "pan" ? "none" : anim,
                        }}
                      >
                        <button
                          className="pega" draggable
                          onDragStart={() => { dragFrom.current = t.id; }}
                          onPointerDown={(e) => e.stopPropagation()}
                          title="Reordenar"
                          style={{
                            left: 7 / k, top: 7 / k, width: 22 / k, height: 22 / k,
                            fontSize: 11 / k, borderRadius: 2 / k, borderWidth: 1 / k,
                          }}
                        >
                          ⠿
                        </button>
                        <div
                          className="alca"
                          onPointerDown={(e) => startResize(e, t)}
                          title="Redimensionar"
                          style={{
                            right: 7 / k, bottom: 7 / k, width: 22 / k, height: 22 / k,
                            borderRadius: 2 / k, borderWidth: 1 / k,
                            backgroundImage: `linear-gradient(135deg, transparent 42%, currentColor 42%, currentColor 52%, transparent 52%)`,
                          }}
                        />
                      </div>
                    );
                  })}
                  {guia && (
                    <div
                      className="guia"
                      style={{
                        left: guia.x, top: guia.y, width: guia.w, height: guia.h,
                        border: `${1 / k}px dashed var(--cyan)`, borderRadius: cfg.radius,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ---------------- inspetor ---------------- */}
        <aside className="painel dir">
          <Secao titulo="Bloco">
            {!atual ? (
              <p className="nota" style={{ marginTop: 0 }}>
                Nenhum bloco selecionado. Clique em uma imagem do documento.
              </p>
            ) : (
              <>
                <div
                  style={{
                    width: "100%", height: 76, marginBottom: 10,
                    border: "1px solid var(--line)", borderRadius: 2,
                    background: `#000 url(${atual.src}) center/cover no-repeat`,
                  }}
                />
                <p className="medida" style={{ marginTop: 0 }}>
                  {atual.name.length > 26 ? atual.name.slice(0, 24) + "…" : atual.name} · {atual.iw}×{atual.ih}
                </p>
                <Campo label="Largura" unidade="cél" value={atual.cs} min={1} max={layout.cols}
                  set={(v) => updTile(atual.id, { cs: v })} />
                <Campo label="Altura" unidade="cél" value={atual.rs} min={1} max={12}
                  set={(v) => updTile(atual.id, { rs: v })} />
                <p className="medida">{Math.round(atual.w)} × {Math.round(atual.h)} px</p>
              </>
            )}
          </Secao>

          {atual && (
            <>
              <Secao titulo="Encaixe">
                <div className="seg" style={{ marginBottom: 14 }}>
                  {[["cover", "Preencher"], ["contain", "Caber"]].map(([id, label]) => (
                    <button key={id} data-on={atual.fit === id ? "1" : "0"}
                      onClick={() => updTile(atual.id, { fit: id })}>{label}</button>
                  ))}
                </div>
                <Deslize label="Zoom" min={1} max={3} step={0.01} value={atual.zoom}
                  set={(v) => updTile(atual.id, { zoom: v })} />
                <Deslize label="Foco X" min={0} max={1} step={0.005} value={atual.fx}
                  set={(v) => updTile(atual.id, { fx: v })} />
                <Deslize label="Foco Y" min={0} max={1} step={0.005} value={atual.fy}
                  set={(v) => updTile(atual.id, { fy: v })} />
                {atual.fit === "contain" && (
                  <div className="linha">
                    <label className="rotulo">Fundo do bloco</label>
                    <input type="color" value={atual.bg || cfg.bg}
                      onChange={(e) => updTile(atual.id, { bg: e.target.value })} />
                    <span className="unidade" />
                  </div>
                )}
              </Secao>

              <Secao titulo="Ações">
                <div className="botoes">
                  <button className="botao" onClick={() => updTile(atual.id, { fx: 0.5, fy: 0.5, zoom: 1 })}>Centralizar</button>
                  <button className="botao" onClick={() => { setTiles((ts) => ts.filter((t) => t.id !== atual.id)); setSel(null); }}>Remover</button>
                </div>
              </Secao>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
