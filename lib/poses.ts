// lib/poses.ts — moteur de poses, partie PURE (aucun accès au DOM).
// Portage de la logique du wireframe (mesurer / cible / rendre) :
//  - chaque chapitre déclare une POSE (position, rotations, échelle, étape d'étiquette...) ;
//  - « ancre » d'un chapitre = position de scroll où il est centré dans la fenêtre ;
//  - entre deux ancres, on interpole les deux poses, avec un palier de maintien
//    (t remappé sur [0.18, 0.82] puis smoothstep) pour que la bouteille se pose.
// La bouteille ne suit jamais le flux de la page : le scroll la POSITIONNE.
// Pas d'alias "@/" ni d'import runtime ici : le fichier est vérifié en Node par scripts/verifier-poses.ts.

/** Pose résolue, en pixels CSS (x, y depuis le centre de la fenêtre, y vers le bas). */
export interface Pose {
  x: number;      // décalage horizontal (px)
  y: number;      // décalage vertical (px, vers le bas)
  r: number;      // inclinaison dans le plan de l'écran (degrés, sens horaire comme CSS rotate)
  ry: number;     // rotation autour de l'axe de la bouteille (degrés)
  s: number;      // échelle (1 = hauteur de base, cf. --hauteur-bouteille)
  label: number;  // étape d'écriture de l'étiquette, 0 (vierge) à 4 (complète), fractionnaire
  sil: number;    // contre-jour, 0 à 1
  pour: number;   // versé, 0 à 1
  o: number;      // opacité CIBLE, 0 ou 1 : jamais interpolée au scroll (fondu temporel côté rendu)
}

/** Pose déclarée par un chapitre : x et y en fraction de la fenêtre, ou ancrage dans le slot DOM.
 *  `pin` : le chapitre est épinglé et fournit DEUX ancres (début et fin d'épinglage) avec la même pose. */
export type PoseChapitre = Partial<Pose> & { dock?: boolean; pin?: boolean };

export interface Vue { l: number; h: number }          // largeur, hauteur de la fenêtre
export interface Rect { left: number; top: number; width: number; height: number }

export const CLES = ["x", "y", "r", "ry", "s", "label", "sil", "pour"] as const;   // sans `o` : voir opaciteCible
export const LARGEUR_MOBILE = 760;   // en dessous : chorégraphie simplifiée
const MOBILE_X = 0.1;                // la bouteille reste presque centrée…
const MOBILE_VERSE_X = 0.22;         // au versé, décalage à droite : sinon le verre sort de l'écran à gauche

export const borne = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lisse = (t: number) => t * t * (3 - 2 * t); // smoothstep

/** Pose cible d'un chapitre, en pixels. La pose « dock » se lit en direct sur le rect du slot :
 *  comme le slot défile, la cible défile avec lui — c'est ce qui « ancre » la bouteille. */
export function poseCible(p: PoseChapitre, vue: Vue, slot: Rect | null, hauteurBase: number): Pose {
  if (p.dock && slot) {
    return {
      x: slot.left + slot.width / 2 - vue.l / 2,
      y: slot.top + slot.height / 2 - vue.h / 2,
      r: 0, ry: 360, s: slot.height / hauteurBase, label: 4, sil: 0, pour: 0, o: 1,
    };
  }
  const mobile = vue.l < LARGEUR_MOBILE;
  return {
    x: mobile
      ? ((p.x ?? 0) * MOBILE_X + (p.pour ?? 0) * MOBILE_VERSE_X) * vue.l
      : (p.x ?? 0) * vue.l,
    y: (p.y ?? 0) * vue.h,
    r: p.r ?? 0,
    ry: p.ry ?? 0,
    s: p.s ?? 1,   // sur mobile, la réduction vient de --hauteur-bouteille (46svh), pas d'ici
    label: p.label ?? 0,
    sil: p.sil ?? 0,
    pour: p.pour ?? 0,
    o: p.o ?? 1,
  };
}

/** Opacité cible sur un segment A → B (addendum §1) : u = avancement BRUT (sans palier) du segment.
 *  On garde l'opacité de A jusqu'à 18 %, celle de B dès 82 %, et entre les deux la plus faible :
 *  la bouteille est invisible pendant tout déplacement dont un bout est invisible. */
export function opaciteCible(u: number, a: number, b: number): number {
  return u <= 0.18 ? a : u >= 0.82 ? b : Math.min(a, b);
}

/** Taux d'avancement entre deux ancres, avec palier de maintien.
 *  En mouvement réduit : pas d'interpolation, la pose bascule d'un coup à mi-chemin. */
export function taux(sy: number, a: number, b: number, reduit: boolean): number {
  const t = lisse(borne(((sy - a) / (b - a) - 0.18) / 0.64));
  return reduit ? (t < 0.5 ? 0 : 1) : t;
}

