import React, { useState, useRef, useEffect, useMemo } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { MONO, SANS } from "./theme.js";

/* Servido pelo hub em /texture-prompts/ — o menu é a raiz do mesmo site. */
const HUB_URL = "/";
import { CATEGORIAS, MATERIAIS, attrsDe, sementeDe } from "./biblioteca.js";
import { amostra } from "./amostras.js";
import {
  MODELOS, PROPORCOES, IDIOMAS, LUZES, FUNDOS, ESTILOS, COMPOSICOES, ATRIBUTOS,
  fraseAtributo, montarPartes, formatar, MODELO_ACEITA_NEGATIVO, detectarIdioma, nomeDaCor,
} from "./prompt.js";

/* ============================================================
   texture prompts — gerador de prompts de textura e material
   Família: gri.d.maker · bento maker · gradient maker · 3d maker
   ============================================================ */

/* ------------------------------------------------------------------ */
/* Paleta — copiada do gri.d.maker (src/GridMaker.jsx). Fonte da verdade */
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

/* Como no 3d maker: Host Grotesk SemiBold pela Google Fonts até existir o
   subconjunto base64 com os glifos de "texture prompts". */
const FONTE_MARCA = `@import url('https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@600&display=swap');`;

/* resoluções das amostras (px do bitmap, já pensando em tela 2x) */
const TAM = { destaque: 640, cardGrande: 448, card: 288, variante: 72, exportar: 960 };

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
  letter-spacing:-.005em;text-transform:lowercase;line-height:1;color:${C.text};white-space:nowrap}
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
  color:${C.cyan};margin:0 0 12px;display:flex;align-items:center;gap:8px;font-weight:400}
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
  background:${C.line};border-radius:2px;margin:6px 0}
.ctl-range::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;
  border-radius:50%;background:var(--accent,var(--acento));cursor:grab;border:2px solid ${C.ink2}}
.ctl-range::-moz-range-thumb{width:13px;height:13px;border-radius:50%;
  background:var(--accent,var(--acento));cursor:grab;border:2px solid ${C.ink2}}
.ctl-range:focus-visible{outline:2px solid ${C.cyan};outline-offset:4px}
.ctl-ends{display:flex;justify-content:space-between;font-family:${MONO};font-size:9.5px;color:${C.muted}}
.ctl-frase{font-family:${MONO};font-size:10px;letter-spacing:.03em;color:${C.muted};line-height:1.6;margin-top:4px}
.ctl-frase b{color:${C.text};font-weight:400}

