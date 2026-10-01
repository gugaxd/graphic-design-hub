/* ============================================================
   amostras.js — miniaturas procedurais da biblioteca
   ------------------------------------------------------------
   Nada de imagem baixada: cada amostra é pintada pixel a pixel a
   partir de ruído (Perlin, fbm, Worley). Dois renderizadores:

   - superfície: mapa de altura + albedo, iluminado pela normal
     derivada da altura (luz rasante para o relevo + softbox para
     o brilho especular)
   - esfera: bola de material num estúdio, com reflexo de ambiente,
     Fresnel e refração do fundo (vidro, gel)

   Os dois são geradores (function*): o agendador fatia o trabalho
   entre quadros e a interface não trava enquanto a biblioteca pinta.
   ============================================================ */

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const mix = (a, b, t) => a + (b - a) * t;
const lisa = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const fract = (x) => x - Math.floor(x);
/* Ombro suave: o que passa de 0,82 é comprimido até 1 em vez de estourar. */
const tom = (x) => (x <= 0.82 ? (x < 0 ? 0 : x) : 0.82 + 0.18 * (1 - Math.exp(-(x - 0.82) / 0.18)));

/* Paleta cosseno — arco-íris contínuo, sem degrau entre matizes. */
function arcoIris(h, out) {
  out[0] = 0.5 + 0.5 * Math.cos(6.2832 * h);
  out[1] = 0.5 + 0.5 * Math.cos(6.2832 * (h - 0.33));
  out[2] = 0.5 + 0.5 * Math.cos(6.2832 * (h - 0.67));
}

/* ------------------------------------------------------------------ */
/* Ruído                                                               */
/* ------------------------------------------------------------------ */
function criaRuido(seed = 1) {
  let s = seed >>> 0 || 1;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const base = new Uint8Array(256);
  for (let i = 0; i < 256; i++) base[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const t = base[i]; base[i] = base[j]; base[j] = t;
  }
  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i++) p[i] = base[i & 255];
  const gx = [1, -1, 1, -1, 1, -1, 0, 0];
  const gy = [1, 1, -1, -1, 0, 0, 1, -1];

  /* Perlin 2D, saída aproximada em [-1, 1]. */
  const n = (x, y) => {
    const X = Math.floor(x), Y = Math.floor(y);
    const xf = x - X, yf = y - Y;
    const xi = X & 255, yi = Y & 255;
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
    const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
    const a = p[p[xi] + yi] & 7, b = p[p[xi + 1] + yi] & 7;
    const c = p[p[xi] + yi + 1] & 7, d = p[p[xi + 1] + yi + 1] & 7;
    const n00 = gx[a] * xf + gy[a] * yf;
    const n10 = gx[b] * (xf - 1) + gy[b] * yf;
    const n01 = gx[c] * xf + gy[c] * (yf - 1);
    const n11 = gx[d] * (xf - 1) + gy[d] * (yf - 1);
    const x1 = n00 + u * (n10 - n00), x2 = n01 + u * (n11 - n01);
    return x1 + v * (x2 - x1);
  };

  /* fbm normalizado — a soma das amplitudes vale 1. */
  const fbm = (x, y, oit = 5) => {
    let soma = 0, amp = 0.5, f = 1, tot = 0;
    for (let i = 0; i < oit; i++) {
      soma += amp * n(x * f + i * 17.3, y * f + i * 9.1);
      tot += amp; amp *= 0.5; f *= 2.03;
    }
    return soma / tot;
  };

  const sd = Math.imul(seed | 0, 0x9e3779b1);
  const hash = (i, j) => {
    let h = (Math.imul(i, 0x27d4eb2d) ^ Math.imul(j, 0x165667b1) ^ sd) | 0;
    h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };

  /* Worley: distância ao ponto mais próximo (f1), ao segundo (f2) e um id
     estável da célula vencedora. O objeto de saída é reaproveitado — leia
     os campos antes da próxima chamada. */
  const W = { f1: 0, f2: 0, id: 0 };
  const worley = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    let f1 = 9, f2 = 9, id = 0;
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) {
        const cx = xi + i, cy = yi + j;
        const dx = cx + hash(cx, cy) - x, dy = cy + hash(cx + 101, cy + 37) - y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < f1) { f2 = f1; f1 = d; id = hash(cx + 53, cy + 211); }
        else if (d < f2) f2 = d;
      }
    }
    W.f1 = f1; W.f2 = f2; W.id = id;
    return W;
  };

  return { n, fbm, worley, hash };
}

/* ------------------------------------------------------------------ */
/* Geradores de superfície                                             */
/* Cada um devolve { relevo, brilho, metal, px(u,v,o), cor? }.         */
/* px escreve altura (o.h) e albedo (o.r, o.g, o.b) para u,v em 0..1.  */
/* cor(nx,ny,u,v,o) é opcional e roda depois da normal (holográfico).  */
/* ------------------------------------------------------------------ */
const SALPICOS = [[0.24, 0.34, 0.62], [0.72, 0.3, 0.24], [0.16, 0.16, 0.17], [0.85, 0.72, 0.3]];

