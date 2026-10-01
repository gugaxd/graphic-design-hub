import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  BoxGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  DoubleSide,
  EquirectangularReflectionMapping,
  ExtrudeGeometry,
  HemisphereLight,
  IcosahedronGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PMREMGenerator,
  Path,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Raycaster,
  RingGeometry,
  SRGBColorSpace,
  Scene,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  TetrahedronGeometry,
  TorusGeometry,
  TorusKnotGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { MONO, SANS } from "./theme.js";
import { SOFTPOINT_SVG } from "./softpoint.js";

/* Servido pelo hub em /3d-maker/ — o menu é a raiz do mesmo site. */
const HUB_URL = "/";

/* ============================================================
   3d maker — gerador de formas 3D
   Família: gri.d.maker · bento maker · gradient maker · logo sizer · Mask Studio
   ------------------------------------------------------------
   Tokens vindos do esqueleto de padrao-visual-ferramentas.
   Substituir pelo tokens.css real do gri.d.maker quando existir.
   ============================================================ */

/* ------------------------------------------------------------------ */
/* Paleta — tinta ciano-escura + acentos de registro CMYK               */
/* Copiada do gri.d.maker (src/GridMaker.jsx). Fonte da verdade.        */
/* ------------------------------------------------------------------ */
const TEMAS = {
  escuro: {
    ink: "#0A0A0A", ink2: "#101010", ink3: "#1C1C1C", line: "#2B2B2B",
    text: "#E8E8E8", muted: "#8C8C8C", mag: "#E0218A", cyan: "#00A9CE",
    stage: "#0A0A0A", stageAlt: "#141414", sombra: "rgba(0,0,0,.6)",
    sobreCyan: "#08181C", sobreMag: "#FFFFFF", magBtn: "#D01A7C", magHover: "#B81068",
  },
  claro: {
    ink: "#E9E9E9", ink2: "#F4F4F4", ink3: "#E1E1E1", line: "#D2D2D2",
    text: "#161616", muted: "#6B6B6B", mag: "#C4136E", cyan: "#00768F",
    stage: "#ECECEC", stageAlt: "#E2E2E2", sombra: "rgba(0,0,0,.13)",
    sobreCyan: "#FFFFFF", sobreMag: "#FFFFFF", magBtn: "#C4136E", magHover: "#9C0E54",
  },
};

/* No gri.d.maker a Host Grotesk SemiBold entra como subconjunto base64 com os
   glifos de "gri.d.maker". "3d maker" precisa de outro subconjunto (o "3" não
   está lá), então aqui a fonte vem da Google Fonts. Ao subir o repositório,
   gere o subconjunto de "3d maker" e troque por @font-face embutido. */
const FONTE_MARCA = `@import url('https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@600&display=swap');`;

const css = (C) => `
${FONTE_MARCA}
.app{--acento:${C.cyan};display:flex;height:100vh;min-height:640px;background:${C.ink};color:${C.text};
  font-family:${SANS};font-size:13px;overflow:hidden}
.app *{box-sizing:border-box}

/* ---- cabeçalho ---- */
.brand{padding:18px 18px 14px;border-bottom:1px solid ${C.line};position:sticky;top:0;
  background:${C.ink2};z-index:5;display:flex;align-items:center;justify-content:space-between;gap:10px}
.marca{display:flex;align-items:center;gap:11px;min-width:0;text-decoration:none}
        a.marca:focus-visible{outline:2px solid ${C.cyan};outline-offset:4px}
        .acoes{display:flex;gap:6px;flex:none}
.marca .logo{height:20px;width:auto;display:block;color:${C.text};flex:none}
.marca .risco{width:1px;align-self:stretch;margin:1px 0;background:${C.line};flex:none}
.brand h1{margin:0;font-family:"Host Grotesk",${SANS};font-size:19px;font-weight:600;
  letter-spacing:-.005em;text-transform:lowercase;line-height:1;color:${C.text}}
.tema{flex:0 0 auto;display:block;width:30px;height:30px;padding:6px;background:${C.ink};
  border:1px solid ${C.line};border-radius:2px;cursor:pointer;color:${C.muted}}
.tema:hover{background:${C.cyan};border-color:${C.cyan};color:${C.sobreCyan}}
.tema:focus-visible{outline:2px solid ${C.cyan};outline-offset:1px}
.tema svg{width:100%;height:100%;display:block;fill:none;stroke:currentColor;stroke-width:1.7}

/* ---- painel ---- */
/* Cabeçalho: o nome encolhe antes de encostar nos botões, e a barra de rolagem
   do painel é fina para não roubar largura do nome. */
.brand .marca{gap:9px}
div.brand{gap:8px}
.brand .acoes{gap:4px}
.marca{flex:0 1 auto;min-width:0}
.brand h1{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.panel{scrollbar-width:thin;scrollbar-color:${C.line} transparent}
.panel::-webkit-scrollbar{width:8px}
.panel::-webkit-scrollbar-thumb{background:${C.line};border-radius:2px}
.panel::-webkit-scrollbar-track{background:transparent}

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
  border-radius:50%;background:var(--accent,var(--acento));cursor:grab;border:2px solid ${C.ink2}}
.ctl-range::-moz-range-thumb{width:13px;height:13px;border-radius:50%;
  background:var(--accent,var(--acento));cursor:grab;border:2px solid ${C.ink2}}
.ctl-range:focus-visible{outline:2px solid ${C.cyan};outline-offset:4px}
.ctl-range:disabled{opacity:.4;cursor:not-allowed}

.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
select,.btn,.file{width:100%;background:${C.ink};border:1px solid ${C.line};color:${C.text};
  font-family:${MONO};font-size:11px;padding:7px 8px;border-radius:2px;cursor:pointer}
select:focus-visible,.btn:focus-visible{outline:2px solid ${C.cyan};outline-offset:1px}
.btn:hover:not(:disabled){background:${C.cyan};border-color:${C.cyan};color:${C.sobreCyan}}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn-mag{background:${C.magBtn};border-color:${C.magBtn};color:${C.sobreMag};font-weight:600;
  letter-spacing:.05em}
.btn-mag:hover:not(:disabled){background:${C.magHover};border-color:${C.magHover};color:${C.sobreMag}}
.btn[data-on="1"]{border-color:${C.mag};background:${C.ink3};color:${C.text}}

.row{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.row:last-child{margin-bottom:0}
.row label{flex:1;font-size:11.5px}
input[type=color]{width:34px;height:24px;padding:0;border:1px solid ${C.line};
  background:${C.ink};border-radius:2px;cursor:pointer}
input[type=text]{flex:1;background:${C.ink};border:1px solid ${C.line};color:${C.text};
  font-family:${MONO};font-size:11px;padding:5px 6px;border-radius:2px}

/* ---- lista de objetos ---- */
.obj{display:flex;align-items:center;gap:7px;background:${C.ink};border:1px solid ${C.line};
  border-radius:2px;padding:5px 7px;margin-bottom:5px}
.obj[data-sel="1"]{border-color:${C.mag};background:${C.ink3}}
.obj[data-vis="0"] .obj-nome{color:${C.muted};text-decoration:line-through}
.obj button{background:none;border:0;padding:0;cursor:pointer;color:${C.muted};display:flex}
.obj button:hover{color:${C.cyan}}
.obj .obj-nome{flex:1;min-width:0;text-align:left;font-size:11.5px;color:${C.text};
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.obj .sw{width:9px;height:9px;border-radius:2px;flex:none;border:1px solid ${C.line}}
.obj svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.5}

.solta{border:1px dashed ${C.line};border-radius:2px;padding:12px;text-align:center;
  font-family:${MONO};font-size:10px;letter-spacing:.03em;color:${C.muted};cursor:pointer}
.solta[data-over="1"]{border-color:${C.cyan};color:${C.cyan}}

/* ---- palco ---- */
.stage{flex:1;display:flex;flex-direction:column;min-width:0}
.bar{display:flex;align-items:center;gap:14px;padding:0 20px;height:46px;
  border-bottom:1px solid ${C.line};font-family:${MONO};font-size:10.5px;color:${C.muted};
  letter-spacing:.06em;flex:0 0 46px}
.bar b{color:${C.text};font-weight:500}
.bar .sp{flex:1}
.msg{color:${C.cyan}}
.rec{color:${C.mag}}

.view{flex:1;position:relative;display:flex;align-items:center;justify-content:center;
  padding:34px;overflow:hidden;
  background:
    linear-gradient(45deg,${C.stageAlt} 25%,transparent 25%,transparent 75%,${C.stageAlt} 75%),
    linear-gradient(45deg,${C.stageAlt} 25%,transparent 25%,transparent 75%,${C.stageAlt} 75%);
  background-size:16px 16px;background-position:0 0,8px 8px;background-color:${C.stage}}
.frame{position:relative;width:100%;height:100%;box-shadow:0 0 0 1px ${C.line},0 20px 60px ${C.sombra}}
.frame canvas{display:block;width:100%;height:100%;cursor:grab}
.frame canvas:active{cursor:grabbing}
.reg{position:absolute;width:13px;height:13px;pointer-events:none}
.reg::before,.reg::after{content:"";position:absolute;background:${C.cyan};opacity:.85}
.reg::before{left:6px;top:0;width:1px;height:13px}
.reg::after{top:6px;left:0;height:1px;width:13px}
.reg.tl{left:-19px;top:-19px}.reg.tr{right:-19px;top:-19px}
.reg.bl{left:-19px;bottom:-19px}.reg.br{right:-19px;bottom:-19px}

/* ---- linha do tempo ---- */
.tl{flex:0 0 auto;border-top:1px solid ${C.line};background:${C.ink2};padding:12px 20px;
  display:flex;align-items:center;gap:12px}
.tl .btn{width:auto;flex:none}
.trilha{position:relative;flex:1;height:30px;background:${C.ink};border:1px solid ${C.line};
  border-radius:2px;cursor:pointer}
.agulha{position:absolute;top:-1px;bottom:-1px;width:1px;background:${C.cyan};pointer-events:none}
.agulha::before{content:"";position:absolute;top:-1px;left:-3px;width:7px;height:4px;background:${C.cyan}}
.kf{position:absolute;top:50%;width:9px;height:9px;margin:-5px 0 0 -5px;background:${C.muted};
  border:1px solid ${C.ink};transform:rotate(45deg);border-radius:1px;cursor:ew-resize}
.kf[data-on="1"]{background:${C.mag}}
.tl .conta{font-family:${MONO};font-size:10px;letter-spacing:.04em;color:${C.muted};flex:none}

.hint{font-family:${MONO};font-size:10px;color:${C.muted};line-height:1.6;
  margin:10px 0 0;letter-spacing:.03em}
.hint code{font-size:9.5px;color:${C.text};word-break:break-all}
.hint b{color:${C.text};font-weight:500}

/* ---- rodapé ---- */
.rodape{padding:16px 18px;border-top:1px solid ${C.line};background:${C.ink2};
  display:flex;flex-wrap:wrap;gap:8px 16px}
.rodape a{font-family:${MONO};font-size:10.5px;letter-spacing:.04em;color:${C.muted};
  text-decoration:none}
.rodape a:hover{color:${C.cyan}}
.rodape a:focus-visible{outline:2px solid ${C.cyan};outline-offset:2px}

@media (max-width:860px){
  .app{flex-direction:column;height:auto;min-height:0}
  .panel{width:100%;flex:none;max-height:none;border-right:none;border-bottom:1px solid ${C.line}}
  .view{min-height:56vh}
}
@media (prefers-reduced-motion:reduce){*{transition:none !important;animation:none !important}}
`;

