// scripts/verifier-poses.ts — vérification minimale du moteur de poses (sans navigateur).
// Lancer : npm run verifier   (Node 22.18+ exécute le TypeScript directement)
import assert from "node:assert/strict";
import { poseAuScroll, poseCible, taux, verse, opaciteCible, calculerAncres, type Pose, type PoseChapitre } from "../lib/poses.ts";

const vue = { l: 1440, h: 900 };
const base = 0.72 * vue.h;
const poses: PoseChapitre[] = [{ r: -18, label: 0 }, { label: 2 }, { dock: true }];
const ancres = [0, 1000, 2000];
const slot = { left: 700, top: 1500, width: 40, height: 144 };
const cible = (i: number): Pose => poseCible(poses[i], vue, slot, base);

// Palier de maintien : jusqu'à 18 % du segment, on reste sur la pose de départ.
assert.equal(taux(150, 0, 1000, false), 0);
assert.equal(taux(850, 0, 1000, false), 1);
assert.equal(taux(500, 0, 1000, false), 0.5);
// Mouvement réduit : bascule franche, pas de valeur intermédiaire.
assert.equal(taux(400, 0, 1000, true), 0);
assert.equal(taux(600, 0, 1000, true), 1);

// Avant la première ancre : pose du hero. Au milieu : interpolation.
assert.equal(poseAuScroll(-50, ancres, cible, false).pose.r, -18);
const milieu = poseAuScroll(500, ancres, cible, false);
assert.equal(milieu.pose.r, -9);
assert.equal(milieu.pose.label, 1);

// Pose dock : centrée sur le slot, échelle = hauteur du slot / hauteur de base.
const dock = poseAuScroll(5000, ancres, cible, false).pose;
assert.equal(dock.x, 700 + 20 - 720);
assert.equal(dock.y, 1500 + 72 - 450);
assert.ok(Math.abs(dock.s - 144 / base) < 1e-9);

// Mobile : bouteille presque centrée et réduite.
const mob = poseCible({ x: 0.4, s: 1 }, { l: 375, h: 812 }, null, 500);
assert.ok(Math.abs(mob.x - 0.4 * 375 * 0.1) < 1e-9);
assert.equal(mob.s, 1);   // la réduction mobile vient de la hauteur de base (46svh)

// Versé : bouteille droite → goulot au-dessus du centre ; renversée à 180° → en dessous.
const droite = verse({ x: 0, y: 0, r: 0, ry: 0, s: 1, label: 0, sil: 0, pour: 0, o: 1 }, vue, base, 0);
assert.ok(droite.goulotY < vue.h / 2);
const renversee = verse({ x: 0, y: 0, r: 180, ry: 0, s: 1, label: 0, sil: 0, pour: 1, o: 1 }, vue, base, 0.5);
assert.ok(renversee.goulotY > vue.h / 2 && renversee.filet);

// Mobile, au versé : le verre (≈ 0,12·h de large) doit rester dans l'écran.
const vm = { l: 375, h: 812 };
const pm = poseCible({ x: 0.15, y: -0.17, r: -112, s: 0.78, pour: 1 }, vm, null, 0.46 * vm.h);
const gm = verse(pm, vm, 0.46 * vm.h, 0.5);
assert.ok(gm.goulotX - gm.verreHauteur / 4 > 0, `verre hors écran (goulot à ${gm.goulotX})`);
assert.ok(gm.surface < vm.h, "surface du vin sous l'écran");
// Desktop : verre = 1/3 de la bouteille de base, soit 24vh pour une bouteille de 72vh (wireframe).
assert.ok(Math.abs(verse(pm, vue, base, 0).verreHauteur - 0.24 * vue.h) < 1e-9);

// Opacité (addendum §1) : jamais interpolée ; invisible pendant tout segment dont un bout est invisible.
assert.equal(opaciteCible(0.1, 1, 0), 1);     // palier de départ : encore visible
assert.equal(opaciteCible(0.5, 1, 0), 0);     // en route vers une pose effacée : déjà invisible
assert.equal(opaciteCible(0.5, 0, 1), 0);     // de IX vers X : se déplace invisible…
assert.equal(opaciteCible(0.9, 0, 1), 1);     // …et réapparaît déjà posée
const poO: PoseChapitre[] = [{ r: 90, s: 0.4 }, { r: 90, s: 0.4, o: 0 }];
const cO = (i: number): Pose => poseCible(poO[i], vue, null, base);
const mi = poseAuScroll(500, [0, 1000], cO, false).pose;
assert.equal(mi.o, 0);
assert.equal(mi.r, 90);                       // poses identiques : la bouteille ne bouge pas en s'effaçant

// Chapitre épinglé : deux ancres = début et fin d'épinglage ; sans épinglage, deux ancres collées au centre.
const mesures = [
  { haut: 0, hauteur: 900, double: false, pin: null },
  { haut: 2000, hauteur: 4590, double: true, pin: { debut: 2000, fin: 5690 } },
  { haut: 6590, hauteur: 900, double: false, pin: null },
];
assert.deepEqual(calculerAncres(mesures, 900), [0, 2000, 5690, 6590]);
const mobile = calculerAncres([mesures[0], { ...mesures[1], pin: null }, mesures[2]], 900);
assert.deepEqual(mobile, [0, 3845, 3846, 6590]);

console.log("verifier-poses : OK");
