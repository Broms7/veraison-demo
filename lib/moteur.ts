// lib/moteur.ts — moteur de poses, partie RUNTIME (navigateur uniquement).
// Une seule boucle pour tout le site : gsap.ticker. À chaque frame, dans cet ordre :
//   1. Lenis avance le scroll lissé ;
//   2. on calcule la pose de la bouteille (lib/poses.ts) avec le scroll de CETTE frame ;
//   3. les abonnés (rail, sceau, image de repli, canvas 3D) appliquent la pose.
// Le canvas R3F est en frameloop="never" et rendu ici même : il ne peut donc jamais
// avoir une frame de retard sur le DOM — indispensable pour que l'ancrage dans le slot ne tremble pas.
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  poseAuScroll, poseCible, remplissage, verse, borne,
  type Pose, type PoseChapitre, type Verse, type Vue,
} from "./poses";

const POSE_NEUTRE: Pose = { x: 0, y: 0, r: 0, ry: 0, s: 1, label: 0, sil: 0, pour: 0 };

/** État partagé, muté en place à chaque frame (jamais de setState React : 60 fois par seconde). */
export const etat = {
  pose: { ...POSE_NEUTRE } as Pose,
  vue: { l: 1, h: 1 } as Vue,
  verse: null as Verse | null,
  remplissage: 0,
  hauteurBase: 1,      // hauteur de la bouteille à l'échelle 1, en px (lue sur #bouteille-repli)
  progression: 0,      // 0 → 1 sur toute la page (rail « niveau »)
  sy: 0,
  courant: 0,          // index du chapitre courant
  reduit: false,
  version: 0,          // incrémentée quand quelque chose de visible a changé
  animerJusqua: 0,     // horodatage (ms) : rendre chaque image jusque-là (tween du tampon ④)
  bouteillePrete: false, // étiquettes dessinées : le canvas peut remplacer l'image de repli
};

type Abonne = (tempsMs: number) => void;
const abonnes = new Set<Abonne>();

/** S'abonner à la boucle. Retourne la fonction de désabonnement (à appeler au démontage). */
export function abonner(fn: Abonne): () => void {
  abonnes.add(fn);
  return () => { abonnes.delete(fn); };
}

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

/** Démarre le moteur. Appelé une fois par <MoteurPoses />. Retourne le nettoyage. */
export function demarrerMoteur(): () => void {
  gsap.registerPlugin(ScrollTrigger);
  etat.reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Lenis = défilement lissé, désactivé si l'utilisateur réduit les animations.
  // autoRaf: false → c'est gsap.ticker qui le fait avancer (une seule boucle).
  lenis = etat.reduit ? null : new Lenis({ autoRaf: false, lerp: 0.09, anchors: true });
  lenis?.on("scroll", ScrollTrigger.update);

  // Les chapitres déclarent leur pose dans data-pose (cf. components/chapitres/Chapitre.tsx).
  const chapitres = [...document.querySelectorAll<HTMLElement>("[data-pose]")];
  const poses: PoseChapitre[] = chapitres.map((el) => JSON.parse(el.dataset.pose ?? "{}") as PoseChapitre);
  const iVerse = poses.findIndex((p) => (p.pour ?? 0) > 0);
  const slot = document.getElementById("slot");
  const gabarit = document.getElementById("bouteille-repli");
  let ancres: number[] = [];

  // Ancre = scroll où le chapitre est centré dans la fenêtre (le hero : 0).
  function mesurer() {
    etat.vue = { l: innerWidth, h: innerHeight };
    etat.hauteurBase = gabarit?.offsetHeight || innerHeight * 0.72;
    ancres = chapitres.map((el, i) => {
      if (i === 0) return 0;
      const r = el.getBoundingClientRect();
      return r.top + scrollY + r.height / 2 - innerHeight / 2;
    });
    etat.version++;
  }

  let signature = "";
  function calculer() {
    const sy = scrollY;
    const cible = (i: number) =>
      poseCible(poses[i], etat.vue, poses[i].dock && slot ? slot.getBoundingClientRect() : null, etat.hauteurBase);
    const { pose, courant } = chapitres.length ? poseAuScroll(sy, ancres, cible, etat.reduit) : { pose: POSE_NEUTRE, courant: 0 };
    etat.pose = pose;
    etat.courant = courant;
    etat.sy = sy;
    etat.remplissage = remplissage(sy, iVerse >= 0 ? ancres[iVerse] : null, etat.vue.h, etat.reduit, pose.pour);
    etat.verse = verse(pose, etat.vue, etat.hauteurBase, etat.remplissage);
    etat.progression = borne(sy / Math.max(1, document.documentElement.scrollHeight - innerHeight));
    // Signature arrondie : si rien n'a bougé au pixel près, le canvas ne se redessine pas.
    const sig = `${Math.round(pose.x)}|${Math.round(pose.y)}|${pose.r.toFixed(1)}|${pose.ry.toFixed(1)}|${pose.s.toFixed(3)}|${pose.label.toFixed(2)}|${pose.sil.toFixed(2)}|${etat.remplissage.toFixed(3)}`;
    if (sig !== signature) { signature = sig; etat.version++; }
  }

  function tick(temps: number) {
    lenis?.raf(temps * 1000);
    calculer();
    const ms = temps * 1000;
    abonnes.forEach((fn) => fn(ms));
  }

  // En développement, l'état est lisible depuis la console (window.__veraison) pour mesurer au pixel.
  if (process.env.NODE_ENV !== "production") Object.assign(window, { __veraison: etat });

  mesurer();
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // Ancres recalculées au resize, après les polices, au load, et à tout changement de hauteur de page.
  addEventListener("resize", mesurer);
  addEventListener("load", mesurer);
  document.fonts?.ready.then(mesurer);
  const ro = new ResizeObserver(mesurer);
  ro.observe(document.body);

  return () => {
    gsap.ticker.remove(tick);
    removeEventListener("resize", mesurer);
    removeEventListener("load", mesurer);
    ro.disconnect();
    lenis?.destroy();
    lenis = null;
  };
}
