"use client";
// components/scene/Bouteille.tsx — la bouteille 3D, sa capsule et ses deux étiquettes (design-spec §4).
// Repère du modèle : hauteur H = 1,904 u, centré à l'origine (axe Y vers le haut), comme le GLB Meshy.
// La pose du moteur est en pixels écran ; `k` (u par px) la convertit dans le monde 3D.
// Modèle : GLB Meshy si présent (public/models/bouteille.glb), sinon profil procédural (repli).
// Les matériaux sont TOUJOURS ceux du site (aperçu validé), jamais ceux du fichier.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { etat } from "@/lib/moteur";
import { lireToken } from "@/lib/tokens";
import { BASE_AVANT, BASE_DOS, dessinerContreEtiquette, dessinerEtiquette, type ThemeEtiquette } from "@/lib/etiquette";
import { creerCapsule, creerEtiquetteAvant, creerVerre, type CouleursScene } from "./materiaux";
import { uniteParPixel } from "./camera";

export const H = 1.904;                       // hauteur du modèle (u)
const BAS = -H / 2;
const COUPE_CAPSULE = BAS + H * 0.8;          // la capsule couvre les 20 % du haut (§4.6)
const ARC_AVANT = THREE.MathUtils.degToRad(134);
const ARC_DOS = THREE.MathUtils.degToRad(100);
const deg = THREE.MathUtils.degToRad;

interface Forme { geo: THREE.BufferGeometry; R: number }

/** Convertit les attributs quantifiés (entiers normalisés) en flottants, pour pouvoir transformer la géométrie. */
function versFlottants(source: THREE.BufferGeometry): THREE.BufferGeometry {
  const geo = source.clone();
  for (const nom of Object.keys(geo.attributes)) {
    const a = geo.getAttribute(nom) as THREE.BufferAttribute;
    const tab = new Float32Array(a.count * a.itemSize);
    for (let i = 0; i < a.count; i++) {
      for (let c = 0; c < a.itemSize; c++) tab[i * a.itemSize + c] = a.getComponent(i, c);
    }
    geo.setAttribute(nom, new THREE.BufferAttribute(tab, a.itemSize));
  }
  return geo;
}

/** Recentre et met à l'échelle une géométrie à la hauteur H ; mesure le rayon du corps. */
function normaliser(geo: THREE.BufferGeometry): Forme {
  geo.computeBoundingBox();
  const b = geo.boundingBox as THREE.Box3;
  const centre = b.getCenter(new THREE.Vector3());
  const taille = b.getSize(new THREE.Vector3());
  geo.translate(-centre.x, -centre.y, -centre.z);
  const k = H / taille.y;
  geo.scale(k, k, k);
  // Le corps est la partie la plus large : son rayon = demi-largeur de la boîte.
  return { geo, R: (Math.max(taille.x, taille.z) / 2) * k };
}

/** Profil procédural (repli sans GLB), tiré du SVG du wireframe : rayon, hauteur vers le haut. */
function formeProcedurale(): Forme {
  const v2 = (x: number, y: number) => new THREE.Vector2(x, y);
  const pied = new THREE.QuadraticBezierCurve(v2(24, -178), v2(34, -178), v2(34, -168)).getPoints(8);
  const epaule = new THREE.CubicBezierCurve(v2(34, 35), v2(34, 62), v2(7, 68), v2(7, 85)).getPoints(24);
  return normaliser(new THREE.LatheGeometry([v2(0, -178), ...pied, ...epaule, v2(7, 180), v2(0, 180)], 72));
}

/** Forme issue du GLB Meshy (suspend pendant le chargement : le parent est sous <Suspense>). */
function BouteilleGLB({ url, mobile }: { url: string; mobile: boolean }) {
  const { scene } = useGLTF(url);
  const forme = useMemo(() => {
    const maillage = scene.getObjectByProperty("type", "Mesh") as THREE.Mesh;
    maillage.updateWorldMatrix(true, false);
    const geo = versFlottants(maillage.geometry);
    geo.applyMatrix4(maillage.matrixWorld);   // la quantification range une échelle dans le nœud
    return normaliser(geo);
  }, [scene]);
  useEffect(() => () => forme.geo.dispose(), [forme]);   // la géométrie clonée est à nous : on la libère
  return <Corps forme={forme} mobile={mobile} />;
}