const GERADORES = {
  papel(N, p) {
    const [r0, g0, b0] = p.cor;
    const c1 = 0.866, s1 = 0.5, c2 = 0.574, s2 = 0.819;
    return {
      relevo: p.relevo ?? 0.35,
      brilho: 0.03,
      px(u, v, o) {
        const a1 = u * c1 + v * s1, b1 = -u * s1 + v * c1;
        const a2 = u * c2 - v * s2, b2 = u * s2 + v * c2;
        const fib = N.n(a1 * 7, b1 * 150) * 0.5 + N.n(a2 * 7 + 31, b2 * 150) * 0.5;
        const grao = N.n(u * 280, v * 280);
        const mancha = N.fbm(u * 4, v * 4, 4);
        let h = fib * 0.12 + grao * 0.05 + mancha * 0.1;
        let k = 1 + mancha * 0.16 + fib * 0.08 + grao * 0.04;

        if (p.modo === "aquarela") {
          const wx = u * 22 + N.n(u * 5, v * 5) * 0.45, wy = v * 22 + N.n(u * 5 + 7, v * 5) * 0.45;
          const w = N.worley(wx, wy);
          const dente = 1 - lisa(0, 0.78, w.f1);
          h = dente * 0.45 + N.fbm(u * 9, v * 9, 3) * 0.4 + fib * 0.05;
          k = 0.985 + mancha * 0.05;
        } else if (p.modo === "amassado") {
          let vinco = 0, a = 0.5, f = 1.7;
          for (let i = 0; i < 4; i++) {
            vinco += a * Math.abs(N.n(u * f + i * 3.1, v * f - i * 1.7));
            a *= 0.42; f *= 2.1;
          }
          h = vinco * 1.3 + N.fbm(u * 1.6, v * 1.6, 2) * 0.7 + grao * 0.01;
          k = 0.99 + mancha * 0.04;
        }

        let r = r0 * k, g = g0 * k, b = b0 * k;
        if (p.modo === "kraft" || p.modo === "reciclado") {
          const risco = lisa(0.45, 0.65, N.n(a1 * 9 + 90, b1 * 110));
          r *= 1 - risco * 0.1; g *= 1 - risco * 0.12; b *= 1 - risco * 0.14;
        }
        if (p.modo === "reciclado") {
          const w = N.worley(u * 34, v * 34);
          if (w.id > 0.7 && w.f1 < 0.08 + (w.id - 0.7) * 0.3) {
            const c = SALPICOS[Math.floor(fract(w.id * 13.7) * SALPICOS.length)];
            r = c[0]; g = c[1]; b = c[2]; h -= 0.04;
          }
        }
        o.h = h; o.r = r; o.g = g; o.b = b;
      },
    };
  },

  madeira(N, p) {
    const cl = p.claro, es = p.escuro;
    if (p.modo === "queimada") {
      return {
        relevo: 0.55, brilho: 0.38,
        px(u, v, o) {
          const w = N.worley(u * 6 + N.n(u * 3, v * 3) * 0.3, v * 15 + N.n(u * 2, v * 4) * 0.6);
          const borda = w.f2 - w.f1;
          const ergue = lisa(0, 0.28, borda);
          const veio = N.n(u * 3, v * 220) * 0.5;
          o.h = ergue * 0.8 + veio * 0.08;
          const k = 0.03 + ergue * 0.07 + (veio + 0.5) * 0.02 + w.id * 0.02;
          o.r = k; o.g = k * 0.98; o.b = k * 1.02;
        },
      };
    }
    /* Tábua aplainada: o relevo é quase nulo, o desenho vem da cor. Os anéis
       correm na horizontal, com a curvatura em catedral do corte tangencial. */
    return {
      relevo: 0.25, brilho: p.brilho ?? 0.14,
      px(u, v, o) {
        let no = 0, dno = 0;
        if (p.nos) {
          const dx = (u - 0.68) * 3.2, dy = (v - 0.4) * 6;
          const d2 = dx * dx + dy * dy;
          no = Math.exp(-d2 * 9);
          dno = 0.06 / (0.12 + d2);
        }
        const arco = Math.pow(Math.abs(u - 0.42) * 1.6, 1.8) * 0.18;
        const warp = N.fbm(u * 0.9, v * 1.4, 4) * 0.09 + N.n(u * 2.4, v * 6) * 0.012;
        const t = (v - arco + warp + dno) * p.aneis;
        const r = fract(t + N.n(Math.floor(t) * 0.7, u * 0.8) * 0.12);
        const tardio = lisa(0.55, 0.9, r) * (1 - lisa(0.93, 1, r));
        const fina = Math.pow(1 - Math.abs(Math.sin(t * Math.PI * 3)), 6) * 0.25;
        const fib = N.n(u * 2.5, v * 300) * 0.5 + N.n(u * 6 + 3, v * 640) * 0.35;
        const poro = lisa(0.5, 0.78, N.n(u * 22, v * 420)) * (0.4 + tardio);
        const k = clamp01(tardio * 0.62 + fina + fib * 0.16 + 0.14 + no * 0.8 + N.fbm(u * 1.5, v * 4, 2) * 0.22);
        const esc = 1 - poro * 0.25;
        o.r = mix(cl[0], es[0], k) * esc;
        o.g = mix(cl[1], es[1], k) * esc;
        o.b = mix(cl[2], es[2], k) * esc;
        o.h = -tardio * 0.03 + fib * 0.05 - poro * 0.08;
      },
    };
  },

  marmore(N, p) {
    const [br, bg, bb] = p.base, [vr, vg, vb] = p.veia, v2 = p.veia2 || p.veia;
    return {
      relevo: 0.06, brilho: 0.82,
      px(u, v, o) {
        /* veios direcionais: o gradiente linear domina e a turbulência só
           desvia — se a turbulência dominar, vira curva de nível */
        const turb = Math.abs(N.fbm(u * 3, v * 3, 6)) * 0.55 + N.fbm(u * 1.2, v * 1.2, 3) * 0.35;
        const t = (u * 1.1 + v * 0.75 + turb) * p.freq;
        const sv = 1 - Math.abs(Math.sin(t * Math.PI));
        const espessura = 0.7 + 0.6 * (N.n(u * 2 + 5, v * 2) + 0.5);
        const veia = Math.pow(sv, p.nitidez / espessura) + Math.pow(sv, 3) * 0.18;
        const turb2 = Math.abs(N.fbm(u * 5 + 9, v * 5 - 3, 5)) * 0.6;
        const t2 = (-u * 0.6 + v * 1.25 + turb2) * 3.2;
        const veia2 = Math.pow(1 - Math.abs(Math.sin(t2 * Math.PI)), p.nitidez * 2.2) * 0.6
          * lisa(-0.2, 0.3, N.n(u * 2.5 + 30, v * 2.5));
        const nuvem = N.fbm(u * 2.5 + 20, v * 2.5, 5);
        const k = clamp01(veia + veia2 * p.rede);
        const ouro = lisa(-0.1, 0.25, N.n(u * 3 + 40, v * 3));
        const vr2 = mix(vr, v2[0], ouro), vg2 = mix(vg, v2[1], ouro), vb2 = mix(vb, v2[2], ouro);
        const tb = 1 + nuvem * 0.16;
        o.r = mix(br * tb, vr2, k); o.g = mix(bg * tb, vg2, k); o.b = mix(bb * tb, vb2, k);
        o.h = -k * 0.04;
      },
    };
  },

  pedra(N, p) {
    const [r0, g0, b0] = p.cor;
    if (p.modo === "granito") {
      return {
        relevo: 0.08, brilho: 0.7,
        px(u, v, o) {
          const fino = N.n(u * 300, v * 300) * 0.05;
          let r = r0 * (1 + fino), g = g0 * (1 + fino), b = b0 * (1 + fino);
          const preto = N.n(u * 40, v * 40) + N.n(u * 120, v * 120) * 0.35;
          const branco = N.n(u * 34 + 11, v * 34) + N.n(u * 110 + 5, v * 110) * 0.35;
          const rosa = N.n(u * 46 + 31, v * 46 - 4);
          if (rosa > 0.32) { r = 0.68; g = 0.56; b = 0.54; }
          if (branco > 0.34) { r = 0.9; g = 0.9; b = 0.89; }
          if (preto > 0.3) { r = 0.07; g = 0.07; b = 0.08; }
          o.r = r; o.g = g; o.b = b; o.h = 0;
        },
      };
    }
    if (p.modo === "ardosia") {
      return {
        relevo: 2.2, brilho: 0.12,
        px(u, v, o) {
          const camada = N.fbm(u * 1.6, v * 1.1, 4) * 0.5 + 0.5;
          const q = camada * 16;
          const degrau = (Math.floor(q) + lisa(0, 0.25, fract(q))) / 16;
          const fino = N.fbm(u * 8, v * 26, 3);
          o.h = degrau * 1.4 + fino * 0.06;
          const k = 0.82 + N.fbm(u * 1.4, v * 4, 3) * 0.45 + fino * 0.12 + (fract(q) < 0.25 ? 0.08 : 0);
          const ferr = lisa(0.35, 0.6, N.n(u * 5 + 8, v * 5)) * 0.25;
          o.r = r0 * k + ferr * 0.15; o.g = g0 * k + ferr * 0.06; o.b = b0 * k;
        },
      };
    }
    return { /* arenito */
      relevo: 0.4, brilho: 0.03,
      px(u, v, o) {
        const t = v * 13 + N.fbm(u * 2, v * 2, 4) * 1.4;
        const faixa = 0.5 + 0.5 * Math.sin(t);
        const grao = N.n(u * 260, v * 260);
        const k = 0.86 + faixa * 0.16 + grao * 0.05 + N.fbm(u * 5, v * 5, 3) * 0.12;
        const ocre = faixa * 0.6;
        o.r = r0 * k; o.g = g0 * k * (1 - ocre * 0.08); o.b = b0 * k * (1 - ocre * 0.18);
        o.h = faixa * 0.12 + grao * 0.06 + N.fbm(u * 12, v * 12, 3) * 0.12;
      },
    };
  },

  concreto(N, p) {
    const [r0, g0, b0] = p.cor;
    const polido = p.modo === "polido", bruto = p.modo === "bruto";
    return {
      relevo: bruto ? 0.6 : 0.3, brilho: polido ? 0.5 : 0.04,
      px(u, v, o) {
        const mancha = N.fbm(u * 3, v * 3, 5);
        const grao = N.n(u * 190, v * 190);
        let k = 1 + mancha * (bruto ? 0.22 : polido ? 0.16 : 0.12) + grao * 0.05;
        let h = mancha * 0.12 + grao * 0.05;
        const w = N.worley(u * 42, v * 42);
        const limiar = bruto ? 0.6 : 0.8;
        if (w.id > limiar) {
          const poro = 1 - lisa(0.04, 0.12 + (w.id - limiar) * 0.6, w.f1);
          k *= 1 - poro * 0.5; h -= poro * 0.5;
        }
        if (polido) {
          const a = N.worley(u * 24, v * 24);
          if (a.id > 0.62 && a.f1 < 0.14) k *= a.id > 0.85 ? 1.15 : 0.8;
        }
        if (bruto) {
          const escorre = lisa(0.1, 0.5, N.n(u * 11, v * 1.3)) * 0.18;
          k *= 1 - escorre;
          h += N.fbm(u * 14, v * 14, 3) * 0.2;
        }
        o.r = r0 * k; o.g = g0 * k; o.b = b0 * k; o.h = h;
      },
    };
  },

  terrazzo(N, p) {
    const [r0, g0, b0] = p.base, pal = p.paleta;
    return {
      relevo: 0.04, brilho: 0.55,
      px(u, v, o) {
        const fino = N.n(u * 140, v * 140) * 0.03;
        let r = r0 * (1 + fino), g = g0 * (1 + fino), b = b0 * (1 + fino);
        const w = N.worley(u * 8.5 + N.n(u * 6, v * 6) * 0.25, v * 8.5 + N.n(u * 6 + 5, v * 6) * 0.25);
        const raio = 0.14 + w.id * 0.24;
        const d = w.f1 + N.n(u * 34, v * 34) * 0.07;
        if (w.id > 0.22 && d < raio) {
          const c = pal[Math.floor(fract(w.id * 7.13) * pal.length)];
          const vv = 0.92 + N.n(u * 60, v * 60) * 0.12;
          r = c[0] * vv; g = c[1] * vv; b = c[2] * vv;
        } else {
          const s = N.worley(u * 40, v * 40);
          if (s.id > 0.58 && s.f1 < 0.13) {
            const c = pal[Math.floor(fract(s.id * 3.7) * pal.length)];
            r = c[0]; g = c[1]; b = c[2];
          }
        }
        o.r = r; o.g = g; o.b = b; o.h = 0;
      },
    };
  },

  gesso(N, p) {
    const [r0, g0, b0] = p.cor;
    if (p.modo === "veneziano") {
      return {
        relevo: 0.1, brilho: 0.55,
        px(u, v, o) {
          const c = N.fbm(u * 2, v * 2, 5);
          const passada = N.n(u * 3.5 + c * 1.6, v * 1.3 + c);
          const k = 0.84 + lisa(-0.3, 0.3, c + passada * 0.6) * 0.26 + N.n(u * 40, v * 12) * 0.025;
          o.r = r0 * k; o.g = g0 * k; o.b = b0 * k * 0.995;
          o.h = passada * 0.08;
        },
      };
    }
    return {
      relevo: 0.7, brilho: 0.03,
      px(u, v, o) {
        const giro = N.n(u * 2, v * 2) * 1.3;
        const espatula = Math.abs(N.fbm(u * 3 + giro, v * 3 - giro * 0.5, 4));
        const areia = N.n(u * 230, v * 230);
        o.h = espatula * 1.1 + areia * 0.06;
        const k = 0.95 + N.fbm(u * 4, v * 4, 3) * 0.08 + areia * 0.02;
        o.r = r0 * k; o.g = g0 * k; o.b = b0 * k;
      },
    };
  },

  tecido(N, p) {
    const [r0, g0, b0] = p.cor;
    if (p.modo === "feltro") {
      const ang = [0.3, 1.4, 2.3, 2.9];
      return {
        relevo: 0.25, brilho: 0.02,
        px(u, v, o) {
          let fib = 0;
          for (let i = 0; i < 4; i++) {
            const c = Math.cos(ang[i]), s = Math.sin(ang[i]);
            const a = u * c + v * s, b = -u * s + v * c;
            fib = Math.max(fib, 1 - Math.abs(N.n(a * 18 + i * 7, b * 160)) * 4);
          }
          const nuvem = N.fbm(u * 6, v * 6, 4);
          o.h = nuvem * 0.3 + fib * 0.12;
          const k = 0.86 + nuvem * 0.2 + fib * 0.08;
          o.r = r0 * k; o.g = g0 * k; o.b = b0 * k;
        },
      };
    }
    const denim = p.modo === "denim";
    const fios = denim ? 96 : 62;
    const [tr, tg, tb] = p.trama || p.cor;
    return {
      relevo: 0.5, brilho: 0.03,
      px(u, v, o) {
        const wx = u * fios, wy = v * fios;
        const ix = Math.floor(wx), iy = Math.floor(wy);
        const fx = wx - ix, fy = wy - iy;
        const urdTopo = denim ? ((ix + iy) & 3) !== 3 : ((ix + iy) & 1) === 0;
        const slubU = 0.75 + 0.25 * N.n(ix * 0.37, v * 3);
        const slubT = 0.75 + 0.25 * N.n(u * 3, iy * 0.37 + 50);
        const perfU = Math.pow(Math.sin(Math.PI * fx), 0.6) * slubU;
        const perfT = Math.pow(Math.sin(Math.PI * fy), 0.6) * slubT;
        const h = urdTopo ? perfU : perfT;
        const pelo = N.n(u * 320, v * 320) * 0.03;
        let r, g, b;
        if (urdTopo) {
          const desbota = denim ? lisa(0.25, 0.7, N.n(ix * 0.5, v * 5)) * 0.35 + N.fbm(u * 3, v * 3, 3) * 0.3 : 0;
          const t = 1 + N.n(ix * 0.9, 3.1) * 0.1 + desbota;
          r = r0 * t; g = g0 * t; b = b0 * t;
        } else {
          const t = 1 + N.n(7.7, iy * 0.9) * 0.1;
          r = tr * t; g = tg * t; b = tb * t;
        }
        const k = 0.7 + 0.36 * h + pelo;
        o.r = r * k; o.g = g * k; o.b = b * k; o.h = h * 0.6;
      },
    };
  },

  couro(N, p) {
    const [r0, g0, b0] = p.cor;
    if (p.modo === "camurca") {
      return {
        relevo: 0.12, brilho: 0.0,
        px(u, v, o) {
          const sombra = N.fbm(u * 1.5, v * 1.5, 4);
          const pelo = N.n(u * 300, v * 300);
          const k = 0.92 + sombra * 0.3 + pelo * 0.05;
          o.r = r0 * k; o.g = g0 * k; o.b = b0 * k;
          o.h = pelo * 0.12 + sombra * 0.2;
        },
      };
    }
    return {
      relevo: 0.45, brilho: p.brilho ?? 0.32,
      px(u, v, o) {
        const w = N.worley(u * 24 + N.n(u * 5, v * 5) * 0.4, v * 24 + N.n(u * 5 + 3, v * 5) * 0.4);
        const borda = w.f2 - w.f1;
        const seixo = Math.sqrt(lisa(0, 0.38, borda));
        const ruga = 1 - lisa(0, 0.07, Math.abs(N.n(u * 2.2, v * 2.2)));
        const mancha = N.fbm(u * 4, v * 4, 3);
        o.h = seixo * 0.5 + mancha * 0.2 - ruga * 0.35;
        const k = (0.72 + 0.32 * seixo) * (1 + mancha * 0.14) * (1 - ruga * 0.25);
        o.r = r0 * k; o.g = g0 * k; o.b = b0 * k;
      },
    };
  },

  escovado(N, p) {
    const [r0, g0, b0] = p.cor;
    return {
      relevo: 0.12, brilho: 0.35, metal: true,
      px(u, v, o) {
        const s = N.n(u * 3, v * 500) * 0.6 + N.n(u * 12 + 5, v * 1400) * 0.4 + N.n(u * 1, v * 80) * 0.3;
        const risco = lisa(0.62, 0.9, N.n(u * 2 + v * 0.3, v * 900)) * 0.25;
        /* faixa anisotrópica: sulcos horizontais esticam o reflexo na vertical */
        const dx1 = (u - 0.32) / 0.14, dx2 = (u - 0.8) / 0.06;
        const refl = 0.6 + 0.62 * Math.exp(-dx1 * dx1) + 0.22 * Math.exp(-dx2 * dx2) - 0.18 * v;
        const k = (0.88 + 0.12 * s + risco) * refl;
        o.r = r0 * k; o.g = g0 * k; o.b = b0 * k; o.h = s * 0.12;
      },
    };
  },

  oxidado(N, p) {
    if (p.modo === "patina") {
      return {
        relevo: 0.45, brilho: 0.08,
        px(u, v, o) {
          const m = lisa(-0.12, 0.22, N.fbm(u * 2.5, v * 2.5, 6) + N.n(u * 14, v * 1.4) * 0.25);
          const crosta = N.fbm(u * 18, v * 18, 4);
          const cob = 1 + N.fbm(u * 6, v * 6, 3) * 0.2;
          const tp = lisa(-0.3, 0.3, N.fbm(u * 7 + 4, v * 7, 3));
          const pr = mix(0.33, 0.62, tp), pg = mix(0.62, 0.8, tp), pb = mix(0.55, 0.7, tp);
          o.r = mix(0.7 * cob, pr, m); o.g = mix(0.4 * cob, pg, m); o.b = mix(0.24 * cob, pb, m);
          o.h = m * 0.35 + crosta * 0.25 * m;
        },
      };
    }
    return {
      relevo: 0.6, brilho: 0.04,
      px(u, v, o) {
        const m = lisa(-0.15, 0.18, N.fbm(u * 3, v * 3, 6));
        const t = lisa(-0.4, 0.4, N.fbm(u * 12 + 7, v * 12, 4));
        const met = 1 + N.n(u * 80, v * 80) * 0.1;
        const w = N.worley(u * 34, v * 34);
        const pite = w.id > 0.7 ? 1 - lisa(0.04, 0.16, w.f1) : 0;
        const rr = mix(0.62, 0.3, t), rg = mix(0.29, 0.13, t), rb = mix(0.1, 0.06, t);
        const esc = 1 - pite * 0.5;
        o.r = mix(0.34 * met, rr, m) * esc; o.g = mix(0.33 * met, rg, m) * esc; o.b = mix(0.33 * met, rb, m) * esc;
        o.h = m * 0.4 + N.fbm(u * 20, v * 20, 4) * 0.3 * m - pite * 0.4;
      },
    };
  },

  agua(N, p) {
    if (p.modo === "ondulacao") {
      return {
        relevo: 0.5, brilho: 0.95,
        px(u, v, o) {
          const dx = u - 0.6, dy = (v - 0.42) * 1.15;
          const d = Math.sqrt(dx * dx + dy * dy);
          const onda = Math.sin(d * 72) * Math.exp(-d * 2.6);
          o.h = onda * 0.22 + N.fbm(u * 5, v * 5, 4) * 0.25;
          const k = 0.9 + v * 0.25;
          o.r = 0.04 * k; o.g = 0.11 * k; o.b = 0.17 * k;
        },
      };
    }
    return {
      relevo: 0.25, brilho: 0.2,
      px(u, v, o) {
        const wx = N.n(u * 3, v * 3) * 0.35, wy = N.n(u * 3 + 9, v * 3) * 0.35;
        const a = N.worley(u * 6 + wx, v * 6 + wy);
        const c1 = Math.pow(1 - lisa(0, 0.2, a.f2 - a.f1), 2.2);
        const b = N.worley(u * 9.5 - wy + 3, v * 9.5 + wx);
        const c2 = Math.pow(1 - lisa(0, 0.16, b.f2 - b.f1), 2.2);
        const luz = c1 * 0.75 + c2 * 0.45;
        const prof = clamp01(0.45 + N.fbm(u * 2, v * 2, 3) * 0.5 + (1 - v) * 0.2);
        o.r = mix(0.0, 0.18, prof) + luz * 0.7;
        o.g = mix(0.38, 0.72, prof) + luz * 0.6;
        o.b = mix(0.5, 0.82, prof) + luz * 0.45;
        o.h = N.fbm(u * 5, v * 5, 3) * 0.25;
      },
    };
  },

  holo(N, p) {
    const rgb = [0, 0, 0];
    if (p.modo === "filme" || p.modo === "nacar") {
      const nacar = p.modo === "nacar";
      return {
        relevo: nacar ? 0.12 : 0.05, brilho: 0.7,
        px(u, v, o) {
          const t = nacar
            ? v * 5.5 + N.fbm(u * 2.2, v * 2.2, 5) * 1.6 + N.n(u * 30, v * 4) * 0.08
            : N.fbm(u * 1.7, v * 1.7, 5) * 1.6 + u * 0.55;
          arcoIris(fract(t), rgb);
          const branco = nacar ? 0.72 : 0.42;
          const k = nacar ? 0.93 + N.n(u * 12, v * 40) * 0.05 : 1;
          o.r = mix(rgb[0], 1, branco) * k * (nacar ? 0.96 : 0.92);
          o.g = mix(rgb[1], 1, branco) * k * (nacar ? 0.95 : 0.92);
          o.b = mix(rgb[2], 1, branco) * k * 0.95;
          o.h = nacar ? Math.sin(t * 6.28) * 0.05 : 0;
        },
      };
    }
    return {
      relevo: 0.55, brilho: 0.8, metal: true,
      px(u, v, o) {
        let vinco = 0, a = 0.5, f = 2.6;
        for (let i = 0; i < 4; i++) {
          vinco += a * Math.abs(N.n(u * f + i * 3.1, v * f - i * 1.7));
          a *= 0.5; f *= 2.2;
        }
        o.h = vinco * 1.1 + N.fbm(u * 1.5, v * 1.5, 2) * 0.5;
        o.r = o.g = o.b = 0.8;
      },
      cor(nx, ny, u, v, o) {
        arcoIris(0.55 + nx * 1.5 + ny * 1.0 + u * 0.35 + v * 0.2, rgb);
        o.r = 0.22 + 0.78 * rgb[0]; o.g = 0.22 + 0.78 * rgb[1]; o.b = 0.22 + 0.78 * rgb[2];
      },
    };
  },
};

