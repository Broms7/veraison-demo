"use client";
// components/site/Fournisseur.tsx — état client du site : panier d'allocation, porte d'âge légal,
// et démarrage du moteur de poses (Lenis + boucle unique). Les chapitres restent des composants
// serveur : ils sont passés en children et n'embarquent que leurs petits îlots interactifs.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { demarrerMoteur, getLenis } from "@/lib/moteur";
import type { Langue } from "@/dictionnaires";

const CLE_AGE = "veraison-age-legal";

/** Lit le choix mémorisé. localStorage peut être bloqué (navigation privée) → try/catch. */
function ageMemorise(): boolean {
  try { return localStorage.getItem(CLE_AGE) === "oui"; } catch { return false; }
}
const pasDAbonnement = () => () => {};

interface ContexteSite {
  langue: Langue;
  panier: number;
  ajouter: () => void;
  entree: boolean;     // la porte d'âge a été franchie
  entrer: () => void;
}

const Contexte = createContext<ContexteSite | null>(null);

export function useSite(): ContexteSite {
  const c = useContext(Contexte);
  if (!c) throw new Error("useSite doit être utilisé sous <Fournisseur>");
  return c;
}

export function Fournisseur({ langue, children }: { langue: Langue; children: ReactNode }) {
  const [panier, setPanier] = useState(0);
  // Porte franchie = choix mémorisé (lu côté client seulement) OU clic sur « Oui » pendant la visite.
  const memorise = useSyncExternalStore(pasDAbonnement, ageMemorise, () => false);
  const [clic, setClic] = useState(false);
  const entree = memorise || clic;

  // 1. Le moteur démarre une fois, quand tous les chapitres sont dans le DOM.
  useEffect(() => demarrerMoteur(), []);

  // 2. Porte fermée = scroll bloqué, cadre refermé en iris (CSS sur body[data-porte]).
  useEffect(() => {
    document.body.dataset.porte = entree ? "ouverte" : "fermee";
    const lenis = getLenis();
    if (entree) lenis?.start(); else lenis?.stop();
  }, [entree]);

  const entrer = useCallback(() => {
    setClic(true);
    try { localStorage.setItem(CLE_AGE, "oui"); } catch { /* sans stockage, on redemandera */ }
  }, []);
  const ajouter = useCallback(() => setPanier((n) => n + 1), []);

  const valeur = useMemo(() => ({ langue, panier, ajouter, entree, entrer }), [langue, panier, ajouter, entree, entrer]);
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}
