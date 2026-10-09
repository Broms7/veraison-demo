// dictionnaires/en.ts — textes anglais. Le type Dictionnaire impose la même forme que fr.ts :
// une clé oubliée ou en trop fait échouer le build TypeScript.
import type { Dictionnaire } from "./fr";

export const en: Dictionnaire = {
  meta: {
    titre: "Véraison 2021 — Clos Ferrugine, Pomerol",
    description:
      "Véraison, the wine of Clos Ferrugine on the Pomerol plateau. 1,200 numbered bottles. 2021 vintage allocation and tastings at the estate.",
  },
  porte: {
    domaine: "Clos Ferrugine — Pomerol",
    titre: "Véraison",
    question: "Are you of legal drinking age in your country?",
    oui: "Yes, enter",
    non: "No",
    refus: "Come back and see us in a few years.",
  },
  tete: {
    menu: "Open the menu",
    marque: "FERRUGINE",
    marqueSous: "CLOS · POMEROL",
    allocation: "Allocation",
    reserver: "Book a tasting",
    langue: "Language",
    sommaire: "Contents",
  },
  rail: "Level",
  sommaire: [
    { ancre: "ouverture", titre: "I · Opening" },
    { ancre: "cuvee", titre: "II · The wine" },
    { ancre: "geste", titre: "III · The hand" },
    { ancre: "verre", titre: "IV · In the glass" },
    { ancre: "table", titre: "V · At the table" },
    { ancre: "domaine", titre: "VI · The estate" },
    { ancre: "millesimes", titre: "VII · The vintages" },
    { ancre: "allocation", titre: "VIII · Allocation" },
    { ancre: "resa", titre: "IX · At the estate" },
    { ancre: "journal", titre: "X · Journal" },
  ],
  ouverture: {
    surtitre: "Clos Ferrugine, Pomerol plateau",
    titre: "Véraison",
    gauche: "Red · Merlot, cabernet franc",
    droite: "Vintage MMXXI",
    indice: "Scroll to uncork",
    sceau: "CLOS FERRUGINE · POMEROL · MMXXI ·",
  },
  cuvee: {
    surtitre: "The wine",
    titre: ["Véraison", "MMXXI"],
    texte:
      "Two and a half hectares of merlot and cabernet franc on the iron-stained clay of the Pomerol plateau, three kilometres from Libourne. Hand-picked over eleven mornings, aged eighteen months in French oak barrels, one third new. Unfined, unfiltered.",
    ajouter: "Add to my allocation",
    lire: "Read",
    lignes: [
      {
        libelle: "Strength · alcohol by volume",
        chiffre: "14%",
        texte: "The fruit carries the alcohol, not the other way round.",
        tiroir:
          "Fourteen degrees is what plateau merlot gives when you wait for full ripeness without going past it. No chaptalisation, no dealcoholisation: the strength is the harvest's own.",
      },
      {
        libelle: "Ageing · months in barrel",
        chiffre: "18",
        texte: "French oak, one third new, two thirds used once or twice.",
        tiroir:
          "Eighteen months in 225-litre barrels in the cellar, with no racking for the first six months. New oak stays in the minority: it should hold the wine, not perfume it.",
      },
      {
        libelle: "Blend · merlot / cabernet franc",
        chiffre: "85",
        texte: "15 cabernet franc, from the sandy plots.",
        tiroir: "",
      },
      {
        libelle: "Cellaring · drink between",
        chiffre: "2028",
        texte: "and 2045. Decant one hour ahead.",
        tiroir:
          "Closed in its youth, the wine opens at around seven years. Serve at 16 °C, decanted for an hour. Store bottles lying down, away from light, at around 13 °C.",
      },
    ],
  },
  geste: {
    video: "Video still · Kling — the winemaker in the cellar, waist shot",
    lireVideo: "Play the video",
    videoTitre: "Claire Dussol, winemaker",
    videoAttente: "Kling video to come — 1 min 40, subtitled.",
    legende: "Listen to Claire Dussol, winemaker — 1 min 40",
    surtitre: "The style",
    titreAvant: "Small plateau,",
    titreMilieu: "great ",
    titreAccent: "merlot",
    paragraphes: [
      "Pomerol has never had a classification and wants none: a handful of families, plots the size of a garden, and merlot as a mother tongue.",
      "Twelve hundred bottles a year. Not one more: two and a half hectares give no more when you harvest them this way.",
    ],
  },
  verre: {
    surtitre: "In the glass",
    titre: "Three beats",
    notes: [
      { num: "01 · The attack", titre: "Blackberry, plum, violet", texte: "Fruit first, fresh, almost crunchy. The violet arrives after twenty minutes of air." },
      { num: "03 · The finish", titre: "Liquorice, fine tannins", texte: "Forty seconds on the palate. The tannin is tight but polished: it holds without gripping." },
      { num: "02 · The middle", titre: "Truffle, graphite", texte: "The wine tightens, turns mineral, almost sanguine. That is the iron clay speaking." },
    ],
  },
  table: {
    photo: "Photo · Kling — duck breast over embers, ceps, a glass set down, raking light, top-down view",
    surtitre: "At the table",
    titreAvant: "Embers, ceps",
    titreAccent: "patience",
    texte:
      "It wants fat, salt and time. Pink Pauillac lamb, lamprey à la bordelaise, ceps with parsley and garlic, an old comté. Skip grilled fish: it would not hear it.",
    cta: "See the pairings",
  },
  domaine: {
    fond: "Full frame · Kling (6 s looping video) — the Pomerol plateau at dawn, bell tower in the mist",
    surtitre: "The estate",
    titre: ["Eleven mornings", "of harvest"],
    texte:
      "The plots sit on the plateau, between the Pomerol bell tower and the Catusseau road, on blue clay stained with iron. We pick before the sun warms the bunches, in twelve-kilo crates, with the same team since 2009.",
    chiffres: [
      { valeur: "2.5 ha", libelle: "of vines" },
      { valeur: "11", libelle: "mornings" },
      { valeur: "1,200", libelle: "bottles" },
    ],
  },
  millesimes: {
    surtitre: "The vintages",
    titreAvant: "Six years,",
    titreMilieu: "one ",
    titreAccent: "soil",
    fermer: "Close",
    annees: [
      { annee: "2016", note: "Sunny, ready to open", statut: "Last bottles", fiche: "A dry, hot summer and an early harvest. The most open of the line: drink it now, decanted." },
      { annee: "2017", note: "April frost: 400 bottles", statut: "Sold out", fiche: "The night of 27 April took two thirds of the crop. Only four hundred bottles, all gone." },
      { annee: "2018", note: "Mildew, then a great summer", statut: "Last bottles", fiche: "A wet spring held back row by row, then a superb summer. A dense wine, give it three more years." },
      { annee: "2019", note: "Classic, for keeping", statut: "Available", fiche: "The estate's reference year: balance, freshness, fine tannins. Keep until 2040." },
      { annee: "2020", note: "Concentrated, dense", statut: "Sold out", fiche: "Low yields, tight berries. A powerful wine, sold en primeur in three weeks." },
    ],
  },
  allocation: {
    surtitre: "2021 allocation:",
    titreAvant: "1,200 bottles, ",
    titreAccent: "not one more",
    ajouter: "Add",
    ajoute: "Added",
    formats: [
      { id: "caisse", nom: "Wooden case · 6", note: "Twelve cases", prix: 630 },
      { id: "magnum", nom: "Magnum 1.5 L", note: "Forty, numbered", prix: 280 },
      { id: "bouteille", nom: "The bottle · 75 cl", note: "The release", prix: 110 },
      { id: "demi", nom: "Half · 37.5 cl", note: "Cellar door only", prix: 58 },
      { id: "coffret", nom: "Tasting box", note: "With the visit", prix: 95 },
    ],
  },
  resa: {
    surtitre: "At the estate",
    titreAvant: "Taste it",
    titreMilieu: "where it ",
    titreAccent: "grows",
    intro:
      "Tuesday to Saturday, by appointment. Claire or Paul welcome you in the cellar, in small groups: eight people at most. Route de Catusseau, 33500 Pomerol.",
    formulesLibelle: "Tasting",
    formules: [
      { id: "decouverte", num: "01", nom: "The discovery", meta: "45 min · three vintages in the cellar", prix: 25 },
      { id: "chai", num: "02", nom: "The cellar", meta: "1 h 30 · tour, five wines including one from barrel", prix: 60 },
      { id: "table", num: "03", nom: "The long table", meta: "3 h · morning harvest, winemaker's lunch", prix: 150 },
    ],
    date: "Date",
    ferme: "Closed Sunday and Monday",
    creneau: "Time",
    creneaux: [
      { id: "1030", libelle: "10:30 am", complet: false },
      { id: "1400", libelle: "2:00 pm", complet: false },
      { id: "1630", libelle: "4:30 pm", complet: true },
    ],
    complet: "full",
    personnes: "Guests",
    moins: "Remove a guest",
    plus: "Add a guest",
    pers: "guests",
    aChoisir: "Pick a date",
    ouvrirAgenda: "Choose date and time",
    fermerAgenda: "Done",
    reserver: "Book the tasting",
    confirmationTitre: "Request received",
    confirmationTexte: "Simulated booking: no payment, no data sent. On the real site, Claire or Paul would confirm your visit by email.",
    fermer: "Close",
  },
  journal: {
    surtitre: "Journal",
    titre: "Cellar notebook",
    tout: "The whole journal",
    articles: [
      { photo: "Photo · Kling — pruned vine shoots, frost", meta: "January · 4 min", titre: "Winter pruning, row by row" },
      { photo: "Photo · Kling — frost candles between the rows", meta: "April 2017 · 6 min", titre: "The night frost took two thirds" },
      { photo: "Photo · Kling — Pomerol bell tower, vines", meta: "Pomerol · 5 min", titre: "Why Pomerol refuses any classification" },
    ],
  },
  pied: {
    lettreTitre: "The harvest letter",
    lettreTexte: "One letter a year, the day the vintage is released. Nothing else.",
    email: "Your email",
    inscrire: "Subscribe",
    inscrit: "Simulated sign-up: nothing was sent.",
    colonnes: [
      { titre: "Visit", liens: ["Tastings", "The long table", "Getting here"] },
      { titre: "Buy", liens: ["Allocation", "Wine shops", "Gifts"] },
      { titre: "Read", liens: ["Journal", "Vintages", "Press"] },
    ],
    // Mention loi Évin : la phrase française fait foi, la traduction l'accompagne.
    evin: "L'abus d'alcool est dangereux pour la santé, à consommer avec modération. Alcohol abuse is dangerous for your health; drink in moderation.",
    credit: "© 2026 Clos Ferrugine — fictional estate, a Kaïro concept",
    geant: "Ferrugine",
  },
  repli: "Bottle of Véraison 2021, Clos Ferrugine",
};
