# design tools — briefing para vídeo explicativo

> **Para o Claude que vai ler este arquivo:** use este documento como fonte única para criar um
> vídeo explicativo sobre a plataforma **design tools**. Tudo o que está aqui é fato verificado
> no código. Não invente números, preços, depoimentos, quantidade de usuários ou recursos que
> não estejam listados. Idioma do vídeo: **português do Brasil**. A seção 9 traz uma estrutura
> de roteiro sugerida; a seção 10 lista o que evitar.

---

## 1. Em uma frase

**design tools** é um site só, com sete ferramentas de design gráfico que rodam inteiras no
navegador: você abre um link, escolhe a ferramenta, cria e exporta — sem instalar nada e sem
nenhum arquivo sair do seu computador.

- **Endereço:** https://graphic-design-hub-two.vercel.app/
- **Código aberto:** https://github.com/gugaxd/graphic-design-hub
- **Autor:** Guga — github.com/gugaxd

## 2. A proposta (mensagens-chave)

Use estas ideias como espinha do vídeo. São todas verdadeiras:

1. **Um link, sete ferramentas.** O menu é a página inicial; cada ferramenta abre no mesmo site
   e volta ao menu por um botão no cabeçalho.
2. **Tudo roda no navegador.** Não há servidor processando nada. Imagens, logos e SVGs que a
   pessoa carrega ficam na máquina dela.
3. **Sem instalação e sem cadastro.** Abre e usa.
4. **Saída profissional.** Cada ferramenta exporta em formatos de produção: SVG vetorial, PNG
   em alta, PDF, vídeo com fundo transparente, código CSS, JSON.
5. **O que você vê é o que sai.** A tela e o arquivo exportado partem da mesma geometria.
6. **Uma família só.** As sete ferramentas compartilham o mesmo sistema visual, os mesmos
   controles e o mesmo jeito de usar — aprendeu uma, sabe usar as outras.

Frase de apoio que já aparece no site:
> "escolha uma ferramenta para começar."
> "07 disponíveis · tudo roda no navegador · nenhum arquivo sai do seu computador"

## 3. Para quem é

Designers gráficos, motion designers, social media, estudantes de design e quem prepara
material para impressão ou tela e precisa de uma peça específica rápido — um grid, um
gradiente, um objeto 3D, um prompt de textura, logos padronizadas, a escala de tipo certa.

## 4. Como a plataforma funciona (o menu)

**Tela inicial:** cabeçalho com a logo do estúdio, uma barra vertical fina e o nome
"design tools" em minúsculas. À direita, o botão de tema (sol/lua).

Abaixo, o título de seção **FERRAMENTAS** (pequeno, em caixa alta, ciano, com uma régua
horizontal) e a chamada grande "escolha uma ferramenta para começar."

**Grade de cards** (7 cards, numerados 01 a 07). Cada card tem:
- uma **miniatura desenhada** do que a ferramenta produz (não é ícone, é um retrato do resultado);
- **marcas de registro** (pequenas cruzes de impressão) nos quatro cantos da miniatura, que
  acendem em ciano quando o mouse passa;
- o número, o nome, uma descrição curta e as etiquetas dos **formatos de exportação**;
- o indicador "abrir →", que também acende em ciano no hover, junto com a borda do card.

**Tema claro e escuro:** um clique no sol/lua troca o tema; a escolha fica salva e vale para
todas as ferramentas.

**Navegação:** clicou no card, a ferramenta abre em `/nome-da-ferramenta/`. Dentro dela, o
botão de grade no cabeçalho volta ao menu.

**Layout de toda ferramenta:** painel de controles fixo à esquerda (seções com títulos em
ciano, sliders com campo numérico ao lado) e o **palco** à direita, onde a peça aparece em
tempo real. Em telas estreitas (celular) o painel empilha sobre o palco.

## 5. As sete ferramentas

