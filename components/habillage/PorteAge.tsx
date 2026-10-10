"use client";
// components/habillage/PorteAge.tsx — porte d'âge légal et cadre bordeaux (design-spec §3.19).
// Le cadre est un rectangle arrondi dont l'ombre géante peint tout l'extérieur en bordeaux.
// Porte fermée : le rectangle est réduit à un point (inset: 50 %), l'écran est entièrement bordeaux.
// « Oui » → inset revient à --cadre : l'iris s'ouvre en 1 600 ms (fondu de 200 ms en mouvement réduit).
// Tant qu'elle est ouverte, le reste du site est `inert` (cf. Inerte) : le focus y reste piégé.
import { useState, type ReactNode } from "react";
import { useSite } from "@/components/site/Fournisseur";
import { Langues } from "./EnTete";
import type { Dictionnaire } from "@/dictionnaires";

export function PorteAge({ t, libelleLangue }: { t: Dictionnaire["porte"]; libelleLangue: string }) {
  const { entree, entrer, langue } = useSite();
  const [refus, setRefus] = useState(false);

  return (
    <>
      <div className="cadre" aria-hidden="true" />
      <div className="porte" role="dialog" aria-modal={!entree} aria-hidden={entree} aria-labelledby="porte-titre" inert={entree}>
        <Langues langue={langue} libelle={libelleLangue} className="porte-langues" />
        <div>
          <div className="mono porte-domaine">{t.domaine}</div>
          <div className="titre porte-titre" id="porte-titre">{t.titre}</div>
          <p className="porte-question">{t.question}</p>
          <div className="choix">
            {/* autoFocus : la porte est la première chose à traverser au clavier */}
            <button className="btn btn-oui" autoFocus onClick={() => {
              entrer();
              // Le reste du site cesse d'être inerte au rendu suivant : le focus passe alors au titre,
              // au lieu de tomber sur <body> (recette n° 7).
              window.setTimeout(() => document.querySelector<HTMLElement>("#ouverture h1")?.focus({ preventScroll: true }), 60);
            }}>{t.oui}</button>
            <button className="btn btn-non" onClick={() => setRefus(true)}>{t.non}</button>
          </div>
          <p className="mono porte-refus" role="status">{refus ? t.refus : ""}</p>
        </div>
      </div>
    </>
  );
}

/** Enveloppe du reste du site : inerte (hors focus, hors lecteur d'écran) tant que la porte est fermée. */
export function Inerte({ children }: { children: ReactNode }) {
  const { entree } = useSite();
  return <div inert={!entree}>{children}</div>;
}
