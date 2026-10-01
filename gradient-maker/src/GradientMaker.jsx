import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Play,
  Pause,
  Shuffle,
  Plus,
  X,
  Download,
  Video,
  Code2,
  Copy,
  Square,
} from "lucide-react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

/* Servido pelo hub em /gradient-maker/ — o menu é a raiz do mesmo site. */
const HUB_URL = "/";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex) {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return { r: 0, g: 0, b: 0 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgba(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = (v) => Math.round(255 * v).toString(16).padStart(2, "0");
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`;
}

/* deterministic blob layout ---------------------------------------- */

function makeBlobs(seed, count) {
  const rnd = mulberry32(seed);
  const out = [];
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2 + rnd() * 0.9;
    const rad = 0.18 + rnd() * 0.24;
    out.push({
      bx: 0.5 + Math.cos(ang) * rad,
      by: 0.5 + Math.sin(ang) * rad,
      br: 0.34 + rnd() * 0.26,
      h1: 1 + Math.floor(rnd() * 3),
      h2: 1 + Math.floor(rnd() * 3),
      h3: 2 + Math.floor(rnd() * 3),
      h4: 2 + Math.floor(rnd() * 3),
      h5: 1 + Math.floor(rnd() * 2),
      p1: rnd(),
      p2: rnd(),
      p3: rnd(),
      p4: rnd(),
      p5: rnd(),
      lobes: Array.from({ length: 4 }, (_, l) => ({
        a: rnd(),
        d: rnd(),
        s: rnd(),
        h: 1 + Math.floor(rnd() * 2),
        h2: 1 + Math.floor(rnd() * 3),
        p: rnd(),
      })),
    });
  }
  return out;
}

/* motion — periodic, so every loop is seamless --------------------- */

function blobPos(b, phase, T) {
  const amp = 0.05 + 0.28 * T;
  const tau = Math.PI * 2;
  const x =
    b.bx +
    amp * Math.sin(tau * (phase * b.h1 + b.p1)) +
    amp * 0.45 * T * Math.sin(tau * (phase * b.h3 + b.p3));
  const y =
    b.by +
    amp * Math.cos(tau * (phase * b.h2 + b.p2)) +
    amp * 0.45 * T * Math.cos(tau * (phase * b.h4 + b.p4));
  const r = b.br * (1 + 0.22 * T * Math.sin(tau * (phase * b.h5 + b.p5)));
  return { x, y, r };
}

/* mesh warp ---------------------------------------------------------
   the whole gradient is pushed around by a sum of sine bands: columns
   get displaced vertically, then rows horizontally. Two cheap passes,
   but the composition reads as fabric folding / water rippling.      */

function wave(u, t, k) {
  const tau = Math.PI * 2;
  return (
    (Math.sin(u * 6.2 + tau * (t + k * 0.31)) +
      0.55 * Math.sin(u * 11.3 - tau * (2 * t + k * 0.11)) +
      0.3 * Math.sin(u * 19.7 + tau * (3 * t + k * 0.57))) /
    1.85
  );
}

function getBuf(buf, W, H) {
  if (!buf.a) {
    buf.a = document.createElement("canvas");
    buf.b = document.createElement("canvas");
  }
  if (buf.a.width !== W || buf.a.height !== H) {
    buf.a.width = buf.b.width = W;
    buf.a.height = buf.b.height = H;
  }
  return buf;
}

function warpPass(src, dctx, W, H, t, A, vertical) {
  dctx.clearRect(0, 0, W, H);
  const pad = A + 1;
  if (vertical) {
    const n = 180;
    const sw = W / n;
    for (let i = 0; i < n; i++) {
      const x = i * sw;
      const d = A * wave(x / W, t, 0);
      dctx.drawImage(src, x, 0, sw, H, x, d - pad, sw + 1, H + 2 * pad);
    }
  } else {
    const n = 130;
    const sh = H / n;
    for (let i = 0; i < n; i++) {
      const y = i * sh;
      const d = A * wave(y / H, t, 1);
      dctx.drawImage(src, 0, y, W, sh, d - pad, y, W + 2 * pad, sh + 1);
    }
  }
}

/* film grain tiles -------------------------------------------------- */

function makeNoiseTiles(n = 6, size = 180) {
  const tiles = [];
  for (let k = 0; k < n; k++) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const x = c.getContext("2d");
    const img = x.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 40 + Math.random() * 175;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    tiles.push(c);
  }
  return tiles;
}

/* ------------------------------------------------------------------ */
/* the renderer — one pure function used by preview, PNG and video     */
/* ------------------------------------------------------------------ */

function drawScene(ctx, W, H, phase, cfg, tiles, buf) {
  const { mode, classicType, angle, colors, turbulence, grain, blobs } = cfg;
  const T = turbulence / 100;
  const D = mode === "mesh" ? (cfg.distort || 0) / 100 : 0;
  const maxD = Math.max(W, H);
  const diag = Math.hypot(W, H);
  const amp = D * 0.11 * Math.min(W, H);

  /* with warp on, the gradient is painted into a buffer first, then
     pushed through the two displacement passes                       */
  const warped = D > 0.005;
  let g2 = ctx;
  if (warped) {
    buf = getBuf(buf || {}, W, H);
    g2 = buf.a.getContext("2d");
    g2.clearRect(0, 0, W, H);
  }

  g2.save();
  g2.globalCompositeOperation = "source-over";
  g2.globalAlpha = 1;

  if (mode === "mesh") {
    g2.fillStyle = colors[0];
    g2.fillRect(0, 0, W, H);
    for (let i = 0; i < colors.length; i++) {
      const b = blobs[i];
      if (!b) continue;
      const p = blobPos(b, phase, T);
      const cx = p.x * W;
      const cy = p.y * H;
      const r = Math.max(8, p.r * maxD);
      const g = g2.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, rgba(colors[i], 1));
      g.addColorStop(0.45, rgba(colors[i], 0.62));
      g.addColorStop(1, rgba(colors[i], 0));
      g2.fillStyle = g;
      g2.fillRect(0, 0, W, H);
    }
  } else {
    const stops = [];
    for (let rep = 0; rep < 3; rep++) for (const c of colors) stops.push(c);
    stops.push(colors[0]);

    if (classicType === "linear") {
      const a = (angle * Math.PI) / 180;
      const ux = Math.cos(a);
      const uy = Math.sin(a);
      const cxc = W / 2;
      const cyc = H / 2;
      const off = phase * diag;
      const strips = T > 0.02 ? 72 : 1;
      const sw = W / strips;
      for (let s = 0; s < strips; s++) {
        const wob =
          T *
          0.22 *
          diag *
          Math.sin(Math.PI * 2 * (phase * 2 + (s / strips) * 2.2));
        const shift = off + wob;
        const g = g2.createLinearGradient(
          cxc - ux * diag * 1.5 + ux * shift,
          cyc - uy * diag * 1.5 + uy * shift,
          cxc + ux * diag * 1.5 + ux * shift,
          cyc + uy * diag * 1.5 + uy * shift
        );
        stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
        g2.fillStyle = g;
        g2.fillRect(s * sw - 1, 0, sw + 2, H);
      }
    } else {
      const cx = W * (0.5 + T * 0.22 * Math.sin(Math.PI * 2 * phase));
      const cy = H * (0.5 + T * 0.22 * Math.cos(Math.PI * 2 * phase * 2));
      const r = diag * (0.75 + T * 0.25 * Math.sin(Math.PI * 2 * phase));
      const g = g2.createRadialGradient(cx, cy, r * 0.02, cx, cy, r);
      const off = phase % 1;
      stops.forEach((c, i) => {
        let pos = i / (stops.length - 1) - off / 3;
        pos = Math.max(0, Math.min(1, pos));
        g.addColorStop(pos, c);
      });
      g2.fillStyle = g;
      g2.fillRect(0, 0, W, H);
    }
  }

  g2.restore();

  if (warped) {
    const bctx = buf.b.getContext("2d");
    warpPass(buf.a, bctx, W, H, phase, amp, true);
    ctx.clearRect(0, 0, W, H);
    warpPass(buf.b, ctx, W, H, phase, amp * 0.85, false);
  }

  ctx.save();
  if (grain > 0 && tiles && tiles.length) {
    const idx = Math.floor(phase * tiles.length) % tiles.length;
    const pat = ctx.createPattern(tiles[idx], "repeat");
    if (pat) {
      const scale = Math.max(1, maxD / 1400);
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = 0.08 + (grain / 100) * 0.62;
      ctx.save();
      ctx.scale(scale, scale);
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, W / scale, H / scale);
      ctx.restore();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
  }

  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* code + svg export builders                                          */
/* ------------------------------------------------------------------ */

const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function buildSVG(cfg, phase, W, H) {
  const { mode, classicType, angle, colors, turbulence, grain, blobs } = cfg;
  const T = turbulence / 100;
  const D = (cfg.distort || 0) / 100;
  const maxD = Math.max(W, H);
  let defs = "";
  let body = "";

  if (mode === "mesh") {
    body += `<rect width="${W}" height="${H}" fill="${colors[0]}"/>`;
    let shapes = "";
    colors.forEach((c, i) => {
      const b = blobs[i];
      if (!b) return;
      defs += `<radialGradient id="g${i}"><stop offset="0" stop-color="${c}" stop-opacity="1"/><stop offset="0.45" stop-color="${c}" stop-opacity="0.62"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
      const p = blobPos(b, phase, T);
      shapes += `<circle cx="${(p.x * W).toFixed(1)}" cy="${(p.y * H).toFixed(
        1
      )}" r="${(p.r * maxD).toFixed(1)}" fill="url(#g${i})"/>`;
    });
    if (D >= 0.01) {
      const bf = (1.5 / maxD).toFixed(5);
      const sc = (D * 0.34 * Math.min(W, H)).toFixed(0);
      defs += `<filter id="warp" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="${bf}" numOctaves="3" seed="${
        cfg.seed || 7
      }" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="${sc}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
      body += `<g filter="url(#warp)">${shapes}</g>`;
    } else {
      body += shapes;
    }
  } else if (classicType === "linear") {
    const a = (angle * Math.PI) / 180;
    const x1 = (0.5 - Math.cos(a) / 2) * 100;
    const y1 = (0.5 - Math.sin(a) / 2) * 100;
    const x2 = (0.5 + Math.cos(a) / 2) * 100;
    const y2 = (0.5 + Math.sin(a) / 2) * 100;
    const st = colors
      .map(
        (c, i) =>
          `<stop offset="${((i / (colors.length - 1)) * 100).toFixed(
            1
          )}%" stop-color="${c}"/>`
      )
      .join("");
    defs += `<linearGradient id="lg" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${st}</linearGradient>`;
    body += `<rect width="${W}" height="${H}" fill="url(#lg)"/>`;
  } else {
    const st = colors
      .map(
        (c, i) =>
          `<stop offset="${((i / (colors.length - 1)) * 100).toFixed(
            1
          )}%" stop-color="${c}"/>`
      )
      .join("");
    defs += `<radialGradient id="rg">${st}</radialGradient>`;
    body += `<rect width="${W}" height="${H}" fill="url(#rg)"/>`;
  }

  let grainLayer = "";
  if (grain > 0) {
    defs += `<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`;
    grainLayer = `<rect width="${W}" height="${H}" filter="url(#grain)" opacity="${(
      0.08 +
      (grain / 100) * 0.5
    ).toFixed(2)}" style="mix-blend-mode:overlay"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${body}${grainLayer}</svg>`;
}

