// components/chapitres/Annee.tsx — VIII. Une année au Clos : section épinglée à défilement horizontal
// (addendum §6). Rendu serveur ; l'épinglage, la translation de la piste, l'accrochage par mois et la règle
// des mois sont posés par components/site/Habillage.tsx (≥ 1024 px, sans mouvement réduit).
// Sous 1024 px ou en mouvement réduit : rangée native à aimantation (scroll-snap), aucun épinglage.
// La bouteille est couchée en bas du cadre pendant tout l'épinglage (pose `pin` : deux ancres).
// Accessibilité : lien d'évitement visible au focus ; aucun élément focusable dans la piste ;
// titres de mois en h3, ordre DOM janvier → décembre.
import { Chapitre, Surtitre } from "./Chapitre";
import { OBJETS_MOIS } from "@/components/illustrations/Traits";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0, y: 0.36, r: 90, ry: 360, s: 0.4, label: 3, pin: true };

export function Annee({ t }: { t: Dictionnaire["annee"] }) {
  return (
    <Chapitre id="annee" folio="VIII" pose={POSE} className="annee-ch">
      <a className="evite" href="#equipe">{t.evitement}</a>
      <div className="collant">
        {/* Bord d'attaque du rideau latéral (filet bordeaux de la largeur du cadre) */}
        <div className="bord-rideau" aria-hidden="true" />
        <div className="regle-mois" aria-hidden="true">
          {t.mois.map((m) => <span key={m.nom} className="mono">{m.nom[0]}</span>)}
        </div>
        {/* Région focusable : au clavier, la rangée native (mobile) défile aux flèches (recette n° 17) */}
        <div className="piste" tabIndex={0} role="region" aria-label={t.surtitre}>
          <div className="panneau feuille">
            <Surtitre folio="VIII">{t.surtitre}</Surtitre>
            <h2 className="titre">{t.titreAvant}<span className="vin">{t.titreAccent}</span></h2>
            <p className="chapeau">{t.chapeau}</p>
            <p className="mono indice-annee">{t.indice}</p>
          </div>
          {t.mois.map((m, i) => {
            const Dessin = OBJETS_MOIS[i];
            return (
              <article key={m.nom} className="mois">
                <span className="mono num">{String(i + 1).padStart(2, "0")}</span>
                <span className="nom-m">{m.nom}</span>
                <h3 className="titre-mois">{m.titre}</h3>
                <Dessin />
                <p>{m.texte}</p>
              </article>
            );
          })}
        </div>
      </div>
    </Chapitre>
  );
}
