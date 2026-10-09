// components/chapitres/Allocation.tsx — VIII. Allocation : la bouteille 3D s'ancre dans #slot.
// La pose « dock » est lue en direct sur le rect du slot (lib/poses.ts) : la bouteille devient un
// format parmi les autres (dessinés au trait), puis défile avec la page. Le tampon ④ tombe à l'arrivée.
// Sur mobile, seul le titre est dans une feuille : le slot doit rester transparent.
import { Chapitre } from "./Chapitre";
import { BoutonAjout } from "@/components/ilots/Ilots";
import { ReleveBouteille, ReleveCaisse, ReleveCoffret } from "./Releves";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire, Langue } from "@/dictionnaires";

const POSE: PoseChapitre = { dock: true };

/** Objet au-dessus de chaque format. La bouteille 75 cl n'a qu'un emplacement vide : le slot. */
function Objet({ id }: { id: string }) {
  switch (id) {
    case "caisse": return <ReleveCaisse />;
    case "magnum": return <ReleveBouteille hauteur="118%" cote="1,5 L" />;
    case "bouteille": return <div id="slot" aria-hidden="true" />;
    case "demi": return <ReleveBouteille hauteur="62%" cote="37,5 cl" />;
    default: return <ReleveCoffret />;
  }
}

export function Allocation({ t, langue }: { t: Dictionnaire["allocation"]; langue: Langue }) {
  const prix = new Intl.NumberFormat(langue === "fr" ? "fr-FR" : "en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  return (
    <Chapitre id="allocation" pose={POSE} className="allocation">
      <div className="feuille">
        <p className="surtitre">{t.surtitre}</p>
        <h2 className="titre">{t.titreAvant}<span className="vin">{t.titreAccent}</span></h2>
      </div>
      <div className="formats">
        {t.formats.map((f, i) => (
          <div key={f.id} className={f.id === "bouteille" ? "format vedette" : "format"} data-apparition={String(i * 0.06)}>
            <div className="objet"><Objet id={f.id} /></div>
            <span className="mono nom">{f.nom}</span>
            {f.id === "demi" ? (
              // Les demis se vendent au chai seulement (brief) : pas de bouton d'ajout.
              <>
                <span className="prix">{prix.format(f.prix)}</span>
                <span className="mono chai-seul">{t.chaiSeulement}</span>
              </>
            ) : (
              <>
                <span className="q">{f.note}</span>
                <span className="prix">{prix.format(f.prix)}</span>
                <BoutonAjout libelle={t.ajouter} libelleAjoute={t.ajoute} />
              </>
            )}
          </div>
        ))}
      </div>
    </Chapitre>
  );
}