function buildCode(cfg, dur, animated, W = 1920, H = 1080) {
  const { mode, classicType, angle, colors, turbulence, grain, blobs } = cfg;
  const T = turbulence / 100;
  const D = (cfg.distort || 0) / 100;
  const maxD = Math.max(W, H);
  const ratio = `${W}/${H}`;
  const grainCss =
    grain > 0
      ? `\n.gm-grain{position:absolute;inset:0;pointer-events:none;background-image:${GRAIN_URI};background-size:180px 180px;opacity:${(
          0.08 +
          (grain / 100) * 0.5
        ).toFixed(2)};mix-blend-mode:overlay}`
      : "";
  const grainDiv = grain > 0 ? `\n  <div class="gm-grain"></div>` : "";

  if (mode === "mesh") {
    const divs = [];
    const rules = [];
    colors.forEach((c, i) => {
      const b = blobs[i];
      if (!b) return;
      const p0 = blobPos(b, 0, T);
      const w0 = 2 * p0.r * maxD;
      const cls = `gm-b${i}`;
      divs.push(`      <div class="gm-blob ${cls}"></div>`);
      const tf = (k) => {
        const pk = blobPos(b, k % 1, T);
        const dx = (((pk.x - p0.x) * W) / w0) * 100;
        const dy = (((pk.y - p0.y) * H) / w0) * 100;
        return `translate(-50%,-50%) translate(${dx.toFixed(2)}%,${dy.toFixed(
          2
        )}%) scale(${(pk.r / p0.r).toFixed(3)})`;
      };
      const decl = `.${cls}{width:${((w0 / W) * 100).toFixed(2)}%;height:${(
        (w0 / H) *
        100
      ).toFixed(2)}%;left:${(p0.x * 100).toFixed(2)}%;top:${(
        p0.y * 100
      ).toFixed(2)}%;background:radial-gradient(closest-side, ${c} 0%, ${rgba(
        c,
        0.62
      )} 45%, ${rgba(c, 0)} 100%)`;
      rules.push(
        animated
          ? `${decl};animation:${cls} ${dur}s ease-in-out infinite}\n@keyframes ${cls}{${[
              0, 0.25, 0.5, 0.75, 1,
            ]
              .map((k) => `${k * 100}%{transform:${tf(k)}}`)
              .join("")}}`
          : `${decl};transform:${tf(0)}}`
      );
    });

    let warpSvg = "";
    let warpCss = "";
    if (D >= 0.01) {
      const bf = 0.006 * (0.5 + D);
      const sc = (D * 260).toFixed(0);
      const anim = animated
        ? `<animate attributeName="baseFrequency" dur="${dur}s" repeatCount="indefinite" values="${bf.toFixed(
            4
          )} ${(bf * 1.6).toFixed(4)};${(bf * 1.5).toFixed(4)} ${bf.toFixed(
            4
          )};${bf.toFixed(4)} ${(bf * 1.6).toFixed(4)}"/>`
        : "";
      warpSvg = `
  <svg class="gm-defs" aria-hidden="true"><filter id="gm-warp" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="${bf.toFixed(
    4
  )} ${(bf * 1.6).toFixed(
        4
      )}" numOctaves="3" seed="9" result="t">${anim}</feTurbulence><feDisplacementMap in="SourceGraphic" in2="t" scale="${sc}" xChannelSelector="R" yChannelSelector="G"/></filter></svg>`;
      warpCss = `\n.gm-warp{filter:url(#gm-warp)}\n.gm-defs{position:absolute;width:0;height:0}`;
    }

    const html = `<div class="gm">
  <div class="gm-layer${D >= 0.01 ? " gm-warp" : ""}">
${divs.join("\n")}
  </div>${warpSvg}${grainDiv}
</div>`;

    const css = `.gm{position:relative;width:100%;aspect-ratio:${ratio};overflow:hidden;background:${colors[0]};isolation:isolate}
.gm-layer{position:absolute;inset:0}
.gm-blob{position:absolute;border-radius:50%;filter:blur(24px)}
${rules.join("\n")}${warpCss}${grainCss}`;

    return `<!-- html — o warp usa um filtro SVG (feDisplacementMap); Chrome e Firefox renderizam bem, Safari pode variar -->\n${html}\n\n<style>\n${css}\n</style>`;
  }

  if (classicType === "linear") {
    const list = colors.join(", ");
    const css = animated
      ? `.gm{position:relative;width:100%;aspect-ratio:${ratio};overflow:hidden;background:linear-gradient(${angle}deg, ${list}, ${colors[0]});background-size:300% 300%;animation:gm-pan ${dur}s linear infinite}
@keyframes gm-pan{0%{background-position:0% 50%}100%{background-position:300% 50%}}${grainCss}`
      : `.gm{position:relative;width:100%;aspect-ratio:${ratio};overflow:hidden;background:linear-gradient(${angle}deg, ${list})}${grainCss}`;
    return `<!-- html -->\n<div class="gm">${grainDiv}\n</div>\n\n<style>\n${css}\n</style>`;
  }

  const list = colors.join(", ");
  const css = animated
    ? `.gm{position:relative;width:100%;aspect-ratio:${ratio};overflow:hidden;background:radial-gradient(circle at 50% 50%, ${list});background-size:180% 180%;background-position:50% 50%;animation:gm-breathe ${dur}s ease-in-out infinite}
@keyframes gm-breathe{0%,100%{background-size:160% 160%;background-position:50% 50%}50%{background-size:220% 220%;background-position:56% 44%}}${grainCss}`
    : `.gm{position:relative;width:100%;aspect-ratio:${ratio};overflow:hidden;background:radial-gradient(circle at 50% 50%, ${list})}${grainCss}`;
  return `<!-- html -->\n<div class="gm">${grainDiv}\n</div>\n\n<style>\n${css}\n</style>`;
}

