/* ------------------------------------------------------------------ */
/* Catálogo de formas                                                  */
/*                                                                     */
/* Cada forma declara a grade (quantas linhas em u e em v), os         */
/* parâmetros próprios, a câmera inicial e um `build` que desenha na   */
/* Cena. `g` traz as divisões (nu, nv), as direções ligadas (lu, lv) e */
/* `res`, o fator de tesselagem — 1 no palco, menor nas miniaturas.    */
/* ------------------------------------------------------------------ */

import earcut from "earcut";
import { patch, tubo, v3, fbm3 } from "./wireframe.js";

const TAU = Math.PI * 2;
const PI = Math.PI;

const R = (g, n) => Math.max(2, Math.round(n * g.res));
const D = (g) => ({ lu: g.lu, lv: g.lv });
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- peças reaproveitadas ---------- */

function esfera(c, g, { nu, nv, raio = 1, centro = [0, 0, 0], achat = 0 }) {
  const k = 1 - achat;
  patch(
    c,
    (u, v) => {
      const th = u * TAU, ph = v * PI;
      return [
        centro[0] + raio * Math.sin(ph) * Math.cos(th),
        centro[1] + raio * Math.cos(ph) * k,
        centro[2] + raio * Math.sin(ph) * Math.sin(th),
      ];
    },
    { nu, nv, fu: true, ru: R(g, 120), rv: R(g, 72), ...D(g) }
  );
}

/* disco ou coroa no plano perpendicular a `eixo`; raios = linhas de u */
function disco(c, g, { nu, ru, r0 = 0, r1 = 1, base, e1, e2, nv = 1 }) {
  patch(
    c,
    (u, t) => {
      const r = lerp(r0, r1, t);
      const a = u * TAU;
      return v3.add(base, v3.add(v3.mul(e1, Math.cos(a) * r), v3.mul(e2, Math.sin(a) * r)));
    },
    { nu, nv, fu: true, ru, rv: 1, ...D(g) }
  );
}

function plano(c, g, f, { nu, nv, ru = 1, rv = 1 }) {
  patch(c, (u, v) => f(u * 2 - 1, v * 2 - 1), { nu, nv, ru, rv, ...D(g) });
}

/* ---------- poliedros ---------- */

const PHI = (1 + Math.sqrt(5)) / 2;

