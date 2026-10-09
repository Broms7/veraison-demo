// components/chapitres/Roue.tsx — V (suite). Roue des arômes T16 + profil en bouche T17 (addendum §2).
// Section SANS pose : la bouteille glisse de la pose « verse » vers celle de VI pendant qu'on la lit,
// ce qui libère la gauche pour la roue. La roue est doublée d'une table masquée (lecteurs d'écran).
import { Chapitre, Surtitre } from "./Chapitre";
import { RoueAromes, ProfilBouche } from "@/components/illustrations/Traits";
import type { Dictionnaire } from "@/dictionnaires";

type Famille = keyof Dictionnaire["roue"]["familles"];

export function Roue({ t }: { t: Dictionnaire["roue"] }) {
  return (
    <Chapitre id="roue" folio="V" className="roue-ch">
      <div className="roue-grille">
        <figure className="roue-fig">
          <RoueAromes aromes={t.aromes} familles={t.familles} alt={t.alt} />
          <table className="sr-only">
            <caption>{t.alt}</caption>
            <thead><tr>{t.entetes.map((e) => <th key={e} scope="col">{e}</th>)}</tr></thead>
            <tbody>
              {t.aromes.map((a) => (
                <tr key={a.nom}><th scope="row">{a.nom}</th><td>{t.familles[a.famille as Famille]}</td><td>{a.moment}</td><td>{a.intensite}</td></tr>
              ))}
            </tbody>
          </table>
        </figure>
        <div className="roue-texte front">
          <Surtitre folio="V">{t.surtitre}</Surtitre>
          <h3 className="titre">{t.titreAvant}<span className="vin">{t.titreAccent}</span></h3>
          <p className="chapeau-g">{t.chapeau}</p>
          <p className="surtitre profil-titre">{t.profilSurtitre}</p>
          <ProfilBouche profil={t.profil} sur={t.sur} />
          <p className="note-releve">{t.note}</p>
        </div>
        <div />
      </div>
    </Chapitre>
  );
}
