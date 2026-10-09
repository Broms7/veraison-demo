// components/chapitres/DansLeVerre.tsx — IV. Dans le verre : la bouteille bascule à −112°,
// le filet coule et le verre se remplit au scroll (remonter le vide). Chapitre long (170vh).
// Taches et anneau retirés (brand-direction) : les notes sont des cartes .front, c'est leur fond
// qui crée le premier plan devant la bouteille.
import { Chapitre } from "./Chapitre";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0.15, y: -0.17, r: -112, ry: 360, s: 0.78, label: 3, pour: 1 };

type Note = Dictionnaire["verre"]["notes"][number];

function CarteNote({ n }: { n: Note }) {
  return (
    <div className="note carte-papier front" data-apparition="">
      <span className="mono vin">{n.num}</span>
      <h4>{n.titre}</h4>
      <p>{n.texte}</p>
    </div>
  );
}

export function DansLeVerre({ t }: { t: Dictionnaire["verre"] }) {
  // Ordre du wireframe : attaque et finale à gauche, milieu à droite plus bas.
  const [attaque, finale, milieu] = t.notes;
  return (
    <Chapitre id="verre" pose={POSE} className="notes">
      <div className="entete feuille">
        <p className="surtitre">{t.surtitre}</p>
        <h2 className="titre">{t.titreAvant}<span className="vin">{t.titreAccent}</span></h2>
      </div>
      <div className="temps">
        <div className="pile"><CarteNote n={attaque} /><CarteNote n={finale} /></div>
        <div />
        <div className="pile d"><CarteNote n={milieu} /></div>
      </div>
    </Chapitre>
  );
}
