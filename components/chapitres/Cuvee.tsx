// components/chapitres/Cuvee.tsx — II. La cuvée : fiche technique à quatre chiffres-héros (§3.5).
// Pose droite, étiquette imprimée jusqu'à l'étape ② (nom + millésime). La carte passe DEVANT la bouteille.
import { Chapitre, Surtitre } from "./Chapitre";
import { BoutonAjout, Tiroir } from "@/components/ilots/Ilots";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0, y: 0, r: 0, s: 1, label: 2 };

export function Cuvee({ t }: { t: Dictionnaire["cuvee"] }) {
  return (
    <Chapitre id="cuvee" folio="II" pose={POSE} registre className="fiche">
      <div className="grille3">
        <div className="col-g feuille">
          <Surtitre folio="II">{t.surtitre}</Surtitre>
          <h2 className="titre">{t.titre[0]}<br /><span className="vin">{t.titre[1]}</span></h2>
          <p className="chapeau" data-apparition="">{t.texte}</p>
          <div data-apparition=""><BoutonAjout libelle={t.ajouter} className="btn btn-secondaire" /></div>
        </div>
        {/* Filet de liaison (addendum §7) : ce qu'on lit sur la bouteille = ce que dit la fiche.
            Il passe DERRIÈRE la bouteille (couche contenu), dans la colonne centrale. */}
        <div className="liaison" aria-hidden="true"><span className="mono">{t.liaison[0]}</span><span className="mono">{t.liaison[1]}</span></div>
        <div className="col-d">
          <div className="carte carte-papier front" data-apparition="0.1">
            {t.lignes.map((l) => (
              <div className="ligne" key={l.libelle}>
                <span className="mono lib">{l.libelle}</span>
                <span className="chiffre">{l.chiffre}</span>
                <span className="txt">
                  {l.texte}{" "}
                  {l.tiroir ? (
                    <Tiroir declencheur={t.lire} titre={l.libelle} texte={l.tiroir} libelle={`${t.lire} : ${l.libelle}`} />
                  ) : (
                    // Ligne d'assemblage : barre de proportions (merlot 85 / cabernet franc 15) au lieu d'un tiroir.
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
