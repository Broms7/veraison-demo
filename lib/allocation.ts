"use client";
// lib/allocation.ts — panier d'allocation (décision de Romain, option B) : quantités par format,
// mémorisées dans localStorage (try/catch : navigation privée, stockage bloqué).
// Petit magasin externe lu par useSyncExternalStore : aucun setState dans un effet, pas de décalage
// d'hydratation (côté serveur et au premier rendu, le panier est vide).
import { useSyncExternalStore } from "react";

export type Quantites = Readonly<Record<string, number>>;

const CLE = "veraison-allocation";
const VIDE: Quantites = Object.freeze({});
let etat: Quantites = VIDE;
let charge = false;
const abonnes = new Set<() => void>();

function lire(): Quantites {
  if (charge) return etat;
  charge = true;
  try {
    const brut = JSON.parse(localStorage.getItem(CLE) ?? "{}") as unknown;
    if (brut && typeof brut === "object") {
      // On ne garde que des entiers positifs : un stockage modifié à la main ne casse rien.
      etat = Object.freeze(Object.fromEntries(
        Object.entries(brut as Record<string, unknown>).filter(([, v]) => Number.isInteger(v) && (v as number) > 0),
      ) as Record<string, number>);
    }
  } catch { /* stockage indisponible : panier en mémoire seulement */ }
  return etat;
}

function ecrire(suivant: Record<string, number>) {
  etat = Object.freeze(Object.fromEntries(Object.entries(suivant).filter(([, v]) => v > 0)));
  try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch { /* idem */ }
  abonnes.forEach((f) => f());
}

/** Change la quantité d'un format, bornée entre 0 et le maximum du format. */
export function changerQuantite(id: string, delta: number, max: number) {
  const q = lire();
  ecrire({ ...q, [id]: Math.min(max, Math.max(0, (q[id] ?? 0) + delta)) });
}
export function retirerFormat(id: string) { const q = { ...lire() }; delete q[id]; ecrire(q); }
export function viderAllocation() { ecrire({}); }

export function useAllocation(): Quantites {
  return useSyncExternalStore(
    (f) => { abonnes.add(f); return () => { abonnes.delete(f); }; },
    lire,
    () => VIDE,
  );
}

/** Nombre total d'articles (l'en-tête affiche « Allocation (n) »). */
export const totalArticles = (q: Quantites) => Object.values(q).reduce((a, n) => a + n, 0);
