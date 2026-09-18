# design tools

Hub das ferramentas de design: um menu com a identidade da família que leva para cada
ferramenta. Cada ferramenta continua no próprio repositório e no próprio deploy; o hub só
aponta para elas, e elas apontam de volta pelo botão de menu no cabeçalho.

## Ferramentas servidas pelo próprio hub

O logo sizer não tem deploy próprio: ele vive em `logo-sizer/` e sai no mesmo build, em
`/logo-sizer/`. Para servir outra ferramenta assim, crie a pasta com `index.html` e `src/`,
registre a página em `rollupOptions.input` no `vite.config.js` e use o caminho como `url` no
catálogo. Dentro dela, `HUB_URL` é só `"/"`.

## Ferramenta nova

Entra em `src/ferramentas.js`. O card se monta sozinho. Com `url: null` ele aparece como
"em breve". A miniatura do card fica em `src/components/Miniatura.jsx`.

Na ferramenta, passe `homeHref={HUB_URL}` para o `Header`. Isso transforma a marca em link
e mostra o botão de voltar ao menu.

## Rodando localmente

```bash
npm install
npm run dev -- --port 5180
```

Em dev, as ferramentas apontam o botão de menu para `http://localhost:5180/`.

## Publicando

Vercel, sem configuração (Vite, build `npm run build`, saída `dist`). Depois do primeiro
deploy, atualize a constante `HUB_URL` no gri.d.maker, no bento maker e no gradient maker com a URL real do hub.

## Sistema visual

`src/styles/tokens.css` e `design-system.md` são cópias do gri.d.maker. Os tokens do bloco
"Hub" são novos. Se virarem padrão, precisam voltar para o gri.d.maker.
