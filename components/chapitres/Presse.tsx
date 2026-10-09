// components/chapitres/Presse.tsx — XI. La presse (addendum §2). Contenu dans les colonnes 1–2 ;
// la bouteille tient la colonne de droite. Mention de fiction DIRECTEMENT sous le titre (jamais en bas
// de page). Pas de compteur sur les notes : une note se lit, elle ne se regarde pas monter.
import { Chapitre, Surtitre } from "./Chapitre";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

// Écart assumé à l'addendum (retour de Romain, phase 3) : la bouteille ne descend plus sous ~55 % de
// l'écran hors frise et slot. Au lieu de tenir la petite pose de X, elle remonte en grand dans la marge.
const POSE: PoseChapitre = { x: 0.33, y: 0.02, r: 0, ry: 360, s: 0.8, label: 3 };

export function Presse({ t }: { t: Dictionnaire["presse"] }) {
  return (
    <Chapitre id="presse" folio="XI" pose={POSE} registre className="presse">
      <div className="presse-col feuille">
        <Surtitre folio="XI">{t.surtitre}</Surtitre>
        <h2 className="titre">{t.titreAvant}<span className="vin">{t.titreAccent}</span></h2>
        <p className="mono fiction">{t.mention}</p>
        <div className="critiques">
          {t.critiques.map((c, i) => (
            <figure key={c.publication} className="critique" data-apparition={String(i * 0.05)}>
              <div className="note-col">
                <span className="note-p">{c.note}</span>
                <span className="mono">{t.millesime} {c.millesime}</span>
              </div>
              <div>
                <blockquote><p>{c.citation}</p></blockquote>
                <figcaption className="mono">{c.publication} · {c.critique}</figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </Chapitre>
  );
}
