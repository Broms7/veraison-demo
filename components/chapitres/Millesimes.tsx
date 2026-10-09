// components/chapitres/Millesimes.tsx — VII. Les millésimes : la 2021 (la bouteille 3D) se range
// au bout de la lignée. Chaque année ouvre une fiche courte (Sheet).
import { Chapitre } from "./Chapitre";
import { Tiroir } from "@/components/ilots/Ilots";
import { SilhouetteBouteille } from "./Silhouettes";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0.36, y: 0.12, r: 0, ry: 360, s: 0.48, label: 3 };

export function Millesimes({ t }: { t: Dictionnaire["millesimes"] }) {
  return (
    <Chapitre id="millesimes" pose={POSE} className="millesimes">
      <p className="ital">{t.surtitre}</p>
      <h2 className="titre">{t.titreAvant}<br />{t.titreMilieu}<span className="vin">{t.titreAccent}</span></h2>
      <div className="lignee">
        {t.annees.map((a) => (
          <Tiroir
            key={a.annee}
            classeDeclencheur="annee"
            titre={`${a.annee} · ${a.note}`}
            texte={a.fiche}
            declencheur={
              <>
                <SilhouetteBouteille />
                <b>{a.annee}</b>
                <span>{a.note}</span>
                <em className="mono">{a.statut}</em>
              </>
            }
          />
        ))}
      </div>
    </Chapitre>
  );
}
