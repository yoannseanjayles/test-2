import type { Product } from "./types";

/**
 * Rayon Ensembles — assortiment textile (D-053, jalon 4).
 *
 * Ce module ne porte que des **données**. Les variantes sont dérivées par
 * `model()` dans `data.ts`, qui bascule sur l'échelle vêtement dès que la
 * sous-catégorie vaut `textile` : les grilles de `brands.ts` sont des grilles
 * de chaussant, elles ne disent rien d'un sweat.
 *
 * ⚠️ Assortiment **provisoire**, au même titre que le stock de démonstration.
 * Ces six entrées existent pour que le rayon soit exploitable de bout en bout
 * — facettes, tailles, fiches, tunnel — pas pour être vendues en l'état. À
 * remplacer avant toute vente : dénominations exactes, prix et compositions.
 * Les packshots, eux, sont en place — un par coloris, comme pour les
 * chaussures.
 *
 * Une règle est tenue ici comme ailleurs dans le catalogue : **aucune mesure
 * n'est attribuée à une marque qui ne l'a pas publiée**. Les compositions
 * portent « Non communiquée » plutôt qu'une valeur plausible, et les conseils
 * de taille parlent de coupe, jamais de tour de poitrine. Une correspondance
 * inventée se paie en retours.
 */
export const textileModels: Omit<Product, "variants">[] = [
  {
    slug: "ensemble-molleton-bicolore",
    name: "Ensemble molleton bicolore",
    brand: "nike",
    subcategory: "textile",
    genres: ["mixte"],
    price: 8999,
    shortDescription:
      "Sweat à capuche et jogging assortis, en molleton gratté. Coupe ample, taille et chevilles élastiquées, poche kangourou.",
    curatorNote:
      "L'ensemble le plus simple du rayon, et celui par lequel commencer : la coupe est droite, le molleton épais, et les deux pièces se portent séparément sans avoir l'air dépareillées.",
    material: "Molleton coton mélangé",
    details: [
      {
        title: "Description complète",
        content:
          "Un ensemble deux pièces en molleton gratté à l'intérieur : sweat à capuche à poche kangourou, et jogging à taille élastiquée avec cordon de serrage.\n\nLa coupe est volontairement ample — épaules tombantes sur le sweat, jambe droite resserrée à la cheville sur le bas. C'est un vêtement d'après-séance et de week-end, pas un vêtement d'entraînement : le molleton retient l'humidité.\n\nLes deux pièces sont vendues ensemble et partagent la même taille. Un écart de morphologie entre le haut et le bas se règle en prenant la taille du haut, la plus contraignante.",
      },
    ],
    colors: [
      { name: "Gris chiné / marine", hex: "#9AA0A6", images: ["/produits/ensemble-molleton-bicolore/1.jpg"] },
      { name: "Noir / gris", hex: "#1C1C1E", images: ["/produits/ensemble-molleton-bicolore/2.jpg"] },
      { name: "Bleu roi / blanc", hex: "#2B5CE6", images: ["/produits/ensemble-molleton-bicolore/3.jpg"] },
    ],
    sizeAdvice:
      "Coupe ample assumée : votre taille habituelle pour le tomber d'origine, une taille en dessous pour un rendu ajusté. Aucune table de mesures n'a été publiée par la marque pour cette pièce — nous n'en inventons pas.",
    isNew: true,
    curatedRank: 20,
    reviews: [],
    pairsWith: ["air-force-1-07", "p-6000"],
    tone: "graphite",
    features: [
      "Deux pièces assorties, vendues ensemble",
      "Molleton gratté à l'intérieur",
      "Capuche doublée, poche kangourou",
      "Taille et chevilles élastiquées",
      "Du XS au XXL",
    ],
    specifications: [
      { label: "Composition", value: "Non communiquée — à confirmer auprès du fournisseur" },
      { label: "Entretien", value: "Lavage à 30 °C, séchage à plat" },
      { label: "Genre", value: "Unisexe" },
      { label: "Tailles", value: "XS à XXL" },
    ],
  },
  {
    slug: "sweat-capuche-epais",
    name: "Sweat à capuche épais",
    brand: "nike",
    subcategory: "textile",
    genres: ["mixte"],
    price: 5499,
    shortDescription:
      "Le sweat seul, dans le même molleton que l'ensemble. Capuche doublée, poche kangourou, bas de corps côtelé.",
    curatorNote:
      "Vendu séparément parce que c'est la pièce que l'on remplace le plus souvent. Même molleton et même coupe que l'ensemble bicolore — les deux se marient sans effort.",
    material: "Molleton coton mélangé",
    details: [
      {
        title: "Description complète",
        content:
          "Sweat à capuche en molleton gratté, coupe droite et épaules légèrement tombantes.\n\nLa capuche est doublée et le cordon de serrage plat. Les poignets et le bas de corps sont côtelés, ce qui tient la forme au lavage mieux qu'une simple couture.\n\nÀ porter par-dessus une couche technique après l'effort, ou seul en ville. Comme tout molleton coton, il n'évacue pas l'humidité : ce n'est pas un vêtement d'entraînement.",
      },
    ],
    colors: [
      { name: "Noir", hex: "#1C1C1E", images: ["/produits/sweat-capuche-epais/1.jpg"] },
      { name: "Gris chiné", hex: "#9AA0A6", images: ["/produits/sweat-capuche-epais/2.jpg"] },
      { name: "Écru", hex: "#EFE9DC", images: ["/produits/sweat-capuche-epais/3.jpg"] },
      { name: "Vert forêt", hex: "#2F4A3C", images: ["/produits/sweat-capuche-epais/4.jpg"] },
    ],
    sizeAdvice:
      "Taille normalement pour un tomber droit. Les épaules tombantes rendent la taille au-dessus très ample — à réserver à un port volontairement oversize.",
    isNew: false,
    curatedRank: 21,
    reviews: [],
    pairsWith: ["ensemble-molleton-bicolore", "jogging-droit-coton"],
    tone: "chalk",
    features: [
      "Molleton gratté à l'intérieur",
      "Capuche doublée, cordon plat",
      "Poignets et bas de corps côtelés",
      "Poche kangourou",
      "Du XS au XXL",
    ],
    specifications: [
      { label: "Composition", value: "Non communiquée — à confirmer auprès du fournisseur" },
      { label: "Entretien", value: "Lavage à 30 °C, séchage à plat" },
      { label: "Genre", value: "Unisexe" },
      { label: "Tailles", value: "XS à XXL" },
    ],
  },
  {
    slug: "jogging-droit-coton",
    name: "Jogging droit en coton",
    brand: "nike",
    subcategory: "textile",
    genres: ["mixte"],
    price: 4999,
    shortDescription:
      "Jogging à jambe droite, taille élastiquée avec cordon, deux poches latérales et une poche arrière zippée.",
    curatorNote:
      "La jambe est droite jusqu'en bas, sans resserrement à la cheville : c'est ce qui le rend portable avec une chaussure volumineuse sans que le bas remonte.",
    material: "Molleton coton mélangé",
    details: [
      {
        title: "Description complète",
        content:
          "Jogging en molleton, coupe droite du genou à la cheville.\n\nLa taille est élastiquée et doublée d'un cordon plat. Deux poches latérales ouvertes, une poche arrière zippée pour un téléphone ou une carte.\n\nLe choix de la jambe droite est délibéré : un bas resserré remonte sur une chaussure épaisse et casse la ligne. Celui-ci tombe sur le dessus du pied.",
      },
    ],
    colors: [
      { name: "Noir", hex: "#1C1C1E", images: ["/produits/jogging-droit-coton/1.jpg"] },
      { name: "Gris chiné", hex: "#9AA0A6", images: ["/produits/jogging-droit-coton/2.jpg"] },
      { name: "Marine", hex: "#26324A", images: ["/produits/jogging-droit-coton/3.jpg"] },
    ],
    sizeAdvice:
      "Taille normalement. La longueur de jambe est unique par taille : au-delà d'1,90 m, la cheville sera découverte.",
    isNew: false,
    curatedRank: 22,
    reviews: [],
    pairsWith: ["sweat-capuche-epais", "air-max-90"],
    tone: "graphite",
    features: [
      "Jambe droite, sans resserrement à la cheville",
      "Taille élastiquée et cordon plat",
      "Deux poches latérales, une poche arrière zippée",
      "Du XS au XXL",
    ],
    specifications: [
      { label: "Composition", value: "Non communiquée — à confirmer auprès du fournisseur" },
      { label: "Entretien", value: "Lavage à 30 °C, séchage à plat" },
      { label: "Genre", value: "Unisexe" },
      { label: "Tailles", value: "XS à XXL" },
    ],
  },
  {
    slug: "coupe-vent-pliable",
    name: "Coupe-vent pliable",
    brand: "salomon",
    subcategory: "textile",
    genres: ["mixte"],
    price: 7999,
    shortDescription:
      "Veste coupe-vent légère, capuche ajustable, qui se replie dans sa propre poche. Déperlante, non imperméable.",
    curatorNote:
      "La pièce que l'on garde dans un sac sans y penser. Elle coupe le vent et supporte une averse courte — nous ne la présentons pas comme imperméable, parce qu'elle ne l'est pas.",
    material: "Nylon déperlant",
    details: [
      {
        title: "Description complète",
        content:
          "Coupe-vent en nylon léger, traité déperlant. La capuche est ajustable par deux cordons, les poignets sont élastiqués, le bas de veste se resserre par un cordon.\n\nElle se replie dans sa poche poitrine et tient alors dans une main.\n\nLimite à connaître : le traitement déperlant fait perler l'eau, il ne rend pas la veste imperméable. Sous une pluie soutenue ou prolongée, le tissu se gorge. Pour de la pluie franche il faut une membrane — cette veste n'en a pas.",
      },
    ],
    colors: [
      { name: "Orange terre", hex: "#E8763A", images: ["/produits/coupe-vent-pliable/1.jpg"] },
      { name: "Noir", hex: "#1C1C1E", images: ["/produits/coupe-vent-pliable/2.jpg"] },
      { name: "Bleu profond", hex: "#26324A", images: ["/produits/coupe-vent-pliable/3.jpg"] },
    ],
    sizeAdvice:
      "Prévue pour se porter par-dessus une couche : taille normalement, sauf si vous comptez l'enfiler sur une polaire épaisse.",
    isNew: true,
    curatedRank: 23,
    reviews: [],
    pairsWith: ["xt-6", "polaire-legere-zippee"],
    tone: "signal",
    features: [
      "Se replie dans sa poche poitrine",
      "Capuche ajustable par deux cordons",
      "Traitement déperlant — pas de membrane imperméable",
      "Poignets élastiqués, bas resserrable",
      "Du XS au XXL",
    ],
    specifications: [
      { label: "Composition", value: "Non communiquée — à confirmer auprès du fournisseur" },
      { label: "Imperméabilité", value: "Aucune — traitement déperlant seul" },
      { label: "Entretien", value: "Lavage à 30 °C, sans adoucissant" },
      { label: "Tailles", value: "XS à XXL" },
    ],
  },
  {
    slug: "polaire-legere-zippee",
    name: "Polaire légère zippée",
    brand: "salomon",
    subcategory: "textile",
    genres: ["mixte"],
    price: 6499,
    shortDescription:
      "Polaire fine à zip intégral, col montant, deux poches zippées. Se porte seule ou sous le coupe-vent.",
    curatorNote:
      "Une polaire fine plutôt qu'épaisse : c'est ce qui la rend utile toute l'année, sous une veste en hiver et seule à la mi-saison.",
    material: "Polaire recyclée",
    details: [
      {
        title: "Description complète",
        content:
          "Polaire à grammage léger, zip intégral et col montant qui protège le cou sans gêner.\n\nDeux poches latérales zippées. Les coutures sont plates pour limiter les frottements sous un sac.\n\nElle sèche vite et se comprime bien, ce qui en fait une bonne seconde couche. Seule, elle coupe mal le vent — d'où le coupe-vent par-dessus.",
      },
    ],
    colors: [
      { name: "Gris ardoise", hex: "#5A6068", images: ["/produits/polaire-legere-zippee/1.jpg"] },
      { name: "Vert sapin", hex: "#2F4A3C", images: ["/produits/polaire-legere-zippee/2.jpg"] },
      { name: "Noir", hex: "#1C1C1E", images: ["/produits/polaire-legere-zippee/3.jpg"] },
    ],
    sizeAdvice:
      "Coupe proche du corps pour se glisser sous une veste. Pour un port seul et plus décontracté, prenez une taille au-dessus.",
    isNew: false,
    curatedRank: 24,
    reviews: [],
    pairsWith: ["coupe-vent-pliable", "xt-6"],
    tone: "sand",
    features: [
      "Zip intégral, col montant",
      "Deux poches latérales zippées",
      "Coutures plates",
      "Se comprime et sèche vite",
      "Du XS au XXL",
    ],
    specifications: [
      { label: "Composition", value: "Non communiquée — à confirmer auprès du fournisseur" },
      { label: "Entretien", value: "Lavage à 30 °C, sans adoucissant" },
      { label: "Tailles", value: "XS à XXL" },
    ],
  },
  {
    slug: "ensemble-entrainement-respirant",
    name: "Ensemble d'entraînement respirant",
    brand: "on",
    subcategory: "textile",
    genres: ["mixte"],
    price: 10999,
    shortDescription:
      "Haut manches longues et collant assortis, en maille respirante. Coupe près du corps, pensée pour l'effort.",
    curatorNote:
      "Le seul ensemble du rayon réellement destiné à l'entraînement : la maille évacue au lieu de retenir, contrairement au molleton. C'est aussi le plus cher, et le plus spécialisé.",
    material: "Maille technique",
    details: [
      {
        title: "Description complète",
        content:
          "Deux pièces en maille technique : un haut à manches longues et un collant, coupés près du corps.\n\nLa maille est ajourée aux zones de transpiration — dos, arrière des cuisses. Les coutures sont décalées pour éviter les frottements sous un sac ou une ceinture.\n\nÀ la différence des ensembles molleton du rayon, celui-ci est fait pour être porté pendant l'effort : il sèche vite et ne s'alourdit pas. En contrepartie, il tient moins chaud à l'arrêt.",
      },
    ],
    colors: [
      { name: "Noir", hex: "#1C1C1E", images: ["/produits/ensemble-entrainement-respirant/1.jpg"] },
      { name: "Gris perle", hex: "#C9CCD1", images: ["/produits/ensemble-entrainement-respirant/2.jpg"] },
      { name: "Bleu nuit", hex: "#26324A", images: ["/produits/ensemble-entrainement-respirant/3.jpg"] },
    ],
    sizeAdvice:
      "Coupe près du corps assumée. En cas d'hésitation entre deux tailles, prenez la plus grande : la maille est extensible, mais le rendu serré n'est pas au goût de tout le monde.",
    isNew: true,
    curatedRank: 25,
    reviews: [],
    pairsWith: ["cloudmonster-3", "cloudsurfer-max"],
    tone: "graphite",
    features: [
      "Deux pièces assorties, vendues ensemble",
      "Maille ajourée aux zones de transpiration",
      "Coutures décalées, sans frottement sous un sac",
      "Sèche vite — conçu pour être porté pendant l'effort",
      "Du XS au XXL",
    ],
    specifications: [
      { label: "Composition", value: "Non communiquée — à confirmer auprès du fournisseur" },
      { label: "Entretien", value: "Lavage à 30 °C, sans sèche-linge" },
      { label: "Genre", value: "Unisexe" },
      { label: "Tailles", value: "XS à XXL" },
    ],
  },
];
