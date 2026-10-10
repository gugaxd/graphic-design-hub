/* ------------------------------------------------------------------ */
/* Leitura de SVG enviado                                              */
/*                                                                     */
/* Parser próprio de path, rect, circle, ellipse, polygon e polyline,  */
/* com transform acumulado — o mesmo do 3d maker. Curvas e arcos viram */
/* polilinhas. Sai uma lista de anéis normalizados (largura maior = 2, */
/* centro na origem, y para cima) e o agrupamento contorno + furos.    */
/* ------------------------------------------------------------------ */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

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

const semPreenchimento = (el) => {
  if (el.getAttribute("fill") === "none" || el.getAttribute("display") === "none") return true;
  const st = (el.getAttribute("style") || "").replace(/\s/g, "");
  return /(^|;)fill:none/.test(st) || /(^|;)display:none/.test(st);
};

/* Converte o texto do SVG em anéis. Lança Error com mensagem em português. */
export function lerSVG(texto, qualidade = 28) {
  const doc = new DOMParser().parseFromString(texto, "image/svg+xml");
  if (doc.querySelector("parsererror")) throw new Error("o arquivo não é um SVG válido");
  const subs = [];
  const walk = (node, m) => {
    for (const el of Array.from(node.children || [])) {
      const tag = el.tagName.toLowerCase();
      const lm = mulM(m, parseTransform(el.getAttribute("transform")));
      if (semPreenchimento(el)) continue;
      if (tag === "g" || tag === "svg" || tag === "a") {
        walk(el, lm);
        continue;
      }
      for (const sp of elementSubpaths(el, qualidade)) subs.push(sp.map(([x, y]) => applyM(lm, x, y)));
    }
  };
  walk(doc.documentElement, [1, 0, 0, 1, 0, 0]);

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const sp of subs)
    for (const [x, y] of sp) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  const w = maxX - minX, h = maxY - minY;
  if (!subs.length || !(Math.max(w, h) > 0)) throw new Error("nenhuma forma preenchida no arquivo");
  const k = 2 / Math.max(w, h);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;

  /* normaliza, tira pontos repetidos e o ponto de fechamento */
  const aneis = [];
  for (const sp of subs) {
    const r = [];
    for (const [x, y] of sp) {
      const p = [(x - cx) * k, -(y - cy) * k];
      const u = r[r.length - 1];
      if (!u || Math.hypot(p[0] - u[0], p[1] - u[1]) > 1e-6) r.push(p);
    }
    while (r.length > 1 && Math.hypot(r[0][0] - r[r.length - 1][0], r[0][1] - r[r.length - 1][1]) < 1e-6) r.pop();
    if (r.length >= 3 && Math.abs(signedArea([...r, r[0]])) > 1e-6) aneis.push(r);
  }
  if (!aneis.length) throw new Error("nenhuma forma preenchida no arquivo");

  /* par-ou-ímpar: anel dentro de um número par de outros é contorno,
     ímpar é furo do menor anel que o contém */
  const meta = aneis
    .map((p) => ({ p, a: Math.abs(signedArea([...p, p[0]])), grupo: null }))
    .sort((u, v) => v.a - u.a);
  const grupos = [];
  meta.forEach((m, i) => {
    const pais = meta.slice(0, i).filter((o) => o.a > m.a && pointInPoly(m.p[0], o.p));
    const pai = pais[pais.length - 1];
    if (pais.length % 2 === 0) {
      m.grupo = { externo: m.p, furos: [] };
      grupos.push(m.grupo);
    } else if (pai && pai.grupo) pai.grupo.furos.push(m.p);
  });
  return { aneis, grupos };
}