/* ---------- utilidades ---------- */
const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

const SHAPES = [
  ["torusKnot", "nó de toro"],
  ["box", "cubo"],
  ["sphere", "esfera"],
  ["cylinder", "cilindro"],
  ["cone", "cone"],
  ["torus", "toro"],
  ["icosahedron", "icosaedro"],
  ["octahedron", "octaedro"],
  ["dodecahedron", "dodecaedro"],
  ["tetrahedron", "tetraedro"],
  ["ring", "anel"],
  ["plane", "plano"],
  ["svg", "svg importado"],
];
const SHAPE_LABEL = Object.fromEntries(SHAPES);

const MATERIALS = [
  ["matte", "fosco"],
  ["glossy", "brilhante"],
  ["metal", "metal"],
  ["glass", "vidro"],
  ["flat", "chapado"],
  ["wire", "arame"],
];

/* ---------- parser de SVG (path + formas básicas) ---------- */
function mulM(m1, m2) {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}
function parseTransform(str) {
  let m = [1, 0, 0, 1, 0, 0];
  if (!str) return m;
  const re = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;
  let r;
  while ((r = re.exec(str))) {
    const v = r[2].split(/[\s,]+/).filter((s) => s.length).map(Number);
    let t = [1, 0, 0, 1, 0, 0];
    if (r[1] === "matrix") t = [v[0], v[1], v[2], v[3], v[4], v[5]];
    else if (r[1] === "translate") t = [1, 0, 0, 1, v[0] || 0, v[1] || 0];
    else if (r[1] === "scale") t = [v[0] ?? 1, 0, 0, v[1] ?? v[0] ?? 1, 0, 0];
    else if (r[1] === "rotate") {
      const a = ((v[0] || 0) * Math.PI) / 180, cx = v[1] || 0, cy = v[2] || 0;
      const rot = [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0];
      t = mulM(mulM([1, 0, 0, 1, cx, cy], rot), [1, 0, 0, 1, -cx, -cy]);
    } else if (r[1] === "skewX") t = [1, 0, Math.tan(((v[0] || 0) * Math.PI) / 180), 1, 0, 0];
    else if (r[1] === "skewY") t = [1, Math.tan(((v[0] || 0) * Math.PI) / 180), 0, 1, 0, 0];
    m = mulM(m, t);
  }
  return m;
}
const applyM = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

function sampleCubic(p0, p1, p2, p3, n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}
function sampleQuad(p0, p1, p2, n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([
      u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
      u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
    ]);
  }
  return out;
}
function arcPoints(x1, y1, rx, ry, phiDeg, fa, fs, x2, y2, seg) {
  if (!rx || !ry) return [[x2, y2]];
  const phi = (phiDeg * Math.PI) / 180;
  const cosp = Math.cos(phi), sinp = Math.sin(phi);
  const dx2 = (x1 - x2) / 2, dy2 = (y1 - y2) / 2;
  const x1p = cosp * dx2 + sinp * dy2, y1p = -sinp * dx2 + cosp * dy2;
  rx = Math.abs(rx); ry = Math.abs(ry);
  const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lam > 1) { const s = Math.sqrt(lam); rx *= s; ry *= s; }
  const sign = fa !== fs ? 1 : -1;
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const co = sign * Math.sqrt(Math.max(0, num / (den || 1)));
  const cxp = (co * rx * y1p) / ry, cyp = (-co * ry * x1p) / rx;
  const cx = cosp * cxp - sinp * cyp + (x1 + x2) / 2;
  const cy = sinp * cxp + cosp * cyp + (y1 + y2) / 2;
  const ang = (ux, uy, vx, vy) => {
    const len = Math.hypot(ux, uy) * Math.hypot(vx, vy) || 1;
    let a = Math.acos(clamp((ux * vx + uy * vy) / len, -1, 1));
    if (ux * vy - uy * vx < 0) a = -a;
    return a;
  };
  const ux = (x1p - cxp) / rx, uy = (y1p - cyp) / ry;
  const vx = (-x1p - cxp) / rx, vy = (-y1p - cyp) / ry;
  const t1 = ang(1, 0, ux, uy);
  let dt = ang(ux, uy, vx, vy);
  if (!fs && dt > 0) dt -= 2 * Math.PI;
  if (fs && dt < 0) dt += 2 * Math.PI;
  const n = Math.max(4, Math.ceil((Math.abs(dt) / (Math.PI / 2)) * seg));
  const out = [];
  for (let k = 1; k <= n; k++) {
    const t = t1 + (dt * k) / n;
    out.push([
      cosp * rx * Math.cos(t) - sinp * ry * Math.sin(t) + cx,
      sinp * rx * Math.cos(t) + cosp * ry * Math.sin(t) + cy,
    ]);
  }
  return out;
}

function parsePathD(d, q) {
  const tokens = d.match(/[a-df-zA-DF-Z]|-?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || [];
  const subs = [];
  let cur = null, x = 0, y = 0, sx = 0, sy = 0, cmd = "", pcx = 0, pcy = 0, prev = "";
  let i = 0;
  const num = () => parseFloat(tokens[i++]);
  const push = (pts) => { for (const p of pts) cur.push(p); };
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    else if (cmd === "M") cmd = "L";
    else if (cmd === "m") cmd = "l";
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    if (C === "M") {
      const nx = num(), ny = num();
      x = rel ? x + nx : nx; y = rel ? y + ny : ny;
      cur = [[x, y]]; subs.push(cur); sx = x; sy = y;
    } else if (C === "L") {
      const nx = num(), ny = num();
      x = rel ? x + nx : nx; y = rel ? y + ny : ny;
      if (cur) cur.push([x, y]);
    } else if (C === "H") {
      const nx = num(); x = rel ? x + nx : nx; if (cur) cur.push([x, y]);
    } else if (C === "V") {
      const ny = num(); y = rel ? y + ny : ny; if (cur) cur.push([x, y]);
    } else if (C === "C" || C === "S") {
      let c1x, c1y;
      if (C === "C") { const a = num(), b = num(); c1x = rel ? x + a : a; c1y = rel ? y + b : b; }
      else { const m = "CS".includes(prev) ? 1 : 0; c1x = m ? 2 * x - pcx : x; c1y = m ? 2 * y - pcy : y; }
      const a2 = num(), b2 = num();
      const c2x = rel ? x + a2 : a2, c2y = rel ? y + b2 : b2;
      const a3 = num(), b3 = num();
      const ex = rel ? x + a3 : a3, ey = rel ? y + b3 : b3;
      if (cur) push(sampleCubic([x, y], [c1x, c1y], [c2x, c2y], [ex, ey], q));
      pcx = c2x; pcy = c2y; x = ex; y = ey;
    } else if (C === "Q" || C === "T") {
      let cx1, cy1;
      if (C === "Q") { const a = num(), b = num(); cx1 = rel ? x + a : a; cy1 = rel ? y + b : b; }
      else { const m = "QT".includes(prev) ? 1 : 0; cx1 = m ? 2 * x - pcx : x; cy1 = m ? 2 * y - pcy : y; }
      const a2 = num(), b2 = num();
      const ex = rel ? x + a2 : a2, ey = rel ? y + b2 : b2;
      if (cur) push(sampleQuad([x, y], [cx1, cy1], [ex, ey], Math.max(4, q >> 1)));
      pcx = cx1; pcy = cy1; x = ex; y = ey;
    } else if (C === "A") {
      const rx = num(), ry = num(), rot = num(), fa = num(), fs = num();
      const a = num(), b = num();
      const ex = rel ? x + a : a, ey = rel ? y + b : b;
      if (cur) push(arcPoints(x, y, rx, ry, rot, !!fa, !!fs, ex, ey, Math.max(4, q >> 1)));
      x = ex; y = ey;
    } else if (C === "Z") {
      if (cur && cur.length) cur.push([sx, sy]);
      x = sx; y = sy;
    } else { i++; continue; }
    prev = C;
  }
  return subs.filter((s) => s.length > 2);
}

