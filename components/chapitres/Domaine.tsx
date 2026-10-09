// components/chapitres/Domaine.tsx — VII. Le domaine : chapitre inversé (nuit), ouvert par l'iris bordeaux.
// Correctif phase 3 (addendum §2) : la boucle vidéo du plateau est PLEINEMENT visible ; le voile ne couvre
// que la colonne du texte (dégradé 85 % → 0 entre 34 % et 52 % de la largeur). Au-delà, vidéo nue.
// Colonne 1 : texte + 4 compteurs ; colonne 2 : planche de la carte des parcelles T14 ; colonne 3 : la bouteille.
// .iris : calque nuit découpé en cercle pendant la transition (Habillage.tsx) ; la section, bordeaux,
// dépasse d'un anneau de 1,6vmax autour du cercle.
import { Chapitre, Surtitre } from "./Chapitre";
import { Compteur } from "./Compteur";
import { BoucleVideo } from "@/components/ilots/Ilots";
import { CarteParcelles } from "@/components/illustrations/Traits";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire, Langue } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0.33, y: 0.02, r: 0, ry: 360, s: 0.8, label: 3, sil: 1 };

export function Domaine({ t, video, tv, langue }: { t: Dictionnaire["domaine"]; video: string | null; tv: Dictionnaire["video"]; langue: Langue }) {
  return (
    <Chapitre id="domaine" folio="VII" pose={POSE} sombre className="domaine">
      <div className="iris">
        <BoucleVideo className="fond" video={video} poster="/visuels/plateau-aube.webp" alt="" decorative
          sizes="100vw" pause={tv.pause} lecture={tv.lecture} />
        <div className="voile-texte" aria-hidden="true" />
        <div className="dom-grille">
          <div className="contenu">
            <Surtitre folio="VII">{t.surtitre}</Surtitre>
            <h2 className="titre">{t.titreAvant}<span className="accent">{t.titreAccent}</span><br />{t.titreApres}</h2>
            <p data-apparition="">{t.texte}</p>
            <p data-apparition="0.06">{t.texte2}</p>
            <div className="cpts">
              {t.chiffres.map((c) => <Compteur key={c.libelle} valeur={c.valeur} libelle={c.libelle} langue={langue} />)}
            </div>
          </div>
          <div className="planche" data-apparition="0.1">
            <p className="ital">{t.carte.libelle}</p>
            <CarteParcelles t={t.carte} />
            <div className="parcelles">
              {t.parcelles.map((p) => (
                <div key={p.nom}><b>{p.nom}</b><span className="mono">{p.detail}</span><span>{p.legende}</span></div>
              ))}
            </div>
          </div>
          <div />
        </div>
      </div>
    </Chapitre>
  );
}