.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
.grid5{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
select,.btn{width:100%;background:${C.ink};border:1px solid ${C.line};color:${C.text};
  font-family:${MONO};font-size:11px;padding:7px 8px;border-radius:2px;cursor:pointer}
select:focus-visible,.btn:focus-visible{outline:2px solid ${C.cyan};outline-offset:1px}
select:disabled{opacity:.4;cursor:not-allowed}
.btn:hover:not(:disabled){background:${C.cyan};border-color:${C.cyan};color:${C.sobreCyan}}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn-mag{background:${C.magBtn};border-color:${C.magBtn};color:${C.sobreMag};font-weight:600;
  letter-spacing:.05em}
.btn-mag:hover:not(:disabled){background:${C.magHover};border-color:${C.magHover};color:${C.sobreMag}}
.btn[data-on="1"]{border-color:${C.mag};background:${C.ink3};color:${C.text}}
.btn[data-on="1"]:hover:not(:disabled){background:${C.cyan};border-color:${C.cyan};color:${C.sobreCyan}}

input[type=text],textarea{width:100%;background:${C.ink};border:1px solid ${C.line};color:${C.text};
  font-family:${MONO};font-size:11px;padding:6px 7px;border-radius:2px;resize:vertical;line-height:1.5}
input[type=text]::placeholder,textarea::placeholder{color:${C.muted}}
.cor-linha{display:flex;align-items:center;gap:6px}
.cor-amostra{flex:none;width:30px;height:30px;padding:2px;background:${C.ink};
  border:1px solid ${C.line};border-radius:2px;cursor:pointer}
.cor-amostra:hover{border-color:${C.cyan}}
.cor-amostra:focus-visible{outline:2px solid ${C.cyan};outline-offset:1px}
.cor-amostra::-webkit-color-swatch-wrapper{padding:0}
.cor-amostra::-webkit-color-swatch{border:0;border-radius:1px}
.cor-amostra::-moz-color-swatch{border:0;border-radius:1px}
.cor-limpar{flex:none;width:30px;height:30px;padding:0;line-height:1}
input[type=text]:focus-visible,textarea:focus-visible{outline:2px solid ${C.cyan};outline-offset:1px}
.check{display:flex;align-items:center;gap:8px;font-size:11.5px;cursor:pointer}
.check input{accent-color:${C.mag};width:13px;height:13px;margin:0}
.check input:focus-visible{outline:2px solid ${C.cyan};outline-offset:1px}
.check[data-off="1"]{opacity:.4;cursor:not-allowed}

/* variações do material, com miniatura */
.var{display:flex;align-items:center;gap:8px;text-align:left;font-family:${SANS};font-size:11.5px;
  padding:4px 6px 4px 4px;min-width:0}
.var canvas{width:28px;height:28px;border-radius:2px;flex:none;display:block;background:${C.ink3}}
.var span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mat-atual{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:10px}
.mat-atual b{font-size:13px;font-weight:600}
.mat-atual span{font-family:${MONO};font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:${C.muted}}

.hint{font-family:${MONO};font-size:10px;color:${C.muted};line-height:1.6;
  margin:10px 0 0;letter-spacing:.03em}
.hint b{color:${C.text};font-weight:500}
.msg{color:${C.cyan}}

/* ---- palco ---- */
.stage{flex:1;display:flex;flex-direction:column;min-width:0;background:${C.stage}}
.bar{display:flex;align-items:center;gap:14px;padding:0 20px;height:46px;
  border-bottom:1px solid ${C.line};font-family:${MONO};font-size:10.5px;color:${C.muted};
  letter-spacing:.06em;flex:0 0 46px;background:${C.ink2};white-space:nowrap;overflow:hidden}
.bar b{color:${C.text};font-weight:500}
.bar .sp{flex:1}
.corpo{flex:1;overflow-y:auto;padding:34px}

.destaque{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:34px;align-items:start;
  margin-bottom:42px}
.quadro{position:relative;margin:19px}
.quadro canvas{display:block;width:100%;aspect-ratio:1/1;background:${C.ink3};
  box-shadow:0 0 0 1px ${C.line},0 20px 60px ${C.sombra}}
.reg{position:absolute;width:13px;height:13px;pointer-events:none}
.reg::before,.reg::after{content:"";position:absolute;background:${C.cyan};opacity:.85}
.reg::before{left:6px;top:0;width:1px;height:13px}
.reg::after{top:6px;left:0;height:1px;width:13px}
.reg.tl{left:-19px;top:-19px}.reg.tr{right:-19px;top:-19px}
.reg.bl{left:-19px;bottom:-19px}.reg.br{right:-19px;bottom:-19px}
.legenda{display:flex;justify-content:space-between;gap:8px;margin:14px 19px 0;font-family:${MONO};
  font-size:10px;letter-spacing:.06em;color:${C.muted}}
.legenda b{color:${C.text};font-weight:500}

.prompt{background:${C.ink2};border:1px solid ${C.line};border-radius:2px;padding:16px 18px}
.prompt-topo{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.prompt-topo .sec-title{flex:1;margin:0}
.prompt-topo .btn{width:auto;flex:none}
.prompt-texto{margin:0;font-family:${MONO};font-size:12px;line-height:1.7;color:${C.text};
  white-space:pre-wrap;word-break:break-word;user-select:text}
.prompt-neg{margin-top:16px}
.prompt-neg .prompt-texto{color:${C.muted}}
.prompt-pe{display:flex;gap:14px;margin-top:14px;padding-top:12px;border-top:1px solid ${C.line};
  font-family:${MONO};font-size:10px;letter-spacing:.06em;color:${C.muted}}
.prompt-pe b{color:${C.text};font-weight:500}

/* anatomia: de onde vem cada parte do prompt */
.anatomia{margin-top:12px;display:grid;grid-template-columns:auto 1fr;gap:6px 12px;
  font-family:${MONO};font-size:10px;letter-spacing:.03em;line-height:1.6}
.anatomia dt{color:${C.cyan};text-transform:uppercase;letter-spacing:.14em;font-size:9.5px;padding-top:1px}
.anatomia dd{margin:0;color:${C.muted}}

/* ---- biblioteca (bento) ---- */
.bib-topo{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.bib-topo .sec-title{flex:1 1 100%;margin:0}
.chips{display:flex;flex-wrap:wrap;gap:6px;flex:1}
.chips .btn{width:auto}
.busca{width:200px !important;flex:none}
.grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));grid-auto-flow:dense;gap:8px}
.card{position:relative;aspect-ratio:1/1;border:1px solid ${C.line};border-radius:2px;overflow:hidden;
  cursor:pointer;background:${C.ink3};padding:0;display:block;width:100%}
