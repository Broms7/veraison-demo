// components/chapitres/Journal.tsx — X. Journal : trois derniers articles (pages /journal/[slug] hors v1).
// Images fournies en 3:4, recadrées en 4:5 par object-fit. Rangée à aimantation sur mobile.
import Image from "next/image";
import { Chapitre, Surtitre } from "./Chapitre";
import type { Dictionnaire } from "@/dictionnaires";

export function Journal({ t }: { t: Dictionnaire["journal"] }) {
  return (
    <Chapitre id="journal" folio="XV" registre className="journal">
      <div className="entete-j">
        <div><Surtitre folio="XV">{t.surtitre}</Surtitre><h2 className="titre">{t.titre}</h2></div>
        <a className="lien" href="#journal">{t.tout}</a>
      </div>
      <div className="articles">
        {t.articles.map((a, i) => (
          <a className="article" href="#journal" key={a.titre} data-apparition={String(i * 0.08)}>
            <div className="media">
              <Image src={`/visuels/${a.image}.webp`} alt={a.alt} fill sizes="(max-width: 759px) 82vw, 30vw" />
            </div>
            <span className="mono num">N° {String(i + 1).padStart(2, "0")}</span>
            <span className="mono">{a.meta}</span>
            <h4>{a.titre}</h4>
          </a>
        ))}
      </div>
    </Chapitre>
  );
}