const POLIEDROS = {
  tetra: {
    v: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]],
    f: [[0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2]],
  },
  octa: {
    v: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]],
    f: [[2, 4, 0], [2, 0, 5], [2, 5, 1], [2, 1, 4], [3, 0, 4], [3, 5, 0], [3, 1, 5], [3, 4, 1]],
  },
  icosa: {
    v: [
      [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
      [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
      [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
    ],
    f: [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ],
  },
};

/* Dodecaedro como dual do icosaedro: cada face do icosaedro vira um vértice,
   cada vértice vira um pentágono, dividido em 5 triângulos a partir do centro. */
function dodecaedro() {
  const I = POLIEDROS.icosa;
  const vi = I.v.map(v3.norm);
  const centros = I.f.map((f) => v3.norm(v3.add(v3.add(vi[f[0]], vi[f[1]]), vi[f[2]])));
  const faces = [];
  vi.forEach((n, k) => {
    const ids = I.f.map((f, i) => (f.includes(k) ? i : -1)).filter((i) => i >= 0);
    const a = v3.norm(v3.cross(n, Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
    const b = v3.cross(n, a);
    ids.sort((p, q) => {
      const P = centros[p], Q = centros[q];
      return Math.atan2(v3.dot(P, b), v3.dot(P, a)) - Math.atan2(v3.dot(Q, b), v3.dot(Q, a));
    });
    faces.push(ids.map((i) => centros[i]));
  });
  return faces;
}

function triangulo(c, g, A, B, C, n, esf, arestas) {
  const Q = (i, j) => {
    const p = v3.add(A, v3.add(v3.mul(v3.sub(B, A), i / n), v3.mul(v3.sub(C, A), j / n)));
    return esf ? v3.lerp(p, v3.norm(p), esf) : p;
  };
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n - i; j++) {
      c.tri(Q(i, j), Q(i + 1, j), Q(i, j + 1));
      if (i + j < n - 1) c.tri(Q(i + 1, j), Q(i + 1, j + 1), Q(i, j + 1));
    }
  /* três famílias de linhas paralelas às arestas; k = 0 é a própria aresta.
     Aresta interna (raio do pentágono) só aparece quando a face é subdividida. */
  const [ab, bc, ca] = arestas;
  const desenha = (k, aresta) => k > 0 || aresta || n > 1;
  for (let k = 0; k < n; k++) {
    const m = n - k;
    const fi = [], fj = [], fs = [];
    for (let t = 0; t <= m; t++) {
      fi.push(Q(k, t));
      fj.push(Q(t, k));
      fs.push(Q(t, m - t));
    }
    if (desenha(k, ca)) c.linha(fi);
    if (desenha(k, ab)) c.linha(fj);
    if (desenha(k, bc)) c.linha(fs);
  }
}

/* ---------- catálogo ---------- */

export const FORMAS = [
  {
    id: "esfera",
    nome: "esfera",
    grade: { u: { rotulo: "Meridianos", min: 3, max: 72, padrao: 24 }, v: { rotulo: "Paralelos", min: 2, max: 48, padrao: 16 } },
    params: [{ id: "achat", rotulo: "Achatamento", min: 0, max: 90, padrao: 0, unidade: "%" }],
    camera: { rx: 18, ry: 0, rz: 0, persp: 0, escala: 100 },
    build(c, g, p) {
      esfera(c, g, { nu: g.nu, nv: g.nv, achat: p.achat / 100 });
    },
  },
  {
    id: "blob",
    nome: "blob",
    grade: { u: { rotulo: "Meridianos", min: 3, max: 72, padrao: 28 }, v: { rotulo: "Paralelos", min: 2, max: 48, padrao: 18 } },
    params: [
      { id: "def", rotulo: "Deformação", min: 0, max: 100, padrao: 55, unidade: "%" },
      { id: "freq", rotulo: "Escala do ruído", min: 5, max: 40, padrao: 12, unidade: "" },
      { id: "semente", rotulo: "Semente", tipo: "semente", padrao: 7 },
    ],
    camera: { rx: 15, ry: 20, rz: 0, persp: 0, escala: 100 },
    build(c, g, p) {
      const f = p.freq / 10;
      const a = (p.def / 100) * 1.4;
      patch(
        c,
        (u, v) => {
          const th = u * TAU, ph = v * PI;
          const d = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)];
          const n = fbm3(d[0] * f + 5.2, d[1] * f + 1.7, d[2] * f + 9.4, 3, p.semente);
          return v3.mul(d, 1 + a * (n - 0.5));
        },
        { nu: g.nu, nv: g.nv, fu: true, ru: R(g, 120), rv: R(g, 80), ...D(g) }
      );
    },
  },
  {
    id: "cubo",
    nome: "cubo",
    grade: { u: { rotulo: "Divisões", min: 1, max: 24, padrao: 3 } },
    params: [
      { id: "alt", rotulo: "Altura", min: 20, max: 300, padrao: 100, unidade: "%" },
      { id: "prof", rotulo: "Profundidade", min: 20, max: 300, padrao: 100, unidade: "%" },
    ],
    camera: { rx: 24, ry: 36, rz: 0, persp: 0, escala: 100 },
    build(c, g, p) {
      const a = 1, b = p.alt / 100, d = p.prof / 100;
      const m = Math.min(a, b, d);
      const n = (L) => Math.max(1, Math.round((g.nu * L) / m));
      const face = (o, e1, e2, n1, n2) =>
        patch(c, (u, v) => v3.add(o, v3.add(v3.mul(e1, u), v3.mul(e2, v))), { nu: n1, nv: n2, ...D(g) });
      const [na, nb, nd] = [n(a), n(b), n(d)];
      face([-a, b, -d], [2 * a, 0, 0], [0, 0, 2 * d], na, nd);
      face([-a, -b, -d], [2 * a, 0, 0], [0, 0, 2 * d], na, nd);
      face([a, -b, -d], [0, 2 * b, 0], [0, 0, 2 * d], nb, nd);
      face([-a, -b, -d], [0, 2 * b, 0], [0, 0, 2 * d], nb, nd);
      face([-a, -b, d], [2 * a, 0, 0], [0, 2 * b, 0], na, nb);
      face([-a, -b, -d], [2 * a, 0, 0], [0, 2 * b, 0], na, nb);
    },
  },
  {
    id: "cone",
    nome: "cone",
    grade: { u: { rotulo: "Ao redor", min: 3, max: 72, padrao: 24 }, v: { rotulo: "Ao longo", min: 1, max: 48, padrao: 10 } },
    params: [
      { id: "topo", rotulo: "Raio do topo", min: 0, max: 95, padrao: 0, unidade: "%" },
      { id: "alt", rotulo: "Altura", min: 30, max: 300, padrao: 110, unidade: "%" },
    ],
    camera: { rx: 16, ry: 0, rz: 0, persp: 0, escala: 100 },
    build(c, g, p) {
      const h = (p.alt / 100) * 2, t = p.topo / 100, ru = R(g, 120);
      patch(
        c,
        (u, v) => {
          const r = lerp(1, t, v), a = u * TAU;
          return [r * Math.cos(a), -h / 2 + h * v, r * Math.sin(a)];
        },
        { nu: g.nu, nv: g.nv, fu: true, ru, rv: 1, ...D(g) }
      );
      disco(c, g, { nu: g.nu, ru, base: [0, -h / 2, 0], e1: [1, 0, 0], e2: [0, 0, 1] });
      if (t > 0) disco(c, g, { nu: g.nu, ru, r1: t, base: [0, h / 2, 0], e1: [1, 0, 0], e2: [0, 0, 1] });
    },
  },
  {
    id: "piramide",
    nome: "pirâmide",
    grade: { u: { rotulo: "Divisões na base", min: 1, max: 16, padrao: 1 }, v: { rotulo: "Níveis", min: 1, max: 24, padrao: 1 } },
    params: [
      { id: "lados", rotulo: "Lados", min: 3, max: 10, padrao: 4, unidade: "" },
      { id: "alt", rotulo: "Altura", min: 30, max: 300, padrao: 110, unidade: "%" },
    ],
    camera: { rx: 18, ry: 20, rz: 0, persp: 0, escala: 100 },
    build(c, g, p) {
      const n = p.lados, h = (p.alt / 100) * 1.6;
      const B = Array.from({ length: n }, (_, k) => {
        const a = (k / n) * TAU + PI / n + PI / 2;
        return [Math.cos(a), -h / 2, Math.sin(a)];
      });
      const A = [0, h / 2, 0];
      for (let k = 0; k < n; k++) {
        const b0 = B[k], b1 = B[(k + 1) % n];
        patch(c, (u, v) => v3.lerp(v3.lerp(b0, b1, u), A, v), { nu: g.nu, nv: g.nv, ...D(g) });
        c.tri([0, -h / 2, 0], b1, b0);
      }
    },
  },
  {
    id: "poliedro",
    nome: "poliedro",
    grade: { u: { rotulo: "Divisões", min: 1, max: 10, padrao: 1 } },
    params: [
      {
        id: "tipo",
        rotulo: "Tipo",
        tipo: "opcoes",
        padrao: "icosa",
        opcoes: [
          { value: "tetra", label: "4" },
          { value: "octa", label: "8" },
          { value: "dodeca", label: "12" },
          { value: "icosa", label: "20" },
        ],
      },
      { id: "esf", rotulo: "Esfericidade", min: 0, max: 100, padrao: 0, unidade: "%" },
    ],
    camera: { rx: 14, ry: 18, rz: 0, persp: 0, escala: 100 },
    build(c, g, p) {
      const n = g.nu, s = p.esf / 100;
      if (p.tipo === "dodeca") {
        for (const pent of dodecaedro()) {
          const cen = v3.mul(pent.reduce((a, b) => v3.add(a, b), [0, 0, 0]), 1 / 5);
          for (let k = 0; k < 5; k++) triangulo(c, g, cen, pent[k], pent[(k + 1) % 5], n, s, [false, true, false]);
        }
        return;
      }
      const P = POLIEDROS[p.tipo];
      const v = P.v.map(v3.norm);
      for (const f of P.f) triangulo(c, g, v[f[0]], v[f[1]], v[f[2]], n, s, [true, true, true]);
    },
  },
  {
    id: "tubo",
    nome: "tubo",
    grade: { u: { rotulo: "Ao redor", min: 3, max: 72, padrao: 24 }, v: { rotulo: "Ao longo", min: 1, max: 48, padrao: 8 } },
    params: [
      { id: "comp", rotulo: "Comprimento", min: 20, max: 400, padrao: 150, unidade: "%" },
      { id: "parede", rotulo: "Parede", min: 5, max: 100, padrao: 30, unidade: "%" },
    ],
    camera: { rx: 16, ry: -32, rz: 0, persp: 0, escala: 100 },
    build(c, g, p) {
      const L = p.comp / 100, ri = 1 - p.parede / 100, ru = R(g, 120);
      const cil = (r) =>
        patch(c, (u, v) => [-L + 2 * L * v, r * Math.cos(u * TAU), r * Math.sin(u * TAU)], {
          nu: g.nu, nv: g.nv, fu: true, ru, rv: 1, ...D(g),
        });
      cil(1);
      if (ri > 0.001) cil(ri);
      for (const x of [-L, L]) disco(c, g, { nu: g.nu, ru, r0: ri, base: [x, 0, 0], e1: [0, 1, 0], e2: [0, 0, 1] });
    },
  },
  {
    id: "capsula",
    nome: "cápsula",
    grade: { u: { rotulo: "Ao redor", min: 3, max: 72, padrao: 24 }, v: { rotulo: "Ao longo", min: 2, max: 64, padrao: 20 } },
    params: [{ id: "comp", rotulo: "Comprimento", min: 0, max: 400, padrao: 140, unidade: "%" }],
    camera: { rx: 14, ry: 0, rz: -35, persp: 0, escala: 100 },
    build(c, g, p) {
      const L = p.comp / 100, tot = PI + 2 * L;
      const nc = Math.max(1, Math.round((g.nv * (PI / 2)) / tot));
      const nl = Math.max(1, Math.round((g.nv * 2 * L) / tot));
      const ru = R(g, 120);
      const rev = (prof, nv, rv) =>
        patch(c, (u, v) => { const [r, y] = prof(v); return [r * Math.cos(u * TAU), y, r * Math.sin(u * TAU)]; },
          { nu: g.nu, nv, fu: true, ru, rv, ...D(g) });
      rev((v) => [Math.sin((v * PI) / 2), L + Math.cos((v * PI) / 2)], nc, R(g, 36));
      if (L > 0) rev((v) => [1, L - 2 * L * v], nl, 1);
      rev((v) => [Math.cos((v * PI) / 2), -L - Math.sin((v * PI) / 2)], nc, R(g, 36));
    },
  },
  {
    id: "toro",
    nome: "toro",
    grade: { u: { rotulo: "Ao redor do anel", min: 3, max: 144, padrao: 48 }, v: { rotulo: "Ao redor do tubo", min: 3, max: 48, padrao: 16 } },
    params: [
      { id: "esp", rotulo: "Espessura", min: 5, max: 95, padrao: 38, unidade: "%" },
      { id: "arco", rotulo: "Arco", min: 20, max: 360, padrao: 360, unidade: "°" },
    ],
    camera: { rx: 32, ry: 0, rz: 0, persp: 0, escala: 100 },
    build(c, g, p) {
      const r = p.esp / 100, arco = (p.arco * PI) / 180, fechado = p.arco >= 360;
      const rv = R(g, 48);
      patch(
        c,
        (u, v) => {
          const f = arco * u, t = v * TAU;
          return [(1 + r * Math.cos(t)) * Math.cos(f), r * Math.sin(t), (1 + r * Math.cos(t)) * Math.sin(f)];
        },
        { nu: g.nu, nv: g.nv, fu: fechado, fv: true, ru: R(g, 160), rv, ...D(g) }
      );
      if (!fechado)
        for (const f of [0, arco])
          disco(c, g, {
            nu: g.nv, ru: rv, r1: r,
            base: [Math.cos(f), 0, Math.sin(f)], e1: [Math.cos(f), 0, Math.sin(f)], e2: [0, 1, 0],
          });
    },
  },
  {
    id: "planeta",
    nome: "planeta",
    grade: { u: { rotulo: "Meridianos", min: 4, max: 72, padrao: 24 }, v: { rotulo: "Paralelos", min: 2, max: 48, padrao: 14 } },
    params: [
      { id: "anel", rotulo: "Largura do anel", min: 0, max: 150, padrao: 75, unidade: "%" },
      { id: "dist", rotulo: "Folga do anel", min: 105, max: 200, padrao: 130, unidade: "%" },
      { id: "faixas", rotulo: "Faixas do anel", min: 1, max: 16, padrao: 5, unidade: "" },
    ],
    camera: { rx: 20, ry: 0, rz: -16, persp: 0, escala: 100 },
    build(c, g, p) {
      esfera(c, g, { nu: g.nu, nv: g.nv });
      if (p.anel > 0) {
        const r0 = p.dist / 100;
        disco(c, g, {
          nu: g.nu * 2, ru: R(g, 200), r0, r1: r0 + p.anel / 100, nv: p.faixas,
          base: [0, 0, 0], e1: [1, 0, 0], e2: [0, 0, 1],
        });
      }
    },
  },
  {
    id: "cupula",
    nome: "cúpula",
    grade: { u: { rotulo: "Meridianos", min: 4, max: 72, padrao: 24 }, v: { rotulo: "Paralelos", min: 1, max: 32, padrao: 8 } },
    params: [
      { id: "base", rotulo: "Plano", tipo: "opcoes", padrao: "sim", opcoes: [{ value: "sim", label: "com plano" }, { value: "nao", label: "sem plano" }] },
      { id: "tam", rotulo: "Tamanho do plano", min: 120, max: 400, padrao: 180, unidade: "%" },
    ],
    camera: { rx: 26, ry: 30, rz: 0, persp: 30, escala: 100 },
    build(c, g, p) {
      patch(
        c,
        (u, v) => {
          const th = u * TAU, ph = (v * PI) / 2;
          return [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)];
        },
        { nu: g.nu, nv: g.nv, fu: true, ru: R(g, 120), rv: R(g, 40), ...D(g) }
      );
      if (p.base === "sim") {
        const s = p.tam / 100, n = Math.max(2, Math.round((g.nu / 4) * s));
        plano(c, g, (x, z) => [x * s, 0, z * s], { nu: n, nv: n });
      }
    },
  },
  {
    id: "mola",
    nome: "mola",
    grade: { u: { rotulo: "Anéis por volta", min: 3, max: 48, padrao: 18 }, v: { rotulo: "Ao redor do tubo", min: 3, max: 32, padrao: 10 } },
    params: [
      { id: "voltas", rotulo: "Voltas", min: 1, max: 16, padrao: 5, unidade: "" },
      { id: "esp", rotulo: "Espessura", min: 5, max: 60, padrao: 24, unidade: "%" },
      { id: "alt", rotulo: "Altura", min: 20, max: 400, padrao: 170, unidade: "%" },
    ],
    camera: { rx: 12, ry: 0, rz: -90, persp: 0, escala: 100 },
    build(c, g, p) {
      const h = (p.alt / 100) * 2, n = p.voltas;
      tubo(c, (t) => { const a = TAU * n * t; return [Math.cos(a), -h / 2 + h * t, Math.sin(a)]; }, (p.esp / 100) * 0.6, {
        nu: g.nu * n, nv: g.nv, ru: R(g, 56) * n, rv: R(g, 32), ...D(g),
      });
    },
  },
  {
    id: "no",
    nome: "nó",
    grade: { u: { rotulo: "Anéis", min: 12, max: 400, padrao: 150 }, v: { rotulo: "Ao redor do tubo", min: 3, max: 32, padrao: 10 } },
    params: [
      {
        id: "tipo",
        rotulo: "Tipo",
        tipo: "opcoes",
        padrao: "2,3",
        opcoes: ["2,3", "2,5", "3,4", "3,5", "2,7"].map((v) => ({ value: v, label: v.replace(",", "·") })),
      },
      { id: "esp", rotulo: "Espessura", min: 5, max: 60, padrao: 32, unidade: "%" },
    ],
    camera: { rx: 0, ry: 0, rz: 0, persp: 0, escala: 100 },
    build(c, g, p) {
      const [P, Q] = p.tipo.split(",").map(Number);
      tubo(
        c,
        (t) => {
          const f = TAU * t, r = 2 + Math.cos(Q * f);
          return [r * Math.cos(P * f), r * Math.sin(P * f), -Math.sin(Q * f)];
        },
        (p.esp / 100) * 0.9,
        { nu: g.nu, nv: g.nv, fechado: true, ru: R(g, 480), rv: R(g, 32), ...D(g) }
      );
    },
  },
  {
    id: "mobius",
    nome: "möbius",
    grade: { u: { rotulo: "Ao longo", min: 6, max: 200, padrao: 64 }, v: { rotulo: "Na largura", min: 1, max: 24, padrao: 6 } },
    params: [
      { id: "larg", rotulo: "Largura", min: 10, max: 120, padrao: 85, unidade: "%" },
      { id: "torcoes", rotulo: "Meias-torções", min: 1, max: 7, padrao: 1, unidade: "" },
    ],
    camera: { rx: 52, ry: 20, rz: 0, persp: 0, escala: 100 },
    build(c, g, p) {
      const w = p.larg / 100, k = p.torcoes;
      patch(
        c,
        (u, v) => {
          const t = u * TAU, s = (v - 0.5) * w, h = (k * t) / 2;
          const r = 1 + s * Math.cos(h);
          return [r * Math.cos(t), s * Math.sin(h), r * Math.sin(t)];
        },
        { nu: g.nu, nv: g.nv, ru: R(g, 200), rv: 1, ...D(g) }
      );
    },
  },
  {
    id: "ampulheta",
    nome: "ampulheta",
    grade: { u: { rotulo: "Ao redor", min: 3, max: 96, padrao: 36 }, v: { rotulo: "Ao longo", min: 2, max: 64, padrao: 22 } },
    params: [
      { id: "cintura", rotulo: "Cintura", min: 3, max: 90, padrao: 18, unidade: "%" },
      { id: "curva", rotulo: "Curvatura", min: 10, max: 80, padrao: 30, unidade: "" },
      { id: "alt", rotulo: "Altura", min: 30, max: 300, padrao: 110, unidade: "%" },
    ],
    camera: { rx: 14, ry: 0, rz: 0, persp: 0, escala: 100 },
    build(c, g, p) {
      const w = p.cintura / 100, e = p.curva / 10, h = (p.alt / 100) * 1.6;
      patch(
        c,
        (u, v) => {
          const t = v * 2 - 1, r = w + (1 - w) * Math.pow(Math.abs(t), e), a = u * TAU;
          return [r * Math.cos(a), (t * h) / 2, r * Math.sin(a)];
        },
        { nu: g.nu, nv: g.nv, fu: true, ru: R(g, 120), rv: R(g, 120), ...D(g) }
      );
    },
  },
  {
    id: "portal",
    nome: "portal",
    grade: { u: { rotulo: "Ao longo do arco", min: 2, max: 96, padrao: 18 }, v: { rotulo: "Na profundidade", min: 1, max: 24, padrao: 3 } },
    params: [
      { id: "esp", rotulo: "Espessura", min: 5, max: 80, padrao: 28, unidade: "%" },
      { id: "pernas", rotulo: "Pernas", min: 0, max: 250, padrao: 80, unidade: "%" },
      { id: "prof", rotulo: "Profundidade", min: 5, max: 250, padrao: 60, unidade: "%" },
    ],
    camera: { rx: 10, ry: -28, rz: 0, persp: 0, escala: 100 },
    build(c, g, p) {
      const ri = 1 - p.esp / 100, Lg = p.pernas / 100, dz = p.prof / 200;
      const z = (w) => -dz + 2 * dz * w;
      const nLeg = Math.max(1, Math.round((g.nu * Lg) / PI));
      const seg = (O, I, n, ru) => {
        patch(c, (s, w) => { const o = O(s); return [o[0], o[1], z(w)]; }, { nu: n, nv: g.nv, ru, rv: 1, ...D(g) });
        patch(c, (s, w) => { const o = I(s); return [o[0], o[1], z(w)]; }, { nu: n, nv: g.nv, ru, rv: 1, ...D(g) });
        for (const zz of [-dz, dz])
          patch(c, (s, t) => { const a = I(s), b = O(s); return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), zz]; }, {
            nu: n, nv: 1, ru, rv: 1, ...D(g),
          });
      };
      seg((s) => [Math.cos(s * PI), Math.sin(s * PI)], (s) => [ri * Math.cos(s * PI), ri * Math.sin(s * PI)], g.nu, R(g, 96));
      const pe = Lg > 0.001;
      if (pe) {
        seg((s) => [1, -Lg * s], (s) => [ri, -Lg * s], nLeg, 1);
        seg((s) => [-1, -Lg * s], (s) => [-ri, -Lg * s], nLeg, 1);
      }
      const yb = pe ? -Lg : 0;
      for (const x of [1, -1])
        patch(c, (t, w) => [lerp(ri * x, x, t), yb, z(w)], { nu: 1, nv: g.nv, ...D(g) });
    },
  },
  {
    id: "escada",
    nome: "escada",
    grade: { u: { rotulo: "Divisões na largura", min: 1, max: 32, padrao: 6 }, v: { rotulo: "Divisões por degrau", min: 1, max: 8, padrao: 1 } },
    params: [
      { id: "degraus", rotulo: "Degraus", min: 2, max: 16, padrao: 6, unidade: "" },
      { id: "larg", rotulo: "Largura", min: 20, max: 300, padrao: 110, unidade: "%" },
    ],
    camera: { rx: 22, ry: -38, rz: 0, persp: 0, escala: 100 },
    build(c, g, p) {
      const n = p.degraus, d = 2 / n, h = (2 / n) * 0.8, w = p.larg / 100;
      const q = (o, e1, e2, nu, nv) =>
        patch(c, (u, v) => v3.add(o, v3.add(v3.mul(e1, u), v3.mul(e2, v))), { nu, nv, ...D(g) });
      for (let i = 0; i < n; i++) {
        const zi = 1 - i * d;
        q([-w, i * h, zi], [2 * w, 0, 0], [0, h, 0], g.nu, g.nv);
        q([-w, (i + 1) * h, zi], [2 * w, 0, 0], [0, 0, -d], g.nu, g.nv);
        for (const x of [-w, w]) {
          const a = [x, 0, zi], b = [x, 0, zi - d], cc = [x, (i + 1) * h, zi - d], dd = [x, (i + 1) * h, zi];
          c.tri(a, b, cc);
          c.tri(a, cc, dd);
        }
      }
      q([-w, 0, -1], [2 * w, 0, 0], [0, n * h, 0], g.nu, g.nv * n);
      q([-w, 0, 1], [2 * w, 0, 0], [0, 0, -2], g.nu, g.nv * n);
    },
  },
  {
    id: "plano",
    nome: "plano",
    grade: { u: { rotulo: "Colunas", min: 1, max: 100, padrao: 16 }, v: { rotulo: "Linhas", min: 1, max: 100, padrao: 16 } },
    params: [
      { id: "prop", rotulo: "Proporção", min: 25, max: 400, padrao: 100, unidade: "%" },
      { id: "curva", rotulo: "Curvatura", min: -100, max: 100, padrao: 0, unidade: "%" },
    ],
    camera: { rx: 30, ry: 0, rz: 0, persp: 55, escala: 100 },
    build(c, g, p) {
      const a = p.prop >= 100 ? 1 : p.prop / 100, d = p.prop >= 100 ? 100 / p.prop : 1;
      const ang = (p.curva / 100) * PI;
      const f = (x, z) => {
        if (Math.abs(ang) < 1e-3) return [x * a, 0, z * d];
        const Rr = (2 * a) / Math.abs(ang), t = (x * Math.abs(ang)) / 2;
        return [Rr * Math.sin(t), Math.sign(ang) * Rr * (1 - Math.cos(t)), z * d];
      };
      plano(c, g, f, { nu: g.nu, nv: g.nv, ru: Math.abs(ang) < 1e-3 ? 1 : R(g, 100) });
    },
  },
  {
    id: "ondas",
    nome: "ondas",
    grade: { u: { rotulo: "Colunas", min: 2, max: 120, padrao: 40 }, v: { rotulo: "Linhas", min: 2, max: 120, padrao: 40 } },
    params: [
      {
        id: "tipo",
        rotulo: "Tipo",
        tipo: "opcoes",
        padrao: "radial",
        opcoes: [
          { value: "linear", label: "linear" },
          { value: "radial", label: "radial" },
          { value: "cruzada", label: "cruzada" },
        ],
      },
      { id: "amp", rotulo: "Amplitude", min: 0, max: 100, padrao: 22, unidade: "%" },
      { id: "freq", rotulo: "Frequência", min: 1, max: 20, padrao: 3, unidade: "" },
      { id: "fase", rotulo: "Fase", min: 0, max: 360, padrao: 0, unidade: "°" },
    ],
    camera: { rx: 34, ry: 28, rz: 0, persp: 25, escala: 115 },
    build(c, g, p) {
      const A = (p.amp / 100) * 0.45, k = PI * p.freq, ph = (p.fase * PI) / 180;
      const y = (x, z) => {
        if (p.tipo === "linear") return A * Math.sin(k * x + ph);
        if (p.tipo === "cruzada") return A * Math.sin(k * x * 0.5 + ph) * Math.sin(k * z * 0.5 + ph);
        return A * Math.cos(k * Math.hypot(x, z) * 0.7 + ph);
      };
      const r = R(g, Math.max(100, p.freq * 22));
      plano(c, g, (x, z) => [x, y(x, z), z], { nu: g.nu, nv: g.nv, ru: r, rv: r });
    },
  },
  {
    id: "terreno",
    nome: "terreno",
    grade: { u: { rotulo: "Colunas", min: 4, max: 120, padrao: 44 }, v: { rotulo: "Linhas", min: 4, max: 120, padrao: 44 } },
    params: [
      { id: "alt", rotulo: "Altura", min: 0, max: 100, padrao: 60, unidade: "%" },
      { id: "rug", rotulo: "Rugosidade", min: 5, max: 60, padrao: 20, unidade: "" },
      { id: "oit", rotulo: "Detalhe", min: 1, max: 6, padrao: 4, unidade: "" },
      { id: "picos", rotulo: "Picos", min: 0, max: 100, padrao: 40, unidade: "%" },
      { id: "conc", rotulo: "Concentração", min: 0, max: 100, padrao: 55, unidade: "%" },
      { id: "semente", rotulo: "Semente", tipo: "semente", padrao: 12 },
    ],
    camera: { rx: 30, ry: 35, rz: 0, persp: 20, escala: 120 },
    build(c, g, p) {
      const A = (p.alt / 100) * 0.9, f = p.rug / 10, pk = p.picos / 100, cc = p.conc / 100;
      const y = (x, z) => {
        const n = fbm3(x * f + 11.3, z * f + 7.1, 0.5, p.oit, p.semente);
        const rid = Math.pow(1 - Math.abs(2 * n - 1), 2);
        const h = Math.min(1, Math.max(0, (lerp(n, rid, pk) - 0.5) * 1.9 + 0.5));
        /* concentração puxa o relevo para uma montanha central */
        const m = Math.exp(-(0.2 + 4.5 * cc) * (x * x + z * z));
        return (A * m * (0.15 + h)) / 1.15;
      };
      const r = R(g, 170);
      plano(c, g, (x, z) => [x, y(x, z), z], { nu: g.nu, nv: g.nv, ru: r, rv: r });
    },
  },
  {
    id: "poco",
    nome: "poço",
    grade: { u: { rotulo: "Colunas", min: 4, max: 100, padrao: 30 }, v: { rotulo: "Linhas", min: 4, max: 100, padrao: 30 } },
    params: [
      { id: "prof", rotulo: "Profundidade", min: -100, max: 100, padrao: 70, unidade: "%" },
      { id: "larg", rotulo: "Largura", min: 5, max: 100, padrao: 30, unidade: "%" },
      { id: "esfera", rotulo: "Esfera", tipo: "opcoes", padrao: "sim", opcoes: [{ value: "sim", label: "com esfera" }, { value: "nao", label: "sem esfera" }] },
    ],
    camera: { rx: 26, ry: 30, rz: 0, persp: 30, escala: 100 },
    build(c, g, p) {
      const Dp = (p.prof / 100) * 0.9, w = (p.larg / 100) * 0.7;
      const y = (x, z) => -Dp / (1 + (x * x + z * z) / (w * w));
      const r = R(g, 180);
      plano(c, g, (x, z) => [x, y(x, z), z], { nu: g.nu, nv: g.nv, ru: r, rv: r });
      if (p.esfera === "sim") {
        /* apoia a esfera na superfície: o centro mais baixo que não a atravessa */
        const rs = w * 1.1;
        let cy = -Infinity;
        for (let i = 0; i <= 48; i++) {
          const rr = (rs * i) / 48;
          cy = Math.max(cy, y(rr, 0) + Math.sqrt(Math.max(0, rs * rs - rr * rr)));
        }
        esfera(c, g, { nu: Math.max(6, Math.round(g.nu * 0.6)), nv: Math.max(4, Math.round(g.nv * 0.4)), raio: rs, centro: [0, cy, 0] });
      }
    },
  },
  {
    id: "vortice",
    nome: "vórtice",
    grade: { u: { rotulo: "Raios", min: 4, max: 120, padrao: 48 }, v: { rotulo: "Anéis", min: 2, max: 80, padrao: 22 } },
    params: [
      { id: "prof", rotulo: "Profundidade", min: 0, max: 100, padrao: 65, unidade: "%" },
      { id: "torcao", rotulo: "Torção", min: -720, max: 720, padrao: 160, unidade: "°" },
      { id: "furo", rotulo: "Abertura", min: 2, max: 60, padrao: 10, unidade: "%" },
    ],
    camera: { rx: 34, ry: 0, rz: 0, persp: 30, escala: 100 },
    build(c, g, p) {
      const r0 = p.furo / 100, Dp = (p.prof / 100) * 1.4, tw = (p.torcao * PI) / 180;
      patch(
        c,
        (u, v) => {
          const r = r0 + (1 - r0) * v;
          const a = u * TAU + tw * (1 - v) * (1 - v);
          return [r * Math.cos(a), (-Dp * (r0 / r - r0)) / (1 - r0), r * Math.sin(a)];
        },
        { nu: g.nu, nv: g.nv, fu: true, ru: R(g, 160), rv: R(g, 120), ...D(g) }
      );
    },
  },
  {
    id: "sela",
    nome: "sela",
    grade: { u: { rotulo: "Colunas", min: 2, max: 100, padrao: 20 }, v: { rotulo: "Linhas", min: 2, max: 100, padrao: 20 } },
    params: [
      { id: "curva", rotulo: "Curvatura", min: 0, max: 100, padrao: 55, unidade: "%" },
      {
        id: "contorno",
        rotulo: "Contorno",
        tipo: "opcoes",
        padrao: "quadrado",
        opcoes: [{ value: "quadrado", label: "quadrado" }, { value: "redondo", label: "redondo" }],
      },
    ],
    camera: { rx: 24, ry: 30, rz: 0, persp: 0, escala: 100 },
    build(c, g, p) {
      const k = (p.curva / 100) * 0.8;
      if (p.contorno === "redondo") {
        patch(
          c,
          (u, v) => { const a = u * TAU, x = v * Math.cos(a), z = v * Math.sin(a); return [x, k * (x * x - z * z), z]; },
          { nu: g.nu, nv: g.nv, fu: true, ru: R(g, 120), rv: R(g, 40), ...D(g) }
        );
        return;
      }
      plano(c, g, (x, z) => [x, k * (x * x - z * z), z], { nu: g.nu, nv: g.nv, ru: R(g, 80), rv: R(g, 80) });
    },
  },
  {
    id: "tunel",
    nome: "túnel",
    grade: { u: { rotulo: "Divisões na seção", min: 1, max: 32, padrao: 6 }, v: { rotulo: "Ao longo", min: 1, max: 60, padrao: 10 } },
    params: [
      {
        id: "secao",
        rotulo: "Seção",
        tipo: "opcoes",
        padrao: "quadrada",
        opcoes: [{ value: "quadrada", label: "quadrada" }, { value: "redonda", label: "redonda" }],
      },
      { id: "comp", rotulo: "Comprimento", min: 50, max: 600, padrao: 220, unidade: "%" },
      { id: "prop", rotulo: "Proporção", min: 25, max: 400, padrao: 100, unidade: "%" },
      { id: "fundo", rotulo: "Fundo", tipo: "opcoes", padrao: "sim", opcoes: [{ value: "sim", label: "fechado" }, { value: "nao", label: "aberto" }] },
    ],
    camera: { rx: 0, ry: 0, rz: 0, persp: 78, escala: 100 },
    build(c, g, p) {
      const Lz = (p.comp / 100) * 1.6;
      const fundo = p.fundo === "sim";
      if (p.secao === "redonda") {
        const nu = g.nu * 4, ru = R(g, 120);
        patch(c, (u, v) => [Math.cos(u * TAU), Math.sin(u * TAU), -Lz * v], { nu, nv: g.nv, fu: true, ru, rv: 1, ...D(g) });
        if (fundo)
          disco(c, g, { nu, ru, nv: Math.max(1, Math.round(g.nu / 2)), base: [0, 0, -Lz], e1: [1, 0, 0], e2: [0, 1, 0] });
        return;
      }
      const a = p.prop >= 100 ? 1 : p.prop / 100, b = p.prop >= 100 ? 100 / p.prop : 1;
      const m = Math.min(a, b);
      const na = Math.max(1, Math.round((g.nu * a) / m)), nb = Math.max(1, Math.round((g.nu * b) / m));
      const q = (o, e1, e2, nu, nv) =>
        patch(c, (u, v) => v3.add(o, v3.add(v3.mul(e1, u), v3.mul(e2, v))), { nu, nv, ...D(g) });
      q([-a, -b, 0], [2 * a, 0, 0], [0, 0, -Lz], na, g.nv);
      q([-a, b, 0], [2 * a, 0, 0], [0, 0, -Lz], na, g.nv);
      q([-a, -b, 0], [0, 2 * b, 0], [0, 0, -Lz], nb, g.nv);
      q([a, -b, 0], [0, 2 * b, 0], [0, 0, -Lz], nb, g.nv);
      if (fundo) q([-a, -b, -Lz], [2 * a, 0, 0], [0, 2 * b, 0], na, nb);
    },
  },
];

