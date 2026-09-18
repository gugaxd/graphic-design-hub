# Grid Maker — Sistema Visual

Referência dos tokens usados na interface, para replicar o padrão em outras ferramentas.

Princípio geral: a interface é neutra e recuada; a cor viva é reservada para acentos funcionais e para a arte que o usuário produz. Nada de gradiente, nada de cor decorativa.

---

## 1. Cor

### Estrutura de camadas

A paleta trabalha em três níveis de profundidade. No tema escuro os níveis sobem em luminosidade; no claro, descem. O nome do token é o mesmo nos dois — só o valor muda.

| Token | Papel | Escuro | Claro |
|---|---|---|---|
| `ink` | Fundo recuado: campos, botões em repouso, fundo do app | `#0A0A0A` | `#E9E9E9` |
| `ink2` | **Cor principal.** Superfície do painel | `#101010` | `#F4F4F4` |
| `ink3` | Superfície elevada: item selecionado, caixa de edição | `#1C1C1C` | `#E1E1E1` |
| `line` | Bordas e divisores | `#2B2B2B` | `#D2D2D2` |
| `text` | Texto primário | `#E8E8E8` | `#161616` |
| `muted` | Texto secundário, rótulos, ícones em repouso | `#8C8C8C` | `#6B6B6B` |

### Acentos

| Token | Papel | Escuro | Claro |
|---|---|---|---|
| `cyan` | Acento de estrutura: títulos de seção, foco, marcas de registro, sliders neutros | `#00A9CE` | `#00768F` |
| `mag` | Acento de seleção: item ativo, contorno da seleção, sliders de atributo | `#E0218A` | `#C4136E` |
| `sobreCyan` | Texto sobre superfície ciano | `#08181C` | `#FFFFFF` |
| `sobreMag` | Texto sobre superfície magenta | `#FFFFFF` | `#FFFFFF` |
| `magBtn` | Fundo do botão primário | `#D01A7C` | `#C4136E` |
| `magHover` | Botão primário em hover (**escurece**, não clareia) | `#B81068` | `#9C0E54` |

Magenta e ciano vêm do M e do C do CMYK. A escolha não é decorativa: num contexto de pré-impressão, os dois acentos lêem como marcas de registro.

### Palco

| Token | Papel | Escuro | Claro |
|---|---|---|---|
| `stage` | Fundo da área de trabalho | `#0A0A0A` | `#ECECEC` |
| `stageAlt` | Quadrado alternado do xadrez de transparência | `#141414` | `#E2E2E2` |
| `sombra` | Sombra projetada do documento | `rgba(0,0,0,.6)` | `rgba(0,0,0,.13)` |

### Arte (independente da interface)

Valores padrão do trabalho do usuário, não da interface. Trocam junto com o tema, mas nunca sobrescrevem uma cor que o usuário já personalizou.

| Token | Escuro | Claro |
|---|---|---|
| `arte.bg` | `#101010` | `#F4F4F4` |
| `arte.fill` | `#E0218A` | `#D81B84` |
| `arte.stroke` | `#00A9CE` | `#00768F` |

### Contraste verificado

Todos acima de AA (4,5:1) para texto normal:

| Par | Escuro | Claro |
|---|---|---|
| `text` sobre `ink2` | 15,5:1 | 16,5:1 |
| `muted` sobre `ink2` | 5,7:1 | 4,9:1 |
| `cyan` sobre `ink2` | 6,9:1 | 4,8:1 |
| `sobreCyan` sobre `cyan` | 6,5:1 | 5,3:1 |
| `sobreMag` sobre `magBtn` | 5,1:1 | 5,7:1 |

Regra derivada: nenhum estado de hover usa cor fixa. Toda cor sai da paleta do tema ativo, senão um dos temas quebra.

---

## 2. Tipografia

Duas famílias, ambas por stack de sistema — sem webfont, sem requisição de rede.

```css
--sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Helvetica, Arial, sans-serif;
--mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
```

A divisão é semântica, não estética: **monoespaçada para qualquer número ou dado**, sans para prosa e rótulos. Números em mono não dançam quando um valor muda de 9 para 10.

### Escala

| Uso | Tamanho | Família | Tracking | Caixa | Peso |
|---|---|---|---|---|---|
| Título do produto | 13px | sans | `.14em` | Alta | 600 |
| Corpo / base do app | 13px | sans | — | — | 400 |
| Rótulo de controle | 11,5px | sans | `.01em` | — | 400 |
| Valor numérico | 11px | mono | — | — | 400 |
| Botão / seletor | 11px | mono | — | — | 400 |
| Barra de status | 10,5px | mono | `.06em` | — | 400 |
| Nota auxiliar | 10px | mono | `.03em` | — | 400 |
| Subtítulo do produto | 10px | mono | `.08em` | Alta | 400 |
| Título de seção | 9,5px | mono | `.18em` | Alta | 400 |
| Etiqueta de seleção | 9,5px | mono | `.14em` | Alta | 400 |
| Unidade de medida | 9,5px | mono | — | — | 400 |

