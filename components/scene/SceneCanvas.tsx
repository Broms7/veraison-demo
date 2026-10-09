"use client";
// components/scene/SceneCanvas.tsx — l'unique <Canvas> du site (design-spec §4.1 à §4.9),
// chargé en différé (dynamic, ssr: false). Rendu PILOTÉ par la boucle du moteur (lib/moteur.ts) :
// frameloop="never" + advance() dans le même tick que Lenis, et seulement si quelque chose a bougé.
// C'est ce qui garantit que la bouteille ancrée dans le slot ne tremble pas (zéro image de retard).
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { abonner, etat } from "@/lib/moteur";
import { lireToken } from "@/lib/tokens";
import { Bouteille } from "./Bouteille";
import { Accessoires } from "./Accessoires";
import { CAMERA } from "./camera";

interface Props { modele: string | null; mobile: boolean; onPret: () => void; onPerdu: () => void }

/** Branche le rendu sur la boucle du moteur ; prévient le parent quand la bouteille est dessinée. */
function Pilote({ onPret }: { onPret: () => void }) {
  const advance = useThree((s) => s.advance);
  const lire = useThree((s) => s.get);
  const taille = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  // Redimensionner le tampon WebGL l'EFFACE : en frameloop="never", personne ne redessinerait.
  // Tout changement de taille ou de densité compte donc comme une modification à rendre.
  useEffect(() => { etat.version++; }, [taille, dpr]);
  // En développement : état R3F lisible depuis la console (window.__veraisonR3f()) pour diagnostiquer.
  useEffect(() => { if (process.env.NODE_ENV !== "production") Object.assign(window, { __veraisonR3f: lire }); }, [lire]);
  useEffect(() => {
    let derniere = -1;
    let pret = false;
    let forcees = 3; // premières images : carte d'environnement, ombres
    return abonner((ms) => {
      const anime = ms < etat.animerJusqua;
      if (etat.version === derniere && forcees <= 0 && !anime) return;
      derniere = etat.version;
      forcees--;
      advance(ms);
      if (!pret && etat.bouteillePrete) { pret = true; onPret(); }
    });
  }, [advance, onPret]);
  return null;
}

/** Reflets du verre : environnement « studio » généré une fois, sans fichier HDR (aperçu validé). */
function Environnement() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const salle = new RoomEnvironment();
    const env = pmrem.fromScene(salle, 0.04).texture;
    scene.environment = env;
    etat.version++;
    return () => { scene.environment = null; env.dispose(); pmrem.dispose(); salle.dispose(); };
  }, [gl, scene]);
  return null;
}

/** Lumières fixes (la bouteille tourne dans la lumière) et ombre portée sur un plan vertical (§4.3, §4.8). */
function Lumieres({ ombres }: { ombres: boolean }) {
  const cle = useRef<THREE.DirectionalLight>(null);
  const contre = useRef<THREE.DirectionalLight>(null);
  const couleurs = useMemo(() => ({ cle: lireToken("--3d-lumiere"), contre: lireToken("--3d-contre"), ombre: lireToken("--3d-ombre") }), []);
  const matOmbre = useMemo(() => new THREE.ShadowMaterial({ color: couleurs.ombre, opacity: 0.22, depthWrite: false }), [couleurs]);
  useEffect(() => () => matOmbre.dispose(), [matOmbre]);

  useFrame(() => {
    const sil = etat.pose.sil;
    if (cle.current) cle.current.intensity = 2.4 - 2 * sil;      // 2,4 → 0,4
    if (contre.current) contre.current.intensity = 1.6 + 1.4 * sil; // 1,6 → 3
    matOmbre.opacity = 0.22 * (1 - sil);                           // pas d'ombre sur la nuit
  });

  return (
    <>
      <ambientLight intensity={0.25} color="#ffffff" />
      <directionalLight
        ref={cle} position={[-3, 4, 3]} intensity={2.4} color={couleurs.cle} castShadow={ombres}
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} shadow-normalBias={0.02}
        shadow-camera-left={-2} shadow-camera-right={2} shadow-camera-top={2} shadow-camera-bottom={-2}
      />
      <directionalLight ref={contre} position={[2.5, 2, -4]} intensity={1.6} color={couleurs.contre} />
      {/* La page est un mur : l'ombre tombe sur un plan vertical fixe, juste derrière la bouteille. */}
      {ombres && (
        <mesh position={[0, 0, -0.22]} material={matOmbre} receiveShadow>
          <planeGeometry args={[6, 6]} />
        </mesh>
      )}
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

export default function SceneCanvas({ modele, mobile, onPret, onPerdu }: Props) {
  // Sans WebGL, on ne monte rien : l'image de repli reste affichée.
  const supporte = useMemo(() => webglDisponible(), []);
  if (!supporte) return null;
  return (
    <Canvas
      className="scene-canvas"
      frameloop="never"
      dpr={mobile ? [1, 1.5] : [1, 1.75]}
      shadows={mobile ? false : "soft"}
      camera={{ fov: CAMERA.fov, position: [0, 0, CAMERA.z], near: CAMERA.near, far: CAMERA.far }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.localClippingEnabled = true;  // capsule et surface du vin
        gl.domElement.addEventListener("webglcontextlost", onPerdu);
      }}
    >
      <Pilote onPret={onPret} />
      <Environnement />
      <Lumieres ombres={!mobile} />
      <Suspense fallback={null}>
        <Bouteille modele={modele} mobile={mobile} />
      </Suspense>
      <Accessoires />
    </Canvas>
  );
}
