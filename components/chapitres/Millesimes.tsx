// components/chapitres/Millesimes.tsx — X. Les millésimes : relevés au trait des années passées,
// la 2021 (la bouteille 3D) se range au bout de la lignée. Pas d'épinglage ;
// défilement horizontal natif à aimantation sur mobile. Chaque année ouvre une fiche (Sheet) enrichie :
// photo 4:5, statut + stock, météo, dégustation (addendum §2). La 2021 a sa fiche via le lien sous la frise.
import { Chapitre, Surtitre } from "./Chapitre";
import { FicheMillesime } from "@/components/ilots/Ilots";
import { ReleveBouteille } from "./Releves";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0.36, y: 0.12, r: 0, ry: 360, s: 0.48, label: 3 };

export function Millesimes({ t, photos }: { t: Dictionnaire["millesimes"]; photos: Record<string, string | null> }) {
  const passees = t.annees.filter((a) => a.etat !== "allocation");
  const sortie = t.annees.find((a) => a.etat === "allocation");
  const libelles = { fermer: t.fermer, meteo: t.meteo, degustation: t.degustation, voirAllocation: t.voirAllocation };
  return (
    <Chapitre id="millesimes" folio="X" pose={POSE} className="millesimes">
      <div className="feuille">
        <Surtitre folio="X">{t.surtitre}</Surtitre>
        <h2 className="titre">{t.titreAvant}<br />{t.titreMilieu}<span className="vin">{t.titreAccent}</span></h2>
        <div className="lignee" data-trace-releves="">
          {passees.map((a) => (
            <FicheMillesime key={a.annee} a={a} photo={photos[a.annee] ?? null} t={libelles} classeDeclencheur="annee"
              declencheur={
                <>
                  <ReleveBouteille epuise={a.etat === "epuise"} />
                  <b>{a.annee}</b>
                  <span>{a.note}</span>
                  <em className={`mono statut-${a.etat}`}>{a.statut}</em>
                  <small className="mono">{a.quantite}</small>
                </>
              }
            />
          ))}
        </div>
        {sortie && (
          <p className="sortie mono">
            <span>{sortie.annee} · {sortie.statut} · {sortie.quantite}</span>
            <FicheMillesime a={sortie} photo={photos[sortie.annee] ?? null} t={libelles} classeDeclencheur="lien" declencheur={t.lireFiche} allocation />
          </p>
        )}
      </div>
    </Chapitre>
  );
}
