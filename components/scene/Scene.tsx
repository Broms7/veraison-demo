"use client";
// components/scene/Scene.tsx — la scène fixe plein écran (pointer-events: none).
// 1. L'image de repli (SVG 2D) s'affiche tout de suite et suit déjà la chorégraphie
//    (translation, inclinaison, échelle), exactement comme le wireframe.
// 2. Le canvas 3D est importé après le premier rendu (dynamic, ssr: false) ; dès sa première
//    image, l'image de repli s'efface. Si WebGL manque ou que le contexte est perdu, elle revient.
// L'élément #bouteille-repli sert aussi d'étalon : sa hauteur CSS (--hauteur-bouteille) est la
// hauteur de base de la bouteille 3D.
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { abonner, etat } from "@/lib/moteur";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

export function Scene({ modele, alt }: { modele: string | null; alt: string }) {
  const [prete, setPrete] = useState(false);
  const repli = useRef<HTMLDivElement>(null);
  const onPret = useCallback(() => setPrete(true), []);
  const onPerdu = useCallback(() => setPrete(false), []);

  // Le repli suit la pose tant qu'il est visible (inutile de le bouger derrière le canvas).
  useEffect(() => abonner(() => {
    const el = repli.current;
    if (!el || prete) return;
    const P = etat.pose;
    el.style.transform = `translate(-50%,-50%) translate(${P.x}px,${P.y}px) rotate(${P.r}deg) scale(${P.s})`;
  }), [prete]);

  return (
    <div className="scene" aria-hidden="true">
      <div id="bouteille-repli" ref={repli} className="repli" data-cache={prete || undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG statique, rien à optimiser */}
        <img src="/bouteille-repli.svg" alt={alt} width={100} height={360} />
      </div>
      <SceneCanvas modele={modele} onPret={onPret} onPerdu={onPerdu} />
    </div>
  );
}
