/* ============================================================
   biblioteca.js — materiais, variações e fragmentos de prompt
   ------------------------------------------------------------
   Cada material tem variações. Cada variação traz:
   - material: o núcleo da frase ("flowing liquid glass, ...")
   - detalhes: propriedades físicas e visuais, sem falar de
     acabamento, desgaste ou iridescência — isso vem dos atributos
   - pt: os mesmos material e detalhes em português. O material em
     português começa pelo substantivo, sem artigo, porque entra
     depois de "feita de"
   - attrs: valores iniciais dos quatro atributos (0–100)
   - amostra: parâmetros do renderizador procedural (amostras.js)

   No material, `neg` e `negPt` são os negativos nos dois idiomas.
   ============================================================ */

export const CATEGORIAS = [
  { id: "todas", nome: "Todas" },
  { id: "transparente", nome: "Transparentes" },
  { id: "metal", nome: "Metais" },
  { id: "natural", nome: "Naturais" },
  { id: "fibra", nome: "Fibras" },
  { id: "construcao", nome: "Construção" },
  { id: "sintetico", nome: "Sintéticos" },
];

const ATTRS = { acabamento: 50, desgaste: 5, detalhe: 55, iridescencia: 0 };

export const MATERIAIS = [
  /* ---------------------------------------------------------------- */
  {
    id: "vidro", nome: "Vidro", cat: "transparente", destaque: true,
    luz: "estudio", fundo: "claro",
    attrs: { acabamento: 95, desgaste: 0, detalhe: 45, iridescencia: 0 },
    neg: ["opaque", "plastic look", "cloudy", "fingerprints", "dirty smudges"],
    negPt: ["opaco", "aspecto de plástico", "turvo", "marcas de dedo", "manchas de sujeira"],
    variantes: [
      {
        id: "liquido", nome: "Líquido iridescente",
        material: "flowing liquid glass, transparent and translucent glass material",
        detalhes: ["smooth organic curves", "fluid glass deformation", "high refraction", "internal light distortion", "glass thickness visible"],
        pt: {
          material: "vidro líquido fluido, material de vidro transparente e translúcido",
          detalhes: ["curvas orgânicas suaves", "deformação fluida do vidro", "alta refração", "distorção interna da luz", "espessura do vidro visível"],
        },
        attrs: { iridescencia: 45 },
        amostra: { tipo: "esfera", shader: "vidro", tint: [1, 1, 1], iris: 0.75, caustica: 0.55 },
      },
      {
        id: "cristal", nome: "Cristal",
        material: "crystal-clear optical glass, flawless transparency",
        detalhes: ["sharp refraction", "clean light caustics", "crisp beveled edges catching light", "subtle internal reflections", "visible glass thickness"],
        pt: {
          material: "vidro óptico cristalino, transparência impecável",
          detalhes: ["refração nítida", "cáusticas de luz limpas", "bordas chanfradas captando a luz", "reflexos internos sutis", "espessura do vidro visível"],
        },
        amostra: { tipo: "esfera", shader: "vidro", tint: [0.97, 0.99, 1], iris: 0.08, caustica: 0.6 },
      },
      {
        id: "jateado", nome: "Jateado",
        material: "frosted sandblasted glass, translucent milky material",
        detalhes: ["soft diffused light transmission", "blurred refraction", "velvety fine-grain surface", "gentle inner glow", "softened edges"],
        pt: {
          material: "vidro jateado fosco, material translúcido e leitoso",
          detalhes: ["transmissão de luz suave e difusa", "refração desfocada", "superfície aveludada de grão fino", "brilho interno suave", "bordas suavizadas"],
        },
        attrs: { acabamento: 30, detalhe: 55 },
        amostra: { tipo: "esfera", shader: "vidro", tint: [0.96, 0.98, 1], fosco: 1, caustica: 0.25 },
      },
      {
        id: "ambar", nome: "Âmbar",
        material: "tinted amber glass, rich saturated translucent color",
        detalhes: ["color deepening in thicker areas", "light passing through and casting colored shadows", "high refraction", "warm glowing core"],
        pt: {
          material: "vidro âmbar tingido, cor translúcida rica e saturada",
          detalhes: ["cor mais intensa nas áreas mais espessas", "luz atravessando e projetando sombras coloridas", "alta refração", "núcleo quente e luminoso"],
        },
        amostra: { tipo: "esfera", shader: "vidro", tint: [0.98, 0.6, 0.16], dens: 1.3, caustica: 0.7 },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "gel", nome: "Gel & silicone", cat: "transparente",
    luz: "softbox", fundo: "claro",
    attrs: { acabamento: 85, desgaste: 0, detalhe: 35, iridescencia: 0 },
    neg: ["hard plastic", "opaque", "dry surface"],
    negPt: ["plástico rígido", "opaco", "superfície seca"],
    variantes: [
      {
        id: "gelatina", nome: "Gelatina",
        material: "translucent jelly material, gummy soft-body gel",
        detalhes: ["subsurface scattering", "soft wobbly volume", "wet highlights", "light glowing through the material", "candy-like translucency"],
        pt: {
          material: "gelatina translúcida, gel macio tipo goma",
          detalhes: ["espalhamento de luz subsuperficial", "volume macio e trêmulo", "brilhos molhados", "luz brilhando através do material", "translucidez de bala de goma"],
        },
        amostra: { tipo: "esfera", shader: "gel", cor: [1, 0.34, 0.5], tint: [1, 0.45, 0.6], dens: 1.6, caustica: 0.6 },
      },
      {
        id: "silicone", nome: "Silicone",
        material: "soft-touch silicone, semi-translucent rubbery material",
        detalhes: ["subtle subsurface scattering", "smooth rounded soft edges", "squishy tactile feel", "gentle light diffusion"],
        pt: {
          material: "silicone soft-touch, material emborrachado semitranslúcido",
          detalhes: ["leve espalhamento de luz subsuperficial", "bordas arredondadas e macias", "sensação tátil de apertar", "difusão de luz suave"],
        },
        attrs: { acabamento: 25 },
        amostra: { tipo: "esfera", shader: "gel", cor: [0.55, 0.74, 0.96], tint: [0.7, 0.84, 1], dens: 1.4, fosco: 1, caustica: 0.3 },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "agua", nome: "Água", cat: "transparente",
    luz: "sol", fundo: "claro",
    attrs: { acabamento: 90, desgaste: 0, detalhe: 60, iridescencia: 0 },
    neg: ["murky", "foam", "debris"],
    negPt: ["água turva", "espuma", "detritos"],
    variantes: [
      {
        id: "caustica", nome: "Cáustica",
        material: "crystal clear pool water with dancing light caustics",
        detalhes: ["shimmering caustic light network", "rippling water surface", "refracted sunlight patterns", "turquoise depth gradient"],
        pt: {
          material: "água de piscina cristalina com cáusticas de luz dançantes",
          detalhes: ["rede cintilante de cáusticas de luz", "superfície da água ondulando", "padrões de luz do sol refratada", "degradê de profundidade turquesa"],
        },
        amostra: { tipo: "superficie", gerador: "agua", modo: "caustica" },
      },
      {
        id: "ondulacao", nome: "Ondulação",
        material: "dark still water surface with gentle ripples",
        detalhes: ["concentric ripples", "mirror-like reflections on the water", "fluid motion frozen in time", "sharp specular glints"],
        pt: {
          material: "superfície de água escura e parada com ondulações suaves",
          detalhes: ["ondulações concêntricas", "reflexos espelhados na água", "movimento fluido congelado no tempo", "cintilações especulares nítidas"],
        },
        amostra: { tipo: "superficie", gerador: "agua", modo: "ondulacao" },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "polido", nome: "Metal polido", cat: "metal", destaque: true,
    luz: "softbox", fundo: "claro",
    attrs: { acabamento: 100, desgaste: 0, detalhe: 40, iridescencia: 0 },
    neg: ["rust", "dull surface", "plastic look", "blurry reflections"],
    negPt: ["ferrugem", "superfície sem brilho", "aspecto de plástico", "reflexos borrados"],
    variantes: [
      {
        id: "cromo", nome: "Cromo",
        material: "mirror-polished chrome, liquid metal",
        detalhes: ["perfect mirror reflections of the studio environment", "high-contrast highlights", "seamless reflective surface", "crisp horizon line in the reflections"],
        pt: {
          material: "cromo polido espelhado, metal líquido",
          detalhes: ["reflexos espelhados perfeitos do estúdio", "realces de alto contraste", "superfície reflexiva contínua", "linha do horizonte nítida nos reflexos"],
        },
        amostra: { tipo: "esfera", shader: "metal", cor: [0.9, 0.91, 0.93] },
      },
      {
        id: "ouro", nome: "Ouro",
        material: "polished 24k gold, rich warm precious metal",
        detalhes: ["warm golden reflections", "luxurious specular highlights", "smooth flawless metal", "deep amber tones in the reflections"],
        pt: {
          material: "ouro 24k polido, metal precioso rico e quente",
          detalhes: ["reflexos dourados quentes", "realces especulares luxuosos", "metal liso e impecável", "tons âmbar profundos nos reflexos"],
        },
        amostra: { tipo: "esfera", shader: "metal", cor: [1, 0.74, 0.3] },
      },
      {
        id: "cobre", nome: "Cobre",
        material: "polished rose copper, warm reddish metal",
        detalhes: ["warm coppery reflections", "soft metallic gradients", "smooth burnished surface", "pinkish highlights"],
        pt: {
          material: "cobre rosé polido, metal avermelhado e quente",
          detalhes: ["reflexos acobreados quentes", "degradês metálicos suaves", "superfície brunida e lisa", "realces rosados"],
        },
        amostra: { tipo: "esfera", shader: "metal", cor: [0.96, 0.58, 0.44] },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "escovado", nome: "Metal escovado", cat: "metal",
    luz: "softbox", fundo: "escuro",
    attrs: { acabamento: 60, desgaste: 10, detalhe: 70, iridescencia: 0 },
    neg: ["mirror finish", "rust", "plastic look"],
    negPt: ["acabamento espelhado", "ferrugem", "aspecto de plástico"],
    variantes: [
      {
        id: "inox", nome: "Aço inox",
        material: "brushed stainless steel with a fine directional brushed finish",
        detalhes: ["parallel linear brushing grooves", "anisotropic highlights stretching across the grain", "cool neutral grey tones", "precision-machined look"],
        pt: {
          material: "aço inoxidável escovado, com escovação fina e direcional",
          detalhes: ["sulcos de escovação lineares e paralelos", "realces anisotrópicos esticados ao longo do veio", "tons de cinza neutros e frios", "aspecto de usinagem de precisão"],
        },
        amostra: { tipo: "superficie", gerador: "escovado", cor: [0.74, 0.76, 0.78] },
      },
      {
        id: "latao", nome: "Latão",
        material: "brushed brass, warm golden metal with a directional brushed finish",
        detalhes: ["linear brushing marks", "warm anisotropic highlights", "soft metallic sheen", "subtle tonal variation"],
        pt: {
          material: "latão escovado, metal dourado e quente com escovação direcional",
          detalhes: ["marcas de escovação lineares", "realces anisotrópicos quentes", "brilho metálico suave", "variação tonal sutil"],
        },
        amostra: { tipo: "superficie", gerador: "escovado", cor: [0.86, 0.68, 0.34] },
      },
      {
        id: "anodizado", nome: "Anodizado",
        material: "brushed anodized aluminum in deep blue",
        detalhes: ["uniform metallic color coating", "fine linear grain", "precise industrial look", "soft anisotropic sheen"],
        pt: {
          material: "alumínio anodizado escovado em azul profundo",
          detalhes: ["revestimento metálico de cor uniforme", "veio linear fino", "aspecto industrial preciso", "brilho anisotrópico suave"],
        },
        amostra: { tipo: "superficie", gerador: "escovado", cor: [0.22, 0.42, 0.72] },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "oxidado", nome: "Metal oxidado", cat: "metal",
    luz: "rasante", fundo: "escuro",
    attrs: { acabamento: 10, desgaste: 85, detalhe: 85, iridescencia: 0 },
    neg: ["clean metal", "shiny", "smooth"],
    negPt: ["metal limpo", "brilhante", "liso"],
    variantes: [
      {
        id: "ferrugem", nome: "Ferrugem",
        material: "heavily rusted iron, corroded oxidized steel",
        detalhes: ["flaking orange and brown rust layers", "pitted corrosion", "patches of exposed dark metal", "powdery oxide texture"],
        pt: {
          material: "ferro muito enferrujado, aço oxidado e corroído",
          detalhes: ["camadas de ferrugem laranja e marrom descascando", "corrosão com pites", "áreas de metal escuro exposto", "textura de óxido em pó"],
        },
        amostra: { tipo: "superficie", gerador: "oxidado", modo: "ferrugem" },
      },
      {
        id: "patina", nome: "Pátina de cobre",
        material: "aged copper with verdigris patina",
        detalhes: ["turquoise-green oxidation blooms", "patches of warm bare copper", "chalky mineral crust", "weathered drip streaks"],
        pt: {
          material: "cobre envelhecido com pátina de azinhavre",
          detalhes: ["manchas de oxidação verde-turquesa", "áreas de cobre nu e quente", "crosta mineral calcária", "escorridos desgastados"],
        },
        attrs: { desgaste: 75 },
        amostra: { tipo: "superficie", gerador: "oxidado", modo: "patina" },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "madeira", nome: "Madeira", cat: "natural", destaque: true,
    luz: "janela", fundo: "claro",
    attrs: { acabamento: 30, desgaste: 15, detalhe: 70, iridescencia: 0 },
    neg: ["plastic laminate", "fake wood print", "repetitive pattern"],
    negPt: ["laminado plástico", "impressão de madeira falsa", "padrão repetitivo"],
    variantes: [
      {
        id: "carvalho", nome: "Carvalho",
        material: "natural oak wood, light warm timber",
        detalhes: ["pronounced straight grain", "visible growth rings", "open pores", "natural color variation"],
        pt: {
          material: "madeira de carvalho natural, madeira clara e quente",
          detalhes: ["veio reto e marcado", "anéis de crescimento visíveis", "poros abertos", "variação natural de cor"],
        },
        amostra: { tipo: "superficie", gerador: "madeira", claro: [0.8, 0.62, 0.42], escuro: [0.5, 0.33, 0.19], aneis: 9 },
      },
      {
        id: "nogueira", nome: "Nogueira",
        material: "dark walnut wood, rich chocolate-brown hardwood",
        detalhes: ["flowing figured grain", "deep color variation", "fine pores", "hand-oiled surface"],
        pt: {
          material: "madeira de nogueira escura, madeira de lei marrom-chocolate",
          detalhes: ["veio figurado e fluido", "variação de cor profunda", "poros finos", "superfície oleada à mão"],
        },
        amostra: { tipo: "superficie", gerador: "madeira", claro: [0.47, 0.31, 0.2], escuro: [0.2, 0.12, 0.07], aneis: 7, brilho: 0.22 },
      },
      {
        id: "pinus", nome: "Pinus",
        material: "pale pine wood, light yellowish softwood",
        detalhes: ["bold contrasting grain lines", "small dark knots", "soft resinous tone", "rustic natural look"],
        pt: {
          material: "madeira de pinus clara, madeira macia amarelada",
          detalhes: ["linhas de veio marcadas e contrastantes", "pequenos nós escuros", "tom resinoso suave", "aspecto rústico e natural"],
        },
        amostra: { tipo: "superficie", gerador: "madeira", claro: [0.92, 0.79, 0.58], escuro: [0.74, 0.5, 0.28], aneis: 6, nos: true },
      },
      {
        id: "queimada", nome: "Queimada",
        material: "charred shou sugi ban wood, burnt Japanese timber",
        detalhes: ["deep alligator-skin crackle pattern", "carbonized black surface", "silvery sheen on the raised char", "raised grain relief"],
        pt: {
          material: "madeira queimada shou sugi ban, madeira japonesa carbonizada",
          detalhes: ["craquelado profundo tipo pele de jacaré", "superfície preta carbonizada", "brilho prateado no carvão em relevo", "veio em relevo"],
        },
        attrs: { acabamento: 35, desgaste: 50, detalhe: 85 },
        amostra: { tipo: "superficie", gerador: "madeira", modo: "queimada" },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "marmore", nome: "Mármore", cat: "natural", destaque: true,
    luz: "softbox", fundo: "claro",
    attrs: { acabamento: 85, desgaste: 0, detalhe: 60, iridescencia: 0 },
    neg: ["fake marble print", "repetitive veins", "plastic look"],
    negPt: ["impressão de mármore falso", "veios repetitivos", "aspecto de plástico"],
    variantes: [
      {
        id: "carrara", nome: "Carrara",
        material: "white Carrara marble",
        detalhes: ["soft grey feathery veining", "natural stone depth", "subtle cloudy tonal variation", "fine crystalline structure"],
        pt: {
          material: "mármore Carrara branco",
          detalhes: ["veios cinza suaves e plumosos", "profundidade natural da pedra", "variação tonal sutil e nebulosa", "estrutura cristalina fina"],
        },
        amostra: { tipo: "superficie", gerador: "marmore", base: [0.93, 0.93, 0.92], veia: [0.52, 0.54, 0.58], freq: 2.4, nitidez: 9, rede: 0.8 },
      },
      {
        id: "nero", nome: "Nero Marquina",
        material: "black Nero Marquina marble",
        detalhes: ["sharp white veins across a deep black base", "high-contrast veining", "natural stone depth"],
        pt: {
          material: "mármore Nero Marquina preto",
          detalhes: ["veios brancos nítidos sobre uma base preta profunda", "veios de alto contraste", "profundidade natural da pedra"],
        },
        amostra: { tipo: "superficie", gerador: "marmore", base: [0.06, 0.06, 0.07], veia: [0.9, 0.9, 0.88], freq: 2, nitidez: 26, rede: 1 },
      },
      {
        id: "calacatta", nome: "Calacatta dourado",
        material: "Calacatta gold marble",
        detalhes: ["bold grey veins with warm gold accents", "bright white base", "dramatic flowing veining"],
        pt: {
          material: "mármore Calacatta dourado",
          detalhes: ["veios cinza marcantes com toques dourados", "base branca e luminosa", "veios fluidos e dramáticos"],
        },
        amostra: { tipo: "superficie", gerador: "marmore", base: [0.96, 0.95, 0.93], veia: [0.45, 0.45, 0.47], veia2: [0.78, 0.62, 0.36], freq: 1.6, nitidez: 7, rede: 0.5 },
      },
      {
        id: "verde", nome: "Verde Guatemala",
        material: "deep green Verde Guatemala marble",
        detalhes: ["dense web of pale green and white veins", "dark emerald base", "rich mineral depth"],
        pt: {
          material: "mármore Verde Guatemala, verde profundo",
          detalhes: ["trama densa de veios verde-claros e brancos", "base esmeralda escura", "profundidade mineral rica"],
        },
        amostra: { tipo: "superficie", gerador: "marmore", base: [0.06, 0.22, 0.16], veia: [0.72, 0.84, 0.76], freq: 3.2, nitidez: 16, rede: 1.2 },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "pedra", nome: "Pedra", cat: "natural",
    luz: "rasante", fundo: "claro",
    attrs: { acabamento: 20, desgaste: 20, detalhe: 75, iridescencia: 0 },
    neg: ["smooth plastic", "flat color", "repetitive tiling"],
    negPt: ["plástico liso", "cor chapada", "padrão repetitivo de ladrilhos"],
    variantes: [
      {
        id: "granito", nome: "Granito",
        material: "speckled granite, natural igneous stone",
        detalhes: ["dense black, white and pink mineral speckles", "crystalline flecks", "uniform granular pattern"],
        pt: {
          material: "granito salpicado, pedra ígnea natural",
          detalhes: ["salpicos minerais densos em preto, branco e rosa", "flocos cristalinos", "padrão granular uniforme"],
        },
        attrs: { acabamento: 75, desgaste: 0 },
        amostra: { tipo: "superficie", gerador: "pedra", modo: "granito", cor: [0.55, 0.55, 0.56] },
      },
      {
        id: "ardosia", nome: "Ardósia",
        material: "natural cleft slate, dark blue-grey layered rock",
        detalhes: ["split layered surface", "stepped ridges", "fine mineral grain", "faint rust-colored mineral stains"],
        pt: {
          material: "ardósia natural clivada, rocha em camadas cinza-azulada escura",
          detalhes: ["superfície fendida em camadas", "cristas escalonadas", "grão mineral fino", "leves manchas minerais cor de ferrugem"],
        },
        amostra: { tipo: "superficie", gerador: "pedra", modo: "ardosia", cor: [0.23, 0.25, 0.28] },
      },
      {
        id: "arenito", nome: "Arenito",
        material: "sandstone, warm beige sedimentary rock",
        detalhes: ["horizontal sediment banding", "coarse sandy grain", "soft eroded surface", "earthy ochre tones"],
        pt: {
          material: "arenito, rocha sedimentar bege e quente",
          detalhes: ["faixas horizontais de sedimento", "grão arenoso grosso", "superfície suave e erodida", "tons terrosos de ocre"],
        },
        amostra: { tipo: "superficie", gerador: "pedra", modo: "arenito", cor: [0.84, 0.7, 0.52] },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "papel", nome: "Papel", cat: "fibra", destaque: true,
    luz: "rasante", fundo: "claro",
    attrs: { acabamento: 5, desgaste: 10, detalhe: 75, iridescencia: 0 },
    neg: ["glossy", "plastic", "digital flat color", "printed text"],
    negPt: ["brilhante", "plástico", "cor chapada digital", "texto impresso"],
    variantes: [
      {
        id: "kraft", nome: "Kraft",
        material: "brown kraft paper, unbleached recycled paper",
        detalhes: ["visible wood-pulp fibers", "fine grainy surface", "subtle tonal mottling", "slightly rough tactile feel"],
        pt: {
          material: "papel kraft marrom, papel reciclado não branqueado",
          detalhes: ["fibras de celulose visíveis", "superfície fina e granulada", "manchas tonais sutis", "toque levemente áspero"],
        },
        amostra: { tipo: "superficie", gerador: "papel", modo: "kraft", cor: [0.74, 0.58, 0.4], relevo: 0.3 },
      },
      {
        id: "aquarela", nome: "Aquarela",
        material: "cold-press watercolor paper, heavy cotton rag paper",
        detalhes: ["pronounced irregular tooth", "soft bumpy relief", "warm off-white tone", "deckled organic texture"],
        pt: {
          material: "papel de aquarela cold press, papel encorpado de algodão",
          detalhes: ["granulação irregular e marcada", "relevo macio e irregular", "tom off-white quente", "textura orgânica com bordas de rebarba"],
        },
        amostra: { tipo: "superficie", gerador: "papel", modo: "aquarela", cor: [0.96, 0.95, 0.91], relevo: 0.32 },
      },
      {
        id: "amassado", nome: "Amassado",
        material: "crumpled white paper",
        detalhes: ["sharp creases and folds", "random faceted wrinkles", "soft shadows in the valleys", "matte paper fibers"],
        pt: {
          material: "papel branco amassado",
          detalhes: ["vincos e dobras marcados", "rugas facetadas aleatórias", "sombras suaves nos vales", "fibras de papel foscas"],
        },
        attrs: { desgaste: 40 },
        amostra: { tipo: "superficie", gerador: "papel", modo: "amassado", cor: [0.95, 0.94, 0.92], relevo: 5 },
      },
      {
        id: "reciclado", nome: "Reciclado",
        material: "handmade recycled paper with fiber flecks",
        detalhes: ["visible colored fiber inclusions", "irregular specks", "uneven pulp density", "organic handmade feel"],
        pt: {
          material: "papel reciclado artesanal com fibras aparentes",
          detalhes: ["inclusões de fibras coloridas visíveis", "salpicos irregulares", "densidade de polpa irregular", "aspecto artesanal e orgânico"],
        },
        amostra: { tipo: "superficie", gerador: "papel", modo: "reciclado", cor: [0.86, 0.83, 0.77], relevo: 0.28 },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "tecido", nome: "Tecido", cat: "fibra",
    luz: "rasante", fundo: "claro",
    attrs: { acabamento: 5, desgaste: 10, detalhe: 80, iridescencia: 0 },
    neg: ["plastic", "printed fabric pattern", "blurry weave"],
    negPt: ["plástico", "estampa impressa", "trama borrada"],
    variantes: [
      {
        id: "linho", nome: "Linho",
        material: "natural linen fabric with a loose plain weave",
        detalhes: ["visible slubby threads", "irregular thread thickness", "soft woven texture", "natural flax color"],
        pt: {
          material: "tecido de linho natural com trama simples e aberta",
          detalhes: ["fios flamê visíveis", "espessura de fio irregular", "textura tecida macia", "cor natural de linho cru"],
        },
        amostra: { tipo: "superficie", gerador: "tecido", modo: "linho", cor: [0.8, 0.74, 0.63] },
      },
      {
        id: "denim", nome: "Denim",
        material: "indigo denim, cotton twill weave",
        detalhes: ["diagonal twill lines", "white weft threads peeking through", "faded indigo variation", "sturdy woven texture"],
        pt: {
          material: "denim índigo, sarja de algodão",
          detalhes: ["linhas diagonais de sarja", "fios brancos da trama aparecendo", "variação de índigo desbotado", "textura tecida robusta"],
        },
        amostra: { tipo: "superficie", gerador: "tecido", modo: "denim", cor: [0.15, 0.24, 0.42], trama: [0.84, 0.84, 0.8] },
      },
      {
        id: "feltro", nome: "Feltro",
        material: "dense wool felt with compressed fibers",
        detalhes: ["fuzzy matted fibers", "soft non-woven surface", "fine fiber halo", "muted solid color"],
        pt: {
          material: "feltro de lã denso com fibras compactadas",
          detalhes: ["fibras felpudas e emaranhadas", "superfície macia de não tecido", "halo de fibras finas", "cor sólida e suave"],
        },
        amostra: { tipo: "superficie", gerador: "tecido", modo: "feltro", cor: [0.52, 0.16, 0.16] },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "veludo", nome: "Veludo", cat: "fibra",
    luz: "softbox", fundo: "escuro",
    attrs: { acabamento: 30, desgaste: 0, detalhe: 55, iridescencia: 0 },
    neg: ["shiny plastic", "flat color", "hard surface"],
    negPt: ["plástico brilhante", "cor chapada", "superfície rígida"],
    variantes: [
      {
        id: "esmeralda", nome: "Esmeralda",
        material: "plush emerald green velvet",
        detalhes: ["soft directional pile", "luminous sheen along the edges", "deep rich shadows", "luxurious soft-touch fabric"],
        pt: {
          material: "veludo verde-esmeralda felpudo",
          detalhes: ["pelo macio e direcional", "brilho luminoso ao longo das bordas", "sombras profundas e ricas", "tecido luxuoso e macio ao toque"],
        },
        amostra: { tipo: "esfera", shader: "veludo", cor: [0.05, 0.36, 0.25] },
      },
      {
        id: "bordo", nome: "Bordô amassado",
        material: "deep burgundy crushed velvet",
        detalhes: ["crushed pile pattern", "rich lustrous highlights", "deep wine-red shadows", "soft folds"],
        pt: {
          material: "veludo amassado bordô profundo",
          detalhes: ["padrão de pelo amassado", "realces ricos e lustrosos", "sombras profundas cor de vinho", "dobras suaves"],
        },
        amostra: { tipo: "esfera", shader: "veludo", cor: [0.42, 0.04, 0.1], amassado: true },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "couro", nome: "Couro", cat: "fibra",
    luz: "softbox", fundo: "claro",
    attrs: { acabamento: 35, desgaste: 15, detalhe: 75, iridescencia: 0 },
    neg: ["plastic", "faux leather", "printed texture"],
    negPt: ["plástico", "couro sintético", "textura impressa"],
    variantes: [
      {
        id: "marrom", nome: "Marrom granulado",
        material: "pebbled brown full-grain leather",
        detalhes: ["natural pebble grain", "fine creases between the grains", "subtle tonal variation", "supple surface"],
        pt: {
          material: "couro marrom flor integral granulado",
          detalhes: ["grão natural tipo seixo", "vincos finos entre os grãos", "variação tonal sutil", "superfície macia e flexível"],
        },
        amostra: { tipo: "superficie", gerador: "couro", cor: [0.45, 0.26, 0.14] },
      },
      {
        id: "preto", nome: "Preto",
        material: "black full-grain leather",
        detalhes: ["fine natural grain", "subtle wrinkles", "deep black with soft highlights", "premium craftsmanship"],
        pt: {
          material: "couro preto flor integral",
          detalhes: ["grão natural fino", "rugas sutis", "preto profundo com realces suaves", "acabamento artesanal premium"],
        },
        attrs: { acabamento: 50 },
        amostra: { tipo: "superficie", gerador: "couro", cor: [0.09, 0.085, 0.08], brilho: 0.45 },
      },
      {
        id: "camurca", nome: "Camurça",
        material: "tan suede leather",
        detalhes: ["soft brushed nap", "velvety fibers", "directional color shading", "fine fuzzy surface"],
        pt: {
          material: "camurça cor caramelo",
          detalhes: ["pelo escovado e macio", "fibras aveludadas", "sombreamento de cor direcional", "superfície fina e felpuda"],
        },
        attrs: { acabamento: 5 },
        amostra: { tipo: "superficie", gerador: "couro", modo: "camurca", cor: [0.66, 0.46, 0.3] },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "concreto", nome: "Concreto", cat: "construcao", destaque: true,
    luz: "rasante", fundo: "claro",
    attrs: { acabamento: 10, desgaste: 25, detalhe: 75, iridescencia: 0 },
    neg: ["smooth plastic", "clean flat grey", "repetitive tiling"],
    negPt: ["plástico liso", "cinza chapado e limpo", "padrão repetitivo de ladrilhos"],
    variantes: [
      {
        id: "aparente", nome: "Aparente",
        material: "raw exposed architectural concrete, béton brut",
        detalhes: ["small air pockets and pores", "subtle formwork marks", "cool grey tonal mottling", "fine aggregate grain"],
        pt: {
          material: "concreto aparente arquitetônico bruto, béton brut",
          detalhes: ["pequenas bolhas de ar e poros", "marcas sutis de fôrma", "manchas tonais em cinza frio", "agregado de grão fino"],
        },
        amostra: { tipo: "superficie", gerador: "concreto", modo: "aparente", cor: [0.63, 0.63, 0.61] },
      },
      {
        id: "polido", nome: "Polido",
        material: "polished concrete, smooth troweled cement",
        detalhes: ["cloudy tonal mottling", "exposed fine aggregate flecks", "seamless continuous surface"],
        pt: {
          material: "concreto polido, cimento queimado e liso",
          detalhes: ["manchas tonais nebulosas", "pequenos fragmentos de agregado expostos", "superfície contínua sem emendas"],
        },
        attrs: { acabamento: 60, desgaste: 5 },
        amostra: { tipo: "superficie", gerador: "concreto", modo: "polido", cor: [0.58, 0.58, 0.57] },
      },
      {
        id: "bruto", nome: "Bruto",
        material: "rough weathered concrete, coarse cement surface",
        detalhes: ["deep pits and pores", "water stains and drip marks", "gritty aggregate", "uneven patches"],
        pt: {
          material: "concreto bruto e desgastado, superfície de cimento grossa",
          detalhes: ["cavidades e poros profundos", "manchas e escorridos de água", "agregado áspero", "manchas irregulares"],
        },
        attrs: { desgaste: 70 },
        amostra: { tipo: "superficie", gerador: "concreto", modo: "bruto", cor: [0.6, 0.59, 0.56] },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "terrazzo", nome: "Terrazzo", cat: "construcao",
    luz: "softbox", fundo: "claro",
    attrs: { acabamento: 65, desgaste: 0, detalhe: 60, iridescencia: 0 },
    neg: ["blurry chips", "repetitive pattern", "plastic look"],
    negPt: ["lascas borradas", "padrão repetitivo", "aspecto de plástico"],
    variantes: [
      {
        id: "classico", nome: "Clássico",
        material: "terrazzo with marble chips",
        detalhes: ["irregular stone fragments in terracotta, sage green and charcoal", "cream cement base", "fine speckles between the chips", "flat ground surface"],
        pt: {
          material: "terrazzo com lascas de mármore",
          detalhes: ["fragmentos irregulares de pedra em terracota, verde-sálvia e grafite", "base de cimento creme", "salpicos finos entre as lascas", "superfície plana lixada"],
        },
        amostra: { tipo: "superficie", gerador: "terrazzo", base: [0.93, 0.9, 0.85], paleta: [[0.76, 0.42, 0.3], [0.55, 0.62, 0.5], [0.22, 0.22, 0.23], [0.86, 0.78, 0.66]] },
      },
      {
        id: "pastel", nome: "Pastel",
        material: "pastel terrazzo with colorful chips",
        detalhes: ["chips in soft pink, baby blue and butter yellow", "bright white base", "playful scattered fragments", "flat ground surface"],
        pt: {
          material: "terrazzo pastel com lascas coloridas",
          detalhes: ["lascas em rosa suave, azul-bebê e amarelo-manteiga", "base branca e clara", "fragmentos espalhados e divertidos", "superfície plana lixada"],
        },
        amostra: { tipo: "superficie", gerador: "terrazzo", base: [0.97, 0.96, 0.95], paleta: [[0.96, 0.7, 0.72], [0.62, 0.78, 0.92], [0.98, 0.86, 0.5], [0.72, 0.86, 0.74]] },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "estuque", nome: "Estuque & reboco", cat: "construcao",
    luz: "rasante", fundo: "claro",
    attrs: { acabamento: 15, desgaste: 10, detalhe: 70, iridescencia: 0 },
    neg: ["flat digital wall", "wallpaper pattern"],
    negPt: ["parede digital chapada", "padrão de papel de parede"],
    variantes: [
      {
        id: "veneziano", nome: "Estuque veneziano",
        material: "Venetian plaster, polished lime stucco",
        detalhes: ["layered cloudy tonal variation", "subtle trowel marks", "marble-like depth", "burnished surface"],
        pt: {
          material: "estuque veneziano, massa de cal polida",
          detalhes: ["variação tonal nebulosa em camadas", "marcas sutis de desempenadeira", "profundidade semelhante à do mármore", "superfície brunida"],
        },
        attrs: { acabamento: 55 },
        amostra: { tipo: "superficie", gerador: "gesso", modo: "veneziano", cor: [0.86, 0.82, 0.76] },
      },
      {
        id: "rustico", nome: "Reboco rústico",
        material: "rough hand-troweled plaster wall",
        detalhes: ["irregular trowel swirls", "sandy grain", "raised relief", "warm off-white tone"],
        pt: {
          material: "reboco rústico aplicado à mão com desempenadeira",
          detalhes: ["espirais irregulares de desempenadeira", "grão arenoso", "relevo saliente", "tom off-white quente"],
        },
        amostra: { tipo: "superficie", gerador: "gesso", modo: "rustico", cor: [0.93, 0.91, 0.87] },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "ceramica", nome: "Cerâmica", cat: "construcao",
    luz: "janela", fundo: "claro",
    attrs: { acabamento: 80, desgaste: 5, detalhe: 50, iridescencia: 0 },
    neg: ["plastic", "perfect CGI smoothness"],
    negPt: ["plástico", "lisura perfeita de CGI"],
    variantes: [
      {
        id: "esmaltada", nome: "Esmaltada",
        material: "glazed ceramic with a celadon green glaze",
        detalhes: ["glaze pooling with deeper color", "fine crackle lines (craquelure)", "vitreous glassy coating", "handmade irregularity"],
        pt: {
          material: "cerâmica esmaltada com esmalte verde celadon",
          detalhes: ["esmalte acumulado com cor mais profunda", "finas linhas de craquelado", "camada vítrea", "irregularidade artesanal"],
        },
        amostra: { tipo: "esfera", shader: "ceramica", cor: [0.55, 0.72, 0.62], brilho: 0.9, craquele: true, poca: true },
      },
      {
        id: "terracota", nome: "Terracota",
        material: "unglazed terracotta clay",
        detalhes: ["warm earthy orange tone", "fine sandy grain", "subtle firing color variation", "porous surface"],
        pt: {
          material: "terracota sem esmalte",
          detalhes: ["tom laranja terroso e quente", "grão arenoso fino", "variação sutil de cor da queima", "superfície porosa"],
        },
        attrs: { acabamento: 10 },
        amostra: { tipo: "esfera", shader: "ceramica", cor: [0.76, 0.4, 0.24], brilho: 0.12, grao: true },
      },
      {
        id: "porcelana", nome: "Porcelana",
        material: "fine white porcelain",
        detalhes: ["pure white vitrified body", "delicate soft reflections", "slight translucency at thin edges"],
        pt: {
          material: "porcelana branca fina",
          detalhes: ["corpo vitrificado branco puro", "reflexos suaves e delicados", "leve translucidez nas bordas finas"],
        },
        attrs: { acabamento: 85, detalhe: 30 },
        amostra: { tipo: "esfera", shader: "ceramica", cor: [0.95, 0.95, 0.94], brilho: 0.92, translucido: true },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "plastico", nome: "Plástico", cat: "sintetico", destaque: true,
    luz: "estudio", fundo: "claro",
    attrs: { acabamento: 80, desgaste: 0, detalhe: 25, iridescencia: 0 },
    neg: ["scratches", "dust", "cheap look"],
    negPt: ["arranhões", "poeira", "aspecto barato"],
    variantes: [
      {
        id: "brilhante", nome: "Brilhante",
        material: "glossy injection-molded plastic",
        detalhes: ["smooth seamless surface", "bright saturated color", "toy-like clean form", "soft reflections of the studio"],
        pt: {
          material: "plástico brilhante moldado por injeção",
          detalhes: ["superfície lisa e contínua", "cor viva e saturada", "forma limpa de brinquedo", "reflexos suaves do estúdio"],
        },
        amostra: { tipo: "esfera", shader: "plastico", cor: [1, 0.4, 0.12], brilho: 0.92 },
      },
      {
        id: "fosco", nome: "Soft-touch",
        material: "matte soft-touch plastic",
        detalhes: ["velvety rubberized coating", "soft diffused highlights", "minimal premium product feel", "smooth molded edges"],
        pt: {
          material: "plástico fosco soft-touch",
          detalhes: ["revestimento emborrachado aveludado", "realces suaves e difusos", "aspecto de produto premium e minimalista", "bordas moldadas lisas"],
        },
        attrs: { acabamento: 15 },
        amostra: { tipo: "esfera", shader: "plastico", cor: [0.8, 0.83, 0.78], brilho: 0.18 },
      },
      {
        id: "translucido", nome: "Translúcido",
        material: "translucent frosted polycarbonate plastic",
        detalhes: ["light glowing through the material", "soft internal diffusion", "candy-colored transparency", "smooth molded edges"],
        pt: {
          material: "policarbonato translúcido e fosco",
          detalhes: ["luz brilhando através do material", "difusão interna suave", "transparência colorida de bala", "bordas moldadas lisas"],
        },
        attrs: { acabamento: 55 },
        amostra: { tipo: "esfera", shader: "gel", cor: [0.2, 0.75, 0.72], tint: [0.45, 0.92, 0.88], dens: 1.2, fosco: 0.7, caustica: 0.5 },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "holografico", nome: "Holográfico", cat: "sintetico",
    luz: "estudio", fundo: "claro",
    attrs: { acabamento: 90, desgaste: 0, detalhe: 60, iridescencia: 95 },
    neg: ["dull", "matte", "single flat color"],
    negPt: ["sem brilho", "fosco", "cor única chapada"],
    variantes: [
      {
        id: "amassado", nome: "Foil amassado",
        material: "crinkled holographic foil, iridescent metallic film",
        detalhes: ["rainbow spectral reflections shifting across the folds", "sharp crinkles and creases", "chrome-like base"],
        pt: {
          material: "foil holográfico amassado, filme metálico iridescente",
          detalhes: ["reflexos espectrais de arco-íris mudando entre as dobras", "vincos e amassados marcados", "base cromada"],
        },
        amostra: { tipo: "superficie", gerador: "holo", modo: "amassado" },
      },
      {
        id: "filme", nome: "Película",
        material: "smooth iridescent thin-film surface with soap-bubble interference colors",
        detalhes: ["pastel rainbow gradients", "oil-slick color swirls", "fluid color transitions"],
        pt: {
          material: "película iridescente lisa com cores de interferência de bolha de sabão",
          detalhes: ["degradês de arco-íris em tons pastel", "redemoinhos de cor como óleo na água", "transições de cor fluidas"],
        },
        attrs: { iridescencia: 80 },
        amostra: { tipo: "superficie", gerador: "holo", modo: "filme" },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    id: "perola", nome: "Pérola & nácar", cat: "sintetico",
    luz: "softbox", fundo: "claro",
    attrs: { acabamento: 75, desgaste: 0, detalhe: 45, iridescencia: 55 },
    neg: ["plastic", "chalky", "flat white"],
    negPt: ["plástico", "aspecto de giz", "branco chapado"],
    variantes: [
      {
        id: "perola", nome: "Pérola",
        material: "lustrous pearl nacre",
        detalhes: ["soft orient luster", "subtle pink and blue overtones", "smooth layered depth", "gentle glow"],
        pt: {
          material: "nácar de pérola lustroso",
          detalhes: ["oriente suave e lustroso", "nuances sutis de rosa e azul", "profundidade lisa em camadas", "brilho delicado"],
        },
        amostra: { tipo: "esfera", shader: "perola", cor: [0.92, 0.9, 0.88] },
      },
      {
        id: "madreperola", nome: "Madrepérola",
        material: "mother-of-pearl shell",
        detalhes: ["layered wavy nacre bands", "shimmering pastel play of color", "silky depth"],
        pt: {
          material: "concha de madrepérola",
          detalhes: ["faixas onduladas de nácar em camadas", "jogo de cores pastel cintilante", "profundidade sedosa"],
        },
        amostra: { tipo: "superficie", gerador: "holo", modo: "nacar" },
      },
    ],
  },
];

/* atributos efetivos da variação: base → material → variação */
export const attrsDe = (mat, va) => ({ ...ATTRS, ...mat.attrs, ...(va.attrs || {}) });

/* semente estável por variação, para a amostra não mudar a cada render */
export const sementeDe = (id) => {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return (h >>> 0) % 100000;
};
