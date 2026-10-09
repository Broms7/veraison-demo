// components/chapitres/Equipe.tsx — IX. Les gens du Clos (addendum §2).
// Partie 1 : manifeste de Claire sur fond bordeaux, arrivé par un rideau qui tombe (Habillage.tsx).
// La bouteille s'est effacée (pose o: 0) : rien entre le lecteur et Claire.
// Partie 2 : l'équipe en grille asymétrique de 12 colonnes ; l'équipe de vendange n'a pas de portrait
// (rendu IA peu fiable sur quatorze visages) : la cagette T10 au trait la remplace.
// Portrait absent du disque → emplacement hachuré, jamais d'image de banque.
import Image from "next/image";
import { Chapitre, Surtitre } from "./Chapitre";
import { Cagette } from "@/components/illustrations/Traits";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0, y: 0.36, r: 90, ry: 360, s: 0.4, label: 3, o: 0 };

export function Equipe({ t, portraits }: { t: Dictionnaire["equipe"]; portraits: Record<string, string | null> }) {
  return (
    <Chapitre id="equipe" folio="IX" pose={POSE} className="equipe">
      <div className="manifeste" data-sombre="">
        <blockquote>
          <p><span className="gm" aria-hidden="true">« </span>{t.citation}<span className="gm" aria-hidden="true"> »</span></p>
          <cite className="mono">{t.signature}</cite>
        </blockquote>
      </div>
      <div className="equipe-corps">
        <div className="feuille">
          <Surtitre folio="IX">{t.surtitre}</Surtitre>
          <h2 className="titre">{t.titreAvant}<span className="vin">{t.titreAccent}</span></h2>
          <p className="chapeau">{t.chapeau}</p>
        </div>
        <div className="portraits">
          {t.membres.map((m, i) => {
            const src = m.image ? portraits[m.image] : null;
            return (
              <div key={m.nom} className={`portrait p${i + 1}`} data-apparition={String((i % 3) * 0.06)}>
                {m.image ? (
                  <div className="media portrait-img">
                    {src ? <Image src={src} alt={`${m.nom}, ${m.role.toLowerCase()}, ${t.au}`} fill sizes={i === 0 ? "(max-width: 759px) 92vw, 38vw" : "(max-width: 759px) 46vw, 22vw"} />
                      : <span className="hachure mono">{m.nom}</span>}
                  </div>
                ) : (
                  <Cagette taille={160} />
                )}
                <span className="mono num">N° {String(i + 1).padStart(2, "0")}</span>
                <b>{m.nom}</b>
                <span className="mono role">{m.role}</span>
                <p>{m.ligne}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Chapitre>
  );
}
