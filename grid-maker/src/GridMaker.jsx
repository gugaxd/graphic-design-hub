import { useState, useRef, useMemo, useCallback } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { MONO, SANS } from "./theme.js";

/* Servido pelo hub em /grid-maker/ — o menu é a raiz do mesmo site. */
const HUB_URL = "/";

/* ------------------------------------------------------------------ */
/* Paleta — tinta ciano-escura + acentos de registro CMYK               */
/* ------------------------------------------------------------------ */
const TEMAS = {
  escuro: {
    ink: "#0A0A0A",
    ink2: "#101010",
    ink3: "#1C1C1C",
    line: "#2B2B2B",
    text: "#E8E8E8",
    muted: "#8C8C8C",
    mag: "#E0218A",
    cyan: "#00A9CE",
    stage: "#0A0A0A",
    stageAlt: "#141414",
    sombra: "rgba(0,0,0,.6)",
    sobreCyan: "#08181C",
    sobreMag: "#FFFFFF",
    magBtn: "#D01A7C",
    magHover: "#B81068",
    arte: { bg: "#101010", fill: "#E0218A", stroke: "#00A9CE" },
  },
  claro: {
    ink: "#E9E9E9",
    ink2: "#F4F4F4",
    ink3: "#E1E1E1",
    line: "#D2D2D2",
    text: "#161616",
    muted: "#6B6B6B",
    mag: "#C4136E",
    cyan: "#00768F",
    stage: "#ECECEC",
    stageAlt: "#E2E2E2",
    sombra: "rgba(0,0,0,.13)",
    sobreCyan: "#FFFFFF",
    sobreMag: "#FFFFFF",
    magBtn: "#C4136E",
    magHover: "#9C0E54",
    arte: { bg: "#F4F4F4", fill: "#D81B84", stroke: "#00768F" },
  },
};

/* Host Grotesk SemiBold — subconjunto com os glifos de "gri.d.maker" (1,2 KB).
   O nome no cabeçalho virou "grid maker": o espaço vem da fonte de sistema. */
const FONTE_MARCA = `@font-face{font-family:"Host Grotesk";font-style:normal;font-weight:600;font-display:swap;src:url(data:font/woff2;base64,d09GMgABAAAAAASsAA8AAAAACJwAAARTAAEAxQAAAAAAAAAAAAAAAAAAAAAAAAAAGhwbIBwqBmA/U1RBVEQAbBEICoYUhRoBNgIkAygLFgAEIAWELgcgGwcHo6JuL06FEP9MMLZlvAaZuTpuujryrpPBpYmhexBcHT8R0reHplfx/P/vR9vnvj8qyQVCJNFgEpogW7RIn4S0RsI7WXx1tf/xT/9GBRgArWMW0MtDybHnT8IKzcIKaSP7H4Azqh+t7WfA90GCZppoUS2FvXoXCqY/iVV+Nd9dri7VX/Dv/F3s1WroKBOQ52BphSIUzAQsfJRQtQbSMYANqFQQDYgb44AdjOqk/7xWtDaCYUAp0Sv69Ytg0JwSpKNWdxjidPAfAMGgDXxkpLeUy53EGOSBoF9X0moAGnXQJMGxU+ccKCMENUSjUqhkqAaErenxfW8YzoEU1r7/exy0pyEABPKBfApYQhHRrzCNjDXk6/0DBAm4cKVzhJSDpDOOBBlfxno0UckFCCg0TKMIplGdBSaloSiHderVb9CwUdh/wK3ruYb/z+y31x677bLT1kjsViP/SUUMgmlgDL8qJwBA92m0pTRJACglR9K4rDSqDJ1L9VRsY9g6w9EFtv6E/RIX+7NnJiK5PAIkbJO8VFXn+yF18STsD5KPg2FWCSi74RGMGOKyZczeVSmSWmu8JimjIQ7v4sSHWRI/4XzHsFAKZKtYajNBJ09OSiR3GS5JNWrWgeCGq8ugWrU5ceyFB9Var9tHN8Pshp9cwm2duZdNoe8nOqSTIgKDaP9R7uMLTHxvNNIi1CdpcnUXFey5cSxSaWth60anhjqmuSv2dFpfocpc9GB1spIWVtobvWVXiYTHLLoEgHXMVDPhdNUQY0ZbeUS0wZu6NuXoCKh4AyIDj2ORSG+sgSsSerp/jge5iS5Mr8fdntoJ3Oh2jNVWjZgT8op3ezksS5WK84yjVxZL2YbrXAFxZeaq3tkqAu1bPSrw1MeZJg96lDqekc41qfXvfpryxdao0UA47AY8arRVNsrXnFM3IlZiotLvEht5XLNIzDUZuWKxicsxisUcs4l3BZB+mPowaZ6dnoVdd1Sen8mbD99fm7p2//xvuz3JDIxYi3l4yvKAeO5Ak0zb3o8hBZMpJpVZrTF47DBVebVZo95UOPRhys0+wTMN+1ivct0Vj4F9c/sWANy4ByTE46655N3nU6u+xlEo7wCv7h4uAOCdpHPq//5t9xxtl4FeBcKv6u2eAHC8zTv2Q4O1pKREGNUEeSWRXyNQ4hZIK4O4rZJmHiSeARsJg86KtY8qLLEJhhx00rp44C5QMXacEMuo92JzxKfaDhN7zEQu9NqKM4wEhoOJmCYtC2KOpGzOP1dCdjJBRE3DDOo3gECnJKekQhc2oBedHQIP420wCEIv3DA6vwuGUDeCNxhHGIDA4Oj4aXGEKFwFGZl+g9CqxnWR6oYYJWMxoteoXmMIEmHTonrJpi+0tSpYFgole24GGSFG9Ajq1W/ciE4YBSk5OZVKbh5eYZUTNZYcUHcMBjcIMYaulUkC9Z7XXTj8gBwInUYM6haEGNVpDAX4/5QMAAA=) format("woff2")}`;