/* ------------------------------------------------------------------ */
/* Renderizador de superfície                                          */
/* ------------------------------------------------------------------ */
function* superficie(spec, S, data) {
  const N = criaRuido(spec.seed ?? 7);
  const g = GERADORES[spec.gerador](N, spec);
  const H = new Float32Array(S * S), A = new Float32Array(S * S * 3);
  const o = { h: 0, r: 0, g: 0, b: 0 };

  for (let y = 0; y < S; y++) {
    const v = (y + 0.5) / S;
    for (let x = 0; x < S; x++) {
      g.px((x + 0.5) / S, v, o);
      const i = y * S + x;
      H[i] = o.h; A[i * 3] = o.r; A[i * 3 + 1] = o.g; A[i * 3 + 2] = o.b;
    }
    if ((y & 3) === 3) yield;
  }

  /* Luz rasante (relevo) vinda do alto à esquerda + softbox pontual para o
     especular, posicionada para o reflexo cair no terço superior esquerdo. */
  let ldx = -0.62, ldy = -0.7, ldz = 0.55;
  const ll = Math.hypot(ldx, ldy, ldz); ldx /= ll; ldy /= ll; ldz /= ll;
  const LPx = 0.19, LPy = 0.11, LPz = 1.2, CPx = 0.5, CPy = 0.5, CPz = 2.2;
  const K = g.relevo * 0.02 * (S / 2);
  const gl = g.brilho || 0;
  const expo = 30 + 260 * gl * gl;

  for (let y = 0; y < S; y++) {
    const v = (y + 0.5) / S;
    const yu = y > 0 ? y - 1 : y, yd = y < S - 1 ? y + 1 : y;
    for (let x = 0; x < S; x++) {
      const u = (x + 0.5) / S;
      const xl = x > 0 ? x - 1 : x, xr = x < S - 1 ? x + 1 : x;
      const i = y * S + x;
      let nx = -(H[y * S + xr] - H[y * S + xl]) * K * (2 / (xr - xl));
      let ny = -(H[yd * S + x] - H[yu * S + x]) * K * (2 / (yd - yu));
      let nz = 1;
      const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;

      if (g.cor) g.cor(nx, ny, u, v, o);
      else { o.r = A[i * 3]; o.g = A[i * 3 + 1]; o.b = A[i * 3 + 2]; }

      const ndl = Math.max(0, nx * ldx + ny * ldy + nz * ldz);
      const dif = 0.36 + (0.64 * ndl) / ldz;

      let lx = LPx - u, ly = LPy - v, lz = LPz;
      const lq = Math.hypot(lx, ly, lz); lx /= lq; ly /= lq; lz /= lq;
      let cx = CPx - u, cy = CPy - v, cz = CPz;
      const cq = Math.hypot(cx, cy, cz); cx /= cq; cy /= cq; cz /= cq;
      let hx = lx + cx, hy = ly + cy, hz = lz + cz;
      const hq = Math.hypot(hx, hy, hz); hx /= hq; hy /= hq; hz /= hq;
      const nh = Math.max(0, nx * hx + ny * hy + nz * hz);
      const esp = gl * (0.18 * Math.pow(nh, 10) + 0.55 * Math.pow(nh, expo));

      let r, gg, b;
      if (g.metal) {
        const m = dif * 0.62 + 0.22;
        r = o.r * m + o.r * esp * 2; gg = o.g * m + o.g * esp * 2; b = o.b * m + o.b * esp * 2;
      } else {
        r = o.r * dif + esp; gg = o.g * dif + esp; b = o.b * dif + esp;
      }
      const j = i * 4;
      data[j] = tom(r) * 255; data[j + 1] = tom(gg) * 255; data[j + 2] = tom(b) * 255; data[j + 3] = 255;
    }
    if ((y & 7) === 7) yield;
  }
}

