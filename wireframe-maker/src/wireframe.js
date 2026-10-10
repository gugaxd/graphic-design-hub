/* ------------------------------------------------------------------ */
/* Motor do wireframe                                                  */
/*                                                                     */
/* Toda forma vira uma Cena: triângulos (só para o teste de profundidade) */
/* e linhas 3D (o que de fato é desenhado). As linhas passam sempre     */
/* pelos vértices da malha de triângulos, então a profundidade de cada  */
/* ponto da linha bate com a do z-buffer — é isso que permite separar   */
/* trecho visível de trecho oculto sem tolerância grosseira.            */
/* ------------------------------------------------------------------ */

const TAU = Math.PI * 2;

/* ---------- vetores ---------- */

export const v3 = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  norm: (a) => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  },
  lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
};

/* ---------- ruído determinístico ---------- */

function hash(i, j, k, s) {
  let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k, 1274126177) + Math.imul(s, 2654435761)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const suave = (t) => t * t * (3 - 2 * t);

export function ruido3(x, y, z, s = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = suave(x - xi), yf = suave(y - yi), zf = suave(z - zi);
  const l = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz, s);
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), xf), l(c(0, 1, 0), c(1, 1, 0), xf), yf),
    l(l(c(0, 0, 1), c(1, 0, 1), xf), l(c(0, 1, 1), c(1, 1, 1), xf), yf),
    zf
  );
}

/* fbm em [0,1] */
export function fbm3(x, y, z, oitavas, s = 0) {
  let soma = 0, amp = 1, tot = 0, f = 1;
  for (let o = 0; o < oitavas; o++) {
    soma += amp * ruido3(x * f, y * f, z * f, s + o * 31);
    tot += amp;
    amp *= 0.5;
    f *= 2.03;
  }
  return soma / tot;
}

/* ---------- cena ---------- */

function chave(pts) {
  const r = (p) => `${Math.round(p[0] * 1e4)},${Math.round(p[1] * 1e4)},${Math.round(p[2] * 1e4)}`;
  let cx = 0, cy = 0, cz = 0;
  for (const p of pts) {
    cx += p[0];
    cy += p[1];
    cz += p[2];
  }
  const n = pts.length;
  const a = r(pts[0]);
  const b = r(pts[n - 1]);
  return `${a < b ? a + "|" + b : b + "|" + a}|${r([cx / n, cy / n, cz / n])}|${n}`;
}

export class Cena {
  constructor() {
    this.tris = [];
    this.linhas = [];
    this.chaves = new Set();
  }
  tri(a, b, c) {
    this.tris.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  }
  /* linha 3D; descarta pontos degenerados (polos) e duplicatas (aresta de cubo
     compartilhada por duas faces, costura de superfície fechada) */
  linha(pts) {
    if (pts.length < 2) return;
    const p0 = pts[0];
    let ext = 0;
    for (const p of pts) ext = Math.max(ext, Math.abs(p[0] - p0[0]), Math.abs(p[1] - p0[1]), Math.abs(p[2] - p0[2]));
    if (ext < 1e-6) return;
    const k = chave(pts);
    if (this.chaves.has(k)) return;
    this.chaves.add(k);
    this.linhas.push(pts);
  }
}

/* Grade de pontos já calculada → triângulos + linhas.
   P é indexado P[i * (TV + 1) + j]; ku/kv é quantos passos de tesselagem
   cabem entre duas linhas desenhadas. */
export function malha(cena, P, TU, TV, o) {
  const { nu, nv, ku, kv, fu = false, fv = false, lu = true, lv = true, tris = true } = o;
  const at = (i, j) => P[i * (TV + 1) + j];
  if (tris) {
    for (let i = 0; i < TU; i++) {
      for (let j = 0; j < TV; j++) {
        const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1);
        cena.tri(a, b, c);
        cena.tri(a, c, d);
      }
    }
  }
  if (lu) {
    const fim = fu ? nu - 1 : nu;
    for (let i = 0; i <= fim; i++) {
      const I = i * ku;
      const pts = [];
      for (let j = 0; j <= TV; j++) pts.push(at(I, j));
      cena.linha(pts);
    }
  }
  if (lv) {
    const fim = fv ? nv - 1 : nv;
    for (let j = 0; j <= fim; j++) {
      const J = j * kv;
      const pts = [];
      for (let i = 0; i <= TU; i++) pts.push(at(i, J));
      cena.linha(pts);
    }
  }
}

