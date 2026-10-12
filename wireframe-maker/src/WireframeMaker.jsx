import React, { useState, useRef, useEffect, useMemo } from "react";
import { Download, Copy, RotateCcw, Shuffle, Eye, EyeOff, Upload } from "lucide-react";
import Header from "./components/Header.jsx";
import { Cena, renderizar, montarSVG } from "./wireframe.js";
import { FORMAS, FORMA, padroes, formaSVG } from "./formas.js";
import { lerSVG } from "./svg-entrada.js";
import { FONTE_MARCA } from "./fonte-marca.js";

/* Servido pelo hub em /wireframe-maker/ — o menu é a raiz do mesmo site. */
const HUB_URL = "/";

/* Cor padrão da arte — troca com o tema, mas nunca por cima de uma cor
   que o usuário já escolheu (o estado guarda `null` até ele mexer). */
const ARTE = {
  escuro: { fundo: "#101010", traco: "#00a9ce" },
  claro: { fundo: "#f4f4f4", traco: "#00768f" },
};

const SIZES = [
  { label: "1080 × 1080", w: 1080, h: 1080 },
  { label: "2048 × 2048", w: 2048, h: 2048 },
  { label: "1920 × 1080", w: 1920, h: 1080 },
  { label: "1080 × 1920", w: 1080, h: 1920 },
  { label: "1080 × 1350", w: 1080, h: 1350 },
  { label: "1200 × 630", w: 1200, h: 630 },
];

const MODOS = [
  { value: "ocultar", label: "ocultar" },
  { value: "tracejar", label: "tracejar" },
  { value: "esmaecer", label: "esmaecer" },
  { value: "raiox", label: "raio-x" },
];

const NOTA_MODO = {
  ocultar: "Só o que a câmera enxerga — a parte de trás sai do arquivo.",
  tracejar: "A parte de trás vira tracejado, numa camada separada.",
  esmaecer: "A parte de trás fica mais clara, numa camada separada.",
  raiox: "Todas as linhas, sem teste de profundidade.",
};

const HEX = /^#[0-9a-f]{6}$/i;
const girar = (a) => Math.round((((a + 180) % 360) + 360) % 360) - 180;

/* ------------------------------------------------------------------ */
/* geometria                                                            */
/* ------------------------------------------------------------------ */

function construir(forma, grade, params, lu, lv, res = 1) {
  const c = new Cena();
  const nv = forma.grade.v ? grade.nv : grade.nu;
  forma.build(c, { nu: grade.nu, nv, lu, lv, res }, params);
  return c;
}

function miniatura(forma) {
  const d = padroes(forma);
  const u = forma.grade.u, v = forma.grade.v || forma.grade.u;
  const grade = {
    nu: Math.max(u.min, Math.round(d.grade.nu * 0.6)),
    nv: Math.max(v.min, Math.round(d.grade.nv * 0.6)),
  };
  const c = construir(forma, grade, d.params, true, true, 0.45);
  const r = renderizar(c, d.camera, 100, 100, { modo: "ocultar", qualidade: 220 });
  return montarSVG(r, 100, 100, {
    traco: "currentColor", fundo: "none", transparente: true, espessura: 0.8, modo: "ocultar", opacOcultas: 0,
  });
}

/* ------------------------------------------------------------------ */
/* tokens + componentes (sistema visual do gri.d.maker)                */
/* ------------------------------------------------------------------ */