/* ------------------------------------------------------------------ */
/* Renderizador de esfera                                              */
/* ------------------------------------------------------------------ */

/* caixa(): 1 dentro do retângulo angular, borda suave. */
const caixa = (x, y, cx, cy, w, h) =>
  lisa(w, w * 0.6, Math.abs(x - cx)) * lisa(h, h * 0.6, Math.abs(y - cy));

/* Estúdio refletido: céu claro e chão escuro com horizonte nítido, uma
   softbox grande no alto à esquerda e um recorte vertical à direita.
   Coordenadas de tela: y cresce para baixo, z aponta para a câmera. */
function ambiente(x, y, z, borrao) {
  const hor = lisa(-0.02 - borrao * 0.3, 0.02 + borrao * 0.3, y);
  const ceu = 0.8 + 0.2 * Math.max(0, -y);
  const chao = 0.48 + 0.32 * Math.min(1, Math.max(0, y) * 1.4);
  let c = mix(ceu, chao, hor);
  /* faixa escura logo abaixo do horizonte: o fundo distante do estúdio */
  const fy = (y - 0.07) / (0.08 + borrao * 0.2);
  c -= 0.45 * Math.exp(-fy * fy) * (1 - borrao * 0.6);
  /* o que fica atrás da câmera (fotógrafo, sala) escurece o centro do reflexo */
  c -= 0.22 * lisa(0.55, 1, z) * (1 - borrao * 0.7);
  const ganho = 1 - borrao * 0.75;
  if (z > -0.2) {
    c += 1.5 * ganho * caixa(x, y, -0.48, -0.5, 0.2 + borrao * 0.2, 0.2 + borrao * 0.2);
    c += 0.9 * ganho * caixa(x, y, 0.74, -0.2, 0.05 + borrao * 0.15, 0.36);
  }
  return c;
}

