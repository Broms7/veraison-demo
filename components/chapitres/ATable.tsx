// components/chapitres/ATable.tsx — V. À table : la bouteille se retire dans la marge (échelle 0,5),
// la photo (agneau rosé, cèpes) prend le premier rôle. Aucune parallaxe sur la photo.
import Image from "next/image";
import { Chapitre } from "./Chapitre";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire } from "@/dictionnaires";

const POSE: PoseChapitre = { x: 0.38, y: 0.08, r: 0, ry: 360, s: 0.5, label: 3 };

export function ATable({ t }: { t: Dictionnaire["table"] }) {
  return (
    <Chapitre id="table" pose={POSE} className="table">
      <div className="grid">
        <div className="media photo front" data-apparition="">
          <Image src="/visuels/plat-agneau.webp" alt={t.alt} fill sizes="(max-width: 759px) 92vw, 42vw" />
        </div>
        <div className="feuille">
          <p className="surtitre">{t.surtitre}</p>
          <h2 className="titre">{t.titreAvant}<br />&amp; <span className="vin">{t.titreAccent}</span></h2>
          <p data-apparition="">{t.texte}</p>
          <a className="btn btn-secondaire" href="#resa" data-apparition="">{t.cta}</a>
        </div>
        <div />
      </div>
    </Chapitre>
  );
}
