// components/chapitres/Millesimes.tsx — VII. Les millésimes : relevés au trait des années passées,
// la 2021 (la bouteille 3D) se range au bout de la lignée. Pas d'épinglage (décision 5) ;
// défilement horizontal natif à aimantation sur mobile. Chaque année ouvre une fiche (Sheet).
import { Chapitre } from "./Chapitre";
import { Tiroir } from "@/components/ilots/Ilots";
import { ReleveBouteille } from "./Releves";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0.36, y: 0.12, r: 0, ry: 360, s: 0.48, label: 3 };

export function Millesimes({ t }: { t: Dictionnaire["millesimes"] }) {
  return (
    <Chapitre id="millesimes" pose={POSE} className="millesimes">
      <div className="feuille">
        <p className="surtitre">{t.surtitre}</p>
        <h2 className="titre">{t.titreAvant}<br />{t.titreMilieu}<span className="vin">{t.titreAccent}</span></h2>
        <div className="lignee" data-trace="">
          {t.annees.map((a) => (
            <Tiroir
              key={a.annee}
              classeDeclencheur="annee"
              titre={`${a.annee} · ${a.note}`}
              texte={a.fiche}
              declencheur={
                <>
                  <ReleveBouteille epuise={a.etat === "epuise"} />
                  <b>{a.annee}</b>
                  <span>{a.note}</span>
                  <em className={`mono statut-${a.etat}`}>{a.statut}</em>
                </>
              }
            />
          ))}
        </div>
      </div>
    </Chapitre>
  );
}