### 01 · grid maker — `/grid-maker/`
**O que é:** gerador de grids modulares para design gráfico e pré-impressão.
**Exporta:** SVG vetorial e PNG (até 4×).
**Miniatura no menu:** uma malha de círculos que crescem da esquerda para a direita, com um
módulo maior ocupando várias células.

**Como usa:**
1. Escolhe o **suporte** — A4, A3, quadrado, post de Instagram, Story/Reels — ou tamanho
   personalizado em px, mm, cm ou polegadas, com DPI ajustável.
2. Define a **malha**: colunas, linhas, tamanho do módulo e espaçamento.
3. Escolhe a **forma** entre 14 prontas (quadrado, arredondado, folha, círculo, anel,
   triângulo, losango, hexágono, cruz, estrela, semicírculo…) ou sobe um **SVG próprio**.
4. Faz qualquer módulo **ocupar várias células**: proporcional (3×3), horizontal, vertical ou
   personalizado (ex.: 3×7).
5. Ajusta **atributos**: rotação, opacidade e **escalonamento progressivo** — os módulos
   crescem ou diminuem ao longo das linhas, das colunas, na diagonal ou de forma radial.
6. Pinta: preenchimento e contorno com cores e opacidades separadas, para tudo ou por módulo.
7. Exporta.

**Momento "uau" para o vídeo:** arrastar o slider de escalonamento e ver a malha inteira virar
um degradê de tamanhos, na diagonal ou em radial.
**Detalhe técnico que dá credibilidade:** o SVG abre no Illustrator limpo — cantos
arredondados mantêm o raio mesmo em módulos esticados, e a espessura do contorno é a mesma do
arquivo final.

---

### 02 · bento maker — `/bento-maker/`
**O que é:** gerador de layouts bento (aquele mosaico de blocos de tamanhos diferentes) com
as suas próprias imagens.
**Exporta:** PNG, JPG, SVG e PDF.
**Miniatura no menu:** seis blocos retangulares de tamanhos variados encaixados.

**Como usa:**
1. **Arrasta imagens do computador** para o palco.
2. Ajusta a **malha**: colunas, altura da linha, espaçamento, margem e cantos.
3. Redimensiona cada **bloco** — ele encaixa célula a célula na malha.
4. Por bloco, escolhe **preencher** (recorta) ou **caber** (encaixa inteira), com **zoom** e
   **ponto de foco** (X/Y) para enquadrar a parte certa da foto.
5. Exporta.

**Momento "uau":** soltar várias fotos de uma vez e ver o mosaico se montar sozinho; depois
esticar um bloco e os outros se reacomodarem com uma transição curta.
**Mensagem importante:** as imagens nunca são distorcidas e nenhuma imagem é enviada para
servidor algum.

---

### 03 · gradient maker — `/gradient-maker/`
**O que é:** gerador de gradientes estáticos e animados.
**Exporta:** PNG, SVG, vídeo (MP4 quando o navegador suporta, senão WebM) e **código
HTML/CSS** pronto para colar, estático ou animado.
**Miniatura no menu:** manchas de cor desfocadas que se misturam, como um mesh.

**Como usa:**
1. Escolhe o **tipo**: **mesh** (manchas suaves de cor em movimento) ou **clássico** (linear
   ou radial, com ângulo).
2. Ajusta o **movimento**: velocidade, turbulência, granulação e, no mesh, **distorção** — de
   0 a 100.
3. Escolhe até **6 cores**, com campo hex editável, sorteio de paleta e presets.
4. Exporta imagem, vídeo ou código.

**Momento "uau":** subir a distorção e ver o campo de cor dobrar em vincos contínuos, como
tecido ou superfície de água; depois exportar o vídeo, que **repete em loop sem emenda**
(o fim de um ciclo fecha exatamente no começo).

---

### 04 · 3d maker — `/3d-maker/`
**O que é:** gerador de formas 3D para design gráfico e motion.
**Exporta:** PNG com fundo transparente, SVG vetorial e vídeo WebM com fundo transparente.
**Miniatura no menu:** um cubo isométrico com três faces em tons diferentes.