function* esfera(p, S, data) {
  const N = criaRuido(p.seed ?? 3);
  const cx = S * 0.5, cy = S * 0.45, R = S * 0.32;
  const hy = cy + R * 0.62;
  let Lx = -0.5, Ly = -0.62, Lz = 0.6;
  const lq = Math.hypot(Lx, Ly, Lz); Lx /= lq; Ly /= lq; Lz /= lq;
  let Hx = Lx, Hy = Ly, Hz = Lz + 1;
  const hq = Math.hypot(Hx, Hy, Hz); Hx /= hq; Hy /= hq; Hz /= hq;

  const sh = p.shader;
  const transparente = sh === "vidro" || sh === "gel";
  const [ar, ag, ab] = p.cor || [0.8, 0.8, 0.8];
  const tint = p.tint || [1, 1, 1];
  const rgb = [0, 0, 0];

  const fundo = (x, y, borrao) => {
    const w = S * (0.025 + borrao * 0.3);
    const t = lisa(hy - w, hy + w, y);
    const parede = 0.965 - 0.05 * (y / S);
    const piso = 0.9 - 0.12 * clamp01((y - hy) / (S - hy));
    return mix(parede, piso, t);
  };

  /* sombra de contato + sombra projetada; vidro e gel deixam passar luz
     e concentram uma cáustica colorida dentro da sombra */
  const sombra = (x, y) => {
    const sx = (x - (cx + R * 0.22)) / (R * 1.05), sy = (y - (cy + R * 0.97)) / (R * 0.2);
    const proj = Math.exp(-(sx * sx + sy * sy) * 2.2);
    const kx = (x - cx) / (R * 0.55), ky = (y - (cy + R)) / (R * 0.07);
    const contato = Math.exp(-(kx * kx + ky * ky));
    return { proj, contato };
  };

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const px = x + 0.5, py = y + 0.5;
      /* ---- fundo ---- */
      const s = sombra(px, py);
      let b = fundo(px, py, 0);
      let br, bg, bb;
      if (transparente) {
        const forca = sh === "vidro" ? 0.22 : 0.3;
        b *= 1 - s.proj * forca - s.contato * 0.3;
        const qx = (px - (cx + R * 0.3)) / (R * 0.32), qy = (py - (cy + R * 1.0)) / (R * 0.075);
        const caust = Math.exp(-(qx * qx + qy * qy) * 1.6) * (p.caustica ?? 0.5);
        br = b * mix(1, tint[0], s.proj * 0.6) + caust * tint[0];
        bg = b * mix(1, tint[1], s.proj * 0.6) + caust * tint[1];
        bb = b * mix(1, tint[2], s.proj * 0.6) + caust * tint[2];
      } else {
        b *= 1 - s.proj * 0.42 - s.contato * 0.45;
        br = bg = bb = b;
      }

      const dx = px - cx, dy = py - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const cob = clamp01(R - dist + 0.5);
      let r = br, g = bg, bl = bb;

      if (cob > 0) {
        /* na borda antisserrilhada a normal é presa logo dentro da esfera */
        const kn = dist < R - 0.01 ? 1 / R : 0.999 / dist;
        const nx = dx * kn, ny = dy * kn;
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        const rx = 2 * nz * nx, ry = 2 * nz * ny, rz = 2 * nz * nz - 1;
        const fr = Math.pow(1 - nz, 5);
        const ndl = Math.max(0, nx * Lx + ny * Ly + nz * Lz);
        const nh = Math.max(0, nx * Hx + ny * Hy + nz * Hz);
        let cr, cg, cb;

        if (sh === "metal") {
          const e = ambiente(rx, ry, rz, p.aspereza || 0);
          const F = 0.15 + 0.85 * fr;
          cr = e * mix(ar, 1, F) * 0.95; cg = e * mix(ag, 1, F) * 0.95; cb = e * mix(ab, 1, F) * 0.95;
          const e2 = Math.pow(nh, 260) * 1.6;
          cr += e2; cg += e2; cb += e2;
        } else if (transparente) {
          /* refração: bola maciça inverte e amplia o fundo */
          const fosco = p.fosco || 0;
          const sx = cx - nx * R * 0.85, sy = cy - ny * R * 0.85 + R * 0.12;
          const t = fundo(sx, sy, fosco);
          const esp = (0.6 + nz * 1.4) * (p.dens ?? 1);
          const borda = mix(sh === "gel" ? 0.55 : 0.38, 1, lisa(0, 0.55, nz));
          cr = t * Math.pow(tint[0], esp) * borda;
          cg = t * Math.pow(tint[1], esp) * borda;
          cb = t * Math.pow(tint[2], esp) * borda;
          if (fosco) {
            const leite = 0.3 * fosco * (0.6 + 0.4 * ndl);
            cr = mix(cr, 0.92, leite * 2); cg = mix(cg, 0.93, leite * 2); cb = mix(cb, 0.95, leite * 2);
          }
          if (sh === "gel") {
            const dif = 0.35 + 0.75 * ndl;
            cr = mix(cr, ar * dif, 0.38); cg = mix(cg, ag * dif, 0.38); cb = mix(cb, ab * dif, 0.38);
            const sss = lisa(0.1, 1, nx * 0.45 + ny * 0.6) * 0.35;
            cr += ar * sss; cg += ag * sss; cb += ab * sss;
          }
          /* crescente de luz focada do lado oposto à luz */
          const cres = lisa(0.5, 0.95, ny * 0.62 + nx * 0.5) * lisa(0, 0.45, nz) * 0.5;
          cr += cres * tint[0]; cg += cres * tint[1]; cb += cres * tint[2];
          if (p.iris) {
            arcoIris((1 - nz) * 1.7 + (nx * 0.6 - ny * 0.4) * 0.35 + 0.05, rgb);
            const w = p.iris * (0.08 + 0.55 * Math.pow(1 - nz, 1.6));
            cr = mix(cr, rgb[0] * 1.15, w); cg = mix(cg, rgb[1] * 1.15, w); cb = mix(cb, rgb[2] * 1.15, w);
          }
          const F = 0.04 + 0.96 * fr;
          const e = ambiente(rx, ry, rz, 0.3 + fosco * 0.6) * F * (1 - fosco * 0.5);
          const e2 = Math.pow(nh, fosco ? 30 : 400) * (fosco ? 0.35 : 2.2);
          cr += e + e2; cg += e + e2; cb += e + e2;
        } else if (sh === "veludo") {
          const amassa = p.amassado ? N.fbm(nx * 5, ny * 5, 4) * 0.5 : 0;
          const fio = N.n(nx * 220, ny * 220) * 0.05;
          const rim = Math.pow(1 - nz, 2.1) * (1 + amassa);
          const wrap = 0.35 + 0.65 * Math.max(0, nx * Lx + ny * Ly + nz * Lz * 0.6 + 0.25);
          const d = 0.14 + 0.62 * ndl * (1 + amassa * 0.6);
          cr = ar * (d + fio) + mix(ar, 1, 0.35) * rim * wrap * 1.25;
          cg = ag * (d + fio) + mix(ag, 1, 0.35) * rim * wrap * 1.25;
          cb = ab * (d + fio) + mix(ab, 1, 0.35) * rim * wrap * 1.25;
        } else if (sh === "perola") {
          const d = 0.5 + 0.55 * ndl;
          arcoIris(0.75 + (1 - nz) * 1.1 + nx * 0.25, rgb);
          const iri = 0.28 * Math.pow(1 - nz, 0.8);
          cr = ar * d + (rgb[0] - 0.5) * iri; cg = ag * d + (rgb[1] - 0.5) * iri; cb = ab * d + (rgb[2] - 0.5) * iri;
          const e = ambiente(rx, ry, rz, 0.35) * (0.05 + 0.6 * fr) + Math.pow(nh, 70) * 0.55;
          cr += e; cg += e; cb += e;
        } else {
          /* plástico e cerâmica */
          const gl = p.brilho ?? 0.8;
          let alb = 1;
          if (p.craquele) {
            const w = N.worley(nx * 7 / (0.6 + nz * 0.4) + 3, ny * 7 / (0.6 + nz * 0.4));
            alb *= 1 - (1 - lisa(0, 0.045, w.f2 - w.f1)) * 0.4;
          }
          if (p.grao) alb *= 0.94 + N.n(nx * 180, ny * 180) * 0.06 + N.fbm(nx * 6, ny * 6, 3) * 0.08;
          if (p.poca) alb *= mix(0.68, 1.06, lisa(0, 0.9, nz));
          const amb = p.translucido ? 0.42 : 0.24;
          const d = (amb + (1 - amb) * 1.05 * ndl) * alb;
          const ref = lisa(0, 1, ny) * 0.1;
          cr = ar * (d + ref); cg = ag * (d + ref); cb = ab * (d + ref);
          const F = 0.04 + 0.96 * fr;
          const e = ambiente(rx, ry, rz, Math.max(0.3, 1 - gl)) * F * (0.25 + 0.75 * gl);
          const e2 = Math.pow(nh, 10 + 300 * gl * gl) * (0.15 + 1.4 * gl * gl);
          cr += e + e2; cg += e + e2; cb += e + e2;
        }
        r = mix(br, cr, cob); g = mix(bg, cg, cob); bl = mix(bb, cb, cob);
      }

      const j = (y * S + x) * 4;
      data[j] = tom(r) * 255; data[j + 1] = tom(g) * 255; data[j + 2] = tom(bl) * 255; data[j + 3] = 255;
    }
    if ((y & 3) === 3) yield;
  }
}

