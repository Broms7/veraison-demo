// components/chapitres/Geste.tsx — III. Le geste : rotation Y 180°, on lit la contre-étiquette.
import { Chapitre } from "./Chapitre";
import { VideoGeste } from "@/components/ilots/Ilots";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0, y: 0, r: 0, ry: 180, s: 1, label: 2 };

export function Geste({ t }: { t: Dictionnaire["geste"] }) {
  return (
    <Chapitre id="geste" pose={POSE} className="geste">
      <div className="grille3">
        <div className="col-g front">
          <VideoGeste vignette={t.video} libelle={t.lireVideo} titre={t.videoTitre} attente={t.videoAttente} />
          <p className="ital legende">{t.legende}</p>
        </div>
        <div className="col-d style">
          <p className="ital">{t.surtitre}</p>
          <h3 className="titre">{t.titreAvant}<br />{t.titreMilieu}<span className="vin">{t.titreAccent}</span></h3>
          {t.paragraphes.map((p) => <p key={p}>{p}</p>)}
        </div>
      </div>
    </Chapitre>
  );
}
