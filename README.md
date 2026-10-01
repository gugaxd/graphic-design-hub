# design tools

Um site só, com todas as ferramentas de design: o menu na raiz e cada ferramenta num
caminho próprio. A pessoa acessa um link, escolhe a ferramenta e volta ao menu pelo botão
de grade no cabeçalho, sem sair do site.

```
/                 menu
/grid-maker/      grids modulares
/bento-maker/     layouts bento
/gradient-maker/  gradientes
/3d-maker/        formas 3D
/texture-prompts/ prompts de textura
/logo-resizer/      padronização óptica de logos
/font-defining/   escala tipográfica
```

## Estrutura

Cada ferramenta é uma pasta deste projeto, com `index.html` e `src/` próprios, e vira uma
página do build. O menu em `src/` é a raiz.

As pastas das ferramentas vieram dos repositórios individuais (`gri.d.maker`, `bento-maker`,
`gradient-maker`, `3d-maker`, `texture-prompts`, e as duas que nunca tiveram repo). **A
cópia daqui é a que vai ao ar** — mudança feita só no repositório antigo não aparece no site.

## Ferramenta nova

1. Crie a pasta `nome-da-ferramenta/` com `index.html` apontando para `./src/main.jsx`
2. Registre o caminho em `PAGINAS`, no `vite.config.js`
3. Acrescente a entrada em `src/ferramentas.js`, com `url: "/nome-da-ferramenta/"`
4. Desenhe a miniatura do card em `src/components/Miniatura.jsx`
5. No componente da ferramenta, `const HUB_URL = "/"` e `homeHref={HUB_URL}` no `Header`

Com `url: null` o card aparece como "em breve", sem link.

## Rodando localmente

```bash
npm install
npm run dev
```

## Publicando

Vercel, sem configuração (Vite, build `npm run build`, saída `dist`). Cada push na `main`
publica tudo junto, menu e ferramentas.

## Sistema visual

`src/styles/tokens.css` e `design-system.md` são cópias do grid maker. Os tokens do bloco
"Hub" são novos. Se virarem padrão, precisam voltar para o grid maker.