**Como usa:**
1. Escolhe uma **forma**: 12 primitivas (cubo, esfera, cilindro, cone, toro, nó de toro,
   icosaedro, octaedro, dodecaedro, tetraedro, anel, plano) ou **importa um SVG próprio** —
   uma logo, um ícone — que vira objeto 3D **extrudado**, com profundidade e chanfro.
2. Monta a **cena**: um objeto ou vários, selecionando por clique no palco.
3. **Transforma**: posição, rotação e escala por eixo, e translucência.
4. Aplica o **material**: fosco, brilhante, metal, vidro colorido, chapado ou arame, com cor e
   rugosidade (no vidro, a rugosidade vira vidro jateado). Ajusta luz ambiente, luz principal
   e ângulo da luz.
5. **Anima** numa timeline com keyframes, interpolação linear ou suave, e um atalho para giro
   de 360°.
6. Exporta.

**Momento "uau":** importar uma logo em SVG, vê-la virar um objeto de vidro colorido girando,
e exportar o vídeo **com fundo transparente**, pronto para jogar sobre qualquer peça.

---

### 05 · texture prompts — `/texture-prompts/`
**O que é:** gerador de **prompts** detalhados de textura e material para IAs de imagem.
Atenção: a ferramenta **escreve o prompt**, não gera a imagem final.
**Exporta:** copiar o prompt, arquivo TXT e PNG em formato de cartão (título, prompt e amostra).
**Miniatura no menu:** duas amostras de material com granulações diferentes.

**Como usa:**
1. Escolhe um material na **biblioteca**: 20 materiais e 56 variações — vidro, gel, água,
   metal polido, escovado e oxidado, madeira, mármore, pedra, papel, tecido, veludo, couro,
   concreto, terrazzo, estuque, cerâmica, plástico, holográfico e pérola. Cada um tem uma
   amostra visual.
2. Define a **aplicação**: **objeto** (o material vestindo uma forma — ícone, letra, símbolo,
   embalagem) ou **textura contínua** (padrão sem emenda, para fundo ou mapa 3D).
3. Ajusta os **atributos** de 0 a 100: acabamento, desgaste, microdetalhe e iridescência.
   Cada faixa vira uma frase no prompt, mostrada embaixo do slider.
4. Ajusta a **cena**: iluminação, fundo, estilo, composição e cor dominante.
5. Escolhe o **modelo** — Grok, Midjourney, GPT Image, Flux / SD ou Firefly — e o prompt sai
   no formato que aquele modelo lê melhor (inclusive prompt negativo e parâmetros do
   Midjourney).
6. Copia ou exporta.

**Momento "uau":** mexer no slider de desgaste e ver a frase do prompt mudar ao vivo; trocar o
modelo e ver o mesmo pedido reescrito no formato de cada IA.
**Detalhe:** o prompt sai em português ou inglês — automaticamente, conforme o idioma que a
pessoa digita. As amostras são pintadas pelo próprio navegador, pixel a pixel, sem baixar
nenhuma imagem (são ilustrativas: mostram o caráter do material, não o resultado da IA).

---

### 06 · logo resizer — `/logo-resizer/`
**O que é:** padroniza **opticamente** o tamanho de várias logos lado a lado — o problema
clássico da faixa de patrocinadores e parceiros.
**Exporta:** SVG (vetorial quando o arquivo de origem é SVG), PNG e JPG; logo por logo ou o
**lockup** inteiro.
**Miniatura no menu:** logos de formatos diferentes alinhadas com o mesmo peso.

**Como usa:**
1. **Arrasta as logos** (SVG, PNG, JPG ou WebP) para o palco.
2. A ferramenta mede a **mancha real** de cada logo, ignorando a margem vazia do arquivo (e,
   se quiser, o fundo branco).
3. Ajusta a **compensação óptica** de 0% a 100%: em 0% todas ficam com a mesma altura; ao
   subir, logos redondas e altas crescem e marcas largas encolhem até terem o **mesmo peso
   visual**.