/* ------------------------------------------------------------------ */
/* Formas — todas normalizadas em viewBox 0 0 100 100                   */
/* ------------------------------------------------------------------ */
/* Formas paramétricas: redesenhadas no tamanho real do bloco, para que o raio
   dos cantos permaneça constante em qualquer proporção. */
const pathArredondado = (w, h, r) => {
  const k = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${k},0 H${w - k} A${k},${k} 0 0 1 ${w},${k} V${h - k} A${k},${k} 0 0 1 ${w - k},${h} H${k} A${k},${k} 0 0 1 0,${h - k} V${k} A${k},${k} 0 0 1 ${k},0 Z`;
};
const pathFolha = (w, h, r) => {
  const k = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${k},0 H${w} V${h - k} A${k},${k} 0 0 1 ${w - k},${h} H0 V${k} A${k},${k} 0 0 1 ${k},0 Z`;
};

const SHAPES = {
  quadrado: { label: "Quadrado", el: <rect className="shp" x="0" y="0" width="100" height="100" /> },
  arredondado: {
    label: "Arredondado",
    el: <rect className="shp" x="0" y="0" width="100" height="100" rx="22" ry="22" />,
    param: pathArredondado,
  },
  folha: {
    label: "Folha",
    el: <path className="shp" d={pathFolha(100, 100, 22)} />,
    param: pathFolha,
  },
  retangulo: {
    label: "Retângulo",
    el: <rect className="shp" x="0" y="22" width="100" height="56" />,
  },
  barra: { label: "Barra", el: <rect className="shp" x="38" y="0" width="24" height="100" /> },
  circulo: { label: "Círculo", el: <circle className="shp" cx="50" cy="50" r="50" /> },
  anel: {
    label: "Anel",
    el: (
      <path
        className="shp"
        fillRule="evenodd"
        d="M50 0a50 50 0 1 0 .1 0zM50 28a22 22 0 1 1-.1 0z"
      />
    ),
  },
  triangulo: { label: "Triângulo", el: <polygon className="shp" points="50,2 98,98 2,98" /> },
  losango: { label: "Losango", el: <polygon className="shp" points="50,0 100,50 50,100 0,50" /> },
  hexagono: {
    label: "Hexágono",
    el: <polygon className="shp" points="25,3 75,3 100,50 75,97 25,97 0,50" />,
  },
  cruz: {
    label: "Cruz",
    el: <polygon className="shp" points="35,0 65,0 65,35 100,35 100,65 65,65 65,100 35,100 35,65 0,65 0,35 35,35" />,
  },
  estrela: {
    label: "Estrela",
    el: (
      <polygon
        className="shp"
        points="50,0 61,35 98,35 68,57 79,92 50,70 21,92 32,57 2,35 39,35"
      />
    ),
  },
  semicirculo: {
    label: "Semicírculo",
    el: <path className="shp" d="M0 100A50 50 0 0 1 100 100Z" />,
  },
};

const CANVASES = [
  { id: "a4r", label: "A4 retrato", w: 2480, h: 3508 },
  { id: "a4p", label: "A4 paisagem", w: 3508, h: 2480 },
  { id: "a3r", label: "A3 retrato", w: 3508, h: 4961 },
  { id: "quad", label: "Quadrado 2000", w: 2000, h: 2000 },
  { id: "ig", label: "Instagram post", w: 1080, h: 1350 },
  { id: "story", label: "Story / Reels", w: 1080, h: 1920 },
  { id: "hd", label: "1920 × 1080", w: 1920, h: 1080 },
];

const ESCALA_DIR = [
  { id: "none", label: "Nenhuma" },
  { id: "rows", label: "Linhas" },
  { id: "cols", label: "Colunas" },
  { id: "diag", label: "Diagonal" },
  { id: "radial", label: "Radial" },
];