export function interpoler(A: Pose, B: Pose, t: number): Pose {
  const P = { ...A };
  for (const k of CLES) P[k] = A[k] + (B[k] - A[k]) * t;
  return P;
}

/** Pose courante pour un scroll donné. `cible(i)` est appelée à la demande (la pose dock lit le DOM). */
export function poseAuScroll(
  sy: number, ancres: number[], cible: (i: number) => Pose, reduit: boolean,
): { pose: Pose; courant: number } {
  const n = ancres.length;
  if (n === 0) return { pose: cible(0), courant: 0 };
  if (sy <= ancres[0]) return { pose: cible(0), courant: 0 };
  if (sy >= ancres[n - 1]) return { pose: cible(n - 1), courant: n - 1 };
  let i = 0;
  while (sy >= ancres[i + 1]) i++;
  const t = taux(sy, ancres[i], ancres[i + 1], reduit);
  const A = cible(i), B = cible(i + 1);
  const pose = interpoler(A, B, t);
  pose.o = opaciteCible((sy - ancres[i]) / (ancres[i + 1] - ancres[i]), A.o, B.o);
  return { pose, courant: t < 0.5 ? i : i + 1 };
}

/** Géométrie du versé, en pixels écran (origine en haut à gauche). */
export interface Verse {
  goulotX: number; goulotY: number;   // bout du goulot
  verreHaut: number;                  // haut du verre (bord de la coupe)
  verreHauteur: number;               // hauteur totale du verre
  surface: number;                    // surface du vin dans le verre
  opaciteVerre: number;
  filet: boolean;                     // le filet coule-t-il ?
}

/** Repère du verre (viewBox 60 × 120 du wireframe) : le vin monte de 60 (fond du calice) à 30 (mi-calice).
 *  Le verre fait 1/3 de la bouteille de base, et son bord est à 0,1389 × hauteur de base sous le goulot
 *  (= 24vh et 10vh du wireframe quand la bouteille fait 72vh). */
export const VERRE = { tiersBouteille: 1 / 3, ecartSousGoulot: 0.1 / 0.72, fond: 60, plein: 30, repere: 120 };

/** Taux de remplissage du verre : suit le scroll autour de l'ancre du chapitre « verse ». */
export function remplissage(sy: number, ancreVerse: number | null, vueH: number, reduit: boolean, pour: number): number {
  if (ancreVerse === null) return 0;
  if (reduit) return pour >= 0.99 ? 1 : 0;
  return borne((sy - (ancreVerse - vueH * 0.35)) / (vueH * 0.55));
}

/** Position du goulot = centre + demi-hauteur tournée de r ; le verre se place sous le goulot. */
export function verse(P: Pose, vue: Vue, hauteurBase: number, rempli: number): Verse {
  const h = (hauteurBase * P.s) / 2 * 0.98;
  const a = (P.r * Math.PI) / 180;
  const goulotX = vue.l / 2 + P.x + h * Math.sin(a);
  const goulotY = vue.h / 2 + P.y - h * Math.cos(a);
  const verreHauteur = hauteurBase * VERRE.tiersBouteille;
  const verreHaut = goulotY + hauteurBase * VERRE.ecartSousGoulot;
  const niveau = VERRE.fond - rempli * (VERRE.fond - VERRE.plein);
  const surface = verreHaut + (niveau / VERRE.repere) * verreHauteur;
  return {
    goulotX, goulotY, verreHaut, verreHauteur, surface,
    opaciteVerre: borne((P.pour - 0.5) * 2),
    filet: P.pour > 0.92 && rempli > 0 && rempli < 0.99,
  };
}

/** Mesure d'un chapitre pour le calcul des ancres. `pin` = début et fin d'épinglage (positions de scroll),
 *  fournis par le ScrollTrigger du chapitre quand il est réellement épinglé ; sinon null. */
export interface MesureChapitre { haut: number; hauteur: number; double: boolean; pin: { debut: number; fin: number } | null }

/** Ancres de toutes les entrées : 1 par chapitre, 2 pour un chapitre `pin` (début, fin).
 *  Hors épinglage (mobile, mouvement réduit), un chapitre `pin` garde deux ancres collées au centre,
 *  pour que l'indexation des entrées ne change pas. Le premier chapitre (le hero) est ancré à 0. */
export function calculerAncres(mesures: MesureChapitre[], vueH: number): number[] {
  const ancres: number[] = [];
  mesures.forEach((m, i) => {
    const centre = i === 0 ? 0 : m.haut + m.hauteur / 2 - vueH / 2;
    if (!m.double) { ancres.push(centre); return; }
    if (m.pin) ancres.push(m.pin.debut, Math.max(m.pin.debut + 1, m.pin.fin));
    else ancres.push(centre, centre + 1);
  });
  return ancres;
}
