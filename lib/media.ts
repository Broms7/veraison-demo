"use client";
// lib/media.ts — media queries lues sans setState dans un effet (useSyncExternalStore).
// Côté serveur et à l'hydratation, la valeur est `false` : le rendu initial est celui du desktop
// sans préférence de mouvement, puis le client corrige.
import { useSyncExternalStore } from "react";
import { LARGEUR_MOBILE } from "./poses";

function useRequete(requete: string): boolean {
  return useSyncExternalStore(
    (cb) => { const m = matchMedia(requete); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => matchMedia(requete).matches,
    () => false,
  );
}

export const useMobile = () => useRequete(`(max-width: ${LARGEUR_MOBILE - 0.02}px)`);
export const useMouvementReduit = () => useRequete("(prefers-reduced-motion: reduce)");

const pasDAbonnement = () => () => {};
/** true seulement côté client, après hydratation (pour ce qui dépend de la date ou du navigateur). */
export const useMonte = () => useSyncExternalStore(pasDAbonnement, () => true, () => false);