function elementSubpaths(el, q) {
  const tag = el.tagName.toLowerCase();
  const n = (a, dflt = 0) => {
    const v = parseFloat(el.getAttribute(a));
    return Number.isFinite(v) ? v : dflt;
  };
  if (tag === "path") return parsePathD(el.getAttribute("d") || "", q);
  if (tag === "rect") {
    const x = n("x"), y = n("y"), w = n("width"), h = n("height");
    let rx = n("rx", 0), ry = n("ry", 0);
    if (!w || !h) return [];
    if (rx && !ry) ry = rx; if (ry && !rx) rx = ry;
    rx = Math.min(rx, w / 2); ry = Math.min(ry, h / 2);
    if (!rx && !ry) return [[[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]];
    const s = Math.max(4, q >> 1), pts = [];
    const corner = (cx, cy, a0) => {
      for (let k = 0; k <= s; k++) {
        const a = a0 + (Math.PI / 2) * (k / s);
        pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
      }
    };
    corner(x + w - rx, y + ry, -Math.PI / 2);
    corner(x + w - rx, y + h - ry, 0);
    corner(x + rx, y + h - ry, Math.PI / 2);
    corner(x + rx, y + ry, Math.PI);
    pts.push(pts[0]);
    return [pts];
  }
  if (tag === "circle" || tag === "ellipse") {
    const cx = n("cx"), cy = n("cy");
    const rx = tag === "circle" ? n("r") : n("rx");
    const ry = tag === "circle" ? n("r") : n("ry");
    if (!rx || !ry) return [];
    const s = Math.max(16, q * 2), pts = [];
    for (let k = 0; k <= s; k++) {
      const a = (k / s) * Math.PI * 2;
      pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    }
    return [pts];
  }
  if (tag === "polygon" || tag === "polyline") {
    const raw = (el.getAttribute("points") || "").trim().split(/[\s,]+/).map(Number);
    const pts = [];
    for (let k = 0; k + 1 < raw.length; k += 2) pts.push([raw[k], raw[k + 1]]);
    if (pts.length < 3) return [];
    if (tag === "polygon") pts.push(pts[0]);
    return [pts];
  }
  return [];
}

const signedArea = (p) => {
  let a = 0;
  for (let i = 0; i < p.length - 1; i++) a += p[i][0] * p[i + 1][1] - p[i + 1][0] * p[i][1];
  return a / 2;
};
function pointInPoly(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi + 1e-12) + xi) inside = !inside;
  }
  return inside;
}

/** Converte texto SVG em Shape[] normalizados (centrados, altura ~2, Y para cima). */
function svgToShapes(text, quality = 12) {
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  if (doc.querySelector("parsererror")) throw new Error("SVG inválido.");
  const root = doc.documentElement;
  const subs = [];
  const walk = (node, m) => {
    for (const el of Array.from(node.children || [])) {
      const tag = el.tagName.toLowerCase();
      const lm = mulM(m, parseTransform(el.getAttribute("transform")));
      if (tag === "g" || tag === "svg") { walk(el, lm); continue; }
      if (el.getAttribute("fill") === "none" || el.getAttribute("display") === "none") continue;
      for (const sp of elementSubpaths(el, quality)) subs.push(sp.map(([x, y]) => applyM(lm, x, y)));
    }
  };
  walk(root, [1, 0, 0, 1, 0, 0]);
  if (!subs.length) throw new Error("Nenhum contorno preenchível encontrado no SVG.");

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const sp of subs) for (const [x, y] of sp) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  const w = maxX - minX || 1, h = maxY - minY || 1;
  const k = 2 / Math.max(w, h);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const norm = subs.map((sp) => sp.map(([x, y]) => [(x - cx) * k, -(y - cy) * k]));

  const meta = norm.map((p) => ({ p, a: Math.abs(signedArea(p)) })).sort((u, v) => v.a - u.a);
  const outers = [];
  for (const m of meta) {
    const host = outers.find((o) => pointInPoly(m.p[0], o.p) && o.a > m.a);
    if (host) host.holes.push(m.p);
    else outers.push({ p: m.p, a: m.a, holes: [] });
  }
  return outers.map((o) => {
    const shape = new Shape(o.p.map(([x, y]) => new Vector2(x, y)));
    for (const hl of o.holes) shape.holes.push(new Path(hl.map(([x, y]) => new Vector2(x, y))));
    return shape;
  });
}

/* ---------- geometria ---------- */
function buildGeometry(o) {
  const d = o.detail / 100, th = 0.08 + (o.thickness / 100) * 0.62;
  const s = (min, max) => Math.max(min, Math.round(min + (max - min) * d));
  let g;
  switch (o.type) {
    case "box": g = new BoxGeometry(1.5, 1.5, 1.5, s(1, 8), s(1, 8), s(1, 8)); break;
    case "sphere": g = new SphereGeometry(1, s(4, 72), s(3, 48)); break;
    case "cylinder": g = new CylinderGeometry(th * 1.6, th * 1.6, 2, s(3, 72), 1); break;
    case "cone": g = new ConeGeometry(th * 1.8, 2.2, s(3, 72), 1); break;
    case "torus": g = new TorusGeometry(1, th * 0.8, s(4, 40), s(6, 120)); break;
    case "torusKnot": g = new TorusKnotGeometry(0.85, th * 0.5, s(24, 260), s(4, 24)); break;
    case "icosahedron": g = new IcosahedronGeometry(1.15, s(0, 3)); break;
    case "octahedron": g = new OctahedronGeometry(1.25, s(0, 3)); break;
    case "dodecahedron": g = new DodecahedronGeometry(1.15, s(0, 3)); break;
    case "tetrahedron": g = new TetrahedronGeometry(1.4, s(0, 3)); break;
    case "ring": g = new RingGeometry(1 - th, 1.2, s(6, 120), 1); break;
    case "plane": g = new PlaneGeometry(2, 2, s(1, 24), s(1, 24)); break;
    case "svg": {
      if (!o.svgShapes || !o.svgShapes.length) return new BoxGeometry(0.01, 0.01, 0.01);
      if (o.svgMode === "flat") g = new ShapeGeometry(o.svgShapes, s(2, 24));
      else {
        const depth = 0.02 + (o.depth / 100) * 1.2;
        const bev = (o.bevel / 100) * 0.06;
        g = new ExtrudeGeometry(o.svgShapes, {
          depth, curveSegments: s(2, 16),
          bevelEnabled: bev > 0.0005, bevelThickness: bev, bevelSize: bev, bevelSegments: Math.max(1, s(1, 5)),
        });
      }
      break;
    }
    default: g = new BoxGeometry(1.5, 1.5, 1.5);
  }
  g.center();
  g.computeVertexNormals();
  return g;
}

/**
 * Translucência de vidro: em vez de sumir por igual, o alpha varia por Fresnel —
 * o miolo fica atravessável e a silhueta, o chanfro e as curvas de fuga continuam
 * densos. É o que faz o objeto ler como material, não como fantasma.
 */
