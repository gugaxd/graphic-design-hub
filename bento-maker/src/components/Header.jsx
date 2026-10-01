import { SANS } from "../theme.js";

/* Cabeçalho do app: logo do estúdio + nome da ferramenta + alternador de tema.
   Genérico — nome e fonte do título vêm por props, sem nada específico da ferramenta.
   Com `homeHref`, a marca vira link e aparece o botão de voltar ao menu do hub. */
export default function Header({ tool, theme, fontFamily = SANS, tema, onToggleTema, homeHref }) {
  const C = theme;
  const Marca = homeHref ? "a" : "div";
  const marcaProps = homeHref ? { href: homeHref, title: "Todas as ferramentas" } : {};
  return (
    <div className="brand">
      <style>{`
        .brand{padding:18px 18px 14px;border-bottom:1px solid ${C.line};position:sticky;top:0;
          background:${C.ink2};z-index:5;display:flex;align-items:center;justify-content:space-between;gap:10px}
        .marca{display:flex;align-items:center;gap:11px;min-width:0;text-decoration:none}
        a.marca:focus-visible{outline:2px solid ${C.cyan};outline-offset:4px}
        .acoes{display:flex;gap:6px;flex:none}
        .marca .logo{height:20px;width:auto;display:block;color:${C.text};flex:none}
        .marca .risco{width:1px;align-self:stretch;margin:1px 0;background:${C.line};flex:none}
        .brand h1{margin:0;font-family:${fontFamily};font-size:19px;font-weight:600;
          letter-spacing:-.005em;text-transform:lowercase;line-height:1;color:${C.text}}
        .tema{flex:0 0 auto;display:block;width:30px;height:30px;padding:6px;background:${C.ink};
          border:1px solid ${C.line};border-radius:2px;cursor:pointer;color:${C.muted}}
        .tema:hover{background:${C.cyan};border-color:${C.cyan};color:${C.sobreCyan}}
        .tema:focus-visible{outline:2px solid ${C.cyan};outline-offset:1px}
        .tema svg{width:100%;height:100%;display:block;fill:none;stroke:currentColor;
          stroke-width:1.7}
      `}</style>
      <Marca className="marca" {...marcaProps}>
        <svg
          className="logo"
          viewBox="0 0 557.34 334.4"
          fill="currentColor"
          role="img"
          aria-label="Logo"
        >
          <path d="M557.34,167.21v167.19h-55.74v-111.47h-111.47v1.96c0,60.48-49.03,109.52-109.52,109.52h-1.94v-55.74h.1c30.73,0,55.63-24.91,55.63-55.63v-.1h-55.74v-55.72h55.74V0h55.72v167.21h167.21Z" />
          <path d="M55.74,167.21h111.46v-55.74h55.74v222.93H0v-55.74h167.19v-55.74H0v-113.41C0,49.03,49.03,0,109.52,0h113.41v55.74h-111.39c-30.82,0-55.8,24.98-55.8,55.8v55.67Z" />
        </svg>
        <span className="risco" />
        <h1>{tool}</h1>
      </Marca>
      <div className="acoes">
      {homeHref && (
        <a className="tema" href={homeHref} aria-label="Voltar ao menu de ferramentas" title="Todas as ferramentas">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="3.5" width="7" height="7" />
          <rect x="13.5" y="3.5" width="7" height="7" />
          <rect x="3.5" y="13.5" width="7" height="7" />
          <rect x="13.5" y="13.5" width="7" height="7" />
        </svg>
        </a>
      )}
      <button
        className="tema"
        onClick={onToggleTema}
        aria-label={tema === "escuro" ? "Mudar para tema claro" : "Mudar para tema escuro"}
        title={tema === "escuro" ? "Tema claro" : "Tema escuro"}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {tema === "escuro" ? (
            <>
              <circle cx="12" cy="12" r="4.6" />
              <g strokeLinecap="round">
                <path d="M12 1.6v2.6M12 19.8v2.6M22.4 12h-2.6M4.2 12H1.6M19.35 4.65l-1.84 1.84M6.49 17.51l-1.84 1.84M19.35 19.35l-1.84-1.84M6.49 6.49L4.65 4.65" />
              </g>
            </>
          ) : (
            <path d="M20.4 14.9A8.7 8.7 0 0 1 9.1 3.6a8.7 8.7 0 1 0 11.3 11.3z" />
          )}
        </svg>
      </button>
      </div>
    </div>
  );
}