/** Forme procédurale : repli quand aucun GLB n'est déposé. */
function BouteilleProcedurale({ mobile }: { mobile: boolean }) {
  const forme = useMemo(() => formeProcedurale(), []);
  useEffect(() => () => forme.geo.dispose(), [forme]);
  return <Corps forme={forme} mobile={mobile} />;
}

export function Bouteille({ modele, mobile }: { modele: string | null; mobile: boolean }) {
  return modele ? <BouteilleGLB url={modele} mobile={mobile} /> : <BouteilleProcedurale mobile={mobile} />;
}

function couleursScene(): CouleursScene {
  return {
    verre: lireToken("--3d-verre"), sheen: lireToken("--3d-verre-sheen"), contrejour: lireToken("--3d-verre-contrejour"),
    capsule: lireToken("--3d-capsule"), lisere: lireToken("--3d-lisere"),
    etiquette: lireToken("--3d-etiquette"), etiquetteContrejour: lireToken("--3d-etiquette-contrejour"),
  };
}

function themeEtiquette(): ThemeEtiquette {
  return {
    polices: { titre: lireToken("--police-titre"), ital: lireToken("--police-ital"), mono: lireToken("--police-mono") },
    couleurs: {
      papier: lireToken("--3d-etiquette"), encre: lireToken("--encre"), vin: lireToken("--vin"),
      gris: lireToken("--gris"), filet: lireToken("--3d-etiquette-filet"), oxyde: lireToken("--oxyde"),
    },
  };
}

/** Attend les quatre graisses utilisées par les canvas : sinon la police de secours s'imprime. */
async function chargerPolices(t: ThemeEtiquette) {
  await Promise.all([
    `900 100px ${t.polices.titre}`, `500 100px ${t.polices.mono}`, `400 100px ${t.polices.mono}`, `italic 400 100px ${t.polices.ital}`,
  ].map((f) => document.fonts.load(f).catch(() => [])));
}

function creerCanvas(l: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = l;
  canvas.height = h;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { ctx: canvas.getContext("2d") as CanvasRenderingContext2D, tex };
}