export const FORMA = Object.fromEntries(FORMAS.map((f) => [f.id, f]));

export function padroes(forma) {
  const params = {};
  for (const p of forma.params) params[p.id] = p.padrao;
  return {
    params,
    grade: { nu: forma.grade.u.padrao, nv: forma.grade.v ? forma.grade.v.padrao : forma.grade.u.padrao },
    camera: { ...forma.camera },
  };
}

/* ------------------------------------------------------------------ */
/* SVG enviado: extrusão com hachura nas faces                         */
/* ------------------------------------------------------------------ */

/* pontos onde a reta (y = t no eixo 0, x = t no eixo 1) cruza os anéis,
   em ordem — pares consecutivos são os trechos dentro da forma */
function cortes(aneis, eixo, t) {
  const a = eixo === 0 ? 1 : 0, b = eixo === 0 ? 0 : 1;
  const xs = [];
  for (const r of aneis)
    for (let i = 0; i < r.length; i++) {
      const p = r[i], q = r[(i + 1) % r.length];
      if (p[a] > t !== q[a] > t) xs.push(p[b] + ((t - p[a]) * (q[b] - p[b])) / (q[a] - p[a]));
    }
  return xs.sort((m, n) => m - n);
}

/* posições ao longo do anel onde sobe uma aresta vertical: os cantos
   (virada maior que 30°) e, na grade, a cada `passo` de comprimento */