/* ------------------------------------------------------------------ */
/* Controles                                                            */
/* ------------------------------------------------------------------ */
function Slider({ label, value, onChange, min, max, step = 1, unit = "", accent }) {
  return (
    <div className="ctl">
      <div className="ctl-head">
        <span className="ctl-label">{label}</span>
        <input
          className="ctl-num"
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!Number.isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
          }}
        />
        <span className="ctl-unit">{unit}</span>
      </div>
      <input
        className="ctl-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--accent": accent || "var(--acento)" }}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="ctl">
      <div className="ctl-label" style={{ marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                  */
/* ------------------------------------------------------------------ */
export default function GeradorDeGrid() {
  const svgRef = useRef(null);
  const fileRef = useRef(null);

  const [tema, setTema] = useState("escuro");
  const C = TEMAS[tema];

  const [canvasId, setCanvasId] = useState("ig");
  const [custW, setCustW] = useState(1200);
  const [custH, setCustH] = useState(1600);
  const [unidade, setUnidade] = useState("px");
  const [dpi, setDpi] = useState(300);
  const [cols, setCols] = useState(6);
  const [rows, setRows] = useState(8);
  const [cell, setCell] = useState(120);
  const [gap, setGap] = useState(28);

  const [shape, setShape] = useState("circulo");
  const [raioCanto, setRaioCanto] = useState(22);
  const [custom, setCustom] = useState(null); // {viewBox, inner, name}
  const [forceColor, setForceColor] = useState(true);

  const [rot, setRot] = useState(0);
  const [op, setOp] = useState(100);
  const [escala, setEscala] = useState(1);
  const [escalaDir, setEscalaDir] = useState("none");

  const [bg, setBg] = useState(TEMAS.escuro.arte.bg);
  const [fill, setFill] = useState(TEMAS.escuro.arte.fill);
  const [modo, setModo] = useState("fill"); // fill | stroke | both
  const [strokeColor, setStrokeColor] = useState(TEMAS.escuro.arte.stroke);
  const [stroke, setStroke] = useState(4);
  const [fillOp, setFillOp] = useState(100);
  const [strokeOp, setStrokeOp] = useState(100);

  const [over, setOver] = useState({}); // "r:c" -> {rot, op, scale, hidden}
  const [sel, setSel] = useState(null);
  const [scale, setScale] = useState(2);
  const [busy, setBusy] = useState("");

  /* medidas físicas convertidas para pixels na resolução escolhida */
  const paraPx = useCallback(
    (v) => {
      if (unidade === "px") return Math.round(v);
      if (unidade === "mm") return Math.round((v / 25.4) * dpi);
      if (unidade === "cm") return Math.round((v / 2.54) * dpi);
      return Math.round(v * dpi); // polegadas
    },
    [unidade, dpi]
  );

  const canvas = useMemo(() => {
    if (canvasId !== "custom") return CANVASES.find((c) => c.id === canvasId);
    return {
      id: "custom",
      label: "Personalizado",
      w: Math.max(16, Math.min(20000, paraPx(custW))),
      h: Math.max(16, Math.min(20000, paraPx(custH))),
    };
  }, [canvasId, custW, custH, paraPx]);

  const usingCustom = shape === "custom" && custom;
  const paramFn = !usingCustom ? SHAPES[shape]?.param : null;
  const vb = usingCustom ? custom.viewBox : "0 0 100 100";

  /* ---- geometria -------------------------------------------------- */
  const pitch = cell + gap;
  const gridW = cols * cell + (cols - 1) * gap;
  const gridH = rows * cell + (rows - 1) * gap;
  const startX = (canvas.w - gridW) / 2;
  const startY = (canvas.h - gridH) / 2;

  const fatorEscala = useCallback(
    (r, c) => {
      if (escalaDir === "none") return 1;
      let t = 0;
      if (escalaDir === "rows") t = rows > 1 ? r / (rows - 1) : 0;
      else if (escalaDir === "cols") t = cols > 1 ? c / (cols - 1) : 0;
      else if (escalaDir === "diag") {
        const d = rows - 1 + (cols - 1);
        t = d > 0 ? (r + c) / d : 0;
      } else if (escalaDir === "radial") {
        const cr = (rows - 1) / 2;
        const cc = (cols - 1) / 2;
        const maxD = Math.hypot(cr, cc) || 1;
        t = Math.hypot(r - cr, c - cc) / maxD;
      }
      return 1 + (escala - 1) * t;
    },
    [escalaDir, escala, rows, cols]
  );

  /* mapa de ocupação: um módulo pode cobrir várias colunas e/ou linhas */
  const { celulas, ocupadas } = useMemo(() => {
    const ocup = new Set();
    const ancoras = Object.entries(over)
      .filter(([, v]) => (v.spanC ?? 1) > 1 || (v.spanR ?? 1) > 1)
      .map(([k, v]) => {
        const [r, c] = k.split(":").map(Number);
        return { key: k, r, c, sr: v.spanR ?? 1, sc: v.spanC ?? 1 };
      })
      .sort((a, b) => a.r - b.r || a.c - b.c);

    const spanDe = {};
    for (const a of ancoras) {
      if (ocup.has(a.key)) continue; // âncora já coberta por outro bloco
      const sr = Math.min(a.sr, rows - a.r);
      const sc = Math.min(a.sc, cols - a.c);
      if (sr <= 1 && sc <= 1) continue;
      let livre = true;
      for (let r = a.r; r < a.r + sr && livre; r++)
        for (let c = a.c; c < a.c + sc; c++)
          if (ocup.has(`${r}:${c}`)) { livre = false; break; }
      if (!livre) continue;
      spanDe[a.key] = { sr, sc };
      for (let r = a.r; r < a.r + sr; r++)
        for (let c = a.c; c < a.c + sc; c++)
          if (!(r === a.r && c === a.c)) ocup.add(`${r}:${c}`);
    }

    const out = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `${r}:${c}`;
        if (ocup.has(key)) continue;
        const o = over[key] || {};
        const { sr, sc } = spanDe[key] || { sr: 1, sc: 1 };
        const bw = sc * cell + (sc - 1) * gap; // cobre as células inteiras
        const bh = sr * cell + (sr - 1) * gap;
        const f = fatorEscala(r, c) * (o.scale ?? 1);
        const sw = bw * f;
        const sh = bh * f;
        const cx = startX + c * pitch + bw / 2;
        const cy = startY + r * pitch + bh / 2;
        out.push({
          key, r, c, sr, sc, bw, bh, sw, sh,
          x: cx - sw / 2,
          y: cy - sh / 2,
          cx, cy,
          par: sr === sc ? "xMidYMid meet" : "none",
          rot: rot + (o.rot ?? 0),
          hidden: !!o.hidden,
        });
      }
    }
    return { celulas: out, ocupadas: ocup };
  }, [rows, cols, over, fatorEscala, cell, gap, startX, startY, pitch, rot]);

  const totalVisivel = celulas.filter((c) => !c.hidden).length;

  /* ---- upload SVG ------------------------------------------------- */
  const carregarSvg = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const doc = new DOMParser().parseFromString(String(reader.result), "image/svg+xml");
        const root = doc.querySelector("svg");
        if (!root) throw new Error("sem tag svg");
        root.querySelectorAll("script, foreignObject").forEach((n) => n.remove());
        let viewBox = root.getAttribute("viewBox");
        if (!viewBox) {
          const w = parseFloat(root.getAttribute("width")) || 100;
          const h = parseFloat(root.getAttribute("height")) || 100;
          viewBox = `0 0 ${w} ${h}`;
        }
        setCustom({ viewBox, inner: root.innerHTML, name: file.name });
        setShape("custom");
        setBusy("");
      } catch {
        setBusy("Não consegui ler esse arquivo. Envie um SVG válido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  /* ---- exportação ------------------------------------------------- */
  const serializar = () => {
    const clone = svgRef.current.cloneNode(true);
    clone.querySelectorAll("[data-ui]").forEach((n) => n.remove());
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", canvas.w);
    clone.setAttribute("height", canvas.h);
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
  };

  const baixar = (blob, nome) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nome;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const nomeBase = `grid-${cols}x${rows}-${usingCustom ? "custom" : shape}`;

  const exportarSvg = () => {
    baixar(new Blob([serializar()], { type: "image/svg+xml" }), `${nomeBase}.svg`);
    setBusy("SVG exportado.");
  };

  const exportarPng = () => {
    setBusy("Renderizando PNG…");
    const str = serializar();
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement("canvas");
      cv.width = Math.round(canvas.w * scale);
      cv.height = Math.round(canvas.h * scale);
      const ctx = cv.getContext("2d");
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      cv.toBlob((b) => {
        baixar(b, `${nomeBase}@${scale}x.png`);
        setBusy(`PNG exportado — ${cv.width} × ${cv.height} px.`);
      }, "image/png");
    };
    img.onerror = () => setBusy("Falha ao rasterizar. Tente exportar em SVG.");
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(str);
  };

  /* ---- ações ------------------------------------------------------ */
  const preencher = () => {
    setCols(Math.max(1, Math.floor((canvas.w + gap) / pitch)));
    setRows(Math.max(1, Math.floor((canvas.h + gap) / pitch)));
  };

  const ajustarModulo = () => {
    const cw = (canvas.w - (cols - 1) * gap) / cols;
    const ch = (canvas.h - (rows - 1) * gap) / rows;
    setCell(Math.max(4, Math.round(Math.min(cw, ch))));
  };

  const igual = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();

  const aplicarArte = (t) => {
    const a = TEMAS[t].arte;
    setBg(a.bg);
    setFill(a.fill);
    setStrokeColor(a.stroke);
  };

  /* troca o tema e leva a arte junto, preservando cores que você personalizou */
  const trocarTema = () => {
    const novo = tema === "escuro" ? "claro" : "escuro";
    const de = TEMAS[tema].arte;
    const para = TEMAS[novo].arte;
    if (igual(bg, de.bg)) setBg(para.bg);
    if (igual(fill, de.fill)) setFill(para.fill);
    if (igual(strokeColor, de.stroke)) setStrokeColor(para.stroke);
    setTema(novo);
  };

  const setOverride = (patch) => {
    if (!sel) return;
    setOver((p) => ({ ...p, [sel]: { ...(p[sel] || {}), ...patch } }));
  };

  const selData = sel ? over[sel] || {} : null;
  const dirSpan = selData?.dirSpan ?? "prop";
  const nSpan = Math.max(selData?.spanR ?? 1, selData?.spanC ?? 1);
  const spanC = selData?.spanC ?? 1;
  const spanR = selData?.spanR ?? 1;
  const aplicarSpan = (dir, n) => {
    if (dir === "h") setOverride({ dirSpan: "h", spanC: n, spanR: 1 });
    else if (dir === "v") setOverride({ dirSpan: "v", spanR: n, spanC: 1 });
    else if (dir === "livre") setOverride({ dirSpan: "livre", spanC, spanR });
    else setOverride({ dirSpan: "prop", spanR: n, spanC: n });
  };
  const maxCell = Math.round(Math.min(canvas.w, canvas.h) / 2);

  /* ---- estilos internos do SVG ------------------------------------ */
  /* Cada combinação de cores vira uma classe própria, para que módulos com cor
     individual convivam com os globais sem duplicar regras. */
  const temFill = modo !== "stroke";
  const temStroke = modo !== "fill";

  const regraDe = (f, st) => {
    const pf = temFill ? `fill:${f};fill-opacity:${fillOp / 100}` : "fill:none";
    const ps = temStroke
      ? `stroke:${st};stroke-opacity:${strokeOp / 100};stroke-width:${stroke};vector-effect:non-scaling-stroke;stroke-linejoin:round`
      : "stroke:none";
    const ff = temFill
      ? `fill:${f} !important;fill-opacity:${fillOp / 100} !important`
      : "fill:none !important";
    const fs = temStroke
      ? `stroke:${st} !important;stroke-opacity:${strokeOp / 100} !important;stroke-width:${stroke}px !important;vector-effect:non-scaling-stroke`
      : "stroke:none !important";
    return { pf, ps, ff, fs };
  };

  const { classeDe, paletaCss } = useMemo(() => {
    const sigs = new Map();
    const linhas = [];
    for (const c of celulas) {
      const o = over[c.key] || {};
      const sig = `${o.cor ?? fill}|${o.corStroke ?? strokeColor}`;
      if (sigs.has(sig)) continue;
      const cls = `p${sigs.size}`;
      sigs.set(sig, cls);
      const [f, st] = sig.split("|");
      const r = regraDe(f, st);
      linhas.push(`.${cls} .shp{${r.pf};${r.ps}}`);
      linhas.push(`.${cls} .forced,.${cls} .forced *{${r.ff};${r.fs}}`);
    }
    return {
      classeDe: (key) => {
        const o = over[key] || {};
        return sigs.get(`${o.cor ?? fill}|${o.corStroke ?? strokeColor}`);
      },
      paletaCss: linhas.join("\n"),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celulas, over, fill, strokeColor, modo, fillOp, strokeOp, stroke]);

  return (
    <div className="app">
      <style>{`
        ${FONTE_MARCA}
        .app{--acento:${C.cyan};display:flex;height:100vh;min-height:640px;background:${C.ink};color:${C.text};
          font-family:${SANS};font-size:13px;overflow:hidden}
        .app *{box-sizing:border-box}

        /* ---- painel ---- */
        .panel{width:312px;flex:0 0 312px;background:${C.ink2};border-right:1px solid ${C.line};
          overflow-y:auto;padding:0}
        .sec{border-bottom:1px solid ${C.line};padding:16px 18px}
        .sec-title{font-family:${MONO};font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;
          color:${C.cyan};margin:0 0 12px;display:flex;align-items:center;gap:8px}
        .sec-title::after{content:"";flex:1;height:1px;background:${C.line}}

        .ctl{margin-bottom:14px}
        .ctl:last-child{margin-bottom:0}
        .ctl-head{display:flex;align-items:baseline;gap:6px;margin-bottom:5px}
        .ctl-label{flex:1;font-size:11.5px;color:${C.text};letter-spacing:.01em}
        .ctl-num{width:58px;background:${C.ink};border:1px solid ${C.line};color:${C.text};
          font-family:${MONO};font-size:11px;padding:3px 5px;border-radius:2px;text-align:right}
        .ctl-num:focus-visible{outline:2px solid ${C.cyan};outline-offset:1px}
        .ctl-unit{font-family:${MONO};font-size:9.5px;color:${C.muted};width:20px}
        .ctl-range{width:100%;-webkit-appearance:none;appearance:none;height:2px;
          background:${C.line};border-radius:2px}
        .ctl-range::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;
          border-radius:50%;background:var(--accent);cursor:grab;border:2px solid ${C.ink2}}
        .ctl-range::-moz-range-thumb{width:13px;height:13px;border-radius:50%;
          background:var(--accent);cursor:grab;border:2px solid ${C.ink2}}
        .ctl-range:focus-visible{outline:2px solid ${C.cyan};outline-offset:4px}

        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        select,.btn,.file{width:100%;background:${C.ink};border:1px solid ${C.line};color:${C.text};
          font-family:${MONO};font-size:11px;padding:7px 8px;border-radius:2px;cursor:pointer}
        select:focus-visible,.btn:focus-visible{outline:2px solid ${C.cyan};outline-offset:1px}
        .btn:hover{background:${C.cyan};border-color:${C.cyan};color:${C.sobreCyan}}
        .btn-mag{background:${C.magBtn};border-color:${C.magBtn};color:${C.sobreMag};font-weight:600;
          letter-spacing:.05em}
        .btn-mag:hover{background:${C.magHover};border-color:${C.magHover};color:${C.sobreMag}}

        .shapes{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
        .sw{aspect-ratio:1;background:${C.ink};border:1px solid ${C.line};border-radius:2px;
          display:flex;align-items:center;justify-content:center;cursor:pointer;padding:7px}
        .sw:hover{border-color:${C.muted}}
        .sw[data-on="1"]{border-color:${C.mag};background:${C.ink3}}
        .sw svg{width:100%;height:100%;fill:${C.muted}}
        .sw[data-on="1"] svg{fill:${C.mag}}

        .row{display:flex;align-items:center;gap:8px;margin-bottom:10px}
        .row:last-child{margin-bottom:0}
        .row label{flex:1;font-size:11.5px}
        input[type=color]{width:34px;height:24px;padding:0;border:1px solid ${C.line};
          background:${C.ink};border-radius:2px;cursor:pointer}
        input[type=checkbox]{accent-color:${C.mag};width:14px;height:14px;cursor:pointer}

        /* ---- palco ---- */
        .stage{flex:1;display:flex;flex-direction:column;min-width:0}
        .bar{display:flex;align-items:center;gap:14px;padding:0 20px;height:46px;
          border-bottom:1px solid ${C.line};font-family:${MONO};font-size:10.5px;color:${C.muted};
          letter-spacing:.06em;flex:0 0 46px}
        .bar b{color:${C.text};font-weight:500}
        .bar .sp{flex:1}
        .msg{color:${C.cyan}}

        .view{flex:1;position:relative;display:flex;align-items:center;justify-content:center;
          padding:34px;overflow:hidden;
          background:
            linear-gradient(45deg,${C.stageAlt} 25%,transparent 25%,transparent 75%,${C.stageAlt} 75%),
            linear-gradient(45deg,${C.stageAlt} 25%,transparent 25%,transparent 75%,${C.stageAlt} 75%);
          background-size:16px 16px;background-position:0 0,8px 8px;background-color:${C.stage}}
        .frame{position:relative;max-width:100%;max-height:100%;display:flex}
        .frame svg.stagesvg{max-width:100%;max-height:100%;width:auto;height:auto;
          display:block;box-shadow:0 0 0 1px ${C.line},0 20px 60px ${C.sombra}}
        /* marcas de registro */
        .reg{position:absolute;width:13px;height:13px;pointer-events:none}
        .reg::before,.reg::after{content:"";position:absolute;background:${C.cyan};opacity:.85}
        .reg::before{left:6px;top:0;width:1px;height:13px}
        .reg::after{top:6px;left:0;height:1px;width:13px}
        .reg.tl{left:-19px;top:-19px}.reg.tr{right:-19px;top:-19px}
        .reg.bl{left:-19px;bottom:-19px}.reg.br{right:-19px;bottom:-19px}

        .hint{font-family:${MONO};font-size:10px;color:${C.muted};line-height:1.6;
          margin:10px 0 0;letter-spacing:.03em}
        .selbox{border:1px solid ${C.mag};background:${C.ink3};border-radius:2px;padding:12px;
          margin-top:4px}
        .selbox .tag{font-family:${MONO};font-size:9.5px;color:${C.mag};letter-spacing:.14em;
          text-transform:uppercase;margin-bottom:10px;display:block}
        .empty{font-family:${MONO};font-size:10.5px;color:${C.muted};line-height:1.65;
          letter-spacing:.03em}

        @media (max-width:860px){
          .app{flex-direction:column;height:auto;min-height:0}
          .panel{width:100%;flex:none;max-height:none;border-right:none;
            border-bottom:1px solid ${C.line}}
          .view{min-height:56vh}
        }
        @media (prefers-reduced-motion:reduce){*{transition:none !important;animation:none !important}}
      `}</style>

      {/* ============================ PAINEL ============================ */}
      <aside className="panel">
        <Header
          tool="grid maker"
          homeHref={HUB_URL}
          theme={C}
          fontFamily={`"Host Grotesk", ${SANS}`}
          tema={tema}
          onToggleTema={trocarTema}
        />

        {/* Suporte */}
        <section className="sec">
          <h2 className="sec-title">Suporte</h2>
          <Field label="Formato">
            <select value={canvasId} onChange={(e) => setCanvasId(e.target.value)}>
              {CANVASES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} — {c.w}×{c.h}
                </option>
              ))}
              <option value="custom">Personalizado…</option>
            </select>
          </Field>

          {canvasId === "custom" && (
            <>
              <div className="grid2" style={{ marginBottom: 10 }}>
                <div>
                  <div className="ctl-label" style={{ marginBottom: 5 }}>
                    Largura
                  </div>
                  <input
                    className="ctl-num"
                    style={{ width: "100%" }}
                    type="number"
                    min={1}
                    step={unidade === "px" ? 1 : 0.1}
                    value={custW}
                    onChange={(e) => setCustW(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  />
                </div>
                <div>
                  <div className="ctl-label" style={{ marginBottom: 5 }}>
                    Altura
                  </div>
                  <input
                    className="ctl-num"
                    style={{ width: "100%" }}
                    type="number"
                    min={1}
                    step={unidade === "px" ? 1 : 0.1}
                    value={custH}
                    onChange={(e) => setCustH(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  />
                </div>
              </div>
              <div className="grid2" style={{ marginBottom: 10 }}>
                <select value={unidade} onChange={(e) => setUnidade(e.target.value)}>
                  <option value="px">Pixels</option>
                  <option value="mm">Milímetros</option>
                  <option value="cm">Centímetros</option>
                  <option value="in">Polegadas</option>
                </select>
                <button
                  className="btn"
                  onClick={() => {
                    const w = custW;
                    setCustW(custH);
                    setCustH(w);
                  }}
                >
                  Girar 90°
                </button>
              </div>
              {unidade !== "px" && (
                <>
                  <Slider
                    label="Resolução"
                    value={dpi}
                    onChange={setDpi}
                    min={72}
                    max={600}
                    step={1}
                    unit="dpi"
                    accent={C.cyan}
                  />
                  <p className="hint" style={{ marginTop: -6, marginBottom: 12 }}>
                    Resulta em {canvas.w} × {canvas.h} px. Para impressão, 300 dpi é o
                    padrão; use 150 para provas e 600 para traços muito finos.
                  </p>
                </>
              )}
            </>
          )}
          <div className="row">
            <label htmlFor="bg">Fundo</label>
            <input id="bg" type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
          </div>
        </section>

        {/* Módulo */}
        <section className="sec">
          <h2 className="sec-title">Módulo</h2>
          <div className="shapes">
            {Object.entries(SHAPES).map(([k, v]) => (
              <button
                key={k}
                className="sw"
                data-on={shape === k ? "1" : "0"}
                title={v.label}
                aria-label={v.label}
                onClick={() => setShape(k)}
              >
                <svg viewBox="0 0 100 100">{v.el}</svg>
              </button>
            ))}
            {custom && (
              <button
                className="sw"
                data-on={shape === "custom" ? "1" : "0"}
                title={custom.name}
                aria-label={`SVG enviado: ${custom.name}`}
                onClick={() => setShape("custom")}
              >
                <svg
                  viewBox={custom.viewBox}
                  dangerouslySetInnerHTML={{ __html: custom.inner }}
                  style={{ fill: "currentColor" }}
                />
              </button>
            )}
          </div>
          {paramFn && (
            <div style={{ marginTop: 12 }}>
              <Slider
                label="Raio dos cantos"
                value={raioCanto}
                onChange={setRaioCanto}
                min={0}
                max={Math.round(cell / 2)}
                step={1}
                unit="px"
                accent={C.cyan}
              />
              <p className="hint" style={{ marginTop: -4 }}>
                Medido em px do arquivo final. Blocos horizontais ou verticais mantêm
                exatamente a mesma curvatura dos módulos 1×1.
              </p>
            </div>
          )}
          <button className="btn" style={{ marginTop: 8 }} onClick={() => fileRef.current.click()}>
            {custom ? "Trocar SVG…" : "Enviar SVG…"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".svg,image/svg+xml"
            onChange={carregarSvg}
            style={{ display: "none" }}
          />
          {usingCustom && (
            <div className="row" style={{ marginTop: 10 }}>
              <label htmlFor="fc">Aplicar cor do painel</label>
              <input
                id="fc"
                type="checkbox"
                checked={forceColor}
                onChange={(e) => setForceColor(e.target.checked)}
              />
            </div>
          )}
        </section>

        {/* Malha */}
        <section className="sec">
          <h2 className="sec-title">Malha</h2>
          <div className="grid2" style={{ marginBottom: 14 }}>
            <Slider label="Colunas" value={cols} onChange={setCols} min={1} max={80} />
            <Slider label="Linhas" value={rows} onChange={setRows} min={1} max={80} />
          </div>
          <Slider label="Tamanho do módulo" value={cell} onChange={setCell} min={4} max={maxCell} unit="px" />
          <Slider label="Espaçamento" value={gap} onChange={setGap} min={0} max={600} unit="px" />
          <div className="grid2" style={{ marginTop: 4 }}>
            <button className="btn" onClick={preencher}>
              Preencher tela
            </button>
            <button className="btn" onClick={ajustarModulo}>
              Encaixar módulo
            </button>
          </div>
        </section>

        {/* Atributos globais */}
        <section className="sec">
          <h2 className="sec-title">Atributos globais</h2>
          <Slider label="Rotação" value={rot} onChange={setRot} min={-180} max={180} unit="°" accent={C.mag} />
          <Slider label="Opacidade" value={op} onChange={setOp} min={0} max={100} unit="%" accent={C.mag} />
          <Field label="Escalonar ao longo de">
            <select value={escalaDir} onChange={(e) => setEscalaDir(e.target.value)}>
              {ESCALA_DIR.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>
          {escalaDir !== "none" && (
            <Slider
              label="Escala final"
              value={escala}
              onChange={setEscala}
              min={0.05}
              max={2.5}
              step={0.05}
              unit="×"
              accent={C.mag}
            />
          )}
        </section>

        {/* Cor e traço */}
        <section className="sec">
          <h2 className="sec-title">Cor e traço</h2>
          <Field label="Pintura">
            <select value={modo} onChange={(e) => setModo(e.target.value)}>
              <option value="fill">Preenchimento</option>
              <option value="stroke">Somente contorno</option>
              <option value="both">Preenchimento + contorno</option>
            </select>
          </Field>
          {temFill && (
            <>
              <div className="row">
                <label htmlFor="fl">Cor do preenchimento</label>
                <input id="fl" type="color" value={fill} onChange={(e) => setFill(e.target.value)} />
              </div>
              <Slider
                label="Opacidade do preenchimento"
                value={fillOp}
                onChange={setFillOp}
                min={0}
                max={100}
                unit="%"
                accent={C.mag}
              />
            </>
          )}
          {temStroke && (
            <>
              <div className="row">
                <label htmlFor="sc">Cor do contorno</label>
                <input
                  id="sc"
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                />
              </div>
              <Slider
                label="Espessura do contorno"
                value={stroke}
                onChange={setStroke}
                min={0.25}
                max={200}
                step={0.25}
                unit="px"
                accent={C.cyan}
              />
              <Slider
                label="Opacidade do contorno"
                value={strokeOp}
                onChange={setStrokeOp}
                min={0}
                max={100}
                unit="%"
                accent={C.cyan}
              />
              <div className="grid2">
                {[1, 2, 4, 8].map((v) => (
                  <button key={v} className="btn" onClick={() => setStroke(v)}>
                    {v} px
                  </button>
                ))}
              </div>
              <p className="hint">
                Preenchimento e contorno têm opacidades independentes — dá para deixar a
                forma a 15% e manter o filete cheio. A espessura é medida no tamanho final
                do arquivo e não escala com o módulo.
              </p>
            </>
          )}
          <button
            className="btn"
            style={{ marginTop: 10 }}
            onClick={() => aplicarArte(tema)}
          >
            Restaurar cores do tema {tema === "escuro" ? "escuro" : "claro"}
          </button>
        </section>

        {/* Seleção individual */}
        <section className="sec">
          <h2 className="sec-title">Elemento</h2>
          {!sel ? (
            <p className="empty">
              Clique em qualquer módulo no palco para editá-lo. A ocupação pode ser
              proporcional (2×2, 3×3), horizontal, vertical ou personalizada — colunas e
              linhas independentes, como 3×7. Os demais módulos permanecem idênticos.
            </p>
          ) : (
            <div className="selbox">
              <span className="tag">
                Módulo {sel.replace(":", " · ")} — ocupa {spanC} × {spanR}
              </span>
              <Field label="Ocupação">
                <select value={dirSpan} onChange={(e) => aplicarSpan(e.target.value, nSpan)}>
                  <option value="prop">Proporcional — n × n</option>
                  <option value="h">Horizontal — n × 1</option>
                  <option value="v">Vertical — 1 × n</option>
                  <option value="livre">Personalizada — colunas × linhas</option>
                </select>
              </Field>
              {dirSpan === "livre" ? (
                <>
                  <Slider
                    label="Colunas"
                    value={spanC}
                    onChange={(v) => setOverride({ dirSpan: "livre", spanC: v })}
                    min={1}
                    max={Math.max(1, cols)}
                    step={1}
                    unit="cél"
                    accent={C.mag}
                  />
                  <Slider
                    label="Linhas"
                    value={spanR}
                    onChange={(v) => setOverride({ dirSpan: "livre", spanR: v })}
                    min={1}
                    max={Math.max(1, rows)}
                    step={1}
                    unit="cél"
                    accent={C.mag}
                  />
                </>
              ) : (
                <Slider
                  label={
                    dirSpan === "h"
                      ? "Colunas ocupadas"
                      : dirSpan === "v"
                      ? "Linhas ocupadas"
                      : "Células por lado"
                  }
                  value={nSpan}
                  onChange={(v) => aplicarSpan(dirSpan, v)}
                  min={1}
                  max={12}
                  step={1}
                  unit="cél"
                  accent={C.mag}
                />
              )}
              {temFill && (
                <div className="row">
                  <label htmlFor="ec">Cor do preenchimento</label>
                  <input
                    id="ec"
                    type="color"
                    value={selData.cor ?? fill}
                    onChange={(e) => setOverride({ cor: e.target.value })}
                  />
                </div>
              )}
              {temStroke && (
                <div className="row">
                  <label htmlFor="ecs">Cor do contorno</label>
                  <input
                    id="ecs"
                    type="color"
                    value={selData.corStroke ?? strokeColor}
                    onChange={(e) => setOverride({ corStroke: e.target.value })}
                  />
                </div>
              )}
              {(selData.cor || selData.corStroke) && (
                <button
                  className="btn"
                  style={{ marginBottom: 14 }}
                  onClick={() => setOverride({ cor: undefined, corStroke: undefined })}
                >
                  Voltar às cores globais
                </button>
              )}
              <Slider
                label="Rotação extra"
                value={selData.rot ?? 0}
                onChange={(v) => setOverride({ rot: v })}
                min={-180}
                max={180}
                unit="°"
                accent={C.mag}
              />
              <Slider
                label="Opacidade"
                value={selData.op ?? op}
                onChange={(v) => setOverride({ op: v })}
                min={0}
                max={100}
                unit="%"
                accent={C.mag}
              />
              <Slider
                label="Escala fina"
                value={selData.scale ?? 1}
                onChange={(v) => setOverride({ scale: v })}
                min={0.05}
                max={3}
                step={0.05}
                unit="×"
                accent={C.mag}
              />
              <div className="grid2" style={{ marginTop: 10 }}>
                <button className="btn" onClick={() => setOverride({ hidden: !selData.hidden })}>
                  {selData.hidden ? "Mostrar" : "Ocultar"}
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setOver((p) => {
                      const n = { ...p };
                      delete n[sel];
                      return n;
                    });
                  }}
                >
                  Redefinir
                </button>
              </div>
            </div>
          )}
          {Object.keys(over).length > 0 && (
            <button
              className="btn"
              style={{ marginTop: 10 }}
              onClick={() => {
                setOver({});
                setSel(null);
              }}
            >
              Limpar {Object.keys(over).length} edição(ões)
            </button>
          )}
        </section>

        {/* Exportar */}
        <section className="sec">
          <h2 className="sec-title">Exportar</h2>
          <button className="btn btn-mag" onClick={exportarSvg}>
            Baixar SVG vetorial
          </button>
          <div className="grid2" style={{ marginTop: 8 }}>
            <select value={scale} onChange={(e) => setScale(parseInt(e.target.value, 10))}>
              {[1, 2, 3, 4].map((s) => (
                <option key={s} value={s}>
                  {s}× — {canvas.w * s}px
                </option>
              ))}
            </select>
            <button className="btn" onClick={exportarPng}>
              Baixar PNG
            </button>
          </div>
          <p className="hint">
            O SVG sai em vetor puro, com o fundo como retângulo sólido — pronto para abrir no
            Illustrator e converter para CMYK.
          </p>
        </section>

        <Footer
          theme={C}
          links={[
            { label: "bento maker", href: "https://bento-maker-three.vercel.app/" },
            { label: "gradient maker", href: "https://gradient-maker-peach.vercel.app/" },
          ]}
        />
      </aside>

      {/* ============================ PALCO ============================ */}
      <main className="stage">
        <div className="bar">
          <span>
            <b>{canvas.w}</b> × <b>{canvas.h}</b> px
          </span>
          <span>
            <b>{celulas.length}</b> módulos · <b>{totalVisivel}</b> visíveis
            {ocupadas.size > 0 && (
              <>
                {" "}· <b>{ocupadas.size}</b> células cobertas
              </>
            )}
          </span>
          <span>
            passo <b>{pitch}</b> px
          </span>
          <span className="sp" />
          {busy && <span className="msg">{busy}</span>}
        </div>

        <div className="view">
          <div className="frame">
            <span className="reg tl" />
            <span className="reg tr" />
            <span className="reg bl" />
            <span className="reg br" />
            <svg
              ref={svgRef}
              className="stagesvg"
              width={canvas.w}
              height={canvas.h}
              viewBox={`0 0 ${canvas.w} ${canvas.h}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <style>{paletaCss}</style>
              <rect x="0" y="0" width={canvas.w} height={canvas.h} fill={bg} />

              {celulas.map((c) => {
                if (c.hidden) return null;
                const opacity = (over[c.key]?.op ?? op) / 100;
                return (
                  <g
                    key={c.key}
                    className={classeDe(c.key)}
                    opacity={opacity}
                    transform={`rotate(${c.rot} ${c.cx} ${c.cy})`}
                    onClick={() => setSel(sel === c.key ? null : c.key)}
                    style={{ cursor: "pointer" }}
                  >
                    {paramFn ? (
                      /* redesenhada no tamanho real: o raio não estica */
                      <path
                        className="shp"
                        transform={`translate(${c.x} ${c.y})`}
                        d={paramFn(c.sw, c.sh, raioCanto)}
                      />
                    ) : (
                      <svg
                        x={c.x}
                        y={c.y}
                        width={c.sw}
                        height={c.sh}
                        viewBox={vb}
                        preserveAspectRatio={c.par}
                        overflow="visible"
                      >
                        {usingCustom ? (
                          <g
                            className={forceColor ? "forced" : undefined}
                            dangerouslySetInnerHTML={{ __html: custom.inner }}
                          />
                        ) : (
                          SHAPES[shape].el
                        )}
                      </svg>
                    )}
                  </g>
                );
              })}

              {/* camada de interface — removida na exportação */}
              <g data-ui="1">
                {celulas.map((c) => (
                  <rect
                    key={`h${c.key}`}
                    x={c.cx - c.bw / 2}
                    y={c.cy - c.bh / 2}
                    width={c.bw}
                    height={c.bh}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onClick={() => setSel(sel === c.key ? null : c.key)}
                  />
                ))}
                {sel &&
                  (() => {
                    const c = celulas.find((x) => x.key === sel);
                    if (!c) return null;
                    const pad = Math.max(6, cell * 0.08);
                    return (
                      <rect
                        x={c.cx - c.bw / 2 - pad}
                        y={c.cy - c.bh / 2 - pad}
                        width={c.bw + pad * 2}
                        height={c.bh + pad * 2}
                        fill="none"
                        stroke={C.mag}
                        strokeWidth={Math.max(1.5, cell * 0.02)}
                        strokeDasharray={`${cell * 0.12} ${cell * 0.08}`}
                        pointerEvents="none"
                      />
                    );
                  })()}
              </g>
            </svg>
          </div>
        </div>
      </main>
    </div>
  );
}