/* Divisões e tesselagem: `n` linhas, no mínimo `res` passos de tesselagem. */
export function passos(n, res) {
  const k = Math.max(1, Math.ceil(res / Math.max(1, n)));
  return { k, T: Math.max(1, n) * k };
}

/* Superfície paramétrica f(u, v), u e v em [0,1]. */
export function patch(cena, f, o) {
  const nu = Math.max(1, o.nu | 0);
  const nv = Math.max(1, o.nv | 0);
  const { k: ku, T: TU } = passos(nu, o.ru ?? 1);
  const { k: kv, T: TV } = passos(nv, o.rv ?? 1);
  const P = new Array((TU + 1) * (TV + 1));
  for (let i = 0; i <= TU; i++) {
    for (let j = 0; j <= TV; j++) P[i * (TV + 1) + j] = f(i / TU, j / TV);
  }
  malha(cena, P, TU, TV, { ...o, nu, nv, ku, kv });
}

/* Tubo ao longo de uma curva, com referencial de transporte paralelo
   (sem a torção brusca do referencial de Frenet). u = ao longo, v = ao redor. */
export function tubo(cena, curva, raio, o) {
  const nu = Math.max(1, o.nu | 0);
  const nv = Math.max(1, o.nv | 0);
  const fechado = !!o.fechado;
  const { k: ku, T: TU } = passos(nu, o.ru ?? 1);
  const { k: kv, T: TV } = passos(nv, o.rv ?? 1);
  const C = [];
  for (let i = 0; i <= TU; i++) C.push(curva(i / TU));
  const T = C.map((_, i) => {
    let a, b;
    if (fechado) {
      a = C[(i - 1 + TU) % TU];
      b = C[(i + 1) % TU];
    } else {
      a = C[Math.max(0, i - 1)];
      b = C[Math.min(TU, i + 1)];
    }
    return v3.norm(v3.sub(b, a));
  });
  const ref = Math.abs(T[0][1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const N = [v3.norm(v3.cross(v3.cross(T[0], ref), T[0]))];
  for (let i = 1; i <= TU; i++) {
    const n = N[i - 1];
    N.push(v3.norm(v3.sub(n, v3.mul(T[i], v3.dot(n, T[i])))));
  }
  /* em curva fechada o referencial não volta igual: distribui a diferença */
  let giro = 0;
  if (fechado) {
    const a = N[TU], b = N[0];
    giro = Math.atan2(v3.dot(v3.cross(a, b), T[0]), v3.dot(a, b));
  }
  const P = new Array((TU + 1) * (TV + 1));
  for (let i = 0; i <= TU; i++) {
    const ang = (giro * i) / TU;
    const t = T[i];
    let n = N[i];
    let b = v3.cross(t, n);
    if (ang) {
      const c = Math.cos(ang), s = Math.sin(ang);
      const n2 = v3.add(v3.mul(n, c), v3.mul(b, s));
      b = v3.cross(t, n2);
      n = n2;
    }
    const r = typeof raio === "function" ? raio(i / TU) : raio;
    for (let j = 0; j <= TV; j++) {
      const th = (j / TV) * TAU;
      const d = v3.add(v3.mul(n, Math.cos(th) * r), v3.mul(b, Math.sin(th) * r));
      P[i * (TV + 1) + j] = v3.add(C[i], d);
    }
  }
  if (fechado) for (let j = 0; j <= TV; j++) P[TU * (TV + 1) + j] = P[j];
  malha(cena, P, TU, TV, { ...o, nu, nv, ku, kv, fu: fechado, fv: true });
}

/* ------------------------------------------------------------------ */
/* Projeção e remoção de linhas ocultas                                */
/* ------------------------------------------------------------------ */

const RAD = Math.PI / 180;

function matriz(rx, ry, rz) {
  const cx = Math.cos(rx * RAD), sx = Math.sin(rx * RAD);
  const cy = Math.cos(ry * RAD), sy = Math.sin(ry * RAD);
  const cz = Math.cos(rz * RAD), sz = Math.sin(rz * RAD);
  /* M = Rx · Ry · Rz — gira no próprio eixo vertical, depois inclina a vista */
  const Rz = [cz, -sz, 0, sz, cz, 0, 0, 0, 1];
  const Ry = [cy, 0, sy, 0, 1, 0, -sy, 0, cy];
  const Rx = [1, 0, 0, 0, cx, -sx, 0, sx, cx];
  const m = (A, B) => {
    const r = new Array(9);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        r[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j];
    return r;
  };
  return m(Rx, m(Ry, Rz));
}

/* Centro e raio da cena, para enquadrar qualquer forma do mesmo jeito. */
export function limites(cena) {
  let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  const v = (x, y, z) => {
    if (x < mn[0]) mn[0] = x;
    if (y < mn[1]) mn[1] = y;
    if (z < mn[2]) mn[2] = z;
    if (x > mx[0]) mx[0] = x;
    if (y > mx[1]) mx[1] = y;
    if (z > mx[2]) mx[2] = z;
  };
  for (const l of cena.linhas) for (const p of l) v(p[0], p[1], p[2]);
  const t = cena.tris;
  for (let i = 0; i < t.length; i += 3) v(t[i], t[i + 1], t[i + 2]);
  if (mn[0] === Infinity) return { c: [0, 0, 0], r: 1 };
  const c = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2];
  let r = 0;
  for (const l of cena.linhas) for (const p of l) r = Math.max(r, Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]));
  for (let i = 0; i < t.length; i += 3)
    r = Math.max(r, Math.hypot(t[i] - c[0], t[i + 1] - c[1], t[i + 2] - c[2]));
  return { c, r: r || 1 };
}