4. Define altura de referência, espaçamento, margem, alinhamento (topo, centro, base) e fundo
   (transparente ou cor sólida).
5. Clica numa logo para afinar só ela: escala e deslocamento.
6. Exporta em 1×, 2× ou 3×.

**Momento "uau":** começar com logos de tamanhos desencontrados, subir o slider de compensação
e ver a fileira ficar equilibrada.

---

### 07 · font defining — `/font-defining/`
**O que é:** calcula o tamanho de tipo de cada nível — h1, h2, h3, corpo e legenda — a partir
do **formato** da peça, da **distância de leitura** e da **quantidade de texto**.
**Exporta:** CSS, JSON, SVG e PNG.
**Miniatura no menu:** blocos de texto de alturas decrescentes com cotas de medida ao lado.

**Como usa:**
1. Escolhe o **formato**: impressos (A6 a A0, cartaz, banner, flyer DL, carta, cartão) ou tela
   (Instagram, story, celular, slide 16:9 e 4:3, web, thumbnail, painel). Ajusta margem,
   colunas e medianiz.
2. Informa a **leitura**: distância (cada preset já traz a típica) e, para tela, a largura
   física em que a peça é vista (celular, monitor, projeção).
3. Informa o **conteúdo**: quantas palavras tem cada nível.
4. Ajusta a **escala**: automática ou fixa numa razão clássica (de 1,2 a 1,618, a áurea),
   e as entrelinhas.
5. Exporta os valores.

**Momento "uau":** encurtar o título de doze para três palavras e ver o h1 crescer — porque
cada número vem de uma restrição real, e a ferramenta mostra qual delas mandou.
**Exemplo concreto:** o mínimo legível a 40 cm é cerca de 10 pt; a 1,5 m, cerca de 38 pt. Um
slide projetado num auditório pede corpo muito maior que o mesmo arquivo visto no notebook.

## 6. Identidade visual (use no vídeo)

**Princípio:** interface neutra e recuada; a cor viva fica para os acentos e para a arte que a
pessoa produz. Nada de gradiente decorativo na interface.

**Cores — tema escuro (padrão)**

| Papel | Hex |
|---|---|
| Fundo / palco | `#0A0A0A` |
| Superfície do painel (cor principal) | `#101010` |
| Superfície elevada | `#1C1C1C` |
| Linhas e bordas | `#2B2B2B` |
| Texto | `#E8E8E8` |
| Texto secundário | `#8C8C8C` |
| **Ciano** — acento de estrutura (títulos, foco, marcas de registro) | `#00A9CE` |
| **Magenta** — acento de seleção (item ativo, botão principal) | `#E0218A` |

**Tema claro:** fundo `#ECECEC`, painel `#F4F4F4`, texto `#161616`, ciano `#00768F`,
magenta `#C4136E`.

Ciano e magenta vêm do **C** e do **M** do CMYK — num contexto de impressão, leem como marcas
de registro. É o conceito da marca.

**Tipografia**
- **Nome das ferramentas / chamadas:** Host Grotesk SemiBold, sempre em **minúsculas**
  ("grid maker", "design tools"). Arquivo em `src/assets/fonts/HostGrotesk-SemiBold.ttf`.
- **Texto de interface:** sans de sistema (Segoe UI / SF / Inter).
- **Números e dados:** monoespaçada. Títulos de seção em mono, caixa alta, bem espaçados.

**Forma:** raio de canto de **2px** em tudo — cantos quase retos sinalizam precisão.

**Elementos de assinatura:** marcas de registro (cruz fina em ciano nos cantos), título de
seção com régua horizontal, xadrez cinza de transparência no palco.

**Logo do estúdio (SVG):**

