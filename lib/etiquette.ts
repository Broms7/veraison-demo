// lib/etiquette.ts — dessin de l'étiquette et de la contre-étiquette (design-spec §4.4 et §4.5).
// Mise en page reprise de l'aperçu 3D validé (assets-3d/apercu.html), coordonnées données pour
// une base 1024 × 1280 (avant) et 700 × 900 (dos), multipliées par l'échelle du canvas (× 2 sur desktop).
// L'étiquette est dessinée UNE SEULE FOIS, complète : c'est le shader (components/scene/materiaux.ts)
// qui masque chaque étape par bande au fil du scroll. Re-téléverser une texture 2048 × 2560 à chaque
// image coûterait ~21 Mo par envoi.
// Le texte n'est pas traduit : c'est la bouteille réelle, avec ses mentions françaises.

export interface ThemeEtiquette {
  polices: { titre: string; ital: string; mono: string };   // familles CSS générées par next/font
  couleurs: { papier: string; encre: string; vin: string; gris: string; filet: string; oxyde: string };
}

export const TEXTE_ETIQUETTE = {
  domaine: "CLOS FERRUGINE",
  cuvee: "VÉRAISON",
  millesime: "2021",
  appellation: "APPELLATION POMEROL CONTRÔLÉE",
  degre: "14 % VOL. — 75 CL",
  mise: "MIS EN BOUTEILLE AU DOMAINE",
  numero: "N° 0417 / 1 200",
  dos: {
    titre: "ASSEMBLAGE",
    cepages: ["Merlot 85", "Cabernet franc 15"],
    mentions: ["VENDANGE MANUELLE · 18 MOIS EN BARRIQUE", "NON COLLÉ · NON FILTRÉ"],
    sulfites: "CONTIENT DES SULFITES",
    sanitaire: ["L'ABUS D'ALCOOL EST DANGEREUX POUR LA SANTÉ,", "À CONSOMMER AVEC MODÉRATION."],
  },
};

/** Bases de mise en page (px) : la taille réelle du canvas en est un multiple. */
export const BASE_AVANT = { l: 1024, h: 1280 };
export const BASE_DOS = { l: 700, h: 900 };

/** Bandes de chaque étape en coordonnée v de texture (v = 1 − y / hauteur), §4.4. */
export const BANDES = [
  [0.633, 0.891],  // ① CLOS FERRUGINE + VÉRAISON
  [0.367, 0.594],  // ② 2021 + appellation
  [0.199, 0.336],  // ③ filet + degré + mise
  [0.086, 0.172],  // ④ numéro
] as const;

