"use client";
// components/scene/Accessoires.tsx — ce qui accompagne la bouteille : halo du contre-jour,
// verre à pied, vin dans le verre, filet de vin. Tout est placé à partir de etat.verse,
// calculé en pixels écran par lib/poses.ts (goulot obtenu par rotation, comme le wireframe).
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { etat } from "@/lib/moteur";
import { lireToken } from "@/lib/tokens";
import { VERRE } from "@/lib/poses";

const v2 = (x: number, y: number) => new THREE.Vector2(x, y);

/** Coupe du verre (repère SVG 60 × 120 du wireframe, origine au centre du bord, y vers le haut). */
const coupe = (k = 1) =>
  new THREE.CubicBezierCurve(v2(0, -60), v2(16 * k, -58), v2(24 * k, -40), v2(22 * k, -4)).getPoints(20);

/** Couleur CSS + alpha → rgba() (les tokens 3D doivent être en hex, rgb() ou hsl(), lisibles par THREE.Color). */
function avecAlpha(css: string, a: number) {
  const c = new THREE.Color(css);
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${a})`;
}

function textureHalo() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, avecAlpha(lireToken("--3d-halo"), 0.4));
  g.addColorStop(0.4, avecAlpha(lireToken("--vin"), 0.13));
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
  const filet = useRef<THREE.Mesh>(null);

  const res = useMemo(() => {
    // Plan de coupe du vin : on garde tout ce qui est SOUS la surface (normale vers le bas).
    const surface = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    const vin = lireToken("--3d-vin");
    return {
      surface,
      geoVerre: new THREE.LatheGeometry(
        [v2(0, -115), v2(16, -114.5), v2(16, -113.5), v2(1.2, -112.6), v2(1.2, -61), ...coupe().slice(1)], 48),
      geoVin: new THREE.LatheGeometry(coupe(0.93), 48),
      geoFilet: new THREE.CylinderGeometry(1, 1, 1, 8, 1, true).translate(0, -0.5, 0), // haut à l'origine
      geoHalo: new THREE.PlaneGeometry(1, 1),
      matVerre: new THREE.MeshPhysicalMaterial({
        color: lireToken("--3d-verre-a-pied"), transparent: true, opacity: 0.25, roughness: 0.05,
        clearcoat: 1, side: THREE.DoubleSide, depthWrite: false,
      }),
      matVin: new THREE.MeshStandardMaterial({ color: vin, roughness: 0.3, side: THREE.DoubleSide, clippingPlanes: [surface], transparent: true }),
      matFilet: new THREE.MeshBasicMaterial({ color: vin, transparent: true }),
      matHalo: new THREE.MeshBasicMaterial({ map: textureHalo(), transparent: true, depthWrite: false }),
    };
  }, []);

  useEffect(() => () => {
    [res.geoVerre, res.geoVin, res.geoFilet, res.geoHalo, res.matVerre, res.matVin, res.matFilet].forEach((o) => o.dispose());
    res.matHalo.map?.dispose();
    res.matHalo.dispose();
  }, [res]);

  useFrame(() => {
    const { pose: P, vue, verse: V } = etat;
    // Repère écran (px, origine en haut à gauche, y vers le bas) → repère scène (centre, y vers le haut).
    const sx = (x: number) => x - vue.l / 2;
    const sy = (y: number) => vue.h / 2 - y;

    if (halo.current) {
      halo.current.visible = P.sil > 0.01;
      halo.current.position.set(P.x, -P.y, -300);
      halo.current.scale.setScalar(vue.h * 0.7);
      res.matHalo.opacity = P.sil;
    }
    if (!V || !verre.current || !filet.current) return;

    const k = V.verreHauteur / VERRE.repere;
    verre.current.visible = V.opaciteVerre > 0;
    verre.current.position.set(sx(V.goulotX), sy(V.verreHaut), 60);
    verre.current.scale.setScalar(k);
    res.matVerre.opacity = 0.25 * V.opaciteVerre;
    res.matVin.opacity = V.opaciteVerre;
    res.surface.constant = sy(V.surface);   // plan y = surface (repère monde)

    filet.current.visible = V.filet;
    filet.current.position.set(sx(V.goulotX), sy(V.goulotY), 50);
    filet.current.scale.set(1.5, Math.max(0.001, V.surface - V.goulotY), 1.5);
  });

  return (
    <>
      <mesh ref={halo} geometry={res.geoHalo} material={res.matHalo} renderOrder={-1} />
      <group ref={verre}>
        <mesh geometry={res.geoVin} material={res.matVin} />
        <mesh geometry={res.geoVerre} material={res.matVerre} renderOrder={2} />
      </group>
      <mesh ref={filet} geometry={res.geoFilet} material={res.matFilet} />
    </>
  );
}
