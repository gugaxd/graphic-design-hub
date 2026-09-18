/* Rodapé genérico: apenas uma lista de links, recebida por props. */
export default function Footer({ links = [] }) {
  if (!links.length) return null;
  return (
    <footer className="gm-rodape">
      {links.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noreferrer noopener">
          {l.label}
        </a>
      ))}
      <span className="gm-rodape-ano">{new Date().getFullYear()}</span>
    </footer>
  );
}
