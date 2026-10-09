"use client";
// components/scene/SceneCanvas.tsx — l'unique <Canvas> du site, chargé en différé (dynamic, ssr: false).
// Caméra orthographique zoom 1 : R3F règle le frustum sur la taille du canvas, donc 1 unité = 1 px CSS.
// frameloop="never" : on rend nous-mêmes depuis la boucle du moteur (cf. lib/moteur.ts),
// et seulement quand la pose a changé — une page immobile ne coûte rien au GPU.
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import type { DirectionalLight } from "three";
import { abonner, etat } from "@/lib/moteur";
import { Bouteille } from "./Bouteille";
import { Accessoires } from "./Accessoires";

interface Props { modele: string | null; onPret: () => void; onPerdu: () => void }

/** Branche le rendu sur la boucle du moteur. Prévient le parent après la première image. */
function Pilote({ onPret }: { onPret: () => void }) {
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    let derniere = -1;
    let premiere = true;
    let restantes = 3; // quelques images forcées au départ (carte d'environnement, textures)
    return abonner((ms) => {
      if (etat.version === derniere && restantes <= 0) return;
      derniere = etat.version;
      restantes--;
      advance(ms);
      if (premiere) { premiere = false; onPret(); }
    });
  }, [advance, onPret]);
  return null;
}

/** Liseré de contre-jour : une lumière derrière la bouteille, qui n'existe qu'au chapitre sombre. */
function Lumieres() {
  const contre = useRef<DirectionalLight>(null);
  useFrame(() => { if (contre.current) contre.current.intensity = 6 * etat.pose.sil; });
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[-400, 500, 600]} intensity={1.6} />
      <directionalLight ref={contre} position={[300, 200, -800]} intensity={0} />
    </>
  );
}

function webglDisponible() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function SceneCanvas({ modele, onPret, onPerdu }: Props) {
  // Sans WebGL, on ne monte rien : l'image de repli reste affichée.
  const supporte = useMemo(() => webglDisponible(), []);
  if (!supporte) return null;
  return (
    <Canvas
      className="scene-canvas"
      orthographic
      frameloop="never"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 1000], zoom: 1, near: 1, far: 3000 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;  // nécessaire au plan de coupe du vin
        gl.domElement.addEventListener("webglcontextlost", onPerdu);
      }}
    >
      <Pilote onPret={onPret} />
      <Lumieres />
      {/* Reflets du verre : bandes lumineuses locales, aucune HDR téléchargée. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[-4, 1, 3]} scale={[1.2, 10, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[4, 0, 2]} scale={[0.6, 10, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[0, 5, -2]} scale={[10, 1, 1]} />
      </Environment>
      <Bouteille modele={modele} />
      <Accessoires />
    </Canvas>
  );
}