.card[data-grande="1"]{grid-column:span 2;grid-row:span 2}
.card canvas{width:100%;height:100%;display:block}
.card:focus-visible{outline:2px solid ${C.cyan};outline-offset:1px}
.card[data-sel="1"]{border-color:${C.mag};box-shadow:inset 0 0 0 1px ${C.mag}}
.etq{position:absolute;left:8px;bottom:8px;display:flex;align-items:baseline;gap:8px;max-width:calc(100% - 16px);
  background:${C.ink2};border:1px solid ${C.line};border-radius:2px;padding:5px 8px;text-align:left}
.etq b{font-size:11.5px;font-weight:500;color:${C.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.etq span{font-family:${MONO};font-size:9.5px;color:${C.muted};flex:none}
.card:hover .etq{background:${C.cyan};border-color:${C.cyan}}
.card:hover .etq b,.card:hover .etq span{color:${C.sobreCyan}}
.card[data-sel="1"] .etq{background:${C.mag};border-color:${C.mag}}
.card[data-sel="1"] .etq b,.card[data-sel="1"] .etq span{color:${C.sobreMag}}
.vazio{font-family:${MONO};font-size:10px;letter-spacing:.03em;color:${C.muted};line-height:1.65;padding:24px 0}

/* ---- rodapé ---- */
.rodape{padding:16px 18px;border-top:1px solid ${C.line};background:${C.ink2};
  display:flex;flex-wrap:wrap;gap:8px 16px}
.rodape a{font-family:${MONO};font-size:10.5px;letter-spacing:.04em;color:${C.muted};
  text-decoration:none}
.rodape a:hover{color:${C.cyan}}
.rodape a:focus-visible{outline:2px solid ${C.cyan};outline-offset:2px}

@media (max-width:1180px){
  .destaque{grid-template-columns:1fr}
  .quadro{max-width:420px}
}
@media (max-width:860px){
  .app{flex-direction:column;height:auto;min-height:0}
  .panel{width:100%;flex:none;max-height:none;border-right:none;border-bottom:1px solid ${C.line}}
  .corpo{padding:20px 16px}
  .bar .dica{display:none}
  .busca{width:100% !important}
  .grade{grid-template-columns:repeat(auto-fill,minmax(130px,1fr))}
}
@media (prefers-reduced-motion:reduce){*{transition:none !important;animation:none !important}}
`;

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */
const specDe = (mat, va) => ({ ...va.amostra, seed: sementeDe(mat.id + "/" + va.id) });
const contaPalavras = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);

const download = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

async function copiarTexto(txt) {
  try {
    await navigator.clipboard.writeText(txt);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

/* quebra texto em linhas que cabem em `largura`, respeitando \n */
function quebrar(ctx, texto, largura) {
  const linhas = [];
  for (const par of texto.split("\n")) {
    if (!par) { linhas.push(""); continue; }
    let atual = "";
    for (const p of par.split(" ")) {
      const teste = atual ? `${atual} ${p}` : p;
      if (ctx.measureText(teste).width > largura && atual) { linhas.push(atual); atual = p; }
      else atual = teste;
    }
    linhas.push(atual);
  }
  return linhas;
}

/* ------------------------------------------------------------------ */
/* Componentes de UI (iguais aos do gri.d.maker)                        */
/* ------------------------------------------------------------------ */
function Slider({ label, value, onChange, min = 0, max = 100, step = 1, unit = "", accent, ends, frase }) {
  return (
    <div className="ctl">
      <div className="ctl-head">
        <span className="ctl-label">{label}</span>
        <input className="ctl-num" type="number" value={value} min={min} max={max} step={step}
          aria-label={label}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!Number.isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
          }} />
        <span className="ctl-unit">{unit}</span>
      </div>
      <input className="ctl-range" type="range" min={min} max={max} step={step} value={value}
        aria-label={`${label}, controle deslizante`}
        style={{ "--accent": accent || "var(--acento)" }}
        onChange={(e) => onChange(parseFloat(e.target.value))} />
      {ends && <div className="ctl-ends"><span>{ends[0]}</span><span>{ends[1]}</span></div>}
      {frase !== undefined && <div className="ctl-frase">{frase ? <b>{frase}</b> : "fora do prompt"}</div>}
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

/* Canvas que recebe a amostra procedural assim que o agendador termina. */
function Amostra({ spec, size, urgente = false, label }) {
  const ref = useRef(null);
  const k = JSON.stringify(spec) + "@" + size;
  useEffect(() => {
    let vivo = true;
    amostra(spec, size, urgente).then((cv) => {
      if (!vivo || !ref.current) return;
      ref.current.getContext("2d").drawImage(cv, 0, 0);
    });
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k]);
  return <canvas key={k} ref={ref} width={size} height={size} role="img" aria-label={label} />;
}

/* ============================================================ */
export default function TexturePrompts() {
  const [tema, setTema] = useState("escuro");
  const C = TEMAS[tema];

  const [matId, setMatId] = useState("vidro");
  const [varPorMat, setVarPorMat] = useState({});
  const mat = MATERIAIS.find((m) => m.id === matId);
  const va = mat.variantes.find((v) => v.id === varPorMat[matId]) || mat.variantes[0];

  const [modo, setModo] = useState("objeto");
  const [attrs, setAttrs] = useState(() => attrsDe(mat, va));
  const [cor, setCor] = useState("");
  const [corHex, setCorHex] = useState("#1B4FA0");
  const [extra, setExtra] = useState("");
  const [luz, setLuz] = useState("auto");
  const [fundo, setFundo] = useState("auto");
  const [estilo, setEstilo] = useState("render");
  const [composicao, setComposicao] = useState("centro");
  const [modelo, setModelo] = useState("grok");
  const [proporcao, setProporcao] = useState("1:1");
  const [negativo, setNegativo] = useState(true);
  const [idiomaModo, setIdiomaModo] = useState("auto");
  const [filtro, setFiltro] = useState("todas");
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const statusTimer = useRef(0);

  const avisar = (msg) => {
    setStatus(msg);
    clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatus(""), 2600);
  };

  /* trocar de material ou variação recarrega os atributos sugeridos */
  const escolher = (m, v) => {
    const vv = v || m.variantes.find((x) => x.id === varPorMat[m.id]) || m.variantes[0];
    setMatId(m.id);
    setVarPorMat((s) => ({ ...s, [m.id]: vv.id }));
    setAttrs(attrsDe(m, vv));
  };

  /* Idioma: no automático, segue o que o usuário escreveu. O texto de um
     preset não é pontuado — ele é nosso e troca de língua junto com o
     resto —, mas se o preset foi escolhido em português, isso vale como
     sinal: clicar em "Esfera" não pode devolver o prompt para o inglês.
     Sem sinal nenhum, fica em inglês. */
  const detectado = detectarIdioma([cor, extra].join(" "));
  const idioma = idiomaModo === "auto" ? detectado || "en" : idiomaModo;
  const pt = idioma === "pt";

  const partes = useMemo(
    () => montarPartes({ modo, attrs, cor, extra, luz, fundo, estilo, composicao, proporcao, idioma }, mat, va),
    [modo, attrs, cor, extra, luz, fundo, estilo, composicao, proporcao, idioma, mat, va],
  );
  const aceitaNeg = MODELO_ACEITA_NEGATIVO[modelo];
  const saida = useMemo(() => formatar(partes, modelo, negativo && aceitaNeg), [partes, modelo, negativo, aceitaNeg]);
  const rotuloNeg = pt ? "Prompt negativo" : "Negative prompt";
  const textoCompleto = saida.negativo ? `${saida.texto}\n\n${rotuloNeg}: ${saida.negativo}` : saida.texto;
  const nomeModelo = MODELOS.find((m) => m.id === modelo).nome;

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return MATERIAIS.filter((m) => {
      if (filtro !== "todas" && m.cat !== filtro) return false;
      if (!q) return true;
      return [m.nome, ...m.variantes.map((v) => `${v.nome} ${v.material} ${v.pt.material}`)].join(" ").toLowerCase().includes(q);
    });
  }, [filtro, busca]);

  /* o seletor escreve o nome da cor mais próxima — modelo de imagem lê nome
     melhor que hexadecimal — e deixa o código ao lado, para quem precisa exato */
  const escolherCor = (hex) => {
    setCorHex(hex);
    setCor(nomeDaCor(hex, idioma) + " " + hex.toUpperCase());
  };

  const tile = modo === "superficie";
  const nomeArquivo = `texture-prompt-${mat.id}-${va.id}-${modelo}`;

  const copiar = async () => avisar((await copiarTexto(textoCompleto)) ? "Prompt copiado." : "Não deu para copiar — selecione o texto.");
  const baixarTxt = () => {
    download(new Blob([textoCompleto + "\n"], { type: "text/plain;charset=utf-8" }), `${nomeArquivo}.txt`);
    avisar("TXT exportado.");
  };

  /* Cartão PNG no formato do exemplo: título, prompt e amostra. */
  const baixarPng = async () => {
    avisar("Gerando PNG…");
    const [cv] = await Promise.all([
      amostra(specDe(mat, va), TAM.exportar, true),
      document.fonts.load('600 64px "Host Grotesk"').catch(() => null),
    ]);
    const W = 1080, H = 1350, M = 60;
    const out = document.createElement("canvas");
    out.width = W; out.height = H;
    const ctx = out.getContext("2d");
    ctx.fillStyle = C.ink2; ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = C.cyan; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.font = `600 64px "Host Grotesk", ${SANS}`;
    ctx.fillText(`PROMPT ${nomeModelo.toUpperCase()}`, W / 2, M + 56);

    /* o texto encolhe até caber em no máximo 40% da altura */
    const topo = M + 100, maxAlt = H * 0.4;
    let fs = 26, linhas, lh;
    do {
      ctx.font = `400 ${fs}px ${MONO}`;
      lh = Math.round(fs * 1.45);
      linhas = quebrar(ctx, textoCompleto, W - M * 2);
      if (linhas.length * lh <= maxAlt) break;
      fs -= 1;
    } while (fs > 12);
    ctx.fillStyle = C.text; ctx.textAlign = "left"; ctx.textBaseline = "top";
    linhas.forEach((l, i) => ctx.fillText(l, M, topo + i * lh));

    const baseTexto = topo + linhas.length * lh + 36;
    const pe = 64;
    const lado = Math.min(W - M * 2, H - baseTexto - pe - M / 2);
    const x0 = (W - lado) / 2;
    ctx.drawImage(cv, x0, baseTexto, lado, lado);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1;
    ctx.strokeRect(x0 + 0.5, baseTexto + 0.5, lado - 1, lado - 1);

    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = C.muted;
    ctx.font = `600 24px "Host Grotesk", ${SANS}`;
    ctx.fillText("texture prompts", M, H - M + 10);
    ctx.textAlign = "right";
    ctx.font = `400 18px ${MONO}`;
    ctx.fillText(`${mat.nome} · ${va.nome}`.toUpperCase(), W - M, H - M + 8);

    out.toBlob((b) => { download(b, `${nomeArquivo}.png`); avisar("PNG exportado."); }, "image/png");
  };

  /* anatomia do prompt, na ordem em que as partes entram */
  const anatomia = [
    ["Material", partes.material],
    ["Detalhes", partes.detalhes.join(" · ")],
    ["Atributos", partes.atributos.join(" · ") || "—"],
    ["Cena", [partes.luz, partes.fundo].filter(Boolean).join(" · ")],
    ["Estilo", [partes.estilo, partes.composicao].join(" · ")],
  ];

  return (
    <div className="app">
      <style>{css(C)}</style>

      {/* ============================ PAINEL ============================ */}
      <aside className="panel">
        <Header tool="texture prompts" homeHref={HUB_URL} tema={tema}
          onToggleTema={() => setTema(tema === "escuro" ? "claro" : "escuro")} />

        <section className="sec">
          <h2 className="sec-title">Aplicação</h2>
          <div className="grid2">
            <button className="btn" data-on={!tile ? 1 : 0} onClick={() => setModo("objeto")}>Objeto</button>
            <button className="btn" data-on={tile ? 1 : 0} onClick={() => setModo("superficie")}>Textura contínua</button>
          </div>
          <p className="hint">
            {tile
              ? "Padrão sem emenda, visto de cima — para fundo, mockup ou mapa de textura 3D."
              : "Só a aparência do material, em peça isolada. Nenhum objeto é nomeado: quem diz o que vestir com ela é você, no seu pedido ao modelo."}
          </p>
        </section>

        <section className="sec">
          <h2 className="sec-title">Material</h2>
          <div className="mat-atual">
            <b>{mat.nome}</b>
            <span>{CATEGORIAS.find((c) => c.id === mat.cat).nome}</span>
          </div>
          <div className="grid2">
            {mat.variantes.map((v) => (
              <button key={v.id} className="btn var" data-on={v.id === va.id ? 1 : 0} title={v.material}
                onClick={() => escolher(mat, v)}>
                <Amostra spec={specDe(mat, v)} size={TAM.variante} urgente label={v.nome} />
                <span>{v.nome}</span>
              </button>
            ))}
          </div>
          <div className="ctl" style={{ marginTop: 14 }}>
            <div className="ctl-label" style={{ marginBottom: 6 }}>Cor dominante</div>
            <div className="cor-linha">
              <input type="color" className="cor-amostra" value={corHex} aria-label="Escolher cor dominante"
                onChange={(e) => escolherCor(e.target.value)} />
              <input type="text" value={cor} placeholder="azul cobalto, verde-sálvia…" aria-label="Cor dominante"
                onChange={(e) => setCor(e.target.value)} />
              {cor && (
                <button className="btn cor-limpar" onClick={() => setCor("")} aria-label="Limpar cor dominante"
                  title="Sem cor dominante">×</button>
              )}
            </div>
          </div>
          <Field label="Detalhe extra">
            <input type="text" value={extra} placeholder="gotas d'água na superfície…" aria-label="Detalhe extra"
              onChange={(e) => setExtra(e.target.value)} />
          </Field>
          <p className="hint">Escreva em português ou em inglês: o prompt inteiro acompanha o idioma do que você escreveu.</p>
        </section>

        <section className="sec">
          <h2 className="sec-title">Atributos</h2>
          {ATRIBUTOS.map((a) => (
            <Slider key={a.id} label={a.nome} value={attrs[a.id]} accent={C.mag}
              ends={[a.min, a.max]} frase={fraseAtributo(a, attrs[a.id], idioma)}
              onChange={(v) => setAttrs((s) => ({ ...s, [a.id]: v }))} />
          ))}
          <button className="btn" style={{ marginTop: 4 }} onClick={() => setAttrs(attrsDe(mat, va))}>
            Restaurar valores do material
          </button>
        </section>

        <section className="sec">
          <h2 className="sec-title">Cena</h2>
          <Field label="Iluminação">
            <select value={luz} onChange={(e) => setLuz(e.target.value)} aria-label="Iluminação">
              {LUZES.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </Field>
          <Field label="Fundo">
            <select value={fundo} disabled={tile} onChange={(e) => setFundo(e.target.value)} aria-label="Fundo">
              {FUNDOS.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </Field>
          <Field label="Estilo">
            <select value={estilo} disabled={tile} onChange={(e) => setEstilo(e.target.value)} aria-label="Estilo">
              {ESTILOS.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </Field>
          <Field label="Composição">
            <select value={composicao} disabled={tile} onChange={(e) => setComposicao(e.target.value)} aria-label="Composição">
              {COMPOSICOES.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </Field>
          {tile && <p className="hint">Na textura contínua, fundo, estilo e composição são fixos: vista de cima, luz uniforme, sem emenda.</p>}
        </section>

        <section className="sec">
          <h2 className="sec-title">Modelo</h2>
          <div className="grid3">
            {MODELOS.map((m) => (
              <button key={m.id} className="btn" data-on={m.id === modelo ? 1 : 0} onClick={() => setModelo(m.id)}>{m.nome}</button>
            ))}
          </div>
          <div className="ctl" style={{ marginTop: 14 }}>
            <div className="ctl-label" style={{ marginBottom: 6 }}>Proporção</div>
            <div className="grid5">
              {PROPORCOES.map((r) => (
                <button key={r} className="btn" data-on={r === proporcao ? 1 : 0} onClick={() => setProporcao(r)}>{r}</button>
              ))}
            </div>
          </div>
          <div className="ctl">
            <div className="ctl-label" style={{ marginBottom: 6 }}>Idioma do prompt</div>
            <div className="grid3">
              {IDIOMAS.map((i) => (
                <button key={i.id} className="btn" data-on={i.id === idiomaModo ? 1 : 0} onClick={() => setIdiomaModo(i.id)}>{i.nome}</button>
              ))}
            </div>
            <p className="hint" style={{ marginTop: 6 }}>
              {idiomaModo === "auto"
                ? detectado
                  ? <>Detectado: <b>{pt ? "português" : "inglês"}</b>, pelo que você escreveu.</>
                  : <>Nada escrito ainda: saindo em <b>inglês</b>.</>
                : <>Fixado em <b>{pt ? "português" : "inglês"}</b>.</>}
              {pt && (modelo === "midjourney" || modelo === "flux") && " Midjourney e Flux entendem português, mas acertam mais em inglês."}
              {pt && modelo === "gemini" && " Gemini e Flow leem português bem."}
            </p>
          </div>
          <label className="check" data-off={aceitaNeg ? 0 : 1}>
            <input type="checkbox" checked={negativo && aceitaNeg} disabled={!aceitaNeg}
              onChange={(e) => setNegativo(e.target.checked)} />
            Prompt negativo
          </label>
          <p className="hint">
            {modelo === "grok" && "Grok: caixa alta entre chaves, como no exemplo. Não aceita negativo."}
            {modelo === "midjourney" && <>Midjourney: parâmetros no fim — <b>--ar</b>, <b>--style raw</b>{tile && <>, <b>--tile</b></>} e <b>--no</b>.</>}
            {modelo === "gpt" && "GPT Image: frases completas, que é como ele lê melhor."}
            {modelo === "gemini" && "Gemini e Flow: frases completas, com a proporção escrita. Nenhum dos dois aceita negativo — no Flow, a proporção vale a da interface."}
            {modelo === "flux" && "Flux / SD: lista de termos, com o negativo em campo separado."}
            {modelo === "firefly" && "Firefly: frases completas. A proporção se escolhe na interface dele."}
          </p>
        </section>

        <section className="sec">
          <h2 className="sec-title">Exportar</h2>
          <button className="btn btn-mag" onClick={copiar}>Copiar prompt</button>
          <div className="grid2" style={{ marginTop: 8 }}>
            <button className="btn" onClick={baixarTxt}>TXT</button>
            <button className="btn" onClick={baixarPng}>PNG cartão</button>
          </div>
          <p className="hint">O PNG sai no formato de cartão: título do modelo, prompt e amostra do material.</p>
          {status && <p className="hint msg" role="status">{status}</p>}
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
          <span><b>{mat.nome}</b> · {va.nome}</span>
          <span><b>{nomeModelo}</b> · {proporcao} · {pt ? "PT" : "EN"}</span>
          <span><b>{contaPalavras(textoCompleto)}</b> palavras · <b>{textoCompleto.length}</b> caracteres</span>
          <span className="sp" />
          <span className="dica">clique numa amostra para trocar o material</span>
        </div>

        <div className="corpo">
          <div className="destaque">
            <div>
              <div className="quadro">
                <Amostra spec={specDe(mat, va)} size={TAM.destaque} urgente label={`Amostra: ${mat.nome}, ${va.nome}`} />
                <span className="reg tl" /><span className="reg tr" /><span className="reg bl" /><span className="reg br" />
              </div>
              <div className="legenda">
                <span><b>{mat.nome}</b> · {va.nome}</span>
                <span>amostra ilustrativa</span>
              </div>
            </div>

            <div className="prompt">
              <div className="prompt-topo">
                <h2 className="sec-title">Prompt {nomeModelo}</h2>
                <button className="btn" onClick={copiar}>Copiar</button>
              </div>
              <p className="prompt-texto">{saida.texto}</p>
              {saida.negativo && (
                <div className="prompt-neg">
                  <h3 className="sec-title">Prompt negativo</h3>
                  <p className="prompt-texto">{saida.negativo}</p>
                </div>
              )}
              <div className="prompt-pe">
                <span><b>{contaPalavras(textoCompleto)}</b> palavras</span>
                <span><b>{textoCompleto.length}</b> caracteres</span>
                <span><b>{partes.detalhes.length + partes.atributos.length}</b> descritores</span>
              </div>
              <dl className="anatomia">
                {anatomia.map(([k, v]) => (
                  <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>
                ))}
              </dl>
            </div>
          </div>

          <section>
            <div className="bib-topo">
              <h2 className="sec-title">Biblioteca · {MATERIAIS.length} materiais · {MATERIAIS.reduce((s, m) => s + m.variantes.length, 0)} variações</h2>
              <div className="chips">
                {CATEGORIAS.map((c) => (
                  <button key={c.id} className="btn" data-on={filtro === c.id ? 1 : 0} onClick={() => setFiltro(c.id)}>{c.nome}</button>
                ))}
              </div>
              <input type="text" className="busca" value={busca} placeholder="buscar material…" aria-label="Buscar material"
                onChange={(e) => setBusca(e.target.value)} />
            </div>
            <div className="grade">
              {visiveis.map((m) => {
                const sel = m.id === mat.id;
                const v = sel ? va : m.variantes.find((x) => x.id === varPorMat[m.id]) || m.variantes[0];
                const grande = m.destaque && filtro === "todas" && !busca.trim();
                return (
                  <button key={m.id} className="card" data-sel={sel ? 1 : 0} data-grande={grande ? 1 : 0}
                    onClick={() => escolher(m)} aria-pressed={sel} title={`${m.nome} — ${v.nome}`}>
                    <Amostra spec={specDe(m, v)} size={grande ? TAM.cardGrande : TAM.card} label={`${m.nome}, ${v.nome}`} />
                    <span className="etq"><b>{m.nome}</b><span>{m.variantes.length}</span></span>
                  </button>
                );
              })}
            </div>
            {!visiveis.length && <p className="vazio">Nenhum material com esse nome. Tente “vidro”, “metal” ou “papel”.</p>}
          </section>
        </div>
      </main>
    </div>
  );
}
