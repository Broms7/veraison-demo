"use client";
// components/habillage/Rail.tsx — rail vertical à gauche : un filet de vin qui monte avec la lecture.
// Mis à jour par la boucle du moteur, directement sur le DOM (pas de rendu React à chaque frame).
// Libellé « Niveau 37 % · VII » : le folio du chapitre sous le milieu de la fenêtre (addendum §7),
// recherché seulement quand le pourcentage change (une fois par point de défilement, pas à chaque image).
import { useEffect, useRef } from "react";
import { abonner, etat } from "@/lib/moteur";

export function Rail({ libelle }: { libelle: string }) {
  const niveau = useRef<HTMLElement>(null);
  const texte = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let dernier = "";
    const sections = [...document.querySelectorAll<HTMLElement>("[data-folio]")];
    const folioCourant = () => {
      let folio = sections[0]?.dataset.folio ?? "";
      for (const s of sections) {
        if (s.getBoundingClientRect().top <= innerHeight / 2) folio = s.dataset.folio ?? folio;
        else break;
      }
      return folio;
    };
    let pctPrecedent = -1;
    return abonner(() => {
      const pct = Math.round(etat.progression * 100);
      if (niveau.current) niveau.current.style.transform = `scaleY(${etat.progression})`;
      if (pct === pctPrecedent || !texte.current) return;
      pctPrecedent = pct;
      const libelleComplet = `${libelle} ${pct} % · ${folioCourant()}`;
      if (libelleComplet !== dernier) { dernier = libelleComplet; texte.current.textContent = libelleComplet; }
    });
  }, [libelle]);

  return (
    <div className="rail" aria-hidden="true">
      <i ref={niveau} />
      <span ref={texte} className="mono">{libelle} 0 % · I</span>
    </div>
  );
}