const FRESNEL_POWER = 2.4;
function attachFresnelAlpha(mat) {
  const uniforms = { uAlphaBase: { value: 1 }, uFresPow: { value: FRESNEL_POWER } };
  mat.userData.uniforms = uniforms;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uAlphaBase = uniforms.uAlphaBase;
    shader.uniforms.uFresPow = uniforms.uFresPow;
    shader.fragmentShader =
      "uniform float uAlphaBase;\nuniform float uFresPow;\n" +
      shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
{
  vec3 fN = normalize( vNormal );
  vec3 fV = normalize( vViewPosition );
  float fres = pow( 1.0 - abs( dot( fN, fV ) ), uFresPow );
  gl_FragColor.a = clamp( mix( uAlphaBase, 1.0, fres ), 0.0, 1.0 );
}`
      );
  };
  mat.customProgramCacheKey = () => "fresnel-alpha";
  return mat;
}

/**
 * Estúdio só do vidro: fundo cinza com janelas de softbox. É o reflexo dessas janelas,
 * curvado pela forma, que faz o objeto ler como vidro — um gradiente liso não basta.
 * Os outros acabamentos continuam no ambiente da cena, então nada muda neles.
 */
let GLASS_ENV = null;
function studioCanvas() {
  const W = 1024, H = 512;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#5f6268"); g.addColorStop(0.48, "#3e4045");
  g.addColorStop(0.52, "#232427"); g.addColorStop(1, "#0e0e10");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // janela de caixilho: retângulo claro cortado por montantes escuros
  const janela = (u0, u1, v0, v1, cols, rows, luz = "#ffffff") => {
    const x = u0 * W, y = v0 * H, w = (u1 - u0) * W, h = (v1 - v0) * H, bar = Math.max(4, w * 0.035);
    ctx.fillStyle = luz; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#2a2b2f";
    for (let i = 1; i < cols; i++) ctx.fillRect(x + (w * i) / cols - bar / 2, y, bar, h);
    for (let j = 1; j < rows; j++) ctx.fillRect(x, y + (h * j) / rows - bar / 2, w, bar);
  };
  janela(0.6, 0.78, 0.06, 0.3, 2, 2);
  janela(0.84, 0.9, 0.18, 0.46, 1, 2, "#e8ecf4");
  janela(0.08, 0.2, 0.22, 0.42, 1, 1, "#dfe3ea");
  janela(0.34, 0.42, 0.06, 0.2, 1, 1, "#f2f2f2");
  return c;
}

/**
 * Vidro colorido. A base física só entrega o especular (reflexo do estúdio, brilho e
 * verniz): a cor difusa é preta. O corpo é montado no shader — miolo claro e
 * atravessável, borda funda e densa, e uma faixa de luz por dentro da silhueta do
 * lado oposto à luz principal, que é a luz refratada que o vidro maciço concentra.
 * A cor sai pré-multiplicada pelo alpha, então funciona sobre fundo transparente.
 */
const GLASS_FRAG = `{
  vec3 gN = normalize( normal );
  vec3 gV = normalize( vViewPosition );
  float edge = 1.0 - clamp( abs( dot( gN, gV ) ), 0.0, 1.0 );
  float fres = pow( edge, 2.2 );
  vec3 claro = mix( uTint, vec3( 1.0 ), 0.12 );
  vec3 fundo = uTint * uTint * 0.7;
  vec3 corpo = mix( claro, fundo, smoothstep( 0.0, 0.85, edge ) );
  float aCorpo = mix( mix( 0.92, 0.2, uClarity ), 0.97, fres );
  if ( !gl_FrontFacing ) aCorpo *= 0.4;
  float avesso = 0.4;
  #if NUM_DIR_LIGHTS > 0
    avesso = clamp( 0.2 - dot( gN, directionalLights[ 0 ].direction ) * 1.4, 0.0, 1.0 );
  #endif
  float faixa = smoothstep( 0.3, 0.68, edge ) * ( 1.0 - smoothstep( 0.82, 0.97, edge ) );
  vec3 brilho = mix( uTint, vec3( 1.0 ), 0.65 ) * faixa * avesso * ( gl_FrontFacing ? 1.6 : 0.0 );
  // só o reflexo do ambiente: o ponto de luz direta deixaria o vidro com cara de plástico
  vec3 spec = 1.0 - exp( -reflectedLight.indirectSpecular );
  float a = clamp( aCorpo + max( spec.r, max( spec.g, spec.b ) ) + max( brilho.r, max( brilho.g, brilho.b ) ) * 0.5, 0.0, 1.0 );
  gl_FragColor = vec4( ( corpo * aCorpo + brilho + spec ) / max( a, 1e-4 ), a );
}`;
function buildGlass(o, rough) {
  const mat = new MeshPhysicalMaterial({
    color: 0x000000, metalness: 0, roughness: clamp(rough * 0.4, 0.02, 1), ior: 1.5,
    envMap: GLASS_ENV, envMapIntensity: 9,
    side: DoubleSide, transparent: true, depthWrite: false,
  });
  const uniforms = { uTint: { value: new Color(o.color) }, uClarity: { value: 0.7 } };
  mat.userData.uniforms = uniforms;
  mat.userData.glass = true;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTint = uniforms.uTint;
    shader.uniforms.uClarity = uniforms.uClarity;
    shader.fragmentShader =
      "uniform vec3 uTint;\nuniform float uClarity;\n" +
      shader.fragmentShader.replace("#include <opaque_fragment>", GLASS_FRAG);
  };
  mat.customProgramCacheKey = () => "glass";
  return mat;
}

function buildMaterial(o) {
  const color = new Color(o.color);
  const rough = o.roughness / 100;
  const common = { color, side: DoubleSide, transparent: false, opacity: 1 };
  switch (o.material) {
    case "flat": return new MeshBasicMaterial(common);
    case "wire": return new MeshBasicMaterial({ ...common, wireframe: true });
    case "metal":
      return attachFresnelAlpha(new MeshStandardMaterial({ ...common, metalness: 1, roughness: clamp(rough * 0.6, 0.04, 1) }));
    case "glossy":
      return attachFresnelAlpha(new MeshStandardMaterial({ ...common, metalness: 0.1, roughness: clamp(rough * 0.5, 0.02, 1) }));
    case "glass":
      return buildGlass(o, rough);
    default:
      return attachFresnelAlpha(new MeshStandardMaterial({ ...common, metalness: 0, roughness: clamp(0.35 + rough * 0.65, 0, 1) }));
  }
}

/* ---------- keyframes ---------- */
const snapshot = (o, t) => ({
  t: round(t, 3),
  position: [...o.position], rotation: [...o.rotation], scale: [...o.scale], translucency: o.translucency,
});
const smooth = (t) => t * t * (3 - 2 * t);

function sampleAt(o, t, easing) {
  const kf = o.keyframes;
  if (!kf.length) return { position: o.position, rotation: o.rotation, scale: o.scale, translucency: o.translucency };
  if (kf.length === 1 || t <= kf[0].t) return kf[0];
  if (t >= kf[kf.length - 1].t) return kf[kf.length - 1];
  let i = 0;
  while (i < kf.length - 1 && kf[i + 1].t < t) i++;
  const a = kf[i], b = kf[i + 1];
  let u = (t - a.t) / (b.t - a.t || 1);
  if (easing === "suave") u = smooth(u);
  return {
    position: a.position.map((v, k) => lerp(v, b.position[k], u)),
    rotation: a.rotation.map((v, k) => lerp(v, b.rotation[k], u)),
    scale: a.scale.map((v, k) => lerp(v, b.scale[k], u)),
    translucency: lerp(a.translucency, b.translucency, u),
  };
}

const download = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

/* ---------- componentes de UI (iguais aos do gri.d.maker) ---------- */
function Slider({ label, value, onChange, min = 0, max = 100, step = 1, unit = "", accent, disabled }) {
  return (
    <div className="ctl">
      <div className="ctl-head">
        <span className="ctl-label">{label}</span>
        <input className="ctl-num" type="number" value={round(value, 2)} min={min} max={max} step={step}
          disabled={disabled}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!Number.isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
          }} />
        <span className="ctl-unit">{unit}</span>
      </div>
      <input className="ctl-range" type="range" min={min} max={max} step={step} value={value}
        disabled={disabled} style={{ "--accent": accent || "var(--acento)" }}
        onChange={(e) => onChange(parseFloat(e.target.value))} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="ctl">
      <div className="ctl-label" style={{ marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function Eixos({ label, values, step, unit = "", onChange }) {
  return (
    <div className="ctl">
      <div className="ctl-head">
        <span className="ctl-label">{label}</span>
        <span className="ctl-unit" style={{ width: "auto" }}>x y z {unit}</span>
      </div>
      <div className="grid3">
        {["x", "y", "z"].map((ax, i) => (
          <input key={ax} className="ctl-num" style={{ width: "100%" }} type="number"
            aria-label={`${label} ${ax}`} step={step} value={round(values[i], 3)}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              const next = [...values]; next[i] = Number.isFinite(v) ? v : 0;
              onChange(next);
            }} />
        ))}
      </div>
    </div>
  );
}

const IconEye = ({ off }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M1 8s2.6-4.2 7-4.2S15 8 15 8s-2.6 4.2-7 4.2S1 8 1 8Z" />
    <circle cx="8" cy="8" r="1.9" />
    {off && <path d="M2.5 13.5 13.5 2.5" />}
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 4h10M6.5 4V2.6h3V4M4.4 4l.6 9h6l.6-9" />
  </svg>
);

/* ============================================================ */
export default function ThreeDMaker() {
  const [objects, setObjects] = useState(() => [makeObject("torusKnot")]);
  const [selectedId, setSelectedId] = useState(null);
  const [tema, setTema] = useState("escuro");
  const C = TEMAS[tema];

  const [duration, setDuration] = useState(4);
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [easing, setEasing] = useState("suave");
  const [fps, setFps] = useState(30);

  const [light, setLight] = useState(70);
  const [ambient, setAmbient] = useState(45);
  const [lightAngle, setLightAngle] = useState(35);
  const [expW, setExpW] = useState(1920);
  const [expH, setExpH] = useState(1080);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const sel = objects.find((o) => o.id === selectedId) || objects[0] || null;

  /* refs three */
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const meshesRef = useRef(new Map());
  const stateRef = useRef({});
  const orbitRef = useRef({ theta: 0.75, phi: 1.15, radius: 6.2, target: new Vector3() });
  const lightRef = useRef(null);
  const ambRef = useRef(null);
  const recRef = useRef(null);
  const fileRef = useRef(null);
  const kfDragRef = useRef(null);

  stateRef.current = { objects, playhead, playing, duration, easing, recording, selectedId };

  function makeObject(type) {
    return {
      id: uid(), type, name: SHAPE_LABEL[type], visible: true,
      color: "#e9e6e1", material: "matte", roughness: 55,
      detail: 55, thickness: 30, depth: 30, bevel: 12,
      svgShapes: null, svgName: "", svgMode: "extrude", svgKey: "",
      position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], translucency: 0,
      keyframes: [],
    };
  }

  /* ---- init three ---- */
  useEffect(() => {
    const mount = mountRef.current;
    const renderer = new WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    if ("outputColorSpace" in renderer) renderer.outputColorSpace = SRGBColorSpace;
    
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new Scene();
    sceneRef.current = scene;
    const camera = new PerspectiveCamera(38, 1, 0.1, 200);
    cameraRef.current = camera;

    const amb = new HemisphereLight(0xffffff, 0x404048, 0.6);
    scene.add(amb); ambRef.current = amb;
    const key = new DirectionalLight(0xffffff, 1.4);
    scene.add(key); lightRef.current = key;
    const fill = new DirectionalLight(0xbfd4ff, 0.35);
    fill.position.set(-4, 1, -3); scene.add(fill);

    try {
      const c = document.createElement("canvas");
      c.width = 32; c.height = 128;
      const ctx = c.getContext("2d");
      const g = ctx.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, "#ffffff"); g.addColorStop(0.5, "#9aa3ad"); g.addColorStop(1, "#1a1a1d");
      ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 128);
      const tex = new CanvasTexture(c);
      tex.mapping = EquirectangularReflectionMapping;
      const pmrem = new PMREMGenerator(renderer);
      scene.environment = pmrem.fromEquirectangular(tex).texture;
      const studio = new CanvasTexture(studioCanvas());
      studio.mapping = EquirectangularReflectionMapping;
      studio.colorSpace = SRGBColorSpace;
      GLASS_ENV = pmrem.fromEquirectangular(studio).texture;
      tex.dispose(); studio.dispose(); pmrem.dispose();
    } catch (e) { /* sem env map, luzes bastam */ }

    const resize = () => {
      const w = mount.clientWidth || 1, h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let raf, last = performance.now();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = (now - last) / 1000; last = now;
      const st = stateRef.current;

      if (st.playing || st.recording) {
        let t = st.playhead + dt;
        if (t >= st.duration) t = st.recording ? st.duration : t % st.duration;
        stateRef.current.playhead = t;
        setPlayhead(t);
      }

      const o = orbitRef.current;
      camera.position.set(
        o.target.x + o.radius * Math.sin(o.phi) * Math.sin(o.theta),
        o.target.y + o.radius * Math.cos(o.phi),
        o.target.z + o.radius * Math.sin(o.phi) * Math.cos(o.theta)
      );
      camera.lookAt(o.target);

      const time = stateRef.current.playhead;
      for (const obj of st.objects) {
        const m = meshesRef.current.get(obj.id);
        if (!m) continue;
        m.visible = obj.visible;
        const s = sampleAt(obj, time, st.easing);
        m.position.set(s.position[0], s.position[1], s.position[2]);
        m.rotation.set(
          MathUtils.degToRad(s.rotation[0]),
          MathUtils.degToRad(s.rotation[1]),
          MathUtils.degToRad(s.rotation[2])
        );
        m.scale.set(s.scale[0] || 0.0001, s.scale[1] || 0.0001, s.scale[2] || 0.0001);
        const tl = clamp(s.translucency / 100, 0, 1);
        const u = m.material.userData.uniforms;
        // vidro é sempre transparente; a translucência só abre o miolo
        if (m.material.userData.glass) { u.uClarity.value = tl; continue; }
        const alphaBase = lerp(1, 0.07, tl);
        if (u) {
          u.uAlphaBase.value = alphaBase;
          if ("envMapIntensity" in m.material) m.material.envMapIntensity = 1 + tl * 1.8;
        }
        m.material.opacity = alphaBase;
        const wantTransparent = tl > 0.002;
        if (m.material.transparent !== wantTransparent) {
          m.material.transparent = wantTransparent;
          m.material.needsUpdate = true;
        }
        m.material.depthWrite = !wantTransparent;
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      meshesRef.current.forEach((m) => { m.geometry.dispose(); m.material.dispose(); });
      meshesRef.current.clear();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  /* ---- luzes ---- */
  useEffect(() => {
    if (!lightRef.current) return;
    const a = MathUtils.degToRad(lightAngle);
    lightRef.current.intensity = light / 45;
    lightRef.current.position.set(Math.sin(a) * 5, 3.4, Math.cos(a) * 5);
    ambRef.current.intensity = ambient / 70;
  }, [light, ambient, lightAngle]);

  /* ---- sync objetos → meshes ---- */
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const alive = new Set();
    for (const o of objects) {
      alive.add(o.id);
      let m = meshesRef.current.get(o.id);
      const geoKey = [o.type, o.detail, o.thickness, o.depth, o.bevel, o.svgMode, o.svgKey].join("|");
      const matKey = [o.material, o.color, o.roughness].join("|");
      if (!m) {
        m = new Mesh(buildGeometry(o), buildMaterial(o));
        m.userData = { geoKey, matKey, id: o.id };
        scene.add(m);
        meshesRef.current.set(o.id, m);
      } else {
        if (m.userData.geoKey !== geoKey) {
          m.geometry.dispose();
          m.geometry = buildGeometry(o);
          m.userData.geoKey = geoKey;
        }
        if (m.userData.matKey !== matKey) {
          m.material.dispose();
          m.material = buildMaterial(o);
          m.userData.matKey = matKey;
        }
      }
    }
    for (const [id, m] of meshesRef.current) {
      if (!alive.has(id)) {
        scene.remove(m); m.geometry.dispose(); m.material.dispose();
        meshesRef.current.delete(id);
      }
    }
  }, [objects]);

  /* ---- palco: órbita, seleção e manipulação direta ---- */
  useEffect(() => {
    const el = rendererRef.current?.domElement;
    if (!el) return;

    const rc = new Raycaster();
    const plane = new Plane();
    const camDir = new Vector3();
    const hit = new Vector3();
    let drag = null;

    const ndcOf = (e) => {
      const r = el.getBoundingClientRect();
      return new Vector2(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1
      );
    };

    const meshUnder = (e) => {
      rc.setFromCamera(ndcOf(e), cameraRef.current);
      const alvos = [...meshesRef.current.values()].filter((m) => m.visible);
      const hits = rc.intersectObjects(alvos, false);
      return hits.length ? hits[0].object : null;
    };

    /* Durante a reprodução a transformação é da animação, não do ponteiro:
       arrastar ali brigaria com a timeline. Parado, vale em qualquer tempo —
       com keyframes, a edição vira keyframe no tempo da agulha. */
    const editavel = () => !stateRef.current.playing && !stateRef.current.recording;

    const down = (e) => {
      el.setPointerCapture(e.pointerId);
      drag = null;
      const camera = cameraRef.current;
      const soCamera = e.button === 1 || e.shiftKey;

      if (!soCamera) {
        const mesh = meshUnder(e);
        if (mesh) {
          const obj = stateRef.current.objects.find((o) => o.id === mesh.userData.id);
          setSelectedId(mesh.userData.id);
          if (obj && editavel()) {
            const s = sampleAt(obj, stateRef.current.playhead, stateRef.current.easing);
            if (e.altKey || e.button === 2) {
              drag = { mode: "girar", id: obj.id, x: e.clientX, y: e.clientY,
                       dx: 0, dy: 0, rot0: [...s.rotation] };
              el.style.cursor = "crosshair";
            } else {
              /* plano paralelo à tela passando pela forma: o arrasto vira
                 deslocamento no mundo sem depender da profundidade do clique */
              camera.getWorldDirection(camDir);
              plane.setFromNormalAndCoplanarPoint(camDir, mesh.position);
              rc.setFromCamera(ndcOf(e), camera);
              const ancora = new Vector3();
              if (rc.ray.intersectPlane(plane, ancora)) {
                drag = { mode: "mover", id: obj.id, ancora, pos0: [...s.position] };
                el.style.cursor = "move";
              }
            }
            if (drag) return;
          }
        }
      }
      drag = { mode: "camera", x: e.clientX, y: e.clientY, pan: e.shiftKey || e.button === 1 };
      el.style.cursor = "";
    };

    const move = (e) => {
      if (!drag) {
        el.style.cursor = meshUnder(e) ? "move" : "";
        return;
      }

      if (drag.mode === "mover") {
        rc.setFromCamera(ndcOf(e), cameraRef.current);
        if (!rc.ray.intersectPlane(plane, hit)) return;
        patch(drag.id, {
          position: [
            round(drag.pos0[0] + hit.x - drag.ancora.x, 3),
            round(drag.pos0[1] + hit.y - drag.ancora.y, 3),
            round(drag.pos0[2] + hit.z - drag.ancora.z, 3),
          ],
        });
        return;
      }

      if (drag.mode === "girar") {
        drag.dx += e.clientX - drag.x;
        drag.dy += e.clientY - drag.y;
        drag.x = e.clientX; drag.y = e.clientY;
        patch(drag.id, {
          rotation: [
            round(drag.rot0[0] + drag.dy * 0.5, 1),
            round(drag.rot0[1] + drag.dx * 0.5, 1),
            round(drag.rot0[2], 1),
          ],
        });
        return;
      }

      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.x = e.clientX; drag.y = e.clientY;
      const o = orbitRef.current;
      if (drag.pan) {
        const right = new Vector3(Math.cos(o.theta), 0, -Math.sin(o.theta));
        const up = new Vector3(0, 1, 0);
        o.target.addScaledVector(right, -dx * o.radius * 0.0016);
        o.target.addScaledVector(up, dy * o.radius * 0.0016);
      } else {
        o.theta -= dx * 0.006;
        o.phi = clamp(o.phi - dy * 0.006, 0.06, Math.PI - 0.06);
      }
    };

    const up = (e) => {
      drag = null;
      el.style.cursor = "";
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    const wheel = (e) => {
      e.preventDefault();
      orbitRef.current.radius = clamp(orbitRef.current.radius * (1 + Math.sign(e.deltaY) * 0.1), 1.2, 40);
    };
    const menu = (e) => e.preventDefault();

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("contextmenu", menu);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("contextmenu", menu);
    };
  }, []);

  /* ---- edição ---- */
  const patch = useCallback((id, data) => {
    setObjects((prev) => prev.map((o) => {
      if (o.id !== id) return o;
      const next = { ...o, ...data };
      const touchesTransform = ["position", "rotation", "scale", "translucency"].some((k) => k in data);
      /* Com o objeto animado, o que vale é o valor no tempo da agulha: a edição
         atualiza o keyframe sob ela, ou cria um ali se não houver. Sem isso a
         mudança iria só para a base, que fica sombreada pelos keyframes, e o
         valor sumiria sem deixar rastro na tela. */
      if (touchesTransform && next.keyframes.length) {
        const t = stateRef.current.playhead;
        const idx = next.keyframes.findIndex((k) => Math.abs(k.t - t) < 0.05);
        /* O keyframe parte do que está na tela em t, com a mudança por cima. Partir
           da base faria os canais não editados saltarem para um valor que os
           keyframes sombreiam — mexer só na rotação puxaria a posição junto. */
        const atual = sampleAt(o, t, stateRef.current.easing);
        const alvo = {
          position: [...(data.position ?? atual.position)],
          rotation: [...(data.rotation ?? atual.rotation)],
          scale: [...(data.scale ?? atual.scale)],
          translucency: data.translucency ?? atual.translucency,
        };
        Object.assign(next, alvo);
        const kfs = [...next.keyframes];
        const kf = snapshot(alvo, idx >= 0 ? kfs[idx].t : t);
        if (idx >= 0) kfs[idx] = kf;
        else { kfs.push(kf); kfs.sort((x, y) => x.t - y.t); }
        next.keyframes = kfs;
      }
      return next;
    }));
  }, []);

  const addObject = (type = "box") => {
    const o = makeObject(type);
    o.position = [round((Math.random() - 0.5) * 2.4, 2), 0, round((Math.random() - 0.5) * 2.4, 2)];
    setObjects((p) => [...p, o]);
    setSelectedId(o.id);
  };
  const duplicateObject = () => {
    if (!sel) return;
    const o = { ...sel, id: uid(), name: sel.name + " cópia", keyframes: sel.keyframes.map((k) => ({ ...k })) };
    setObjects((p) => [...p, o]);
    setSelectedId(o.id);
  };
  const removeObject = (id) => {
    setObjects((p) => p.filter((o) => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  /* ---- SVG ---- */
  /* caminho único: arquivo enviado e forma embutida entram pelo mesmo lugar */
  const addSVG = (text, nome) => {
    try {
      const shapes = svgToShapes(text, 12);
      const o = makeObject("svg");
      o.svgShapes = shapes;
      o.svgName = nome;
      o.svgKey = uid();
      o.name = nome.replace(/\.svg$/i, "");
      setObjects((p) => [...p, o]);
      setSelectedId(o.id);
      setStatus(`${nome} — ${shapes.length} contorno(s)`);
    } catch (err) {
      setStatus(`Não deu para ler o SVG: ${err.message}`);
    }
  };

  const loadSVG = async (file) => {
    if (!file) return;
    addSVG(await file.text(), file.name);
  };

  /* ---- keyframes ---- */
  const addKey = () => {
    if (!sel) return;
    const t = round(playhead, 3);
    const kfs = sel.keyframes.filter((k) => Math.abs(k.t - t) >= 0.05);
    kfs.push(snapshot(sampleAt(sel, playhead, easing), t));
    kfs.sort((a, b) => a.t - b.t);
    patch(sel.id, { keyframes: kfs });
  };
  const removeKey = (t) => {
    if (!sel) return;
    patch(sel.id, { keyframes: sel.keyframes.filter((k) => k.t !== t) });
  };
  /* Reposiciona um keyframe no tempo. Devolve o novo t, ou null quando o alvo
     está em cima de outro keyframe — soltar um sobre o outro apagaria pose. */
  const moveKey = (de, para) => {
    if (!sel) return null;
    const t = round(clamp(para, 0, duration), 3);
    if (t === de) return null;
    if (sel.keyframes.some((k) => k.t !== de && Math.abs(k.t - t) < 0.05)) return null;
    const kfs = sel.keyframes.map((k) => (k.t === de ? { ...k, t } : k)).sort((a, b) => a.t - b.t);
    patch(sel.id, { keyframes: kfs });
    return t;
  };
  const spin360 = () => {
    if (!sel) return;
    /* parte do que está na tela, não da base, que os keyframes podem estar sombreando */
    const atual = sampleAt(sel, playhead, easing);
    const a = snapshot(atual, 0);
    const b = snapshot(atual, duration);
    b.rotation = [atual.rotation[0], atual.rotation[1] + 360, atual.rotation[2]];
    patch(sel.id, { keyframes: [a, b] });
    setStatus("Giro de 360° criado em Y.");
  };

  /* ---- exportação ---- */
  const withSize = (w, h, fn) => {
    const r = rendererRef.current, cam = cameraRef.current;
    const old = new Vector2(); r.getSize(old);
    const oldPR = r.getPixelRatio();
    r.setPixelRatio(1);
    r.setSize(w, h, false);
    cam.aspect = w / h; cam.updateProjectionMatrix();
    r.render(sceneRef.current, cam);
    const out = fn();
    r.setPixelRatio(oldPR);
    r.setSize(old.x, old.y, false);
    cam.aspect = old.x / old.y; cam.updateProjectionMatrix();
    return out;
  };

  const exportPNG = () => {
    const w = clamp(Math.round(expW), 16, 8192), h = clamp(Math.round(expH), 16, 8192);
    withSize(w, h, () => {
      rendererRef.current.domElement.toBlob((b) => b && download(b, "3d-maker.png"), "image/png");
    });
    setStatus(`PNG ${w}×${h} com alpha exportado.`);
  };

  const exportSVG = () => {
    const w = clamp(Math.round(expW), 16, 8192), h = clamp(Math.round(expH), 16, 8192);
    const cam = cameraRef.current;
    const oldAspect = cam.aspect;
    cam.aspect = w / h; cam.updateProjectionMatrix();
    cam.updateMatrixWorld();

    const lightDir = lightRef.current.position.clone().normalize();
    const ambientK = clamp(ambient / 140, 0, 0.9);
    const tris = [];
    const a = new Vector3(), b = new Vector3(), c = new Vector3();
    const n = new Vector3(), e1 = new Vector3(), e2 = new Vector3();

    for (const obj of objects) {
      const mesh = meshesRef.current.get(obj.id);
      if (!mesh || !mesh.visible) continue;
      mesh.updateMatrixWorld(true);
      const geo = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry;
      const pos = geo.attributes.position;
      const base = new Color(obj.color);
      const flat = obj.material === "flat" || obj.material === "wire";
      const glass = obj.material === "glass";
      const tl = clamp(sampleAt(obj, playhead, easing).translucency / 100, 0, 1);
      const alphaBase = glass ? lerp(0.92, 0.2, tl) : lerp(1, 0.07, tl);
      // mesmas pontas do shader do vidro: miolo claro, borda funda
      const claro = base.clone().lerp(new Color(1, 1, 1), 0.12);
      const fundo = base.clone().multiply(base).multiplyScalar(0.7);
      const cent = new Vector3(), view = new Vector3();
      for (let i = 0; i < pos.count; i += 3) {
        a.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
        b.fromBufferAttribute(pos, i + 1).applyMatrix4(mesh.matrixWorld);
        c.fromBufferAttribute(pos, i + 2).applyMatrix4(mesh.matrixWorld);
        const depth = a.distanceTo(cam.position) + b.distanceTo(cam.position) + c.distanceTo(cam.position);
        e1.subVectors(b, a); e2.subVectors(c, a); n.crossVectors(e1, e2).normalize();
        const lamb = flat ? 1 : ambientK + (1 - ambientK) * clamp(Math.abs(n.dot(lightDir)), 0, 1);
        const p = [a, b, c].map((v) => {
          const q = v.clone().project(cam);
          return [((q.x + 1) / 2) * w, ((1 - q.y) / 2) * h];
        });
        if (p.some((q) => !Number.isFinite(q[0]) || !Number.isFinite(q[1]))) continue;
        cent.copy(a).add(b).add(c).multiplyScalar(1 / 3);
        view.subVectors(cam.position, cent).normalize();
        const edge = 1 - Math.abs(n.dot(view));
        const fres = Math.pow(edge, glass ? 2.2 : FRESNEL_POWER);
        const alpha = clamp(lerp(alphaBase, glass ? 0.97 : 1, fres), 0, 1);
        const col = glass
          ? claro.clone().lerp(fundo, MathUtils.smoothstep(edge, 0, 0.85))
          : base.clone().multiplyScalar(clamp(lamb, 0.06, 1.25));
        tris.push({ d: depth, p, f: `#${col.getHexString()}`, o: alpha });
      }
      if (geo !== mesh.geometry) geo.dispose();
    }
    cam.aspect = oldAspect; cam.updateProjectionMatrix();

    if (!tris.length) { setStatus("Nada visível para exportar em SVG."); return; }
    tris.sort((x, y) => y.d - x.d);
    const parts = tris.map((t) => {
      const d = `M${t.p.map((q) => `${round(q[0], 1)},${round(q[1], 1)}`).join("L")}Z`;
      const op = t.o < 0.999 ? ` fill-opacity="${round(t.o, 3)}"` : "";
      return `<path d="${d}" fill="${t.f}" stroke="${t.f}" stroke-width="0.6"${op}/>`;
    });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n${parts.join("\n")}\n</svg>`;
    download(new Blob([svg], { type: "image/svg+xml" }), "3d-maker.svg");
    setStatus(`SVG vetorial exportado — ${tris.length} faces. Menos detalhe = arquivo mais leve.`);
  };

  const exportVideo = () => {
    const canvas = rendererRef.current?.domElement;
    if (!canvas || recording) return;
    const types = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
    const mime = types.find((t) => window.MediaRecorder && MediaRecorder.isTypeSupported(t));
    if (!mime) { setStatus("Este navegador não grava WebM. Use Chrome ou Edge."); return; }
    const stream = canvas.captureStream(fps);
    const chunks = [];
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 16_000_000 });
    recRef.current = rec;
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      download(new Blob(chunks, { type: "video/webm" }), "3d-maker-alpha.webm");
      setRecording(false);
      setPlaying(false);
      setStatus("WebM com alpha exportado.");
    };
    stateRef.current.playhead = 0;
    setPlayhead(0);
    setPlaying(false);
    setRecording(true);
    setStatus("Gravando…");
    rec.start();
    setTimeout(() => { try { rec.state !== "inactive" && rec.stop(); } catch (e) { setRecording(false); } }, duration * 1000 + 250);
  };

  /* ---- timeline ---- */
  const trackRef = useRef(null);
  const scrub = (e) => {
    const r = trackRef.current.getBoundingClientRect();
    const t = clamp(((e.clientX - r.left) / r.width) * duration, 0, duration);
    stateRef.current.playhead = t;
    setPlayhead(t);
    setPlaying(false);
  };

  const keyAtPlayhead = sel?.keyframes.some((k) => Math.abs(k.t - playhead) < 0.05);
  /* Os controles mostram o valor no tempo da agulha, que é o que está na tela.
     Sem keyframes isso é a própria base do objeto. */
  const selT = sel ? sampleAt(sel, playhead, easing) : null;

  return (
    <div className="app">
      <style>{css(C)}</style>

      {/* ============================ PAINEL ============================ */}
      <aside className="panel">
        <Header tool="3d maker" homeHref={HUB_URL} tema={tema} onToggleTema={() => setTema(tema === "escuro" ? "claro" : "escuro")} />

        {/* Objetos */}
        <section className="sec">
          <h2 className="sec-title">Objetos</h2>
          {objects.map((o) => (
            <div key={o.id} className="obj" data-sel={o.id === sel?.id ? 1 : 0} data-vis={o.visible ? 1 : 0}>
              <span className="sw" style={{ background: o.color }} />
              <button className="obj-nome" onClick={() => setSelectedId(o.id)}>{o.name}</button>
              <button onClick={() => patch(o.id, { visible: !o.visible })} title="Mostrar ou esconder">
                <IconEye off={!o.visible} />
              </button>
              <button onClick={() => removeObject(o.id)} title="Excluir"><IconTrash /></button>
            </div>
          ))}
          {!objects.length && <p className="empty hint" style={{ margin: "0 0 10px" }}>Cena vazia. Adicione uma forma para começar.</p>}
          <div className="grid2" style={{ marginTop: 8 }}>
            <button className="btn" onClick={() => addObject("box")}>Adicionar forma</button>
            <button className="btn" onClick={duplicateObject} disabled={!sel}>Duplicar</button>
          </div>
          <button className="btn" style={{ marginTop: 8, width: "100%" }}
            onClick={() => addSVG(SOFTPOINT_SVG, "Softpoint")}>Softpoint</button>
          <div className="solta" style={{ marginTop: 8 }} data-over={dragOver ? 1 : 0}
            onClick={() => fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); loadSVG(e.dataTransfer.files[0]); }}>
            Solte um SVG ou clique para escolher
          </div>
          <input ref={fileRef} type="file" accept=".svg,image/svg+xml" style={{ display: "none" }}
            onChange={(e) => { loadSVG(e.target.files[0]); e.target.value = ""; }} />
        </section>

        {sel && (
          <>
            {/* Forma */}
            <section className="sec">
              <h2 className="sec-title">Forma</h2>
              <Field label="Tipo">
                <select value={sel.type} onChange={(e) => patch(sel.id, { type: e.target.value, name: SHAPE_LABEL[e.target.value] })}>
                  {SHAPES.map(([v, l]) => (
                    <option key={v} value={v} disabled={v === "svg" && !sel.svgShapes}>{l}</option>
                  ))}
                </select>
              </Field>
              {sel.type === "svg" ? (
                <>
                  <div className="grid2" style={{ marginBottom: 14 }}>
                    <button className="btn" data-on={sel.svgMode === "extrude" ? 1 : 0}
                      onClick={() => patch(sel.id, { svgMode: "extrude" })}>Extrudado</button>
                    <button className="btn" data-on={sel.svgMode === "flat" ? 1 : 0}
                      onClick={() => patch(sel.id, { svgMode: "flat" })}>Plano</button>
                  </div>
                  <Slider label="Profundidade" value={sel.depth} unit="%" disabled={sel.svgMode === "flat"}
                    onChange={(v) => patch(sel.id, { depth: v })} />
                  <Slider label="Chanfro" value={sel.bevel} unit="%" disabled={sel.svgMode === "flat"}
                    onChange={(v) => patch(sel.id, { bevel: v })} />
                </>
              ) : (
                <Slider label="Espessura" value={sel.thickness} unit="%"
                  disabled={!["cylinder", "cone", "torus", "torusKnot", "ring"].includes(sel.type)}
                  onChange={(v) => patch(sel.id, { thickness: v })} />
              )}
              <Slider label="Detalhe" value={sel.detail} unit="%" onChange={(v) => patch(sel.id, { detail: v })} />
            </section>

            {/* Transformação */}
            <section className="sec">
              <h2 className="sec-title">Transformação</h2>
              <Eixos label="Posição" values={selT.position} step={0.1} onChange={(v) => patch(sel.id, { position: v })} />
              <Eixos label="Rotação" values={selT.rotation} step={5} unit="°" onChange={(v) => patch(sel.id, { rotation: v })} />
              <Eixos label="Escala" values={selT.scale} step={0.05} onChange={(v) => patch(sel.id, { scale: v })} />
              <Slider label="Escala uniforme" min={5} max={300} value={round(selT.scale[0] * 100)} unit="%"
                onChange={(v) => patch(sel.id, { scale: [v / 100, v / 100, v / 100] })} />
              <Slider label="Translucência" value={selT.translucency} unit="%" accent={C.mag}
                onChange={(v) => patch(sel.id, { translucency: v })} />
              <button className="btn" onClick={() => patch(sel.id, { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], translucency: 0 })}>
                Zerar transformação
              </button>
              <p className="hint">
                No palco, <b>arrastar a forma</b> muda a posição e <b>alt+arrastar</b> — ou o botão
                direito — muda a rotação; os campos acima acompanham em tempo real. Sobre o fundo os
                mesmos gestos valem para a câmera, e <b>shift+arrastar</b> a desloca. A silhueta e as
                bordas continuam densas mesmo no máximo de translucência — o miolo é que deixa passar.
                {keyAtPlayhead && <> A agulha está sobre um <b>keyframe</b>: as mudanças acima são gravadas nele.</>}
                {!!sel.keyframes.length && !keyAtPlayhead && <> O objeto está animado e a agulha não está sobre um keyframe, então qualquer mudança acima <b>cria um keyframe</b> em {round(playhead, 2)}s.</>}
              </p>
            </section>

            {/* Material */}
            <section className="sec">
              <h2 className="sec-title">Material</h2>
              <Field label="Acabamento">
                <select value={sel.material} onChange={(e) => {
                  const material = e.target.value;
                  // vidro pede miolo aberto e reflexo nítido; só ajusta o que ainda está longe disso
                  const vidro = material === "glass" && sel.material !== "glass";
                  patch(sel.id, {
                    material,
                    ...(vidro && sel.translucency < 5 ? { translucency: 45 } : {}),
                    ...(vidro && sel.roughness > 15 ? { roughness: 4 } : {}),
                  });
                }}>
                  {MATERIALS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <div className="row">
                <label htmlFor="cor">Cor</label>
                <input id="cor" type="color" value={sel.color} onChange={(e) => patch(sel.id, { color: e.target.value })} />
                <input type="text" value={sel.color} onChange={(e) => patch(sel.id, { color: e.target.value })} />
              </div>
              <Slider label="Rugosidade" value={sel.roughness} unit="%" disabled={["flat", "wire"].includes(sel.material)}
                onChange={(v) => patch(sel.id, { roughness: v })} />
            </section>

            {/* Animação */}
            <section className="sec">
              <h2 className="sec-title">Animação</h2>
              <div className="grid2" style={{ marginBottom: 8 }}>
                <button className="btn" onClick={addKey}>{keyAtPlayhead ? "Atualizar kf" : "Gravar kf"}</button>
                <button className="btn" onClick={() => patch(sel.id, { keyframes: [] })} disabled={!sel.keyframes.length}>
                  Limpar
                </button>
              </div>
              <button className="btn" style={{ marginBottom: 14 }} onClick={spin360}>Gerar giro de 360°</button>
              <Field label="Interpolação">
                <select value={easing} onChange={(e) => setEasing(e.target.value)}>
                  <option value="linear">Linear</option>
                  <option value="suave">Suave</option>
                </select>
              </Field>
              <Slider label="Duração" min={1} max={30} step={0.5} value={duration} unit="s" onChange={setDuration} />
              <p className="hint">
                Na trilha, <b>arrastar um keyframe</b> muda o tempo dele e <b>clique duplo</b> remove.
                Soltar em cima de outro não vale — a pose que está lá se perderia.
              </p>
            </section>
          </>
        )}

        {/* Cena */}
        <section className="sec">
          <h2 className="sec-title">Cena</h2>
          <Slider label="Luz principal" value={light} unit="%" onChange={setLight} />
          <Slider label="Luz ambiente" value={ambient} unit="%" onChange={setAmbient} />
          <Slider label="Ângulo da luz" min={0} max={360} value={lightAngle} unit="°" onChange={setLightAngle} />
          <button className="btn" onClick={() => {
            orbitRef.current.theta = 0.75; orbitRef.current.phi = 1.15;
            orbitRef.current.radius = 6.2; orbitRef.current.target.set(0, 0, 0);
          }}>Reenquadrar câmera</button>
        </section>

        {/* Exportar */}
        <section className="sec">
          <h2 className="sec-title">Exportar</h2>
          <button className="btn btn-mag" onClick={exportSVG}>Baixar SVG vetorial</button>
          <div className="grid2" style={{ marginTop: 8, marginBottom: 8 }}>
            <input className="ctl-num" style={{ width: "100%" }} type="number" aria-label="Largura"
              value={expW} onChange={(e) => setExpW(+e.target.value)} />
            <input className="ctl-num" style={{ width: "100%" }} type="number" aria-label="Altura"
              value={expH} onChange={(e) => setExpH(+e.target.value)} />
          </div>
          <button className="btn" onClick={exportPNG}>Baixar PNG com alpha</button>
          <div className="grid2" style={{ marginTop: 8 }}>
            <select value={fps} onChange={(e) => setFps(+e.target.value)}>
              {[24, 30, 60].map((f) => <option key={f} value={f}>{f} fps</option>)}
            </select>
            <button className="btn" onClick={exportVideo} disabled={recording}>
              {recording ? "Gravando…" : `WebM ${duration}s`}
            </button>
          </div>
          <p className="hint">
            O SVG sai em vetor puro, face a face, pronto para o Illustrator — menos detalhe, arquivo mais
            leve. O WebM carrega canal alpha; para o After Effects, converta:
            <br /><code>ffmpeg -i 3d-maker-alpha.webm -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le saida.mov</code>
          </p>
          {status && <p className="hint msg">{status}</p>}
        </section>

        <Footer links={[
          { label: "grid maker", href: "https://github.com/gugaxd/gri.d.maker" },
          { label: "bento maker", href: "https://bento-maker-three.vercel.app/" },
          { label: "gradient maker", href: "https://gradient-maker-peach.vercel.app/" },
        ]} />
      </aside>

      {/* ============================ PALCO ============================ */}
      <main className="stage">
        <div className="bar">
          <span><b>{expW}</b> × <b>{expH}</b> px</span>
          <span><b>{objects.length}</b> objetos · <b>{objects.filter((o) => o.visible).length}</b> visíveis</span>
          <span><b>{round(playhead, 2)}</b> / {duration}s</span>
          <span className="sp" />
          {recording && <span className="rec">gravando</span>}
          <span>arrastar a forma move · alt ou botão direito gira · fundo orbita · scroll aproxima</span>
        </div>

        <div className="view">
          <div className="frame" ref={mountRef}>
            <span className="reg tl" /><span className="reg tr" />
            <span className="reg bl" /><span className="reg br" />
          </div>
        </div>

        <div className="tl">
          <button className="btn" onClick={() => setPlaying((p) => !p)} disabled={recording}>
            {playing ? "Pausar" : "Reproduzir"}
          </button>
          <button className="btn" onClick={() => { stateRef.current.playhead = 0; setPlayhead(0); setPlaying(false); }}>
            Início
          </button>
          <div className="trilha" ref={trackRef} onPointerDown={scrub}
            onPointerMove={(e) => {
              const d = kfDragRef.current;
              if (!d) { if (e.buttons === 1) scrub(e); return; }
              /* zona morta: sem ela um tremor do mouse desloca o keyframe e
                 remonta o marcador, o que engoliria o clique duplo de remover */
              if (!d.ativo && Math.abs(e.clientX - d.x0) < 3) return;
              d.ativo = true;
              const r = trackRef.current.getBoundingClientRect();
              const novo = moveKey(d.t, ((e.clientX - r.left) / r.width) * duration);
              if (novo == null) return;
              d.t = novo;
              stateRef.current.playhead = novo;
              setPlayhead(novo);
            }}
            onPointerUp={() => { kfDragRef.current = null; }}
            onPointerCancel={() => { kfDragRef.current = null; }}>
            <div className="agulha" style={{ left: `${(playhead / duration) * 100}%` }} />
            {sel?.keyframes.map((k) => (
              <span key={k.t} className="kf" data-on={Math.abs(k.t - playhead) < 0.05 ? 1 : 0}
                style={{ left: `${(k.t / duration) * 100}%` }}
                title={`${k.t}s — arraste para mover, clique duplo remove`}
                onPointerDown={(e) => {
                  /* o ponteiro fica preso à trilha, não ao marcador: ele remonta a
                     cada mudança de t, porque a chave do React é o próprio tempo */
                  e.stopPropagation();
                  trackRef.current.setPointerCapture(e.pointerId);
                  kfDragRef.current = { t: k.t, x0: e.clientX, ativo: false };
                  stateRef.current.playhead = k.t;
                  setPlayhead(k.t);
                  setPlaying(false);
                }}
                onDoubleClick={(e) => { e.stopPropagation(); removeKey(k.t); }} />
            ))}
          </div>
          <span className="conta">{sel ? `${sel.keyframes.length} keyframes` : "sem objeto"}</span>
        </div>
      </main>
    </div>
  );
}