/* ------------------------------------------------------------------ */
/* Agendador                                                           */
/* ------------------------------------------------------------------ */
function gerar(spec, S, data) {
  return spec.tipo === "esfera" ? esfera(spec, S, data) : superficie(spec, S, data);
}

const cache = new Map();
const fila = [];
let rodando = false;
/* setTimeout, não MessageChannel: mensagens em sequência têm prioridade
   sobre a pintura e travariam a tela enquanto a biblioteca carrega. */
const proximo = () => setTimeout(processa, 0);

function processa() {
  const t0 = performance.now();
  while (fila.length && performance.now() - t0 < 10) {
    const job = fila[0];
    if (job.it.next().done) { fila.shift(); job.fim(); }
  }
  if (fila.length) proximo();
  else rodando = false;
}

const chave = (spec, S) => `${JSON.stringify(spec)}@${S}`;

/* Devolve uma Promise<canvas> com a amostra pintada. `urgente` fura a fila
   (a amostra grande do destaque passa na frente das miniaturas). */
export function amostra(spec, S, urgente = false) {
  const k = chave(spec, S);
  if (cache.has(k)) {
    if (urgente) {
      const i = fila.findIndex((j) => j.k === k);
      if (i > 0) fila.unshift(fila.splice(i, 1)[0]);
    }
    return cache.get(k);
  }
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const ctx = cv.getContext("2d");
  const img = ctx.createImageData(S, S);
  let resolve;
  const prom = new Promise((r) => (resolve = r));
  const job = { k, it: gerar(spec, S, img.data), fim: () => { ctx.putImageData(img, 0, 0); resolve(cv); } };
  if (urgente) fila.unshift(job); else fila.push(job);
  cache.set(k, prom);
  if (!rodando) { rodando = true; proximo(); }
  return prom;
}
