// lib/scroll.ts — petits outils de scroll partagés par les îlots (tiroirs, modales, menu).
"use client";
import { useEffect } from "react";
import { getLenis } from "./moteur";

/** Met Lenis en pause tant qu'une surface modale est ouverte (sinon la page défile dessous). */
export function usePauseScroll(ouvert: boolean) {
  useEffect(() => {
    if (!ouvert) return;
    const lenis = getLenis();
    lenis?.stop();
    return () => { lenis?.start(); };
  }, [ouvert]);
}

/** Défile jusqu'à un chapitre : Lenis s'il tourne, sinon scroll natif (mouvement réduit). */
export function allerA(id: string) {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(`#${id}`);
  else document.getElementById(id)?.scrollIntoView();
}
