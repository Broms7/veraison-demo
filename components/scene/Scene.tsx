"use client";
// components/scene/Scene.tsx — la scène fixe plein écran (pointer-events: none, aria-hidden).
// 1. L'image de repli s'affiche tout de suite et suit déjà la chorégraphie (translation, inclinaison,
//    échelle), comme le wireframe. Sans WebGL, elle reste.
// 2. Le canvas 3D est importé après le premier rendu (dynamic, ssr: false) : le LCP reste le H1.
//    Dès que la bouteille est dessinée, fondu enchaîné : repli 400 ms, bouteille 600 ms (§4.11, §5.2).
// L'élément #bouteille-repli sert aussi d'étalon : sa hauteur CSS (--hauteur-bouteille) est la
// hauteur de base de la bouteille 3D.
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { abonner, etat } from "@/lib/moteur";
import { useMobile } from "@/lib/media";
import { useSite } from "@/components/site/Fournisseur";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

export function Scene({ modele, alt }: { modele: string | null; alt: string }) {
  const [prete, setPrete] = useState(false);
  const mobile = useMobile();
  const { entree } = useSite();
  // Performance (recette n° 8) : three/R3F (≈ 260 Ko) n'est demandé qu'une fois la porte d'âge franchie,
  // puis au premier moment de calme du fil principal. Jusque-là, l'image de repli suit déjà la pose.
  const [charger, setCharger] = useState(false);
  useEffect(() => {
    if (!entree || charger) return;
    const lancer = () => setCharger(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(lancer, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(lancer, 300);
    return () => window.clearTimeout(id);
  }, [entree, charger]);
  const repli = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const onPret = useCallback(() => setPrete(true), []);
  const onPerdu = useCallback(() => setPrete(false), []);

  useEffect(() => {
    let courant = -1;
    let creux = 0;
    return abonner(() => {
      // Opacité (clé `o`) : jamais interpolée au scroll ; l'attribut déclenche un fondu CSS
      // de 400 ms à l'entrée, 240 ms à la sortie (styles/site.css, .scene[data-efface]).
      scene.current?.toggleAttribute("data-efface", etat.pose.o < 0.5);
      // Le repli suit la pose tant qu'il est visible.
      const el = repli.current;
      if (el && !prete) {
        const P = etat.pose;
        el.style.transform = `translate(-50%,-50%) translate(${P.x}px,${P.y}px) rotate(${P.r}deg) scale(${P.s})`;
      }
      // Mouvement réduit : la pose saute d'un chapitre à l'autre ; un creux d'opacité de 200 ms
      // (--d-reduit) masque le saut au lieu de faire glisser la bouteille.
      if (etat.reduit && scene.current && etat.courant !== courant) {
        if (courant !== -1) {
          scene.current.dataset.creux = "";
          window.clearTimeout(creux);
          creux = window.setTimeout(() => { if (scene.current) delete scene.current.dataset.creux; }, 100);
        }
        courant = etat.courant;
      }
    });
  }, [prete]);

  return (
    <div className="scene" ref={scene} aria-hidden="true" data-prete={prete || undefined}>
      <div id="bouteille-repli" ref={repli} className="repli">
        {/* eslint-disable-next-line @next/next/no-img-element -- image de repli statique, déjà dimensionnée */}
        <img src="/bouteille-repli.svg" alt={alt} width={229} height={1000} />
      </div>
      {charger && <SceneCanvas modele={modele} mobile={mobile} onPret={onPret} onPerdu={onPerdu} />}
    </div>
  );
}