function verticais(r, passo, grade) {
  const n = r.length, out = [];
  const cantos = [];
  for (let i = 0; i < n; i++) {
    const a = r[(i - 1 + n) % n], b = r[i], c = r[(i + 1) % n];
    const u = [b[0] - a[0], b[1] - a[1]], v = [c[0] - b[0], c[1] - b[1]];
    const ang = Math.abs(Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]));
    if (ang > PI / 6) cantos.push(i);
  }
  const acum = [0];
  for (let i = 0; i < n; i++) acum.push(acum[i] + Math.hypot(r[(i + 1) % n][0] - r[i][0], r[(i + 1) % n][1] - r[i][1]));
  for (const i of cantos) out.push({ s: acum[i], p: r[i] });
  if (grade) {
    const L = acum[n];
    const m = Math.max(1, Math.round(L / passo));
    let i = 0;
    for (let k = 0; k < m; k++) {
      const s = (k / m) * L;
      if (cantos.some((j) => Math.abs(acum[j] - s) < passo * 0.3 || L - Math.abs(acum[j] - s) < passo * 0.3)) continue;
      while (acum[i + 1] < s) i++;
      const t = (s - acum[i]) / (acum[i + 1] - acum[i] || 1);
      const p = r[i], q = r[(i + 1) % n];
      out.push({ s, p: [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t] });
    }
  }
  return out.map((o) => o.p);
}

