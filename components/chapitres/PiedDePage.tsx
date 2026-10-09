// components/chapitres/PiedDePage.tsx — XI. Pied de page : la page finit dans la couleur du cadre.
// Mention loi Évin obligatoire et visible.
import { Lettre } from "@/components/ilots/Ilots";
import type { Dictionnaire } from "@/dictionnaires";

export function PiedDePage({ t }: { t: Dictionnaire["pied"] }) {
  return (
    <footer className="pied" data-sombre="">
      <div className="haut">
        <div>
          <h3 className="titre">{t.lettreTitre}</h3>
          <p>{t.lettreTexte}</p>
          <Lettre email={t.email} inscrire={t.inscrire} inscrit={t.inscrit} erreur={t.erreur} />
        </div>
        <div className="cols">
          {t.colonnes.map((c) => (
            <div key={c.titre}>
              <span className="mono">{c.titre}</span>
              {c.liens.map((l) => <a key={l} href="#ouverture">{l}</a>)}
            </div>
          ))}
        </div>
      </div>
      <div className="legal mono">
        {/* Mention sanitaire (loi Évin) : texte HTML, en premier sur mobile */}
        <span className="evin">{t.evin}</span>
        <span>{t.credit}</span>
      </div>
      <div className="titre geant" aria-hidden="true">{t.geant}</div>
    </footer>
  );
}
