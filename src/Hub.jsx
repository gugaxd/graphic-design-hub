import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Miniatura from "./components/Miniatura.jsx";
import { FERRAMENTAS, LINKS_RODAPE } from "./ferramentas.js";

const CHAVE_TEMA = "design-tools:tema";

function temaInicial() {
  const t = document.documentElement.dataset.tema;
  return t === "claro" ? "claro" : "escuro";
}

function Registros() {
  return (
    <>
      <span className="gm-registro hub-reg hub-reg--ne" />
      <span className="gm-registro hub-reg hub-reg--no" />
      <span className="gm-registro hub-reg hub-reg--se" />
      <span className="gm-registro hub-reg hub-reg--so" />
    </>
  );
}

function Card({ f, indice }) {
  const ativo = Boolean(f.url);
  const Tag = ativo ? "a" : "div";
  const props = ativo ? { href: f.url } : { "aria-disabled": "true" };
  return (
    <Tag className={`hub-card${ativo ? "" : " hub-card--breve"}`} {...props}>
      <div className="hub-card-palco">
        <Registros />
        <Miniatura id={f.id} />
      </div>
      <div className="hub-card-corpo">
        <div className="hub-card-topo">
          <span className="hub-card-indice">{String(indice + 1).padStart(2, "0")}</span>
          <span className="hub-card-estado">{ativo ? "abrir →" : "em breve"}</span>
        </div>
        <h2 className="hub-card-nome">{f.nome}</h2>
        <p className="hub-card-desc">{f.descricao}</p>
        <ul className="hub-card-formatos" aria-label="Formatos de exportação">
          {f.formatos.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
    </Tag>
  );
}

export default function Hub() {
  const [tema, setTema] = useState(temaInicial);

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    try {
      localStorage.setItem(CHAVE_TEMA, tema);
    } catch (e) {
      /* sem storage (aba anônima): o tema só não persiste */
    }
  }, [tema]);

  const prontas = FERRAMENTAS.filter((f) => f.url).length;

  return (
    <div className="hub">
      <Header
        tool="design tools"
        tema={tema}
        onToggleTema={() => setTema((t) => (t === "escuro" ? "claro" : "escuro"))}
      />

      <main className="hub-main gm-palco">
        <div className="hub-conteudo">
          <section className="hub-intro">
            <h2 className="gm-secao-titulo">Ferramentas</h2>
            <p className="hub-chamada">escolha uma ferramenta para começar.</p>
            <p className="gm-nota">
              {String(prontas).padStart(2, "0")} disponíveis · tudo roda no navegador · nenhum
              arquivo sai do seu computador
            </p>
          </section>

          <nav className="hub-grade" aria-label="Ferramentas">
            {FERRAMENTAS.map((f, i) => (
              <Card key={f.id} f={f} indice={i} />
            ))}
          </nav>
        </div>
      </main>

      <Footer links={LINKS_RODAPE} />
    </div>
  );
}