/* ------------------------------------------------------------------ */
/* tokens + componentes (sistema visual do gri.d.maker)                */
/* ------------------------------------------------------------------ */

const CSS = `
@font-face{font-family:"Host Grotesk";font-style:normal;font-weight:600;font-display:block;src:url(data:font/woff2;base64,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) format("woff2")}
.gm-app{
  --gm-sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Helvetica,Arial,sans-serif;
  --gm-mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;
  --gm-radius:2px;
  display:flex;min-height:100vh;
  font-family:var(--gm-sans);font-size:13px;
  background:var(--gm-stage);color:var(--gm-text);
}
.gm-app[data-tema="escuro"]{
  --gm-ink:#0a0a0a;--gm-ink2:#101010;--gm-ink3:#1c1c1c;--gm-line:#2b2b2b;
  --gm-text:#e8e8e8;--gm-muted:#8c8c8c;
  --gm-cyan:#00a9ce;--gm-mag:#e0218a;--gm-sobre-cyan:#08181c;--gm-sobre-mag:#fff;
  --gm-mag-btn:#d01a7c;--gm-mag-hover:#b81068;
  --gm-stage:#0a0a0a;--gm-stage-alt:#141414;--gm-sombra:rgba(0,0,0,.6);
}
.gm-app[data-tema="claro"]{
  --gm-ink:#e9e9e9;--gm-ink2:#f4f4f4;--gm-ink3:#e1e1e1;--gm-line:#d2d2d2;
  --gm-text:#161616;--gm-muted:#6b6b6b;
  --gm-cyan:#00768f;--gm-mag:#c4136e;--gm-sobre-cyan:#fff;--gm-sobre-mag:#fff;
  --gm-mag-btn:#c4136e;--gm-mag-hover:#9c0e54;
  --gm-stage:#ececec;--gm-stage-alt:#e2e2e2;--gm-sombra:rgba(0,0,0,.13);
}

.gm-painel{width:312px;flex:0 0 312px;background:var(--gm-ink2);
  border-right:1px solid var(--gm-line);max-height:100vh;overflow-y:auto}
.gm-cabecalho{padding:18px 18px 14px;border-bottom:1px solid var(--gm-line);
  position:sticky;top:0;background:var(--gm-ink2);z-index:5;
  display:flex;align-items:center;justify-content:space-between;gap:10px}
.gm-marca{display:flex;align-items:center;gap:11px;min-width:0;text-decoration:none}
a.gm-marca:focus-visible{outline:2px solid var(--gm-cyan);outline-offset:4px}
.gm-acoes{display:flex;gap:6px;flex:none}
.gm-risco{width:1px;align-self:stretch;margin:1px 0;background:var(--gm-line);flex:none}
.gm-marca-nome{margin:0;font-family:"Host Grotesk",var(--gm-sans);font-size:19px;
  font-weight:600;letter-spacing:-.005em;text-transform:lowercase;line-height:1;color:var(--gm-text)}
.gm-logo{height:20px;width:auto;color:var(--gm-text);flex:none;display:block}
.gm-tema{flex:0 0 auto;display:block;width:30px;height:30px;padding:6px;background:var(--gm-ink);
  border:1px solid var(--gm-line);border-radius:var(--gm-radius);cursor:pointer;color:var(--gm-muted)}
.gm-tema:hover{background:var(--gm-cyan);border-color:var(--gm-cyan);color:var(--gm-sobre-cyan)}
.gm-tema:focus-visible{outline:2px solid var(--gm-cyan);outline-offset:1px}
.gm-tema svg{width:100%;height:100%;display:block;fill:none;stroke:currentColor;stroke-width:1.7}

.gm-rodape{padding:16px 18px;border-top:1px solid var(--gm-line);background:var(--gm-ink2);
  display:flex;flex-wrap:wrap;gap:8px 16px}
.gm-rodape a{font-family:var(--gm-mono);font-size:10.5px;letter-spacing:.04em;color:var(--gm-muted);
  text-decoration:none}
.gm-rodape a:hover{color:var(--gm-cyan)}
.gm-rodape a:focus-visible{outline:2px solid var(--gm-cyan);outline-offset:2px}

.gm-secao{padding:16px 18px;border-bottom:1px solid var(--gm-line)}
.gm-secao-titulo{display:flex;align-items:center;gap:8px;margin:0 0 12px;
  font-family:var(--gm-mono);font-size:9.5px;letter-spacing:.18em;font-weight:400;
  text-transform:uppercase;color:var(--gm-cyan)}
.gm-secao-titulo::after{content:"";flex:1;height:1px;background:var(--gm-line)}

.gm-controle{margin-bottom:14px}
.gm-controle:last-child{margin-bottom:0}
.gm-controle-cab{display:flex;align-items:center;gap:6px;margin-bottom:7px}
.gm-rotulo{flex:1;font-size:11.5px;letter-spacing:.01em;color:var(--gm-text)}
.gm-valor{font-family:var(--gm-mono);font-size:11px;text-align:right;
  background:var(--gm-ink);border:1px solid var(--gm-line);color:var(--gm-text);
  padding:3px 5px;border-radius:var(--gm-radius);width:46px}
.gm-valor--hex{text-align:left;width:100%;flex:1}
.gm-valor:focus-visible{outline:2px solid var(--gm-cyan);outline-offset:1px}
.gm-unidade{font-family:var(--gm-mono);font-size:9.5px;color:var(--gm-muted);width:14px}
.gm-nota{font-family:var(--gm-mono);font-size:10px;line-height:1.6;letter-spacing:.03em;
  color:var(--gm-muted);margin:7px 0 0}

.gm-slider{width:100%;-webkit-appearance:none;appearance:none;height:2px;
  background:var(--gm-line);border-radius:var(--gm-radius);display:block}
.gm-slider::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;
  border-radius:50%;background:var(--gm-acento,var(--gm-cyan));
  border:2px solid var(--gm-ink2);cursor:grab}
.gm-slider::-moz-range-thumb{width:13px;height:13px;border-radius:50%;
  background:var(--gm-acento,var(--gm-cyan));border:2px solid var(--gm-ink2);cursor:grab}
.gm-slider:focus-visible{outline:2px solid var(--gm-cyan);outline-offset:4px}

.gm-botao{background:var(--gm-ink);border:1px solid var(--gm-line);color:var(--gm-text);
  font-family:var(--gm-mono);font-size:11px;padding:7px 8px;border-radius:var(--gm-radius);
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;
  line-height:1;white-space:nowrap}
.gm-botao:hover{background:var(--gm-cyan);border-color:var(--gm-cyan);color:var(--gm-sobre-cyan)}
.gm-botao:focus-visible{outline:2px solid var(--gm-cyan);outline-offset:1px}
.gm-botao[disabled]{opacity:.4;cursor:not-allowed}
.gm-botao[disabled]:hover{background:var(--gm-ink);border-color:var(--gm-line);color:var(--gm-text)}
.gm-botao.is-ativo{background:var(--gm-cyan);border-color:var(--gm-cyan);color:var(--gm-sobre-cyan)}
.gm-botao--primario{background:var(--gm-mag-btn);border-color:var(--gm-mag-btn);
  color:var(--gm-sobre-mag);font-weight:600;letter-spacing:.05em}
.gm-botao--primario:hover{background:var(--gm-mag-hover);border-color:var(--gm-mag-hover);
  color:var(--gm-sobre-mag)}
.gm-botao--icone{padding:5px;width:26px;flex:0 0 26px}
.gm-botao--gravando{background:var(--gm-mag);border-color:var(--gm-mag);color:var(--gm-sobre-mag)}

.gm-seletor{display:flex;gap:0}
.gm-seletor .gm-botao{flex:1;border-radius:0;margin-left:-1px}
.gm-seletor .gm-botao:first-child{margin-left:0;border-radius:var(--gm-radius) 0 0 var(--gm-radius)}
.gm-seletor .gm-botao:last-child{border-radius:0 var(--gm-radius) var(--gm-radius) 0}
.gm-grade2{display:grid;grid-template-columns:1fr 1fr;gap:8px}

.gm-cor{display:flex;align-items:center;gap:6px;margin-bottom:6px}
.gm-swatch{width:26px;height:26px;flex:0 0 26px;padding:0;border:1px solid var(--gm-line);
  border-radius:var(--gm-radius);background:none;cursor:pointer}
.gm-swatch::-webkit-color-swatch-wrapper{padding:2px}
.gm-swatch::-webkit-color-swatch{border:none;border-radius:1px}
.gm-paletas{display:flex;gap:6px;margin-top:10px}
.gm-paleta{flex:1;height:16px;border:1px solid var(--gm-line);border-radius:var(--gm-radius);
  cursor:pointer;padding:0}
.gm-paleta:focus-visible{outline:2px solid var(--gm-cyan);outline-offset:1px}

.gm-main{flex:1;min-width:0;display:flex;flex-direction:column}
.gm-barra{height:46px;flex:0 0 46px;display:flex;align-items:center;gap:16px;
  padding:0 18px;border-bottom:1px solid var(--gm-line);background:var(--gm-ink2);
  font-family:var(--gm-mono);font-size:10.5px;letter-spacing:.06em;color:var(--gm-muted)}
.gm-barra strong{color:var(--gm-text);font-weight:400}
.gm-barra-fim{margin-left:auto;display:flex;align-items:center;gap:8px}

.gm-palco{flex:1;display:flex;align-items:center;justify-content:center;padding:34px;
  background-color:var(--gm-stage);
  background-image:linear-gradient(45deg,var(--gm-stage-alt) 25%,transparent 25%,transparent 75%,var(--gm-stage-alt) 75%),
    linear-gradient(45deg,var(--gm-stage-alt) 25%,transparent 25%,transparent 75%,var(--gm-stage-alt) 75%);
  background-size:16px 16px;background-position:0 0,8px 8px}
.gm-doc{position:relative;max-width:100%}
.gm-documento{display:block;max-width:100%;max-height:calc(100vh - 160px);width:auto;
  box-shadow:0 0 0 1px var(--gm-line),0 20px 60px var(--gm-sombra)}
.gm-registro{position:absolute;width:13px;height:13px;pointer-events:none}
.gm-registro::before,.gm-registro::after{content:"";position:absolute;
  background:var(--gm-cyan);opacity:.85}
.gm-registro::before{left:6px;top:0;width:1px;height:13px}
.gm-registro::after{top:6px;left:0;height:1px;width:13px}

.gm-codigo{border-top:1px solid var(--gm-line);background:var(--gm-ink2)}
.gm-codigo-cab{display:flex;align-items:center;gap:8px;padding:10px 18px;
  border-bottom:1px solid var(--gm-line)}
.gm-codigo textarea{width:100%;height:190px;resize:vertical;background:var(--gm-ink);
  border:0;border-top:1px solid var(--gm-line);color:var(--gm-text);
  font-family:var(--gm-mono);font-size:10.5px;line-height:1.6;padding:12px 18px;display:block}
.gm-codigo textarea:focus-visible{outline:2px solid var(--gm-cyan);outline-offset:-2px}

@media (max-width:860px){
  .gm-app{flex-direction:column}
  .gm-painel{width:100%;flex:none;max-height:none;border-right:0;border-bottom:1px solid var(--gm-line)}
  .gm-documento{max-height:60vh}
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{transition:none!important}
}
`;

