// lib/etiquette.ts — dessin de l'étiquette et de la contre-étiquette sur un canvas 2D.
// Fonctions pures (ne lisent que leurs arguments) : la texture R3F appelle dessinerEtiquette
// à chaque changement d'étape, et la même fonction pourra servir à un export image.
// Coordonnées reprises du SVG du wireframe : l'étiquette avant fait 120 unités de haut
// (y 196 → 316), la contre-étiquette 86 (y 214 → 300). 1 unité = H / hauteur en px canvas.
// Le texte de l'étiquette n'est pas traduit : c'est la bouteille réelle, avec ses mentions françaises.

export interface ThemeEtiquette {
  polices: { titre: string; ital: string; mono: string };   // familles CSS (ex. "'Anton', 'Anton Fallback'")
  couleurs: { papier: string; encre: string; vin: string; gris: string; filet: string };
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
    mentions: ["VENDANGE MANUELLE · 18 MOIS", "EN BARRIQUE · NON FILTRÉ"],
    sulfites: "CONTIENT DES SULFITES",
  },
};

/** Taille des canvas : le rapport largeur / hauteur suit l'arc du cylindre (cf. Bouteille.tsx). */
export const CANVAS_AVANT = { l: 640, h: 1018, unites: 120 };
export const CANVAS_DOS = { l: 640, h: 922, unites: 86 };

const borne = (v: number) => Math.min(1, Math.max(0, v));

/** Écrit une ligne centrée. y et taille en unités d'étiquette, interlettrage en unités. */
function ligne(
  ctx: CanvasRenderingContext2D, u: number, texte: string, y: number,
  police: string, taille: number, couleur: string, interlettre = 0, style = "",
) {
  ctx.font = `${style} ${taille * u}px ${police}`.trim();
  ctx.fillStyle = couleur;
  ctx.letterSpacing = `${interlettre * u}px`;
  ctx.fillText(texte, ctx.canvas.width / 2, y * u);
}

/**
 * Étiquette avant. `etape` va de 0 (vierge) à 4 (complète) et peut être fractionnaire :
 * chaque bloc apparaît en fondu entre deux étapes entières, comme dans le wireframe.
 *  ① domaine + nom de la cuvée  ② millésime + appellation  ③ degré + mise  ④ numéro
 */
export function dessinerEtiquette(ctx: CanvasRenderingContext2D, etape: number, theme: ThemeEtiquette): void {
  const { l, h } = { l: ctx.canvas.width, h: ctx.canvas.height };
  const u = h / CANVAS_AVANT.unites;
  const { polices: p, couleurs: c } = theme;
  const T = TEXTE_ETIQUETTE;

  ctx.globalAlpha = 1;
  ctx.fillStyle = c.papier;
  ctx.fillRect(0, 0, l, h);
  // Filet intérieur, toujours présent : l'étiquette « vierge » est un cadre vide.
  ctx.strokeStyle = c.vin;
  ctx.lineWidth = 0.35 * u;
  ctx.strokeRect(2.5 * u, 2.5 * u, l - 5 * u, h - 5 * u);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const blocs: Array<() => void> = [
    () => {
      ligne(ctx, u, T.domaine, 14, p.mono, 3.1, c.encre, 0.5);
      ligne(ctx, u, T.cuvee, 39, p.titre, 15, c.vin);
    },
    () => {
      ligne(ctx, u, T.millesime, 58, p.ital, 11, c.encre, 0, "italic");
      ligne(ctx, u, T.appellation, 69, p.mono, 2.5, c.gris, 0.3);
    },
    () => {
      ctx.strokeStyle = c.filet;
      ctx.lineWidth = 0.4 * u;
      ctx.beginPath();
      ctx.moveTo(l / 2 - 20 * u, 80 * u);
      ctx.lineTo(l / 2 + 20 * u, 80 * u);
      ctx.stroke();
      ligne(ctx, u, T.degre, 90, p.mono, 2.7, c.encre, 0.3);
      ligne(ctx, u, T.mise, 97, p.mono, 2.2, c.gris, 0.3);
    },
    () => ligne(ctx, u, T.numero, 111, p.ital, 6, c.vin, 0, "italic"),
  ];
  blocs.forEach((dessiner, k) => {
    const alpha = borne(etape - k);
    if (alpha <= 0) return;
    ctx.globalAlpha = alpha;
    dessiner();
  });
  ctx.globalAlpha = 1;
  ctx.letterSpacing = "0px";
}

/** Contre-étiquette : assemblage et mentions légales (pictogramme femme enceinte, sulfites). */
export function dessinerContreEtiquette(ctx: CanvasRenderingContext2D, theme: ThemeEtiquette): void {
  const { l, h } = { l: ctx.canvas.width, h: ctx.canvas.height };
  const u = h / CANVAS_DOS.unites;
  const { polices: p, couleurs: c } = theme;
  const D = TEXTE_ETIQUETTE.dos;

  ctx.globalAlpha = 1;
  ctx.fillStyle = c.papier;
  ctx.fillRect(0, 0, l, h);
  ctx.textAlign = "center";
  ligne(ctx, u, D.titre, 12, p.mono, 2.6, c.encre, 0.4);
  ligne(ctx, u, D.cepages[0], 24, p.ital, 5, c.encre, 0, "italic");
  ligne(ctx, u, D.cepages[1], 32, p.ital, 5, c.encre, 0, "italic");
  ligne(ctx, u, D.mentions[0], 49, p.mono, 2.2, c.gris);
  ligne(ctx, u, D.mentions[1], 54, p.mono, 2.2, c.gris);

  // Pictogramme femme enceinte (mention obligatoire en France) : cercle barré.
  // Silhouette simplifiée — à remplacer par le pictogramme officiel en phase 2.
  const cx = l / 2, cy = 70 * u, r = 6 * u;
  ctx.strokeStyle = c.encre;
  ctx.lineWidth = 0.6 * u;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx - 0.6 * u, cy - 3 * u, 1 * u, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx + 0.4 * u, cy + 0.8 * u, 1.6 * u, 2.4 * u, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 4.2 * u, cy + 4.2 * u); ctx.lineTo(cx + 4.2 * u, cy - 4.2 * u); ctx.stroke();

  ligne(ctx, u, D.sulfites, 82, p.mono, 1.9, c.gris);
  ctx.letterSpacing = "0px";
}
