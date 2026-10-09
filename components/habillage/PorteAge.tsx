"use client";
// components/habillage/PorteAge.tsx — porte d'âge légal et cadre bordeaux.
// Le cadre est un rectangle arrondi dont l'ombre (box-shadow géante) peint tout l'extérieur
// en bordeaux. Porte fermée : le rectangle est réduit à un point (inset: 50 %), l'écran est
// entièrement bordeaux. « Oui » → inset revient à --cadre : l'iris s'ouvre (transition CSS).
import { useState } from "react";
import { useSite } from "@/components/site/Fournisseur";
import type { Dictionnaire } from "@/dictionnaires";

export function PorteAge({ t }: { t: Dictionnaire["porte"] }) {
  const { entree, entrer } = useSite();
  const [refus, setRefus] = useState(false);

  return (
    <>
      <div className="cadre" aria-hidden="true" />
      <div
        className="porte"
        role="dialog"
        aria-modal={!entree}
        aria-hidden={entree}
        aria-labelledby="porte-titre"
        inert={entree}
      >
        <div>
          <div className="mono porte-domaine">{t.domaine}</div>
          <div className="titre porte-titre" id="porte-titre">{t.titre}</div>
          <p>{t.question}</p>
          <div className="choix">
            {/* autoFocus : la porte est la première chose à traverser au clavier */}
            <button className="btn btn-creme" onClick={entrer} autoFocus>{t.oui}</button>
            <button className="btn btn-contour" onClick={() => setRefus(true)}>{t.non}</button>
          </div>
          <p className="mono porte-refus" role="status">{refus ? t.refus : ""}</p>
        </div>
      </div>
    </>
  );
}
