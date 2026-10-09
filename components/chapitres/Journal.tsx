// components/chapitres/Journal.tsx — X. Journal : trois derniers articles (pages /journal/[slug] en v2).
import { Chapitre } from "./Chapitre";
import type { Dictionnaire } from "@/dictionnaires";

export function Journal({ t }: { t: Dictionnaire["journal"] }) {
  return (
    <Chapitre id="journal" className="journal">
      <div className="entete-j">
        <div><p className="ital">{t.surtitre}</p><h2 className="titre">{t.titre}</h2></div>
        <a className="lien" href="#journal">{t.tout}</a>
      </div>
      <div className="articles">
        {t.articles.map((a) => (
          <a className="article" href="#journal" key={a.titre}>
            <div className="ph">{a.photo}</div>
            <span className="mono">{a.meta}</span>
            <h4>{a.titre}</h4>
          </a>
        ))}
      </div>
    </Chapitre>
  );
}
