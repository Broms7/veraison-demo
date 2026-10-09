"use client";
// components/scene/Bouteille.tsx — la bouteille 3D et ses deux étiquettes.
// Unités : le modèle est construit dans le repère du SVG du wireframe (viewBox 100 × 360,
// centre en (50, 180)), puis mis à l'échelle hauteurBase / 360 par la pose. Comme la caméra
// orthographique fait 1 unité = 1 px CSS, la bouteille mesure exactement --hauteur-bouteille.
// Les étiquettes sont TOUJOURS des mesh séparés (portions de cylindre ouvert) : le futur
// modèle Meshy sera généré sans étiquette.
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { etat } from "@/lib/moteur";
import { lireToken } from "@/lib/tokens";
import {
  CANVAS_AVANT, CANVAS_DOS, dessinerContreEtiquette, dessinerEtiquette, type ThemeEtiquette,
} from "@/lib/etiquette";

const HAUTEUR_REPERE = 360;     // hauteur du repère SVG
const RAYON_CORPS = 34;         // rayon du corps (x 16 → 84 dans le SVG)
const deg = THREE.MathUtils.degToRad;
const v2 = (x: number, y: number) => new THREE.Vector2(x, y);

/** Profil de révolution du verre (rayon, hauteur vers le haut), tiré du path SVG du wireframe. */
function profilVerre(): THREE.Vector2[] {
  const pied = new THREE.QuadraticBezierCurve(v2(24, -178), v2(34, -178), v2(34, -168)).getPoints(8);
  const epaule = new THREE.CubicBezierCurve(v2(34, 35), v2(34, 62), v2(7, 68), v2(7, 85)).getPoints(24);
  return [v2(0, -178), ...pied, ...epaule, v2(7, 174), v2(0, 174)];
}

/** Capsule : manchon sur le goulot + tête plus large. */
const PROFIL_CAPSULE = [v2(0, 110), v2(7.35, 110), v2(7.35, 173), v2(9.5, 173), v2(9.5, 180), v2(0, 180)];

/** Thème de l'étiquette lu dans les tokens CSS (couleurs et polices next/font). */
function themeEtiquette(): ThemeEtiquette {
  return {
    polices: {
      titre: lireToken("--police-titre") || "Impact",
      ital: lireToken("--police-ital") || "Georgia",
      mono: lireToken("--police-mono") || "monospace",
    },
    couleurs: {
      papier: lireToken("--3d-etiquette"),
      encre: lireToken("--encre"),
      vin: lireToken("--vin"),
      gris: lireToken("--gris"),
      filet: lireToken("--filet"),
    },
  };
}

function creerTexture(l: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = l;
  canvas.height = h;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { ctx: canvas.getContext("2d") as CanvasRenderingContext2D, tex };
}

/** Modèle GLB (Meshy) normalisé dans le repère 360 : centré, hauteur 358. Renvoie aussi son rayon. */
function ModeleGLB({ url, onRayon, materiaux }: { url: string; onRayon: (r: number) => void; materiaux: RefObject<THREE.MeshStandardMaterial[]> }) {
  const { scene } = useGLTF(url);
  const { objet, rayon } = useMemo(() => {
    const objet = scene.clone(true);
    const boite = new THREE.Box3().setFromObject(objet);
    const taille = boite.getSize(new THREE.Vector3());
    const centre = boite.getCenter(new THREE.Vector3());
    const k = 358 / taille.y;
    objet.position.set(-centre.x * k, -centre.y * k, -centre.z * k);
    objet.scale.setScalar(k);
    // On garde les matériaux du modèle ; on mémorise leur couleur pour le contre-jour.
    const liste: THREE.MeshStandardMaterial[] = [];
    objet.traverse((o) => {
      const m = (o as THREE.Mesh).material;
      if (m instanceof THREE.MeshStandardMaterial) {
        const copie = m.clone();
        copie.userData.base = copie.color.clone();
        (o as THREE.Mesh).material = copie;
        liste.push(copie);
      }
    });
    materiaux.current = liste;
    return { objet, rayon: (Math.max(taille.x, taille.z) / 2) * k };
  }, [scene, materiaux]);
  useEffect(() => onRayon(rayon), [rayon, onRayon]);
  return <primitive object={objet} />;
}

