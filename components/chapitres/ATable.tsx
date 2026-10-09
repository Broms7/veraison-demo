// components/chapitres/ATable.tsx — V. À table : la bouteille se retire dans la marge (échelle 0,5),
// la photo prend le premier rôle.
import { Chapitre } from "./Chapitre";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0.38, y: 0.08, r: 0, ry: 360, s: 0.5, label: 3 };

export function ATable({ t }: { t: Dictionnaire["table"] }) {
  return (
    <Chapitre id="table" pose={POSE} className="table">
      <div className="grid">
        <div className="ph front">{t.photo}</div>
        <div>
          <p className="ital">{t.surtitre}</p>
          <h2 className="titre">{t.titreAvant}<br />&amp; <span className="vin">{t.titreAccent}</span></h2>
          <p>{t.texte}</p>
          <a className="btn" href="#resa">{t.cta}</a>
        </div>
        <div />
      </div>
    </Chapitre>
  );
}
