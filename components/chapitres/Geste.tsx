// components/chapitres/Geste.tsx — III. Le geste : rotation Y 180°, on lit la contre-étiquette.
// Vignette : boucle vidéo de Claire (aller-retour ~5,7 s, muette) directement dans le cadre 4:3,
// sans modale ni bouton lecture ; bouton pause ; image fixe si mouvement réduit ou fichier absent.
import { Chapitre } from "./Chapitre";
import { BoucleVideo } from "@/components/ilots/Ilots";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0, y: 0, r: 0, ry: 180, s: 1, label: 2 };

export function Geste({ t, video, tv }: { t: Dictionnaire["geste"]; video: string | null; tv: Dictionnaire["video"] }) {
  return (
    <Chapitre id="geste" pose={POSE} className="geste">
      <div className="grille3">
        <figure className="col-g front" data-apparition="">
          <BoucleVideo className="vignette" video={video} poster="/visuels/claire-nb2.webp" alt={t.alt}
            sizes="(max-width: 759px) 92vw, 30vw" pause={tv.pause} lecture={tv.lecture} />
          <figcaption className="ital legende">{t.legende}</figcaption>
        </figure>
        <div className="col-d style feuille">
          <p className="surtitre">{t.surtitre}</p>
          <h3 className="titre">{t.titreAvant}<br />{t.titreMilieu}<span className="vin">{t.titreAccent}</span></h3>
          {t.paragraphes.map((p) => <p key={p} data-apparition="">{p}</p>)}
        </div>
      </div>
    </Chapitre>
  );
}