/* Distância da câmera em raios da cena. 0 = ortográfica. */
export function distancia(persp) {
  if (persp <= 0) return Infinity;
  const q = 1 - persp / 100;
  return 1.12 + 14 * q * q;
}

/* Simplificação de Ramer–Douglas–Peucker num run [x0,y0,x1,y1,...]. */
function simplificar(run, tol) {
  const n = run.length / 2;
  if (n <= 2) return run;
  const manter = new Uint8Array(n);
  manter[0] = manter[n - 1] = 1;
  const pilha = [[0, n - 1]];
  const t2 = tol * tol;
  while (pilha.length) {
    const [a, b] = pilha.pop();
    const ax = run[a * 2], ay = run[a * 2 + 1];
    const dx = run[b * 2] - ax, dy = run[b * 2 + 1] - ay;
    const L2 = dx * dx + dy * dy;
    let mx = -1, mi = -1;
    for (let i = a + 1; i < b; i++) {
      const px = run[i * 2] - ax, py = run[i * 2 + 1] - ay;
      let d2;
      if (L2 < 1e-12) d2 = px * px + py * py;
      else {
        const c = px * dy - py * dx;
        d2 = (c * c) / L2;
      }
      if (d2 > mx) {
        mx = d2;
        mi = i;
      }
    }
    if (mx > t2) {
      manter[mi] = 1;
      pilha.push([a, mi], [mi, b]);
    }
  }
  const out = [];
  for (let i = 0; i < n; i++) if (manter[i]) out.push(run[i * 2], run[i * 2 + 1]);
  return out;
}