function Secao({ titulo, children }) {
  return (
    <section className="gm-secao">
      <h2 className="gm-secao-titulo">{titulo}</h2>
      {children}
    </section>
  );
}

function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  unidade = "%",
  acento = "cyan",
  nota,
}) {
  const clamp = (n) => Math.max(min, Math.min(max, n));
  return (
    <div className="gm-controle">
      <div className="gm-controle-cab">
        <label className="gm-rotulo">{label}</label>
        <input
          className="gm-valor"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            const n = parseInt(e.target.value.replace(/[^0-9-]/g, ""), 10);
            onChange(Number.isNaN(n) ? min : clamp(n));
          }}
        />
        <span className="gm-unidade">{unidade}</span>
      </div>
      <input
        type="range"
        className="gm-slider"
        style={{ "--gm-acento": `var(--gm-${acento})` }}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {nota && <p className="gm-nota">{nota}</p>}
    </div>
  );
}

function Seletor({ options, value, onChange }) {
  return (
    <div className="gm-seletor">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`gm-botao${value === o.value ? " is-ativo" : ""}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* main                                                                */
/* ------------------------------------------------------------------ */

const PRESETS = [
  ["#0f172a", "#4338ca", "#db2777", "#f97316"],
  ["#052e16", "#15803d", "#a3e635", "#fef08a"],
  ["#1e1b4b", "#7c3aed", "#22d3ee", "#f0abfc"],
  ["#450a0a", "#dc2626", "#f59e0b", "#fde68a"],
  ["#0c0a09", "#334155", "#94a3b8", "#e2e8f0"],
];

const SIZES = [
  { label: "1920 × 1080", w: 1920, h: 1080 },
  { label: "1080 × 1080", w: 1080, h: 1080 },
  { label: "1080 × 1920", w: 1080, h: 1920 },
  { label: "2560 × 1440", w: 2560, h: 1440 },
  { label: "1200 × 630", w: 1200, h: 630 },
];

export default function GradientMaker() {
  const [mode, setMode] = useState("mesh");
  const [classicType, setClassicType] = useState("linear");
  const [angle, setAngle] = useState(135);
  const [colors, setColors] = useState(PRESETS[0]);
  const [speed, setSpeed] = useState(45);
  const [turbulence, setTurbulence] = useState(50);
  const [distort, setDistort] = useState(45);
  const [grain, setGrain] = useState(25);
  const [playing, setPlaying] = useState(true);
  const [seed, setSeed] = useState(7);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [recording, setRecording] = useState(false);
  const [recProgress, setRecProgress] = useState(0);
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeAnimated, setCodeAnimated] = useState(true);
  const [status, setStatus] = useState("");
  const [tema, setTema] = useState("escuro");

  const canvasRef = useRef(null);
  const phaseRef = useRef(0);
  const lastRef = useRef(0);
  const stopRecRef = useRef(null);
  const bufRef = useRef({});

  const tiles = useMemo(() => makeNoiseTiles(6, 180), []);
  const blobs = useMemo(() => makeBlobs(seed, 6), [seed]);
  const size = SIZES[sizeIdx];

  const loopDur = useMemo(
    () => (speed === 0 ? 0 : 15 - 12 * (speed / 100)),
    [speed]
  );

  const cfg = useMemo(
    () => ({ mode, classicType, angle, colors, turbulence, distort, grain, blobs, seed }),
    [mode, classicType, angle, colors, turbulence, distort, grain, blobs, seed]
  );

  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;
  const loopRef = useRef(loopDur);
  loopRef.current = loopDur;
  const playRef = useRef(playing);
  playRef.current = playing;

  /* preview loop --------------------------------------------------- */
  useEffect(() => {
    let raf;
    const tick = (now) => {
      const c = canvasRef.current;
      if (c) {
        const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
        lastRef.current = now;
        if (playRef.current && loopRef.current > 0) {
          phaseRef.current = (phaseRef.current + dt / loopRef.current) % 1;
        }
        const ctx = c.getContext("2d");
        drawScene(
          ctx,
          c.width,
          c.height,
          phaseRef.current,
          cfgRef.current,
          tiles,
          bufRef.current
        );
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [tiles]);

  /* keep preview canvas at the export aspect ----------------------- */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const max = 1280;
    const scale = Math.min(1, max / Math.max(size.w, size.h));
    c.width = Math.round(size.w * scale);
    c.height = Math.round(size.h * scale);
  }, [size]);

  /* ---------------------------------------------------------------- */

  const setColor = (i, v) =>
    setColors((cs) => cs.map((c, j) => (j === i ? v : c)));

  const addColor = () =>
    setColors((cs) => (cs.length >= 6 ? cs : [...cs, hsl(Math.random() * 360, 70, 55)]));

  const removeColor = (i) =>
    setColors((cs) => (cs.length <= 2 ? cs : cs.filter((_, j) => j !== i)));

  const randomize = () => {
    const base = Math.random() * 360;
    const n = colors.length;
    const spread = 40 + Math.random() * 90;
    setColors(
      Array.from({ length: n }, (_, i) =>
        hsl(base + (i / n) * spread * (Math.random() > 0.5 ? 1 : -1), 45 + Math.random() * 45, 22 + (i / n) * 55)
      )
    );
    setSeed(Math.floor(Math.random() * 99999));
  };

  const download = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const exportPNG = () => {
    const c = document.createElement("canvas");
    c.width = size.w;
    c.height = size.h;
    drawScene(c.getContext("2d"), size.w, size.h, phaseRef.current, cfg, tiles, {});
    c.toBlob((b) => {
      if (b) download(b, `gradiente-${size.w}x${size.h}.png`);
      setStatus("PNG salvo");
    }, "image/png");
  };

  const exportSVG = () => {
    const svg = buildSVG(cfg, phaseRef.current, size.w, size.h);
    download(new Blob([svg], { type: "image/svg+xml" }), `gradiente-${size.w}x${size.h}.svg`);
    setStatus("SVG salvo");
  };

  const pickMime = () => {
    const opts = [
      "video/mp4;codecs=avc1.42E01E",
      "video/mp4",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ];
    for (const m of opts) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) return m;
    }
    return "";
  };

  const recordVideo = useCallback(() => {
    if (loopDur === 0) {
      setStatus("Aumente a velocidade para gravar o vídeo");
      return;
    }
    const c = document.createElement("canvas");
    c.width = size.w;
    c.height = size.h;
    const ctx = c.getContext("2d");
    const recBuf = {};
    const stream = c.captureStream(30);
    const mime = pickMime();
    let rec;
    try {
      rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 14000000 } : undefined);
    } catch {
      setStatus("Este navegador não permite gravar vídeo do canvas");
      return;
    }
    const ext = (rec.mimeType || mime || "video/webm").includes("mp4") ? "mp4" : "webm";
    const chunks = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      download(new Blob(chunks, { type: rec.mimeType || "video/webm" }), `gradiente-${size.w}x${size.h}.${ext}`);
      setRecording(false);
      setRecProgress(0);
      setStatus(`Vídeo ${ext.toUpperCase()} salvo`);
    };

    setRecording(true);
    setStatus("");
    rec.start();
    const t0 = performance.now();
    let raf;
    const step = (now) => {
      const el = (now - t0) / 1000;
      const ph = (el / loopDur) % 1;
      drawScene(ctx, size.w, size.h, ph, cfgRef.current, tiles, recBuf);
      setRecProgress(Math.min(1, el / loopDur));
      if (el < loopDur && stopRecRef.current !== "abort") {
        raf = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(raf);
        stopRecRef.current = null;
        rec.stop();
      }
    };
    raf = requestAnimationFrame(step);
  }, [loopDur, size, tiles]);

  const code = useMemo(
    () =>
      buildCode(cfg, Math.max(2, Math.round(loopDur || 8)), codeAnimated, size.w, size.h),
    [cfg, loopDur, codeAnimated, size]
  );

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Código copiado");
    } catch {
      setStatus("Selecione o texto e copie manualmente");
    }
  };

  /* ---------------------------------------------------------------- */

  return (
    <div className="gm-app" data-tema={tema}>
      <style>{CSS}</style>

      <aside className="gm-painel">
        <Header
          tool="gradient maker"
          homeHref={HUB_URL}
          tema={tema}
          onToggleTema={() => setTema((t) => (t === "escuro" ? "claro" : "escuro"))}
        />

        <Secao titulo="Tipo">
          <div className="gm-controle">
            <Seletor
              value={mode}
              onChange={setMode}
              options={[
                { value: "mesh", label: "mesh" },
                { value: "classic", label: "clássico" },
              ]}
            />
          </div>
          {mode === "classic" && (
            <>
              <div className="gm-controle">
                <Seletor
                  value={classicType}
                  onChange={setClassicType}
                  options={[
                    { value: "linear", label: "linear" },
                    { value: "radial", label: "radial" },
                  ]}
                />
              </div>
              {classicType === "linear" && (
                <Slider
                  label="Ângulo"
                  value={angle}
                  onChange={setAngle}
                  min={0}
                  max={360}
                  unidade="°"
                  acento="cyan"
                />
              )}
            </>
          )}
        </Secao>

        <Secao titulo="Movimento">
          <Slider
            label="Velocidade"
            value={speed}
            onChange={setSpeed}
            acento="mag"
            nota={
              speed === 0
                ? "Parado — gradiente estático"
                : `Ciclo de ${loopDur.toFixed(1)}s`
            }
          />
          <Slider
            label="Turbulência"
            value={turbulence}
            onChange={setTurbulence}
            acento="cyan"
          />
          {mode === "mesh" && (
            <Slider
              label="Distorção"
              value={distort}
              onChange={setDistort}
              acento="cyan"
              nota="Deforma o campo inteiro, como tecido ou água"
            />
          )}
          <Slider
            label="Granulação"
            value={grain}
            onChange={setGrain}
            acento="mag"
          />
        </Secao>

        <Secao titulo={`Cores · ${colors.length} de 6`}>
          {colors.map((c, i) => (
            <div className="gm-cor" key={i}>
              <input
                type="color"
                className="gm-swatch"
                value={c}
                onChange={(e) => setColor(i, e.target.value)}
                aria-label={`Cor ${i + 1}`}
              />
              <input
                className="gm-valor gm-valor--hex"
                value={c}
                onChange={(e) => setColor(i, e.target.value)}
              />
              <button
                type="button"
                className="gm-botao gm-botao--icone"
                onClick={() => removeColor(i)}
                disabled={colors.length <= 2}
                aria-label="Remover cor"
              >
                <X size={13} />
              </button>
            </div>
          ))}

          <div className="gm-grade2" style={{ marginTop: 10 }}>
            <button
              type="button"
              className="gm-botao"
              onClick={addColor}
              disabled={colors.length >= 6}
            >
              <Plus size={13} /> cor
            </button>
            <button type="button" className="gm-botao" onClick={randomize}>
              <Shuffle size={13} /> sortear
            </button>
          </div>

          <div className="gm-paletas">
            {PRESETS.map((pal, i) => (
              <button
                key={i}
                type="button"
                className="gm-paleta"
                onClick={() => setColors(pal)}
                style={{ background: `linear-gradient(90deg, ${pal.join(",")})` }}
                aria-label={`Paleta ${i + 1}`}
              />
            ))}
          </div>
        </Secao>

        <Secao titulo="Exportação">
          <div className="gm-controle">
            <div className="gm-controle-cab">
              <label className="gm-rotulo">Tamanho</label>
            </div>
            <select
              className="gm-valor"
              style={{ width: "100%", textAlign: "left", padding: "6px 5px" }}
              value={sizeIdx}
              onChange={(e) => setSizeIdx(Number(e.target.value))}
            >
              {SIZES.map((sz, i) => (
                <option key={sz.label} value={i}>
                  {sz.label} px
                </option>
              ))}
            </select>
          </div>

          <div className="gm-grade2">
            <button
              type="button"
              className="gm-botao gm-botao--primario"
              onClick={exportPNG}
            >
              <Download size={13} /> png
            </button>
            <button type="button" className="gm-botao" onClick={exportSVG}>
              <Download size={13} /> svg
            </button>
            {recording ? (
              <button
                type="button"
                className="gm-botao gm-botao--gravando"
                onClick={() => (stopRecRef.current = "abort")}
              >
                <Square size={11} /> {Math.round(recProgress * 100)}%
              </button>
            ) : (
              <button
                type="button"
                className="gm-botao"
                onClick={recordVideo}
                disabled={loopDur === 0}
              >
                <Video size={13} /> vídeo
              </button>
            )}
            <button
              type="button"
              className={`gm-botao${codeOpen ? " is-ativo" : ""}`}
              onClick={() => setCodeOpen((v) => !v)}
            >
              <Code2 size={13} /> código
            </button>
          </div>

          <p className="gm-nota">
            {loopDur > 0
              ? "O vídeo grava um ciclo inteiro, então repete sem emenda. Sai em MP4 onde o navegador suporta; senão, WebM."
              : "Velocidade em 0: exporte em PNG ou SVG."}
          </p>
        </Secao>

        <Footer
          links={[
            { label: "bento maker", href: "https://bento-maker-three.vercel.app/" },
            { label: "grid maker", href: "https://github.com/gugaxd/gri.d.maker" },
          ]}
        />
      </aside>

      <main className="gm-main">
        <div className="gm-barra">
          <span>
            <strong>{mode === "mesh" ? "MESH" : classicType.toUpperCase()}</strong>
          </span>
          <span>
            {size.w} × {size.h} PX
          </span>
          <span>{loopDur > 0 ? `LOOP ${loopDur.toFixed(1)}S` : "ESTÁTICO"}</span>
          {status && <span>{status.toUpperCase()}</span>}
          <span className="gm-barra-fim">
            <button
              type="button"
              className="gm-botao"
              onClick={() => setPlaying((v) => !v)}
              disabled={loopDur === 0}
            >
              {playing ? <Pause size={13} /> : <Play size={13} />}
              {playing ? "pausar" : "reproduzir"}
            </button>
          </span>
        </div>

        <div className="gm-palco">
          <div className="gm-doc">
            <canvas ref={canvasRef} className="gm-documento" />
            <span className="gm-registro" style={{ left: -19, top: -19 }} />
            <span className="gm-registro" style={{ right: -19, top: -19 }} />
            <span className="gm-registro" style={{ left: -19, bottom: -19 }} />
            <span className="gm-registro" style={{ right: -19, bottom: -19 }} />
          </div>
        </div>

        {codeOpen && (
          <div className="gm-codigo">
            <div className="gm-codigo-cab">
              <Seletor
                value={codeAnimated ? "anim" : "static"}
                onChange={(v) => setCodeAnimated(v === "anim")}
                options={[
                  { value: "static", label: "estático" },
                  { value: "anim", label: "animado" },
                ]}
              />
              <button
                type="button"
                className="gm-botao gm-botao--primario"
                onClick={copyCode}
                style={{ marginLeft: "auto" }}
              >
                <Copy size={13} /> copiar
              </button>
            </div>
            <textarea readOnly value={code} spellCheck={false} />
          </div>
        )}
      </main>
    </div>
  );
}
