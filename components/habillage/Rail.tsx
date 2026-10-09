"use client";
// components/habillage/Rail.tsx — rail vertical à gauche : un filet de vin qui monte avec la lecture.
// Mis à jour par la boucle du moteur, directement sur le DOM (pas de rendu React à chaque frame).
import { useEffect, useRef } from "react";
import { abonner, etat } from "@/lib/moteur";

export function Rail({ libelle }: { libelle: string }) {
  const niveau = useRef<HTMLElement>(null);
  const texte = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let dernier = -1;
    return abonner(() => {
      const pct = Math.round(etat.progression * 100);
      if (niveau.current) niveau.current.style.transform = `scaleY(${etat.progression})`;
      if (pct !== dernier && texte.current) { dernier = pct; texte.current.textContent = `${libelle} ${pct} %`; }
    });
  }, [libelle]);

  return (
    <div className="rail" aria-hidden="true">
      <i ref={niveau} />
      <span ref={texte} className="mono">{libelle} 0 %</span>
    </div>
  );
}