/*
  cam: { rx, ry, rz, persp (0–100), escala (%) }
  modo: "ocultar" | "tracejar" | "esmaecer" | "raiox"
  qualidade: lado maior do z-buffer, em pixels
  → { linhas: [{ vis: [run], ocu: [run] }], segmentos }
*/
export function renderizar(cena, cam, W, H, { modo = "ocultar", qualidade = 1400 } = {}) {
  const { c, r } = limites(cena);
  const M = matriz(cam.rx, cam.ry, cam.rz);
  const dist = distancia(cam.persp);
  const orto = !Number.isFinite(dist);
  const S = (Math.min(W, H) / 2) * 0.86 * (cam.escala / 100);
  const cx = W / 2, cy = H / 2;
  const PERTO = 0.03;

  /* projeta para coordenadas do documento; k cresce para perto da câmera
     e é linear no espaço de tela (z na ortográfica, 1/d na perspectiva) */
  const proj = (x, y, z, out, o) => {
    x = (x - c[0]) / r;
    y = (y - c[1]) / r;
    z = (z - c[2]) / r;
    const qx = M[0] * x + M[1] * y + M[2] * z;
    const qy = M[3] * x + M[4] * y + M[5] * z;
    const qz = M[6] * x + M[7] * y + M[8] * z;
    if (orto) {
      out[o] = cx + S * qx;
      out[o + 1] = cy - S * qy;
      out[o + 2] = qz;
      return true;
    }
    const d = dist - qz;
    if (d < PERTO) {
      out[o + 2] = NaN;
      return false;
    }
    const f = dist / d;
    out[o] = cx + S * qx * f;
    out[o + 1] = cy - S * qy * f;
    out[o + 2] = 1 / d;
    return true;
  };

  const ocultas = modo !== "raiox";
  let buf = null, BW = 0, BH = 0, bs = 1;

  if (ocultas) {
    bs = qualidade / Math.max(W, H);
    BW = Math.max(1, Math.ceil(W * bs));
    BH = Math.max(1, Math.ceil(H * bs));
    buf = new Float32Array(BW * BH).fill(-Infinity);
    const t = cena.tris;
    const nv = t.length / 3;
    const pr = new Float64Array(nv * 3);
    for (let i = 0; i < nv; i++) proj(t[i * 3], t[i * 3 + 1], t[i * 3 + 2], pr, i * 3);
    const E = -1e-7;
    for (let i = 0; i < nv; i += 3) {
      const o = i * 3;
      const ka = pr[o + 2], kb = pr[o + 5], kc = pr[o + 8];
      if (Number.isNaN(ka) || Number.isNaN(kb) || Number.isNaN(kc)) continue;
      const ax = pr[o] * bs, ay = pr[o + 1] * bs;
      const bx = pr[o + 3] * bs, by = pr[o + 4] * bs;
      const qx = pr[o + 6] * bs, qy = pr[o + 7] * bs;
      const area = (bx - ax) * (qy - ay) - (by - ay) * (qx - ax);
      if (Math.abs(area) < 1e-10) continue;
      const x0 = Math.max(0, Math.floor(Math.min(ax, bx, qx)));
      const x1 = Math.min(BW - 1, Math.ceil(Math.max(ax, bx, qx)));
      const y0 = Math.max(0, Math.floor(Math.min(ay, by, qy)));
      const y1 = Math.min(BH - 1, Math.ceil(Math.max(ay, by, qy)));
      if (x0 > x1 || y0 > y1) continue;
      const ia = 1 / area;
      /* pesos baricêntricos lineares em (px, py) */
      const Ax = -(qy - by) * ia, Ay = (qx - bx) * ia, Ac = ((qy - by) * bx - (qx - bx) * by) * ia;
      const Bx = -(ay - qy) * ia, By = (ax - qx) * ia, Bc = ((ay - qy) * qx - (ax - qx) * qy) * ia;
      for (let y = y0; y <= y1; y++) {
        const py = y + 0.5;
        const px = x0 + 0.5;
        let wa = Ax * px + Ay * py + Ac;
        let wb = Bx * px + By * py + Bc;
        const row = y * BW;
        for (let x = x0; x <= x1; x++, wa += Ax, wb += Bx) {
          const wc = 1 - wa - wb;
          if (wa >= E && wb >= E && wc >= E) {
            const k = wa * ka + wb * kb + wc * kc;
            if (k > buf[row + x]) buf[row + x] = k;
          }
        }
      }
    }
  }

  const TOL = 0.012;
  /* visível se algum pixel vizinho não estiver na frente do ponto:
     tolera o degrau de profundidade das superfícies quase rasantes */
  const visivel = (bx, by, k) => {
    const x = Math.floor(bx), y = Math.floor(by);
    if (x < 0 || y < 0 || x >= BW || y >= BH) return true;
    const eps = TOL * (orto ? 1 : k * k);
    const lim = k + eps;
    const xa = Math.max(0, x - 1), xb = Math.min(BW - 1, x + 1);
    const ya = Math.max(0, y - 1), yb = Math.min(BH - 1, y + 1);
    for (let yy = ya; yy <= yb; yy++) {
      const row = yy * BW;
      for (let xx = xa; xx <= xb; xx++) if (buf[row + xx] <= lim) return true;
    }
    return false;
  };

  const saida = [];
  let segmentos = 0;
  const simpl = 0.06 * Math.max(W, H) / 1080;

  for (const L of cena.linhas) {
    const n = L.length;
    const pr = new Float64Array(n * 3);
    const ok = new Uint8Array(n);
    for (let i = 0; i < n; i++) ok[i] = proj(L[i][0], L[i][1], L[i][2], pr, i * 3) ? 1 : 0;
    const vis = [], ocu = [];
    const ponto = (a, t) => {
      const o = a * 3;
      return [pr[o] + (pr[o + 3] - pr[o]) * t, pr[o + 1] + (pr[o + 4] - pr[o + 1]) * t];
    };
    /* cada trecho contínuo (sem ponto atrás da câmera) vira uma fila de
       amostras de ~0,75px do z-buffer, cada uma visível ou oculta */
    let i = 0;
    while (i < n - 1) {
      if (!ok[i] || !ok[i + 1]) {
        i++;
        continue;
      }
      let j = i;
      while (j < n - 1 && ok[j] && ok[j + 1]) j++;
      const seg = [], sub = [], cnt = [], flag = [];
      for (let a = i; a < j; a++) {
        const o = a * 3;
        const x0 = pr[o], y0 = pr[o + 1], k0 = pr[o + 2];
        const x1 = pr[o + 3], y1 = pr[o + 4], k1 = pr[o + 5];
        const m = ocultas ? Math.max(1, Math.ceil((Math.hypot(x1 - x0, y1 - y0) * bs) / 0.75)) : 1;
        for (let s = 0; s < m; s++) {
          const t = (s + 0.5) / m;
          seg.push(a);
          sub.push(s);
          cnt.push(m);
          flag.push(ocultas ? visivel((x0 + (x1 - x0) * t) * bs, (y0 + (y1 - y0) * t) * bs, k0 + (k1 - k0) * t) : true);
        }
      }
      /* perto da silhueta a visibilidade pisca: trecho mais curto que
         3 amostras é absorvido pelo vizinho em vez de virar fragmento */
      if (ocultas) {
        let a = 0;
        while (a < flag.length) {
          let b = a;
          while (b < flag.length && flag[b] === flag[a]) b++;
          if (b - a < 3 && (a > 0 || b < flag.length) && flag.length > 3)
            for (let q = a; q < b; q++) flag[q] = !flag[q];
          a = b;
        }
      }
      let cur = null, curVis = true;
      const fecha = () => {
        if (cur && cur.length >= 4) (curVis ? vis : ocu).push(cur);
        cur = null;
      };
      for (let q = 0; q < flag.length; q++) {
        const a = seg[q], s = sub[q], m = cnt[q], v = flag[q];
        if (!cur) {
          cur = ponto(a, s / m);
          curVis = v;
        } else if (v !== curVis) {
          const p = ponto(a, s / m);
          cur.push(p[0], p[1]);
          fecha();
          cur = p;
          curVis = v;
        }
        if (s === m - 1) {
          const o = (a + 1) * 3;
          cur.push(pr[o], pr[o + 1]);
        }
      }
      fecha();
      i = j;
    }
    const sv = vis.map((r2) => simplificar(r2, simpl));
    const so = ocu.map((r2) => simplificar(r2, simpl));
    for (const r2 of sv) segmentos += r2.length / 2 - 1;
    if (sv.length || so.length) saida.push({ vis: sv, ocu: so });
  }
  return { linhas: saida, segmentos };
}

