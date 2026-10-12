# the hub

Um site só, com todas as ferramentas de design: o menu na raiz e cada ferramenta num
caminho próprio. A pessoa acessa um link, escolhe a ferramenta e volta ao menu pelo botão
de grade no cabeçalho, sem sair do site.

```
/                  menu
/grid-maker/       grids modulares
/bento-maker/      layouts bento
/gradient-maker/   gradientes
/3d-maker/         formas 3D
/texture-prompts/  prompts de textura
/wireframe-maker/  formas 3D em arame
/logo-resizer/     padronização óptica de logos
/font-defining/    escala tipográfica
```

## Estrutura

Cada ferramenta é uma pasta deste projeto, com `index.html` e `src/` próprios, e vira uma
página do build. O menu em `src/` é a raiz.

Cada ferramenta também existe num repositório próprio — `gri.d.maker`, `bento-maker`,
`gradient-maker`, `3d-maker`, `texture-prompts`, `logo-resizer` e `font-defining`; só o
wireframe maker ainda não tem. **A cópia daqui é a que vai ao ar**: mudança feita só no
repositório individual não aparece no site, e o contrário também vale — mexeu aqui, espelhe
lá para as duas não divergirem.

A única diferença proposital entre as duas cópias é o `HUB_URL` no topo do componente
principal: aqui é `"/"`, porque o menu é a raiz do mesmo site; na versão independente, o
endereço do hub publicado.

## Ferramenta nova

1. Crie a pasta `nome-da-ferramenta/` com `index.html` apontando para `./src/main.jsx`
2. Registre o caminho em `PAGINAS`, no `vite.config.js`
3. Acrescente a entrada em `src/ferramentas.js`, com `url: "/nome-da-ferramenta/"`
4. Desenhe a miniatura do card em `src/components/Miniatura.jsx`
5. No componente da ferramenta, `const HUB_URL = "/"` e `homeHref={HUB_URL}` no `Header`

Com `url: null` o card aparece como "em breve", sem link.

A casca é só o `Header`: logo do estúdio, nome da ferramenta em minúsculas, botão de menu e
botão de tema. As ferramentas não têm rodapé — quem leva de uma para outra é o botão de menu.

Abaixo de 860px — celular e tablet em pé — o painel vira `display:contents`, e com `order` o
cabeçalho e o palco sobem para o topo, os dois `sticky`, enquanto os controles rolam por
baixo. A raiz precisa de `overflow:visible` nessa faixa, senão o `sticky` não gruda. Quem
arrasta no palco (3d maker, wireframe maker, bento maker) precisa de `touch-action:none` no
alvo, ou o toque rola a página em vez de mover a peça.

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