export function formaSVG(dados, arquivo) {
  return {
    id: "svg",
    nome: "svg",
    arquivo,
    grade: {
      u: { rotulo: "Linhas na face", min: 2, max: 120, padrao: 20 },
      v: { rotulo: "Divisões na profundidade", min: 1, max: 24, padrao: 2 },
    },
    params: [
      { id: "prof", rotulo: "Profundidade", min: 0, max: 200, padrao: 30, unidade: "%" },
      {
        id: "face",
        rotulo: "Face",
        tipo: "opcoes",
        padrao: "grade",
        opcoes: [
          { value: "grade", label: "grade" },
          { value: "horizontais", label: "horiz." },
          { value: "verticais", label: "vert." },
          { value: "lisa", label: "lisa" },
        ],
      },
      {
        id: "lateral",
        rotulo: "Lateral",
        tipo: "opcoes",
        padrao: "grade",
        opcoes: [
          { value: "grade", label: "grade" },
          { value: "cantos", label: "só cantos" },
          { value: "lisa", label: "lisa" },
        ],
      },
    ],
    camera: { rx: 16, ry: -30, rz: 0, persp: 0, escala: 100 },
    build(c, g, p) {
      const { aneis, grupos } = dados;
      const d = p.prof / 200;
      const zs = d > 0 ? [d, -d] : [0];
      const passo = 2 / g.nu;

      /* tampas: só triângulos, para o z-buffer */
      for (const gr of grupos) {
        const plano = [], furos = [];
        for (const q of gr.externo) plano.push(q[0], q[1]);
        for (const f of gr.furos) {
          furos.push(plano.length / 2);
          for (const q of f) plano.push(q[0], q[1]);
        }
        const idx = earcut(plano, furos.length ? furos : undefined);
        for (const z of zs) {
          const P = (k) => [plano[2 * k], plano[2 * k + 1], z];
          for (let t = 0; t < idx.length; t += 3) c.tri(P(idx[t]), P(idx[t + 1]), P(idx[t + 2]));
        }
      }

      /* hachura das faces, recortada pela regra par-ou-ímpar */
      if (g.lu && p.face !== "lisa") {
        const eixos = p.face === "grade" ? [0, 1] : p.face === "horizontais" ? [0] : [1];
        for (const eixo of eixos)
          for (let k = 1; k < g.nu; k++) {
            const t = -1 + k * passo + 1e-7;
            const xs = cortes(aneis, eixo, t);
            for (let q = 0; q + 1 < xs.length; q += 2)
              for (const z of zs) {
                const a = eixo === 0 ? [xs[q], t, z] : [t, xs[q], z];
                const b = eixo === 0 ? [xs[q + 1], t, z] : [t, xs[q + 1], z];
                c.linha([a, b]);
              }
          }
      }

      for (const r of aneis) {
        const fechado = (z) => [...r, r[0]].map((q) => [q[0], q[1], z]);
        if (d === 0) {
          c.linha(fechado(0));
          continue;
        }
        /* parede: um quad plano por segmento do contorno, na profundidade toda */
        for (let i = 0; i < r.length; i++) {
          const a = r[i], b = r[(i + 1) % r.length];
          c.tri([a[0], a[1], -d], [b[0], b[1], -d], [b[0], b[1], d]);
          c.tri([a[0], a[1], -d], [b[0], b[1], d], [a[0], a[1], d]);
        }
        /* contornos da frente e de trás sempre; os do meio seguem a malha */
        for (let j = 0; j <= g.nv; j++) {
          if ((j > 0 && j < g.nv) && !g.lv) continue;
          c.linha(fechado(-d + (2 * d * j) / g.nv));
        }
        if (g.lv && p.lateral !== "lisa")
          for (const q of verticais(r, passo, p.lateral === "grade")) c.linha([[q[0], q[1], -d], [q[0], q[1], d]]);
      }
    },
  };
}
