// components/chapitres/Ouverture.tsx — I. Ouverture : titre usé, sceau, bouteille inclinée, étiquette vierge.
// Addendum §2 : baseline sous le titre, 3 compteurs dans les colonnes latérales (rien au centre :
// la bouteille y passe), bandeau défilant derrière la bouteille. Libellés « Rouge… / Millésime… » retirés.
import { Chapitre } from "./Chapitre";
import { Compteur } from "./Compteur";
import { Sceau, TitreOuverture } from "@/components/ilots/Ilots";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire, Langue } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0, y: 0.04, r: -18, s: 1, label: 0 };

export function Ouverture({ t, langue }: { t: Dictionnaire["ouverture"]; langue: Langue }) {
  const [ha, bouteilles, mois] = t.indicateurs;
  // Piste du bandeau : les entrées séparées par le carré oxyde du logotype ; dupliquée pour boucler.
  const piste = t.bandeau.flatMap((e) => [<span key={e}>{e}</span>, <i key={`${e}-carre`} />]);
  return (
    <Chapitre id="ouverture" folio="I" pose={POSE} className="ouverture">
      <Sceau texte={t.sceau} />
      <div>
        <p className="surtitre">{t.surtitre}</p>
        <TitreOuverture texte={t.titre} />
        <p className="baseline">{t.baseline}</p>
      </div>
      <div className="indic g">
        <Compteur {...ha} langue={langue} />
        <Compteur {...bouteilles} langue={langue} />
      </div>
      <div className="indic d">
        <Compteur {...mois} langue={langue} />
      </div>
      <div className="indice mono">{t.indice}</div>
      {/* Décoratif et répétitif : masqué aux lecteurs d'écran ; arrêté en mouvement réduit (CSS). */}
      <div className="bandeau" aria-hidden="true">
        <div className="piste-b">{piste}</div>
        <div className="piste-b">{piste}</div>
      </div>
    </Chapitre>
  );
}
