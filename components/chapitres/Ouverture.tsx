// components/chapitres/Ouverture.tsx — I. Ouverture : titre usé, sceau, bouteille inclinée, étiquette vierge.
import { Chapitre } from "./Chapitre";
import { Sceau, TitreOuverture } from "@/components/ilots/Ilots";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0, y: 0.04, r: -18, s: 1, label: 0 };

export function Ouverture({ t }: { t: Dictionnaire["ouverture"] }) {
  return (
    <Chapitre id="ouverture" pose={POSE} className="ouverture">
      <Sceau texte={t.sceau} />
      <div>
        <p className="ital">{t.surtitre}</p>
        <TitreOuverture texte={t.titre} />
        <div className="sous"><span className="mono">{t.gauche}</span><span className="mono">{t.droite}</span></div>
      </div>
      <div className="indice mono">{t.indice}</div>
    </Chapitre>
  );
}
