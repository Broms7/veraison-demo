// components/chapitres/Cuvee.tsx — II. La cuvée : fiche technique à quatre chiffres-héros.
// Pose droite, étiquette écrite jusqu'à l'étape ② (nom + millésime). La carte passe DEVANT la bouteille.
import { Chapitre } from "./Chapitre";
import { BoutonAjout, Tiroir } from "@/components/ilots/Ilots";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0, y: 0, r: 0, s: 1, label: 2 };

export function Cuvee({ t }: { t: Dictionnaire["cuvee"] }) {
  return (
    <Chapitre id="cuvee" pose={POSE} className="fiche">
      <div className="grille3">
        <div className="col-g">
          <p className="ital">{t.surtitre}</p>
          <h2 className="titre">{t.titre[0]}<br />{t.titre[1]}</h2>
          <p>{t.texte}</p>
          <BoutonAjout libelle={t.ajouter} className="btn" />
        </div>
        <div className="col-d">
          <div className="carte front">
            {t.lignes.map((l) => (
              <div className="ligne" key={l.libelle}>
                <span className="mono lib">{l.libelle}</span>
                <span className="chiffre">{l.chiffre}</span>
                <span className="txt">
                  {l.texte}{" "}
                  {l.tiroir ? (
                    <Tiroir declencheur={t.lire} titre={l.libelle} texte={l.tiroir} />
                  ) : (
                    // Ligne d'assemblage : barre de proportions au lieu d'un tiroir.
                    <span className="assemblage" aria-hidden="true"><i style={{ flex: 85 }} /><i style={{ flex: 15 }} /></span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Chapitre>
  );
}
