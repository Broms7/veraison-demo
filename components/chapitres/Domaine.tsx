// components/chapitres/Domaine.tsx — VI. Le domaine : chapitre inversé (sombre).
// Fond : boucle vidéo du plateau à l'aube (muette, décorative), voile 80 % sous le texte (décision 3),
// bouton pause ; image fixe seule en mouvement réduit. La bouteille passe en contre-jour (clé sil).
import { Chapitre } from "./Chapitre";
import { BoucleVideo } from "@/components/ilots/Ilots";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0.24, y: 0.02, r: 0, ry: 360, s: 0.95, label: 3, sil: 1 };

export function Domaine({ t, video, tv }: { t: Dictionnaire["domaine"]; video: string | null; tv: Dictionnaire["video"] }) {
  return (
    <Chapitre id="domaine" pose={POSE} sombre className="domaine">
      <BoucleVideo className="fond" video={video} poster="/visuels/plateau-aube.webp" alt="" decorative
        sizes="100vw" pause={tv.pause} lecture={tv.lecture} />
      <div className="contenu">
        <p className="surtitre">{t.surtitre}</p>
        <h2 className="titre">{t.titreAvant}<span className="accent">{t.titreAccent}</span><br />{t.titreApres}</h2>
        <p data-apparition="">{t.texte}</p>
        <div className="chiffres" data-apparition="">
          {t.chiffres.map((c) => <div key={c.libelle}><b>{c.valeur}</b><span className="mono">{c.libelle}</span></div>)}
        </div>
      </div>
    </Chapitre>
  );
}
