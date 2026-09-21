/* Miniatura de cada ferramenta — um retrato do que ela produz, não um ícone.
   Tudo em viewBox 160×100; cor só pelas classes .mini-* (tokens de arte). */

function Grid() {
  const cel = [];
  for (let l = 0; l < 4; l++) {
    for (let c = 0; c < 7; c++) {
      if (c >= 1 && c <= 2 && l >= 1 && l <= 2) continue;
      const cx = 29 + c * 17;
      const cy = 24.5 + l * 17;
      const r = 3.2 + (c / 6) * 3.2;
      cel.push(<circle key={`${l}-${c}`} cx={cx} cy={cy} r={r} className="mini-fill" />);
    }
  }
  return (
    <>
      {cel}
      <rect x="39.5" y="34" width="29" height="29" rx="14.5" className="mini-traco" />
    </>
  );
}

function Bento() {
  const blocos = [
    [22, 14, 54, 44],
    [80, 14, 58, 20],
    [80, 38, 27, 20],
    [111, 38, 27, 48],
    [22, 62, 26, 24],
    [52, 62, 55, 24],
  ];
  return blocos.map(([x, y, w, h], i) => (
    <rect
      key={i}
      x={x}
      y={y}
      width={w}
      height={h}
      rx="2"
      className={i === 0 ? "mini-fill" : i === 3 ? "mini-traco" : "mini-bloco"}
    />
  ));
}

function Gradient() {
  return (
    <>
      <defs>
        <filter id="mini-borrao" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <clipPath id="mini-recorte">
          <rect x="22" y="14" width="116" height="72" rx="2" />
        </clipPath>
      </defs>
      <g clipPath="url(#mini-recorte)">
        <rect x="22" y="14" width="116" height="72" className="mini-fundo" />
        <g filter="url(#mini-borrao)">
          <ellipse cx="56" cy="40" rx="34" ry="24" className="mini-fill" />
          <ellipse cx="112" cy="66" rx="32" ry="22" className="mini-ciano" />
        </g>
      </g>
      <rect x="22" y="14" width="116" height="72" rx="2" className="mini-contorno" />
    </>
  );
}

function Logo() {
  /* logos de formatos diferentes, igualadas pelo peso óptico na mesma linha de base */
  const base = 66;
  return (
    <>
      <path d={`M18 ${base + 0.5}H142`} className="mini-cota" />
      <circle cx="42" cy={base - 17} r="17" className="mini-fill" />
      <rect x="72" y={base - 29} width="27" height="29" className="mini-texto" />
      <rect x="116" y={base - 44} width="14" height="44" className="mini-texto" />
      <path d={`M25 ${base + 8}h34 M72 ${base + 8}h27 M116 ${base + 8}h14`} className="mini-cota" />
    </>
  );
}

function TresD() {
  /* cubo isométrico: três faces em tons diferentes, como o palco mostra um sólido */
  const cx = 80;
  const topo = 24;
  const l = 34; /* meia largura */
  const h = 20; /* meia altura da face do topo */
  const alt = 30; /* altura das faces laterais */
  return (
    <>
      <path
        d={`M${cx} ${topo} L${cx + l} ${topo + h} L${cx} ${topo + 2 * h} L${cx - l} ${topo + h} Z`}
        className="mini-fill"
      />
      <path
        d={`M${cx - l} ${topo + h} L${cx} ${topo + 2 * h} L${cx} ${topo + 2 * h + alt} L${cx - l} ${topo + h + alt} Z`}
        className="mini-face"
      />
      <path
        d={`M${cx + l} ${topo + h} L${cx} ${topo + 2 * h} L${cx} ${topo + 2 * h + alt} L${cx + l} ${topo + h + alt} Z`}
        className="mini-face mini-face--clara"
      />
      <path
        d={`M${cx - l} ${topo + h + alt} L${cx} ${topo + 2 * h + alt} L${cx + l} ${topo + h + alt}`}
        className="mini-traco"
      />
    </>
  );
}

const DESENHOS = { grid: Grid, bento: Bento, gradient: Gradient, "tres-d": TresD, logo: Logo };

export default function Miniatura({ id }) {
  const Desenho = DESENHOS[id];
  if (!Desenho) return null;
  return (
    <svg className="hub-mini" viewBox="0 0 160 100" aria-hidden="true">
      <Desenho />
    </svg>
  );
}
