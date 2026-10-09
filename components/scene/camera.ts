// components/scene/camera.ts — caméra de la scène (design-spec §4.1).
// Perspective fov 28°, posée à z = 5,3 et visant l'origine : la hauteur visible dans le plan z = 0
// vaut 2 × 5,3 × tan(14°) = 2,643 u. La bouteille (1,904 u) y occupe donc 72 % de la hauteur à s = 1,
// comme --hauteur-bouteille. Les poses du moteur sont en pixels : 1 px = 2,643 / hauteur du canvas.
export const CAMERA = { fov: 28, z: 5.3, near: 0.1, far: 50 } as const;

/** Hauteur visible (u) dans le plan z = 0. */
export const HAUTEUR_VISIBLE = 2 * CAMERA.z * Math.tan((CAMERA.fov / 2) * (Math.PI / 180));

/** Unités monde par pixel CSS, pour un canvas de hauteur `hauteurPx`. */
export const uniteParPixel = (hauteurPx: number) => HAUTEUR_VISIBLE / Math.max(1, hauteurPx);