Os tamanhos quebrados (9,5 / 10,5 / 11,5) são deliberados: numa interface densa de painel, o passo de 1px inteiro é grande demais entre níveis vizinhos.

Regra do tracking: quanto menor e mais em caixa alta, maior o espacejamento. Abaixo de 10px em caixa alta, nunca menos de `.14em`.

Altura de linha: `1.6` em notas, `1.65` em texto vazio de estado. Nos rótulos de uma linha, padrão.

---

## 3. Espaçamento e forma

Sem escala geométrica rígida — os valores seguem a densidade real de um painel de controle.

| Token | Valor | Uso |
|---|---|---|
| `radius` | `2px` | Todos os elementos. Único raio do sistema |
| `gap-sm` | `6px` | Grade de ícones de forma |
| `gap-md` | `8px` | Colunas de botão, grades de dois |
| Padding de seção | `16px 18px` | Blocos do painel |
| Padding do cabeçalho | `18px 18px 14px` | Marca |
| Padding de botão | `7px 8px` | Botões e seletores |
| Padding de campo | `3px 5px` | Entrada numérica |
| Padding do palco | `34px` | Respiro ao redor do documento |
| Espaço entre controles | `14px` | Vertical, entre sliders |
| Largura do painel | `312px` | Fixa; empilha abaixo de 860px |
| Altura da barra | `46px` | Status superior |

O raio de 2px é uma escolha, não um descuido: numa ferramenta de precisão, cantos quase retos sinalizam exatidão. Botão arredondado sugere toque casual.

---

## 4. Componentes

### Slider

Trilho de 2px na cor `line`. Polegar circular de 13px na cor de acento, com borda de 2px na cor da superfície do painel — a borda cria separação sem sombra.

Cada slider vem acompanhado de um campo numérico editável alinhado à direita, em mono, e da unidade em `muted`. O usuário nunca fica preso à imprecisão do arrasto.

```css
.range::-webkit-slider-thumb {
  width: 13px; height: 13px; border-radius: 50%;
  background: var(--accent); border: 2px solid var(--ink2);
}
```

Cor do polegar por natureza do controle: `cyan` para estrutura (dimensão, malha), `mag` para atributo (rotação, opacidade, cor).

### Título de seção

Mono 9,5px, caixa alta, tracking `.18em`, cor `cyan`, seguido de uma régua de 1px que ocupa o espaço restante.

```css
.sec-title::after { content:""; flex:1; height:1px; background: var(--line); }
```

### Botão

Repouso: fundo `ink`, borda `line`, texto `text`.
Hover: preenche com o acento, texto vira `sobreCyan`.
Primário: fundo `magBtn`, escurece para `magHover` no hover.

O hover preenche em vez de só mudar a borda — num painel denso, a mudança de área é mais legível que a de contorno.

### Foco

`outline: 2px solid cyan` com `outline-offset: 1px`, ou `4px` em sliders para não colidir com o trilho. Nunca removido.

### Marcas de registro

Cruz de 13px em `cyan`, uma em cada canto do documento, deslocada 19px para fora. Elemento de assinatura da ferramenta — funciona porque comunica alinhamento e origem de impressão, não porque decora.

### Xadrez de transparência

Quadrados de 16px em `stage` e `stageAlt`, deslocamento de 8px.

```css
background:
  linear-gradient(45deg, var(--stage-alt) 25%, transparent 25%, transparent 75%, var(--stage-alt) 75%),
  linear-gradient(45deg, var(--stage-alt) 25%, transparent 25%, transparent 75%, var(--stage-alt) 75%);
background-size: 16px 16px;
background-position: 0 0, 8px 8px;
background-color: var(--stage);
```

---

## 5. Comportamento

- **Ponto de quebra único** em `860px`: o painel deixa de ser lateral e passa a empilhar acima do palco.
- **Movimento**: nenhum. O sistema respeita `prefers-reduced-motion`, mas não há transição a suprimir — numa ferramenta de precisão, animação atrapalha a leitura de um valor que muda ao arrastar.
- **Idioma**: português, com termos técnicos de pré-impressão preservados (dpi, SVG, CMYK).
- **Rótulos**: substantivo direto, sem verbo. "Espaçamento", não "Ajustar espaçamento".

---

## 6. Aplicando em outra ferramenta

O mínimo para manter o padrão reconhecível:

1. As duas famílias tipográficas e a divisão mono-para-número
2. Raio de 2px em tudo
3. `ink2` como superfície dominante, `cyan` como acento estrutural, `mag` como acento de seleção
4. Título de seção com régua
5. Hover que preenche

O arquivo `tokens.css` ao lado traz todos os valores como variáveis CSS prontas, com os dois temas.