const CSS = `
${FONTE_MARCA}
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

/* o cabeçalho fica fora da área que rola: assim a barra de rolagem não tira
   largura do nome, que é mais comprido que o das outras ferramentas */
.gm-painel{width:312px;flex:0 0 312px;background:var(--gm-ink2);
  border-right:1px solid var(--gm-line);height:100vh;position:sticky;top:0;
  display:flex;flex-direction:column;overflow:hidden}
.wm-rolagem{flex:1;min-height:0;overflow-y:auto;
  scrollbar-width:thin;scrollbar-color:var(--gm-line) transparent}
.wm-rolagem::-webkit-scrollbar{width:8px}
.wm-rolagem::-webkit-scrollbar-thumb{background:var(--gm-line);border-radius:var(--gm-radius)}
.wm-rolagem::-webkit-scrollbar-track{background:transparent}
.gm-cabecalho{padding:18px 18px 14px;border-bottom:1px solid var(--gm-line);
  position:sticky;top:0;background:var(--gm-ink2);z-index:5;
  display:flex;align-items:center;justify-content:space-between;gap:8px}
.gm-marca{display:flex;align-items:center;gap:9px;flex:0 1 auto;min-width:0;text-decoration:none}
a.gm-marca:focus-visible{outline:2px solid var(--gm-cyan);outline-offset:4px}
.gm-acoes{display:flex;gap:4px;flex:none}
.gm-risco{width:1px;align-self:stretch;margin:1px 0;background:var(--gm-line);flex:none}
.gm-marca-nome{margin:0;font-family:"Host Grotesk",var(--gm-sans);font-size:19px;
  font-weight:600;letter-spacing:-.005em;text-transform:lowercase;line-height:1;color:var(--gm-text);
  min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
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
.gm-valor[disabled]{opacity:.4}
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
.gm-slider[disabled]{opacity:.4}

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
.gm-botao--icone.is-desligado{color:var(--gm-muted)}

.gm-seletor{display:flex;gap:0}
.gm-seletor .gm-botao{flex:1;border-radius:0;margin-left:-1px;padding-left:4px;padding-right:4px}
.gm-seletor .gm-botao:first-child{margin-left:0;border-radius:var(--gm-radius) 0 0 var(--gm-radius)}
.gm-seletor .gm-botao:last-child{border-radius:0 var(--gm-radius) var(--gm-radius) 0}
.gm-grade2{display:grid;grid-template-columns:1fr 1fr;gap:8px}

.gm-cor{display:flex;align-items:center;gap:6px}
.gm-swatch{width:26px;height:26px;flex:0 0 26px;padding:0;border:1px solid var(--gm-line);
  border-radius:var(--gm-radius);background:none;cursor:pointer}
.gm-swatch::-webkit-color-swatch-wrapper{padding:2px}
.gm-swatch::-webkit-color-swatch{border:none;border-radius:1px}
.gm-swatch:focus-visible{outline:2px solid var(--gm-cyan);outline-offset:1px}
.gm-swatch[disabled]{opacity:.4;cursor:not-allowed}

.wm-formas{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.wm-forma{aspect-ratio:1;background:var(--gm-ink);border:1px solid var(--gm-line);
  border-radius:var(--gm-radius);padding:4px;cursor:pointer;color:var(--gm-muted);display:block}
.wm-forma:hover{border-color:var(--gm-muted);color:var(--gm-text)}
.wm-forma:focus-visible{outline:2px solid var(--gm-cyan);outline-offset:1px}
.wm-forma.is-ativo{border-color:var(--gm-mag);background:var(--gm-ink3);color:var(--gm-mag)}
.wm-forma svg{width:100%;height:100%;display:block}
.wm-enviar{display:flex;align-items:center;justify-content:center;border-style:dashed}
.wm-enviar svg{width:16px;height:16px}
.gm-palco.is-soltando{outline:2px dashed var(--gm-cyan);outline-offset:-10px}

.gm-main{flex:1;min-width:0;display:flex;flex-direction:column}
.gm-barra{height:46px;flex:0 0 46px;display:flex;align-items:center;gap:16px;
  padding:0 18px;border-bottom:1px solid var(--gm-line);background:var(--gm-ink2);
  font-family:var(--gm-mono);font-size:10.5px;letter-spacing:.06em;color:var(--gm-muted);
  white-space:nowrap;overflow:hidden}
.gm-barra strong{color:var(--gm-text);font-weight:400}
.gm-barra-fim{margin-left:auto;display:flex;align-items:center;gap:8px}

.gm-palco{flex:1;display:flex;align-items:center;justify-content:center;padding:34px;
  background-color:var(--gm-stage);
  background-image:linear-gradient(45deg,var(--gm-stage-alt) 25%,transparent 25%,transparent 75%,var(--gm-stage-alt) 75%),
    linear-gradient(45deg,var(--gm-stage-alt) 25%,transparent 25%,transparent 75%,var(--gm-stage-alt) 75%);
  background-size:16px 16px;background-position:0 0,8px 8px}
.gm-doc{position:relative;max-width:100%;
  width:min(100%, calc((100vh - 160px) * var(--wm-razao)));aspect-ratio:var(--wm-razao);
  cursor:grab;touch-action:none;user-select:none}
.gm-doc.is-arrastando{cursor:grabbing}
.gm-documento{width:100%;height:100%;box-shadow:0 0 0 1px var(--gm-line),0 20px 60px var(--gm-sombra)}
.gm-documento svg{display:block;width:100%;height:100%}
.gm-registro{position:absolute;width:13px;height:13px;pointer-events:none}
.gm-registro::before,.gm-registro::after{content:"";position:absolute;
  background:var(--gm-cyan);opacity:.85}
.gm-registro::before{left:6px;top:0;width:1px;height:13px}
.gm-registro::after{top:6px;left:0;height:1px;width:13px}

  /* Celular e tablet em pé: o painel deixa de ser uma caixa (display:contents),
     então o cabeçalho e o palco sobem para o topo e grudam lá, enquanto os
     controles rolam por baixo. O overflow:hidden da raiz anularia o sticky. */
@media (max-width:860px){
  /* tablet em pé: a coluna de controles para de esticar e fica centrada */
  .wm-rolagem>*{padding-inline:max(18px,calc((100% - 600px) / 2))}
  .gm-app{flex-direction:column;overflow:visible}
  .gm-painel,.wm-rolagem{display:contents}
  .wm-rolagem>*{order:1;background:var(--gm-ink2);width:100%}
  .gm-cabecalho{order:-2;position:sticky;top:0;z-index:7;width:100%}
  .gm-main{order:-1;position:sticky;top:63px;z-index:6;height:46vh;flex:none;
    background:var(--gm-ink);border-bottom:1px solid var(--gm-line)}
  .gm-doc{width:min(100%, calc(34vh * var(--wm-razao)))}
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

function Slider({ label, value, onChange, min = 0, max = 100, step = 1, unidade = "%", acento = "cyan", nota, extra, disabled }) {
  const [txt, setTxt] = useState(null);
  const casas = step < 1 ? 1 : 0;
  const ajusta = (n) => {
    const q = Math.round(n / step) * step;
    return Number(Math.max(min, Math.min(max, q)).toFixed(casas));
  };
  return (
    <div className="gm-controle">
      <div className="gm-controle-cab">
        <label className="gm-rotulo">{label}</label>
        <input
          className="gm-valor"
          inputMode="decimal"
          disabled={disabled}
          value={txt ?? value.toFixed(casas)}
          onChange={(e) => {
            setTxt(e.target.value);
            const n = parseFloat(e.target.value.replace(",", "."));
            if (!Number.isNaN(n)) onChange(ajusta(n));
          }}
          onBlur={() => setTxt(null)}
          aria-label={label}
        />
        <span className="gm-unidade">{unidade}</span>
        {extra}
      </div>
      <input
        type="range"
        className="gm-slider"
        style={{ "--gm-acento": `var(--gm-${acento})` }}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(ajusta(Number(e.target.value)))}
        aria-label={label}
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
          aria-pressed={value === o.value}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* cor com campo hex: o texto pode ficar inválido enquanto se digita,
   mas só cor válida chega ao desenho */
function Cor({ label, value, onChange, disabled }) {
  const [txt, setTxt] = useState(value);
  useEffect(() => setTxt(value), [value]);
  return (
    <div className="gm-controle">
      <div className="gm-controle-cab">
        <label className="gm-rotulo">{label}</label>
      </div>
      <div className="gm-cor">
        <input
          type="color"
          className="gm-swatch"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
        <input
          className="gm-valor gm-valor--hex"
          value={txt}
          disabled={disabled}
          spellCheck={false}
          onChange={(e) => {
            const t = e.target.value.trim();
            setTxt(t);
            const h = t.startsWith("#") ? t : `#${t}`;
            if (HEX.test(h)) onChange(h.toLowerCase());
          }}
          onBlur={() => setTxt(value)}
          aria-label={`${label} em hexadecimal`}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* main                                                                */