export function Bouteille({ modele }: { modele: string | null }) {
  const groupe = useRef<THREE.Group>(null);
  const rayon = useRef(RAYON_CORPS);
  const etiquettes = useRef<THREE.Group>(null);
  const materiauxGLB = useRef<THREE.MeshStandardMaterial[]>([]);

  const geo = useMemo(() => ({
    verre: new THREE.LatheGeometry(profilVerre(), 72),
    capsule: new THREE.LatheGeometry(PROFIL_CAPSULE, 48),
    // Étiquette avant : 120 de haut, centrée sur y = -76 (SVG 196 → 316), arc de 2,2 rad face caméra.
    avant: new THREE.CylinderGeometry(1, 1, 120, 48, 1, true, -1.1, 2.2).translate(0, -76, 0),
    // Contre-étiquette : 86 de haut, centrée sur y = -77, au dos (theta = π).
    dos: new THREE.CylinderGeometry(1, 1, 86, 40, 1, true, Math.PI - 0.87, 1.74).translate(0, -77, 0),
  }), []);

  const mat = useMemo(() => {
    const avant = creerTexture(CANVAS_AVANT.l, CANVAS_AVANT.h);
    const dos = creerTexture(CANVAS_DOS.l, CANVAS_DOS.h);
    return {
      avant, dos,
      verre: new THREE.MeshPhysicalMaterial({
        color: lireToken("--3d-verre"), roughness: 0.16, metalness: 0.05,
        clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.3,
      }),
      capsule: new THREE.MeshStandardMaterial({ color: lireToken("--3d-capsule"), roughness: 0.35, metalness: 0.55 }),
      etiquetteAvant: new THREE.MeshStandardMaterial({ map: avant.tex, roughness: 0.9 }),
      etiquetteDos: new THREE.MeshStandardMaterial({ map: dos.tex, roughness: 0.9 }),
    };
  }, []);
  const couleurVerre = useMemo(() => mat.verre.color.clone(), [mat]);

  // Libération GPU au démontage.
  useEffect(() => () => {
    Object.values(geo).forEach((g) => g.dispose());
    [mat.verre, mat.capsule, mat.etiquetteAvant, mat.etiquetteDos].forEach((m) => m.dispose());
    mat.avant.tex.dispose();
    mat.dos.tex.dispose();
  }, [geo, mat]);

  // Thème lu une fois les polices chargées ; on force alors un redessin des étiquettes.
  const theme = useRef<ThemeEtiquette | null>(null);
  const derniereEtape = useRef(-1);
  useEffect(() => {
    const charger = () => {
      theme.current = themeEtiquette();
      dessinerContreEtiquette(mat.dos.ctx, theme.current);
      mat.dos.tex.needsUpdate = true;
      derniereEtape.current = -1;
      etat.version++;
    };
    charger();
    document.fonts?.ready.then(charger);
  }, [mat]);

  useFrame(() => {
    const g = groupe.current;
    if (!g) return;
    const P = etat.pose;
    // Pose : y CSS vers le bas → y three vers le haut ; rotate CSS horaire → rotation z négative.
    // Ordre ZYX : la bouteille tourne d'abord sur son axe (ry), puis s'incline (r).
    g.position.set(P.x, -P.y, 0);
    g.rotation.set(0, deg(P.ry), -deg(P.r), "ZYX");
    g.scale.setScalar((etat.hauteurBase / HAUTEUR_REPERE) * P.s);

    // Contre-jour : verre assombri (brightness 1 - 0,5·sil), étiquettes éteintes (1 - 0,82·sil).
    mat.verre.color.copy(couleurVerre).multiplyScalar(1 - 0.5 * P.sil);
    mat.verre.envMapIntensity = 1.3 * (1 - 0.6 * P.sil);
    const encre = 1 - 0.82 * P.sil;
    mat.etiquetteAvant.color.setScalar(encre);
    mat.etiquetteDos.color.setScalar(encre);
    materiauxGLB.current.forEach((m) => {
      const base = m.userData.base as THREE.Color | undefined;
      if (base) m.color.copy(base).multiplyScalar(1 - 0.5 * P.sil);
    });

    // Étiquette qui s'écrit : redessin seulement quand l'étape change (pas de 0,02).
    const etape = Math.round(Math.min(4, Math.max(0, P.label)) * 50) / 50;
    if (theme.current && etape !== derniereEtape.current) {
      derniereEtape.current = etape;
      dessinerEtiquette(mat.avant.ctx, etape, theme.current);
      mat.avant.tex.needsUpdate = true;
    }
    etiquettes.current?.scale.set(rayon.current + 0.35, 1, rayon.current + 0.35);
  });

  return (
    <group ref={groupe}>
      {modele ? (
        <ModeleGLB url={modele} materiaux={materiauxGLB} onRayon={(r) => { rayon.current = r; }} />
      ) : (
        <>
          <mesh geometry={geo.verre} material={mat.verre} />
          <mesh geometry={geo.capsule} material={mat.capsule} />
        </>
      )}
      {/* Cylindres de rayon 1 mis à l'échelle du corps : marche aussi avec le GLB. */}
      <group ref={etiquettes}>
        <mesh geometry={geo.avant} material={mat.etiquetteAvant} />
        <mesh geometry={geo.dos} material={mat.etiquetteDos} />
      </group>
    </group>
  );
}
