// components/chapitres/Domaine.tsx — VI. Le domaine : chapitre inversé (sombre).
// La bouteille passe en contre-jour (clé sil : verre assombri, étiquette éteinte, halo, liseré).
import { Chapitre } from "./Chapitre";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0.24, y: 0.02, r: 0, ry: 360, s: 0.95, label: 3, sil: 1 };

export function Domaine({ t }: { t: Dictionnaire["domaine"] }) {
  return (
    <Chapitre id="domaine" pose={POSE} sombre className="domaine">
      <div className="fond ph sombre">{t.fond}</div>
      <div className="contenu">
        <p className="ital">{t.surtitre}</p>
        <h2 className="titre">{t.titre[0]}<br />{t.titre[1]}</h2>
        <p>{t.texte}</p>
        <div className="chiffres">
          {t.chiffres.map((c) => <div key={c.libelle}><b>{c.valeur}</b><span className="mono">{c.libelle}</span></div>)}
        </div>
      </div>
    </Chapitre>
  );
}