/** Papier + grain léger. Le grain est discret : les bandes masquées montrent un papier uni (§4.4). */
function papier(ctx: CanvasRenderingContext2D, couleur: string, f: number) {
  const { width: l, height: h } = ctx.canvas;
  ctx.fillStyle = couleur;
  ctx.fillRect(0, 0, l, h);
  // Grain pseudo-aléatoire déterministe (même rendu à chaque chargement).
  let graine = 7;
  const alea = () => ((graine = (graine * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 4000 * f * f; i++) {
    ctx.fillStyle = `rgba(80,50,40,${alea() * 0.025})`;
    ctx.fillRect(alea() * l, alea() * h, 1.5 * f, 1.5 * f);
  }
}

/** Texte centré : police CSS complète (« 900 230px famille »), interlettrage en px de base. */
function texte(ctx: CanvasRenderingContext2D, t: string, x: number, y: number, police: string, couleur: string, f: number, espace = 0) {
  ctx.font = police;
  ctx.fillStyle = couleur;
  ctx.textAlign = "center";
  ctx.letterSpacing = `${espace * f}px`;
  ctx.fillText(t, x, y);
  ctx.letterSpacing = "0px";
}

/** Étiquette avant, complète (les 4 étapes). Le masquage par étape est fait par le shader. */
export function dessinerEtiquette(ctx: CanvasRenderingContext2D, theme: ThemeEtiquette): void {
  const f = ctx.canvas.width / BASE_AVANT.l;
  const cx = ctx.canvas.width / 2;
  const { polices: p, couleurs: c } = theme;
  const T = TEXTE_ETIQUETTE;
  const px = (n: number) => `${n * f}px`;

  papier(ctx, c.papier, f);
  // Le « clos » : filet intérieur vin à 46 px du bord.
  ctx.strokeStyle = c.vin;
  ctx.lineWidth = 3 * f;
  ctx.strokeRect(46 * f, 46 * f, ctx.canvas.width - 92 * f, ctx.canvas.height - 92 * f);

  texte(ctx, T.domaine, cx, 190 * f, `500 ${px(40)} ${p.mono}`, c.encre, f, 14);                    // ①
  texte(ctx, T.cuvee, cx, 450 * f, `900 ${px(230)} ${p.titre}`, c.vin, f, 2);                       // ①
  texte(ctx, T.millesime, cx, 680 * f, `italic 400 ${px(190)} ${p.ital}`, c.encre, f);               // ②
  texte(ctx, T.appellation, cx, 790 * f, `500 ${px(30)} ${p.mono}`, c.gris, f, 6);                  // ②
  ctx.fillStyle = c.filet;                                                                          // ③
  ctx.fillRect(cx - 220 * f, 870 * f, 440 * f, 2 * f);
  texte(ctx, T.degre, cx, 950 * f, `500 ${px(36)} ${p.mono}`, c.encre, f, 8);                       // ③
  texte(ctx, T.mise, cx, 1010 * f, `500 ${px(26)} ${p.mono}`, c.gris, f, 6);                        // ③
  // ④ Le numéro : coup de numéroteur, encre oxyde, légèrement de travers.
  ctx.save();
  ctx.translate(cx, 1140 * f);
  ctx.rotate(-0.035);
  ctx.globalAlpha = 0.88;
  texte(ctx, T.numero, 0, 0, `italic 400 ${px(92)} ${p.ital}`, c.oxyde, f);
  ctx.restore();
}

/** Contre-étiquette (format 7:9) : assemblage, mentions, pictogramme, sulfites, mention sanitaire. */
export function dessinerContreEtiquette(ctx: CanvasRenderingContext2D, theme: ThemeEtiquette): void {
  const f = ctx.canvas.width / BASE_DOS.l;
  const cx = ctx.canvas.width / 2;
  const { polices: p, couleurs: c } = theme;
  const D = TEXTE_ETIQUETTE.dos;
  const px = (n: number) => `${n * f}px`;

  papier(ctx, c.papier, f);
  texte(ctx, D.titre, cx, 110 * f, `500 ${px(30)} ${p.mono}`, c.encre, f, 10);
  texte(ctx, D.cepages[0], cx, 220 * f, `italic 400 ${px(76)} ${p.ital}`, c.encre, f);
  texte(ctx, D.cepages[1], cx, 310 * f, `italic 400 ${px(76)} ${p.ital}`, c.encre, f);
  texte(ctx, D.mentions[0], cx, 420 * f, `500 ${px(22)} ${p.mono}`, c.gris, f, 3);
  texte(ctx, D.mentions[1], cx, 460 * f, `500 ${px(22)} ${p.mono}`, c.gris, f, 3);
  // Pictogramme femme enceinte : cercle barré (forme simplifiée, vitrine fictive).
  ctx.strokeStyle = c.encre;
  ctx.lineWidth = 5 * f;
  ctx.beginPath(); ctx.arc(cx, 610 * f, 70 * f, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 50 * f, 660 * f); ctx.lineTo(cx + 50 * f, 560 * f); ctx.stroke();
  texte(ctx, D.sulfites, cx, 750 * f, `500 ${px(24)} ${p.mono}`, c.gris, f, 4);
  texte(ctx, D.sanitaire[0], cx, 812 * f, `400 ${px(22)} ${p.mono}`, c.gris, f, 1);
  texte(ctx, D.sanitaire[1], cx, 844 * f, `400 ${px(22)} ${p.mono}`, c.gris, f, 1);
}