/* ------------------------------------------------------------------ */

const INICIAL = "esfera";

export default function WireframeMaker() {
  const [formaId, setFormaId] = useState(INICIAL);
  const [grade, setGrade] = useState(() => padroes(FORMA[INICIAL]).grade);
  const [params, setParams] = useState(() => padroes(FORMA[INICIAL]).params);
  const [cam, setCam] = useState(() => padroes(FORMA[INICIAL]).camera);
  const [linhasU, setLinhasU] = useState(true);
  const [linhasV, setLinhasV] = useState(true);
  const [modo, setModo] = useState("ocultar");
  const [opacOcultas, setOpacOcultas] = useState(30);
  const [espessura, setEspessura] = useState(1.5);
  const [traco, setTraco] = useState(null);
  const [fundo, setFundo] = useState(null);
  const [transparente, setTransparente] = useState(false);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [escalaPng, setEscalaPng] = useState(2);
  const [status, setStatus] = useState("");
  const [tema, setTema] = useState("escuro");
  const [arrastando, setArrastando] = useState(false);
  const [svgEnviado, setSvgEnviado] = useState(null);
  const [soltando, setSoltando] = useState(false);
  const arrasto = useRef(null);
  const arquivoRef = useRef(null);

  const forma = formaId === "svg" ? svgEnviado.forma : FORMA[formaId];
  const size = SIZES[sizeIdx];
  const corTraco = traco ?? ARTE[tema].traco;
  const corFundo = fundo ?? ARTE[tema].fundo;
  const duasDirecoes = !!forma.grade.v;

  const miniaturas = useMemo(() => Object.fromEntries(FORMAS.map((f) => [f.id, miniatura(f)])), []);

  const cena = useMemo(
    () => construir(forma, grade, params, !duasDirecoes || linhasU, !duasDirecoes || linhasV),
    [forma, grade, params, linhasU, linhasV, duasDirecoes]
  );

  /* arrastando, o z-buffer cai de resolução para acompanhar o ponteiro */
  const resultado = useMemo(
    () => renderizar(cena, cam, size.w, size.h, { modo, qualidade: arrastando ? 800 : 1600 }),
    [cena, cam, size, modo, arrastando]
  );

  const estilo = { traco: corTraco, fundo: corFundo, transparente, espessura, modo, opacOcultas };
  const svg = useMemo(
    () => montarSVG(resultado, size.w, size.h, estilo),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resultado, size, corTraco, corFundo, transparente, espessura, modo, opacOcultas]
  );

  /* ---------------------------------------------------------------- */

  const escolher = (f) => {
    const d = padroes(f);
    setFormaId(f.id);
    setGrade(d.grade);
    setParams(d.params);
    setCam(d.camera);
    setLinhasU(true);
    setLinhasV(true);
    setStatus("");
  };

  const carregarSVG = async (arquivo) => {
    if (!arquivo) return;
    try {
      const f = formaSVG(lerSVG(await arquivo.text()), arquivo.name);
      setSvgEnviado({ forma: f, miniatura: miniatura(f) });
      escolher(f);
      setStatus(`${arquivo.name} carregado`);
    } catch (err) {
      setStatus(`Não deu para ler o SVG: ${err.message}`);
    }
  };

  const setParam = (id, v) => setParams((p) => ({ ...p, [id]: v }));
  const setCamera = (k, v) => setCam((c) => ({ ...c, [k]: v }));

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arrasto.current = { x: e.clientX, y: e.clientY, rx: cam.rx, ry: cam.ry };
    setArrastando(true);
  };
  const onPointerMove = (e) => {
    const a = arrasto.current;
    if (!a) return;
    const dx = e.clientX - a.x, dy = e.clientY - a.y;
    setCam((c) => ({ ...c, ry: girar(a.ry + dx * 0.5), rx: girar(a.rx + dy * 0.5) }));
  };
  const onPointerUp = () => {
    arrasto.current = null;
    setArrastando(false);
  };

  /* exportação: refaz o teste de profundidade em resolução maior */
  const nomeArquivo = `wireframe-${forma.id}-${size.w}x${size.h}`;
  const svgFinal = () =>
    montarSVG(renderizar(cena, cam, size.w, size.h, { modo, qualidade: 3200 }), size.w, size.h, estilo);

  const baixar = (blob, nome) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nome;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const exportSVG = () => {
    baixar(new Blob([svgFinal()], { type: "image/svg+xml" }), `${nomeArquivo}.svg`);
    setStatus("SVG salvo");
  };

  const exportPNG = () => {
    const k = escalaPng;
    const W = size.w * k, H = size.h * k;
    /* o SVG declara o tamanho final, então o navegador rasteriza o vetor já
       na resolução do PNG em vez de ampliar uma imagem pequena */
    const s = svgFinal().replace(`width="${size.w}" height="${size.h}"`, `width="${W}" height="${H}"`);
    const url = URL.createObjectURL(new Blob([s], { type: "image/svg+xml" }));
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement("canvas");
      cv.width = W;
      cv.height = H;
      cv.getContext("2d").drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(url);
      cv.toBlob((b) => {
        if (b) baixar(b, `${nomeArquivo}${k > 1 ? `@${k}x` : ""}.png`);
        setStatus(b ? "PNG salvo" : "Não foi possível gerar o PNG");
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setStatus("Não foi possível gerar o PNG");
    };
    img.src = url;
  };

  const copiarSVG = async () => {
    try {
      await navigator.clipboard.writeText(svgFinal());
      setStatus("SVG copiado");
    } catch {
      setStatus("O navegador bloqueou a área de transferência");
    }
  };

  const restaurarCamera = () => setCam(padroes(forma).camera);

  const nLinhas = resultado.linhas.filter((l) => l.vis.length).length;
  const ocultasVisiveis = modo === "tracejar" || modo === "esmaecer";

  /* ---------------------------------------------------------------- */

  return (
    <div className="gm-app" data-tema={tema}>
      <style>{CSS}</style>

      <aside className="gm-painel">
        <Header
          tool="wireframe maker"
          homeHref={HUB_URL}
          tema={tema}
          onToggleTema={() => setTema((t) => (t === "escuro" ? "claro" : "escuro"))}
        />

        <div className="wm-rolagem">
        <Secao titulo={`Forma · ${forma.nome}`}>
          <div className="wm-formas">
            {FORMAS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`wm-forma${f.id === formaId ? " is-ativo" : ""}`}
                title={f.nome}
                aria-label={f.nome}
                aria-pressed={f.id === formaId}
                onClick={() => escolher(f)}
                dangerouslySetInnerHTML={{ __html: miniaturas[f.id] }}
              />
            ))}
            {svgEnviado && (
              <button
                type="button"
                className={`wm-forma${formaId === "svg" ? " is-ativo" : ""}`}
                title={svgEnviado.forma.arquivo}
                aria-label={`SVG enviado: ${svgEnviado.forma.arquivo}`}
                aria-pressed={formaId === "svg"}
                onClick={() => escolher(svgEnviado.forma)}
                dangerouslySetInnerHTML={{ __html: svgEnviado.miniatura }}
              />
            )}
            <button
              type="button"
              className="wm-forma wm-enviar"
              title="Enviar SVG"
              aria-label="Enviar SVG"
              onClick={() => arquivoRef.current?.click()}
            >
              <Upload />
            </button>
            <input
              ref={arquivoRef}
              type="file"
              accept=".svg,image/svg+xml"
              hidden
              onChange={(e) => {
                carregarSVG(e.target.files[0]);
                e.target.value = "";
              }}
            />
          </div>
          <p className="gm-nota">
            Envie um SVG — ou solte o arquivo no palco — para extrudar o contorno preenchido em wireframe.
          </p>
        </Secao>

        {forma.params.length > 0 && (
          <Secao titulo="Geometria">
            {forma.arquivo && (
              <p className="gm-nota" style={{ margin: "0 0 12px" }}>
                {forma.arquivo}
              </p>
            )}
            {forma.params.map((p) => {
              if (p.tipo === "opcoes")
                return (
                  <div className="gm-controle" key={`${forma.id}-${p.id}`}>
                    <div className="gm-controle-cab">
                      <label className="gm-rotulo">{p.rotulo}</label>
                    </div>
                    <Seletor options={p.opcoes} value={params[p.id]} onChange={(v) => setParam(p.id, v)} />
                  </div>
                );
              if (p.tipo === "semente")
                return (
                  <div className="gm-controle" key={`${forma.id}-${p.id}`}>
                    <div className="gm-controle-cab" style={{ marginBottom: 0 }}>
                      <label className="gm-rotulo">{p.rotulo}</label>
                      <input
                        className="gm-valor"
                        inputMode="numeric"
                        value={params[p.id]}
                        onChange={(e) => {
                          const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
                          setParam(p.id, Number.isNaN(n) ? 0 : Math.min(99999, n));
                        }}
                        aria-label={p.rotulo}
                      />
                      <button
                        type="button"
                        className="gm-botao gm-botao--icone"
                        onClick={() => setParam(p.id, Math.floor(Math.random() * 99999))}
                        aria-label="Sortear semente"
                        title="Sortear"
                      >
                        <Shuffle size={13} />
                      </button>
                    </div>
                  </div>
                );
              return (
                <Slider
                  key={`${forma.id}-${p.id}`}
                  label={p.rotulo}
                  value={params[p.id]}
                  onChange={(v) => setParam(p.id, v)}
                  min={p.min}
                  max={p.max}
                  unidade={p.unidade}
                  acento="cyan"
                />
              );
            })}
          </Secao>
        )}

        <Secao titulo="Malha">
          {[
            ["u", "nu", linhasU, setLinhasU],
            ["v", "nv", linhasV, setLinhasV],
          ].map(([eixo, k, ligado, setLigado]) => {
            const g = forma.grade[eixo];
            if (!g) return null;
            return (
              <Slider
                key={`${forma.id}-${eixo}`}
                label={g.rotulo}
                value={grade[k]}
                onChange={(v) => setGrade((gr) => ({ ...gr, [k]: v }))}
                min={g.min}
                max={g.max}
                unidade=""
                acento="cyan"
                disabled={!ligado}
                extra={
                  duasDirecoes && (
                    <button
                      type="button"
                      className={`gm-botao gm-botao--icone${ligado ? "" : " is-desligado"}`}
                      onClick={() => setLigado((x) => !x)}
                      aria-pressed={ligado}
                      aria-label={ligado ? `Esconder ${g.rotulo.toLowerCase()}` : `Mostrar ${g.rotulo.toLowerCase()}`}
                      title={ligado ? "Esconder estas linhas" : "Mostrar estas linhas"}
                    >
                      {ligado ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                  )
                }
              />
            );
          })}
        </Secao>

        <Secao titulo="Câmera">
          <Slider label="Inclinação" value={cam.rx} onChange={(v) => setCamera("rx", v)} min={-180} max={180} unidade="°" acento="mag" />
          <Slider label="Giro" value={cam.ry} onChange={(v) => setCamera("ry", v)} min={-180} max={180} unidade="°" acento="mag" />
          <Slider label="Rolagem" value={cam.rz} onChange={(v) => setCamera("rz", v)} min={-180} max={180} unidade="°" acento="mag" />
          <Slider
            label="Perspectiva"
            value={cam.persp}
            onChange={(v) => setCamera("persp", v)}
            acento="cyan"
            nota={cam.persp === 0 ? "Projeção paralela, sem ponto de fuga" : null}
          />
          <Slider label="Escala" value={cam.escala} onChange={(v) => setCamera("escala", v)} min={10} max={250} acento="cyan" nota="Arraste o desenho para girar." />
        </Secao>

        <Secao titulo="Traço">
          <div className="gm-controle">
            <div className="gm-controle-cab">
              <label className="gm-rotulo">Linhas ocultas</label>
            </div>
            <Seletor options={MODOS} value={modo} onChange={setModo} />
            <p className="gm-nota">{NOTA_MODO[modo]}</p>
          </div>
          {ocultasVisiveis && (
            <Slider label="Opacidade das ocultas" value={opacOcultas} onChange={setOpacOcultas} min={5} max={100} acento="mag" />
          )}
          <Slider label="Espessura" value={espessura} onChange={setEspessura} min={0.1} max={8} step={0.1} unidade="px" acento="mag" />
          <Cor label="Cor do traço" value={corTraco} onChange={setTraco} />
          <div className="gm-controle">
            <div className="gm-controle-cab">
              <label className="gm-rotulo">Fundo</label>
            </div>
            <Seletor
              options={[
                { value: "cor", label: "cor" },
                { value: "transparente", label: "transparente" },
              ]}
              value={transparente ? "transparente" : "cor"}
              onChange={(v) => setTransparente(v === "transparente")}
            />
          </div>
          {!transparente && <Cor label="Cor do fundo" value={corFundo} onChange={setFundo} />}
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
              aria-label="Tamanho"
            >
              {SIZES.map((sz, i) => (
                <option key={sz.label} value={i}>
                  {sz.label} px
                </option>
              ))}
            </select>
          </div>
          <div className="gm-controle">
            <div className="gm-controle-cab">
              <label className="gm-rotulo">Resolução do PNG</label>
            </div>
            <Seletor
              options={[1, 2, 4].map((k) => ({ value: k, label: `${k}×` }))}
              value={escalaPng}
              onChange={setEscalaPng}
            />
          </div>

          <div className="gm-grade2">
            <button type="button" className="gm-botao gm-botao--primario" onClick={exportPNG}>
              <Download size={13} /> png
            </button>
            <button type="button" className="gm-botao" onClick={exportSVG}>
              <Download size={13} /> svg
            </button>
          </div>
          <button type="button" className="gm-botao" style={{ width: "100%", marginTop: 8 }} onClick={copiarSVG}>
            <Copy size={13} /> copiar svg
          </button>

          <p className="gm-nota">
            O SVG sai só com traços, sem preenchimento. Linhas visíveis e ocultas ficam em grupos separados — no
            Illustrator, cada um vira uma camada.
          </p>
        </Secao>

        </div>
      </aside>

      <main className="gm-main">
        <div className="gm-barra">
          <span>
            <strong>{forma.nome.toUpperCase()}</strong>
          </span>
          <span>
            {size.w} × {size.h} PX
          </span>
          <span>{nLinhas} LINHAS</span>
          {status && <span>{status.toUpperCase()}</span>}
          <span className="gm-barra-fim">
            <button type="button" className="gm-botao" onClick={restaurarCamera}>
              <RotateCcw size={13} /> câmera
            </button>
          </span>
        </div>

        <div
          className={`gm-palco${soltando ? " is-soltando" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setSoltando(true);
          }}
          onDragLeave={() => setSoltando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setSoltando(false);
            carregarSVG(e.dataTransfer.files[0]);
          }}
        >
          <div
            className={`gm-doc${arrastando ? " is-arrastando" : ""}`}
            style={{ "--wm-razao": size.w / size.h }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div className="gm-documento" dangerouslySetInnerHTML={{ __html: svg }} />
            <span className="gm-registro" style={{ left: -19, top: -19 }} />
            <span className="gm-registro" style={{ right: -19, top: -19 }} />
            <span className="gm-registro" style={{ left: -19, bottom: -19 }} />
            <span className="gm-registro" style={{ right: -19, bottom: -19 }} />
          </div>
        </div>
      </main>
    </div>
  );
}