/* ------------------------------------------------------------------ */
/* SVG                                                                  */
/* ------------------------------------------------------------------ */

const fmt = (n) => {
  const s = n.toFixed(2);
  return s.indexOf(".") >= 0 ? s.replace(/\.?0+$/, "") : s;
};

function caminho(runs) {
  let d = "";
  for (const r of runs) {
    d += `M${fmt(r[0])} ${fmt(r[1])}L`;
    for (let i = 2; i < r.length; i += 2) d += `${i > 2 ? " " : ""}${fmt(r[i])} ${fmt(r[i + 1])}`;
  }
  return d;
}

/*
  estilo: { traco, fundo, transparente, espessura, modo, opacOcultas }
  As linhas saem só com traço, sem preenchimento, em dois grupos com id —
  o Illustrator lê cada grupo como uma camada.
*/
export function montarSVG(res, W, H, estilo) {
  const { traco, fundo, transparente, espessura, modo, opacOcultas } = estilo;
  const attrs = `fill="none" stroke="${traco}" stroke-width="${fmt(espessura)}" stroke-linecap="round" stroke-linejoin="round"`;
  let out = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  if (!transparente) out += `<rect id="fundo" width="${W}" height="${H}" fill="${fundo}"/>`;
  if (modo === "tracejar" || modo === "esmaecer") {
    const tr = modo === "tracejar" ? ` stroke-dasharray="${fmt(espessura * 3)} ${fmt(espessura * 3)}"` : "";
    out += `<g id="linhas-ocultas" ${attrs} opacity="${fmt(opacOcultas / 100)}"${tr}>`;
    for (const l of res.linhas) if (l.ocu.length) out += `<path d="${caminho(l.ocu)}"/>`;
    out += `</g>`;
  }
  out += `<g id="linhas-visiveis" ${attrs}>`;
  for (const l of res.linhas) if (l.vis.length) out += `<path d="${caminho(l.vis)}"/>`;
  out += `</g></svg>`;
  return out;
}
