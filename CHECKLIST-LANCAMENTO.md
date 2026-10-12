# the hub — checklist de lançamento

Estado em 2026-10-11. O que está marcado eu verifiquei no site publicado
(`gh-the-hub.vercel.app`) ou no código; o que está em aberto depende de você.

---

## Já está pronto

- [x] As oito ferramentas no ar, num link só, com o menu na raiz
- [x] Voltar ao menu pelo botão de grade, de dentro de qualquer ferramenta
- [x] Celular e tablet: palco no topo, controles rolando por baixo
- [x] Tema claro e escuro, com a escolha salva
- [x] Domínio definido: `gh-the-hub.vercel.app`
- [x] Deploy automático a cada push na `main`
- [x] Vídeo de lançamento pronto

---

## Bloqueia o lançamento

### 1. Ícone da aba (favicon)
`gh-the-hub.vercel.app/favicon.ico` responde **404**. A aba fica com o ícone
genérico, e é o que aparece nos favoritos e no histórico de quem salvar.

Precisa de um `favicon.svg` (a logo do estúdio serve) em `public/`, mais a linha
`<link rel="icon" href="/favicon.svg" />` nos nove `index.html`. Eu faço, se quiser.

### 2. Prévia do link em rede social
Não há `og:image`, `og:title` nem `og:description` em nenhuma página. Colado no
WhatsApp, no LinkedIn ou no X, o link aparece **sem imagem e sem descrição** — só
a URL crua. Num lançamento com vídeo, isso derruba o clique.

Precisa de: uma imagem 1200×630 (dá para fazer no próprio bento maker ou no
gradient maker), salva em `public/og.png`, e as metatags em cada página. Também
faço, se quiser.

### 3. Conferir o vídeo com o domínio certo
O roteiro e o briefing foram escritos quando o endereço era
`graphic-design-hub-two.vercel.app`. **Confira se o endereço que aparece na tela
do vídeo é `gh-the-hub.vercel.app`.** Se estiver o antigo, é refazer a cena final.

### 4. Testar as oito no seu celular, com o dedo
Testei o layout em emulação, mas o gesto de arrastar com o dedo eu não consegui
reproduzir — o navegador daqui manda evento de mouse. Abra no seu telefone e
confirme, principalmente:

- **3d maker:** arrastar gira o objeto, não rola a página
- **bento maker:** arrastar move o bloco e a alça redimensiona
- **wireframe maker:** arrastar gira a forma
- **logo resizer** e **bento maker:** escolher imagem pela galeria do celular funciona

### 5. Decidir o que fazer com os deploys antigos
`gridmaker-iota`, `bento-maker-three`, `gradient-maker-peach`, `3d-maker-kohl` e
`texture-prompts` seguem como projetos separados na Vercel, servindo versões
velhas das mesmas ferramentas — sem o botão de menu, sem os ajustes de celular.

Se alguém chegar por esses links, usa uma versão pior e nunca descobre o hub.
Ou apague os projetos, ou troque cada um por um redirecionamento para o caminho
equivalente dentro do hub.

---

## Antes de divulgar, vale a pena

### 6. Texto de divulgação, pronto para colar
Um parágrafo para LinkedIn, um para Instagram e uma linha para grupos de WhatsApp.
A matéria-prima está em `README-VIDEO.md`, seção 2. Posso escrever.

### 7. Página de erro
Caminho inexistente cai no 404 padrão da Vercel, que não tem a sua cara nem um
caminho de volta. Uma página simples, com a logo e um link para o menu, resolve.

### 8. Medir acesso
Não há nenhuma medição hoje. Se quiser saber quantas pessoas entraram e qual
ferramenta puxa mais, o Vercel Analytics é uma dependência e uma linha de código,
sem cookie e sem banner de consentimento.

### 9. Título do bento maker
A aba dele é "bento maker — gerador de layouts"; as outras sete são só o nome da
ferramenta. Padronizar é um minuto.

### 10. Repositório do wireframe maker
É a única das oito sem repositório próprio. Não impede nada, mas quebra o padrão
se alguém for procurar o código.

---

## No dia

- [ ] Publicar o vídeo com o endereço na descrição, não só na tela
- [ ] Postar nas redes com o link direto para `gh-the-hub.vercel.app`
- [ ] Deixar o celular à mão: é por onde a maioria vai abrir o link
- [ ] Abrir o site em janela anônima depois do post, para ver o que um visitante novo vê
- [ ] Conferir se o deploy da Vercel está verde antes de divulgar

---

## Depois da primeira semana

- [ ] Ver qual ferramenta foi mais usada e escrever um post só sobre ela
- [ ] Anotar o que as pessoas pediram que não existe — vira a nona ferramenta
- [ ] Rever os textos dos cards com base nas dúvidas que aparecerem
