// components/chapitres/Sol.tsx — III. Le sol (addendum §2, §3 T1).
// La bouteille se tient debout dans la colonne gauche, échelle 0,62, le pied sur la ligne de surface.
// Écart à l'addendum §1 : la surface descend de 40vh à 50vh (coupe de 45vh pour 2 m), sinon le haut de la
// bouteille sortait de l'écran (recette n° 27). Pied à 50vh, 72vh × 0,62 = 44,6vh → centre 27,7vh → y = −0,223. La coupe se trace au scroll,
// couche par couche ; chaque ligne de légende s'allume quand sa couche est tracée, et le mot « fer »
// passe de l'encre au vin quand les plaques de fer sont dessinées (Habillage.tsx, data-legende / data-fer).
import { Chapitre, Surtitre } from "./Chapitre";
import { CoupeSol } from "@/components/illustrations/Traits";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: -0.29, y: -0.223, r: 0, ry: 0, s: 0.62, label: 2 };
// Groupe de tracé de chaque couche de la légende (ordre de la coupe : surface, graves + sables, argile, fer).
const GROUPE_COUCHE = [0, 1, 1, 3, 2];

export function Sol({ t }: { t: Dictionnaire["sol"] }) {
  return (
    <Chapitre id="sol" folio="III" pose={POSE} registre className="sol">
      <div className="surface" aria-hidden="true" />
      <div className="coupe-cadre"><CoupeSol alt={t.alt} /></div>
      <div className="regle mono" aria-hidden="true">
        <span className="regle-titre">{t.profondeur}</span>
        {t.graduations.map((g, i) => <span key={g} style={{ top: `${i * 25}%` }}>{g}</span>)}
      </div>
      <p className="mono racines-leg">{t.racines}</p>
      <div className="texte feuille">
        <Surtitre folio="III">{t.surtitre}</Surtitre>
        <h2 className="titre" data-fer="">{t.titreAvant}<span className="vin">{t.titreAccent}</span></h2>
        <p className="chapeau">{t.chapeauAvant}<em>{t.chapeauMot}</em>{t.chapeauApres}</p>
        <p className="corps">{t.corps}</p>
        <ul className="couches">
          {t.couches.map((c, i) => (
            <li key={c.nom} data-legende={GROUPE_COUCHE[i]} className={`couche-${i}`}>
              <i aria-hidden="true" />
              <span className="mono">{c.nom} · <span className="prof">{c.profondeur}</span></span>
              <span className="phrase">{c.phrase}</span>
            </li>
          ))}
        </ul>
      </div>
    </Chapitre>
  );
}