/** Corps commun : verre, capsule, étiquettes, et application de la pose à chaque image. */
function Corps({ forme, mobile }: { forme: Forme; mobile: boolean }) {
  const groupe = useRef<THREE.Group>(null);
  const tampon = useRef(0);   // avancement du tampon ④ (0 → 1)

  // Matériaux et étiquettes, créés une fois. Plan de coupe de la capsule en repère LOCAL,
  // recopié chaque image en repère monde (la bouteille bouge, le plan doit la suivre).
  const res = useMemo(() => {
    const c = couleursScene();
    const echelle = mobile ? 1 : 2;   // canvas 1024 × 1280 sur mobile, 2048 × 2560 sur desktop
    const avant = creerCanvas(BASE_AVANT.l * echelle, BASE_AVANT.h * echelle);
    const dos = creerCanvas(BASE_DOS.l * echelle, BASE_DOS.h * echelle);
    const planLocal = new THREE.Plane(new THREE.Vector3(0, 1, 0), -COUPE_CAPSULE);
    const planMonde = planLocal.clone();
    const verre = creerVerre(c);
    const etiquette = creerEtiquetteAvant(avant.tex, c);
    return {
      c, avant, dos, planLocal, planMonde, verre, etiquette,
      capsule: creerCapsule(c, planMonde),
      matDos: new THREE.MeshStandardMaterial({ map: dos.tex, roughness: 0.92, metalness: 0, polygonOffset: true, polygonOffsetFactor: -1 }),
      couleurVerre: new THREE.Color(c.verre),
      couleurContrejour: new THREE.Color(c.contrejour),
      blanc: new THREE.Color("#ffffff"),
      etiquetteNuit: new THREE.Color(c.etiquetteContrejour),
    };
  }, [mobile]);

  // Géométries des étiquettes, sur le rayon réel du modèle (+0,0015 u pour ne pas toucher le verre).
  const geoEtiquettes = useMemo(() => {
    const r = forme.R + 0.0015;
    const largeurAvant = forme.R * ARC_AVANT;
    const largeurDos = forme.R * ARC_DOS;
    return {
      // θ = 0 pointe vers +Z : l'étiquette est face caméra quand ry = 0. Centre à 33 % de la hauteur.
      avant: new THREE.CylinderGeometry(r, r, largeurAvant / 0.8, 64, 1, true, -ARC_AVANT / 2, ARC_AVANT).translate(0, BAS + H * 0.33, 0),
      dos: new THREE.CylinderGeometry(r, r, (largeurDos * 9) / 7, 48, 1, true, Math.PI - ARC_DOS / 2, ARC_DOS).translate(0, BAS + H * 0.33 - 0.02, 0),
    };
  }, [forme]);

  // Dessin des deux étiquettes, une seule fois, après chargement des polices.
  useEffect(() => {
    let annule = false;
    const theme = themeEtiquette();
    chargerPolices(theme).then(() => {
      if (annule) return;
      dessinerEtiquette(res.avant.ctx, theme);
      dessinerContreEtiquette(res.dos.ctx, theme);
      res.avant.tex.needsUpdate = true;
      res.dos.tex.needsUpdate = true;
      etat.bouteillePrete = true;
      etat.version++;
    });
    return () => { annule = true; };
  }, [res]);

  // Libération GPU au démontage.
  useEffect(() => () => {
    Object.values(geoEtiquettes).forEach((g) => g.dispose());
    [res.verre.materiau, res.capsule, res.etiquette.materiau, res.matDos].forEach((m) => m.dispose());
    res.avant.tex.dispose();
    res.dos.tex.dispose();
  }, [res, geoEtiquettes]);

  useFrame((state, delta) => {
    const g = groupe.current;
    if (!g) return;
    const P = etat.pose;
    const k = uniteParPixel(state.size.height);
    // Pose : y CSS vers le bas → y monde vers le haut ; rotate CSS horaire → rotation z négative.
    // Ordre ZYX : la bouteille tourne d'abord sur son axe (ry), puis s'incline (r).
    g.position.set(P.x * k, -P.y * k, 0);
    g.rotation.set(0, deg(P.ry), -deg(P.r), "ZYX");
    g.scale.setScalar((etat.hauteurBase * P.s * k) / H);
    g.updateMatrixWorld();
    res.planMonde.copy(res.planLocal).applyMatrix4(g.matrixWorld);

    // Contre-jour (§4.2, §4.4) : verre assombri, liseré, étiquette éteinte.
    const sil = P.sil;
    res.verre.uniforms.uSil.value = sil;
    res.verre.materiau.color.copy(res.couleurVerre).lerp(res.couleurContrejour, sil);
    res.verre.materiau.envMapIntensity = 1.3 - 0.8 * sil;
    res.etiquette.materiau.color.copy(res.blanc).lerp(res.etiquetteNuit, sil);
    res.matDos.color.copy(res.etiquette.materiau.color);

    // Impression au scroll : ①②③ suivent la valeur interpolée de la pose ; ④ est un tampon temporel.
    const L = P.label;
    const e = res.etiquette.uniforms.uEtape.value;
    const borne = (v: number) => Math.min(1, Math.max(0, v));
    e.set(borne(L), borne(L - 1), borne(L - 2), e.w);
    const cible = L >= 3.98 ? 1 : L < 3.9 ? 0 : tampon.current;
    if (etat.reduit) tampon.current = cible;
    else if (tampon.current !== cible) {
      // 120 ms (--d-tampon), delta borné : après une longue pause, pas de saut à l'arrivée.
      const pas = Math.min(delta, 1 / 30) / 0.12;
      tampon.current = cible > tampon.current ? Math.min(1, tampon.current + pas) : Math.max(0, tampon.current - pas);
      etat.animerJusqua = performance.now() + 50;   // continuer à rendre jusqu'à la fin du tween
    }
    e.w = tampon.current;
    res.etiquette.uniforms.uEchelle4.value = etat.reduit ? 1 : 1.04 - 0.04 * tampon.current;
  });

  return (
    <group ref={groupe}>
      <mesh geometry={forme.geo} material={res.verre.materiau} castShadow />
      <mesh geometry={forme.geo} material={res.capsule} scale={[1.035, 1.002, 1.035]} castShadow />
      <mesh geometry={geoEtiquettes.avant} material={res.etiquette.materiau} castShadow />
      <mesh geometry={geoEtiquettes.dos} material={res.matDos} castShadow />
    </group>
  );
}
