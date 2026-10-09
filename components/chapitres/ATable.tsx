// components/chapitres/ATable.tsx — VI. À table : la bouteille se retire à côté du texte,
// la photo (agneau rosé, cèpes) prend le premier rôle. Aucune parallaxe sur la photo.
// Phase 3 : les accords passent en liste numérotée mono, relevé de service sous le bouton (addendum §7).
// Pose agrandie à la demande de Romain (≥ 55 % de la hauteur d'écran) et rapprochée du texte.
import Image from "next/image";
import { Chapitre, Surtitre } from "./Chapitre";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0.3, y: 0.02, r: 0, ry: 360, s: 0.8, label: 3 };

export function ATable({ t }: { t: Dictionnaire["table"] }) {
  return (
    <Chapitre id="table" folio="VI" pose={POSE} registre className="table">
      <div className="grid">
        <div className="media photo front" data-apparition="">
          <Image src="/visuels/plat-agneau.webp" alt={t.alt} fill sizes="(max-width: 759px) 92vw, 42vw" />
        </div>
        <div className="feuille">
          <Surtitre folio="VI">{t.surtitre}</Surtitre>
          <h2 className="titre">{t.titreAvant}<br />&amp; <span className="vin">{t.titreAccent}</span></h2>
          <p data-apparition="">{t.texte}</p>
          <ol className="accords mono" data-apparition="0.06">
            {t.accords.map((a, i) => <li key={a}><span className="num">{String(i + 1).padStart(2, "0")}</span>{a}</li>)}
          </ol>
          <p className="eviter" data-apparition="0.1">{t.eviter}</p>
          <a className="btn btn-secondaire" href="#resa" data-apparition="0.12">{t.cta}</a>
          <p className="releve-service mono" data-apparition="0.16">{t.releve.map((r) => <span key={r}>{r}</span>)}</p>
        </div>
        <div />
      </div>
    </Chapitre>
  );
}
