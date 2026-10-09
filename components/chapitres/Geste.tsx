// components/chapitres/Geste.tsx — IV. Le geste : rotation Y 180°, on lit la contre-étiquette.
// Vignette : boucle vidéo de Claire (aller-retour ~5,7 s, muette) directement dans le cadre 4:3,
// sans modale ni bouton lecture ; bouton pause ; image fixe si mouvement réduit ou fichier absent.
// Addendum §2 : sous la vignette, la contre-étiquette en texte HTML (mentions légales lisibles,
// le canvas 3D ne l'est pas pour un lecteur d'écran).
import { Chapitre, Surtitre } from "./Chapitre";
import { BoucleVideo } from "@/components/ilots/Ilots";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0, y: 0, r: 0, ry: 180, s: 1, label: 2 };

export function Geste({ t, video, tv }: { t: Dictionnaire["geste"]; video: string | null; tv: Dictionnaire["video"] }) {
  const c = t.contre;
  return (
    <Chapitre id="geste" folio="IV" pose={POSE} registre className="geste">
      <div className="grille3">
        <div className="col-g front">
          <figure data-apparition="">
            <BoucleVideo className="vignette" video={video} poster="/visuels/claire-nb2.webp" alt={t.alt}
              sizes="(max-width: 759px) 92vw, 30vw" pause={tv.pause} lecture={tv.lecture} />
            <figcaption className="ital legende">{t.legende}</figcaption>
          </figure>
          <div className="contre" data-apparition="0.1">
            <span className="mono">{c.titre}</span>
            <span className="ital">{c.assemblage}</span>
            <span>{c.elevage}</span>
            <span>{c.garde}</span>
            <span>{c.mise}</span>
            <span className="sulfites">
              {c.sulfites}
              {/* Pictogramme femme enceinte : mention obligatoire en France */}
              <svg width="20" height="20" viewBox="0 0 20 20" role="img" aria-label={c.enceinte}>
                <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="10.5" cy="5.6" r="1.4" fill="currentColor" />
                <path d="M9.6 7.6 C8.4 9.6 8.6 11 9.4 12.2 L9 15.8 M10.4 8.4 C12.6 9.6 12.4 12 10.2 12.4" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                <line x1="4" y1="16" x2="16" y2="4" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </span>
            <span className="mono sanitaire">{c.sanitaire}</span>
          </div>
        </div>
        <div className="col-d style feuille">
          <Surtitre folio="IV">{t.surtitre}</Surtitre>
          <h3 className="titre">{t.titreAvant}<br />{t.titreMilieu}<span className="vin">{t.titreAccent}</span></h3>
          {t.paragraphes.map((p) => <p key={p} data-apparition="">{p}</p>)}
        </div>
      </div>
    </Chapitre>
  );
}
