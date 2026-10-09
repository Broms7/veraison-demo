// components/chapitres/DansLeVerre.tsx — IV. Dans le verre : la bouteille bascule à −112°,
// le filet coule et le verre se remplit au scroll (remonter le vide). Chapitre long (170vh)
// pour laisser le temps au versé. Taches et anneau passent DEVANT la bouteille (.front).
import { Chapitre } from "./Chapitre";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0.15, y: -0.17, r: -112, ry: 360, s: 0.78, label: 3, pour: 1 };

/** Taches de vin décoratives : [cx, cy, rayon, opacité] par variante. */
const TACHES: Array<Array<[number, number, number, number]>> = [
  [[48, 50, 30, 0.18], [82, 30, 5, 0.25], [20, 80, 3, 0.3]],
  [[50, 50, 26, 0.15], [14, 24, 6, 0.22]],
  [[52, 48, 28, 0.16], [88, 70, 4, 0.3]],
];

type Note = Dictionnaire["verre"]["notes"][number];

function CarteNote({ n, variante }: { n: Note; variante: number }) {
  return (
    <div className="note front">
      <svg className="tache" viewBox="0 0 100 100" aria-hidden="true">
        {TACHES[variante].map(([cx, cy, r, o]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="var(--vin)" opacity={o} />)}
      </svg>
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
      <div className="entete">
        <p className="ital">{t.surtitre}</p>
        <h2 className="titre">{t.titre}</h2>
      </div>
      <div className="temps">
        <div className="pile"><CarteNote n={attaque} variante={0} /><CarteNote n={finale} variante={1} /></div>
        <div />
        <div className="pile d"><CarteNote n={milieu} variante={2} /></div>
      </div>
      <svg className="anneau front" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="38" fill="none" stroke="var(--vin)" strokeWidth="3" opacity=".35" strokeDasharray="180 12 30 8" />
      </svg>
    </Chapitre>
  );
}
