import { MONO } from "../theme.js";

/* Rodapé genérico: apenas uma lista de links, recebida por props. */
export default function Footer({ links = [], theme }) {
  const C = theme;
  if (!links.length) return null;
  return (
    <footer className="rodape">
      <style>{`
        .rodape{padding:16px 18px;border-top:1px solid ${C.line};background:${C.ink2};
          display:flex;flex-wrap:wrap;gap:8px 16px}
        .rodape a{font-family:${MONO};font-size:10.5px;letter-spacing:.04em;color:${C.muted};
          text-decoration:none}
        .rodape a:hover{color:${C.cyan}}
        .rodape a:focus-visible{outline:2px solid ${C.cyan};outline-offset:2px}
      `}</style>
      {links.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noreferrer noopener">
          {l.label}
        </a>
      ))}
    </footer>
  );
}