```svg
<svg viewBox="0 0 557.34 334.4" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M557.34,167.21v167.19h-55.74v-111.47h-111.47v1.96c0,60.48-49.03,109.52-109.52,109.52h-1.94v-55.74h.1c30.73,0,55.63-24.91,55.63-55.63v-.1h-55.74v-55.72h55.74V0h55.72v167.21h167.21Z"/>
  <path d="M55.74,167.21h111.46v-55.74h55.74v222.93H0v-55.74h167.19v-55.74H0v-113.41C0,49.03,49.03,0,109.52,0h113.41v55.74h-111.39c-30.82,0-55.8,24.98-55.8,55.8v55.67Z"/>
</svg>
```

No cabeçalho, a logo aparece à esquerda, seguida de uma barra vertical de 1px e do nome em
minúsculas.

## 7. Tom de voz

- Português direto, sem exagero de marketing. Substantivo antes de verbo.
- Termos técnicos de design preservados: SVG, DPI, CMYK, kerning, mesh, keyframe.
- Nomes das ferramentas sempre em minúsculas.
- Mostrar, não prometer: cada afirmação do vídeo deve corresponder a algo que aparece na tela.

## 8. Formatos de exportação — resumo

| Ferramenta | Exporta |
|---|---|
| grid maker | SVG, PNG |
| bento maker | PNG, JPG, SVG, PDF |
| gradient maker | PNG, SVG, vídeo, CSS |
| 3d maker | PNG, SVG, WebM (com transparência) |
| texture prompts | prompt (copiar/TXT), cartão PNG |
| logo resizer | SVG, PNG, JPG |
| font defining | CSS, JSON, SVG, PNG |

## 9. Estrutura de roteiro sugerida (~90 s)

| Tempo | Cena | Narração (ideia) |
|---|---|---|
| 0–8 s | Tela preta, marcas de registro em ciano se desenhando nos cantos; entra "design tools" em Host Grotesk | Abertura: sete ferramentas de design num link só |
| 8–18 s | O menu: a grade de cards aparece, cursor passa e as marcas acendem em ciano | Tudo roda no navegador; nada sai do seu computador; sem instalar, sem cadastro |
| 18–28 s | grid maker: slider de escalonamento transforma a malha | Grids modulares, exporta SVG pronto para o Illustrator |
| 28–37 s | bento maker: fotos soltas viram mosaico | Layouts bento com as suas imagens |
| 37–46 s | gradient maker: mesh com distorção em movimento | Gradientes animados em loop sem emenda, até em código CSS |
| 46–56 s | 3d maker: logo SVG vira objeto de vidro girando | 3D com fundo transparente, de foto a vídeo |
| 56–64 s | texture prompts: slider muda a frase do prompt; troca de modelo | Prompts de material no formato de cada IA |
| 64–72 s | logo resizer: logos desencontradas se equilibram | Logos com o mesmo peso visual |
| 72–80 s | font defining: título encurta, h1 cresce | O tamanho de tipo certo para a distância de leitura |
| 80–90 s | Volta ao menu, troca de tema escuro → claro, URL na tela | Chamada final com o endereço |

**Versão curta (30 s, para Reels/Shorts):** abertura (3 s) → menu (4 s) → um corte de ~3 s
por ferramenta mostrando só o "momento uau" → endereço na tela (2 s). Formato vertical 9:16.

**Direção visual:** fundo escuro `#0A0A0A`, cortes secos, ciano e magenta só como acento,
textos na tela em minúsculas. A interface em si não tem animação — o movimento do vídeo vem
da edição e da arte que as ferramentas produzem.

## 10. O que NÃO dizer

- Não citar preço, plano pago, número de usuários ou depoimentos — não existem dados sobre isso.
- Não dizer que o texture prompts **gera imagens**: ele gera o **texto do prompt**.
- Não dizer que há IA rodando nas ferramentas — os cálculos são próprios, no navegador.
- Não dizer que funciona offline nem que é um app instalável.
- Não prometer exportação para formatos que não estão na tabela da seção 8 (por exemplo,
  não há exportação nativa para Figma ou After Effects; o WebM do 3d maker precisa ser
  convertido para abrir no After Effects).
- Não usar letras maiúsculas no nome das ferramentas.
