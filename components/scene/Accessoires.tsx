"use client";
// components/scene/Accessoires.tsx — halo du contre-jour, verre à pied, vin, surface et filet
// (design-spec §4.7 et §4.9). Les positions viennent de etat.verse, calculé en pixels écran
// par lib/poses.ts (goulot obtenu par rotation, comme le wireframe), puis converties en unités monde.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { etat } from "@/lib/moteur";
import { lireToken } from "@/lib/tokens";
import { uniteParPixel } from "./camera";

const v2 = (x: number, y: number) => new THREE.Vector2(x, y);
const HAUTEUR_VERRE = 0.62;      // u : 1/3 de la bouteille (§4.7)

/** Calice tulipe (origine au centre du bord, y vers le bas) : bord 0,13, panse 0,16, calice 0,30. */
const calice = (k = 1) =>
  new THREE.CubicBezierCurve(v2(0, -0.3), v2(0.175 * k, -0.29), v2(0.17 * k, -0.07), v2(0.13 * k, 0)).getPoints(28);

/** Rayon intérieur du calice à une profondeur donnée (lu sur le profil, pour le disque de surface). */
function rayonA(profil: THREE.Vector2[], y: number): number {
  for (let i = 1; i < profil.length; i++) {
    const a = profil[i - 1], b = profil[i];
    if (y >= a.y && y <= b.y) return a.x + ((y - a.y) / (b.y - a.y || 1)) * (b.x - a.x);
  }
  return 0;
}

/** Couleur CSS + alpha → rgba() (tokens 3D en hex, rgb() ou hsl() : THREE.Color ne lit pas oklch). */
function avecAlpha(css: string, a: number) {
  const c = new THREE.Color(css);
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${a})`;
}

function textureHalo() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, avecAlpha(lireToken("--3d-halo"), 0.55));
  g.addColorStop(0.4, avecAlpha(lireToken("--vin"), 0.2));
  g.addColorStop(0.68, avecAlpha(lireToken("--vin"), 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function Accessoires() {
  const halo = useRef<THREE.Mesh>(null);
  const verre = useRef<THREE.Group>(null);
  const surface = useRef<THREE.Mesh>(null);
  const filet = useRef<THREE.Mesh>(null);

  const res = useMemo(() => {
    // Plan de coupe du vin : on garde ce qui est SOUS la surface (normale vers le bas, repère monde).
    const plan = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    const profilInt = calice(0.97);
    const vin = lireToken("--3d-vin");
    return {
      plan, profilInt,
      geoVerre: new THREE.LatheGeometry([
        v2(0, -0.62), v2(0.11, -0.62), v2(0.11, -0.605), v2(0.012, -0.59), v2(0.012, -0.3), ...calice().slice(1),
      ], 56),
      geoVin: new THREE.LatheGeometry(profilInt, 56),
      geoSurface: new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2),
      geoFilet: new THREE.CylinderGeometry(0.006, 0.006, 1, 10, 1, true).translate(0, -0.5, 0), // haut à l'origine
      geoHalo: new THREE.PlaneGeometry(2.6, 2.6),
      matVerre: new THREE.MeshPhysicalMaterial({
        color: lireToken("--3d-verre-a-pied"), transparent: true, opacity: 0.14, roughness: 0.05,
        clearcoat: 1, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide,
      }),
      matVin: new THREE.MeshStandardMaterial({ color: vin, roughness: 0.2, side: THREE.DoubleSide, clippingPlanes: [plan], transparent: true }),
      matSurface: new THREE.MeshStandardMaterial({ color: lireToken("--3d-vin-surface"), roughness: 0.12, transparent: true }),
      matFilet: new THREE.MeshStandardMaterial({ color: vin, roughness: 0.2 }),
      matHalo: new THREE.MeshBasicMaterial({ map: textureHalo(), transparent: true, depthWrite: false }),
    };
  }, []);

  useEffect(() => () => {
    [res.geoVerre, res.geoVin, res.geoSurface, res.geoFilet, res.geoHalo, res.matVerre, res.matVin, res.matSurface, res.matFilet].forEach((o) => o.dispose());
    res.matHalo.map?.dispose();
    res.matHalo.dispose();
  }, [res]);

  useFrame((state) => {
    const { pose: P, vue, verse: V } = etat;
    const k = uniteParPixel(state.size.height);
    // Repère écran (px, origine en haut à gauche) → repère monde (u, origine au centre, y vers le haut).
    const mx = (x: number) => (x - vue.l / 2) * k;
    const my = (y: number) => (vue.h / 2 - y) * k;

    if (halo.current) {
      halo.current.visible = P.sil > 0.01;
      halo.current.position.set(P.x * k, -P.y * k, -0.4);
      res.matHalo.opacity = P.sil;
    }
    if (!V || !verre.current || !filet.current || !surface.current) return;

    // Le verre suit la taille de la bouteille de base (1/3), y compris sur mobile.
    const echelle = (V.verreHauteur * k) / HAUTEUR_VERRE;
    verre.current.visible = V.opaciteVerre > 0;
    verre.current.position.set(mx(V.goulotX), my(V.verreHaut), 0);
    verre.current.scale.setScalar(echelle);
    res.matVerre.opacity = 0.14 * V.opaciteVerre;
    res.matVin.opacity = V.opaciteVerre;
    res.matSurface.opacity = V.opaciteVerre;

    // Surface du vin : plan de coupe + disque, au même niveau.
    const ySurface = my(V.surface);
    res.plan.constant = ySurface;
    const prof = (ySurface - my(V.verreHaut)) / echelle;   // profondeur dans le repère du calice (≤ 0)
    const r = rayonA(res.profilInt, prof);
    surface.current.visible = r > 0.005;
    surface.current.position.set(0, prof, 0);
    surface.current.scale.setScalar(Math.max(r, 0.001));

    filet.current.visible = V.filet;
    filet.current.position.set(mx(V.goulotX), my(V.goulotY), 0);
    filet.current.scale.set(1, Math.max(0.001, (V.surface - V.goulotY) * k), 1);
  });

  return (
    <>
      <mesh ref={halo} geometry={res.geoHalo} material={res.matHalo} renderOrder={-1} />
      <group ref={verre}>
        <mesh geometry={res.geoVin} material={res.matVin} />
        <mesh ref={surface} geometry={res.geoSurface} material={res.matSurface} />
        <mesh geometry={res.geoVerre} material={res.matVerre} renderOrder={2} />
      </group>
      <mesh ref={filet} geometry={res.geoFilet} material={res.matFilet} />
    </>
  );
}
