// components/chapitres/Allocation.tsx — VIII. Allocation : la bouteille 3D s'ancre dans #slot.
// La pose « dock » est lue en direct sur le rect du slot (lib/poses.ts) : la bouteille devient un
// format parmi les autres, puis défile avec la page. L'étiquette y est complète (étape ④).
import { Chapitre } from "./Chapitre";
import { BoutonAjout } from "@/components/ilots/Ilots";
import { Caisse, Coffret, SilhouetteBouteille } from "./Silhouettes";
import type { PoseChapitre } from "@/lib/poses";
import type { Dictionnaire, Langue } from "@/dictionnaires";

const POSE: PoseChapitre = { dock: true };

/** Objet dessiné au-dessus de chaque format. La bouteille 75 cl n'a qu'un emplacement vide : le slot. */
function Objet({ id }: { id: string }) {
  switch (id) {
    case "caisse": return <Caisse />;
    case "magnum": return <SilhouetteBouteille hauteur="118%" />;
    case "bouteille": return <div id="slot" aria-hidden="true" />;
    case "demi": return <SilhouetteBouteille hauteur="62%" />;
    default: return <Coffret />;
  }
}

export function Allocation({ t, langue }: { t: Dictionnaire["allocation"]; langue: Langue }) {
  const prix = new Intl.NumberFormat(langue, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  return (
    <Chapitre id="allocation" pose={POSE} className="allocation">
      <p className="ital">{t.surtitre}</p>
      <h2 className="titre">{t.titreAvant}<span className="vin">{t.titreAccent}</span></h2>
      <div className="formats">
        {t.formats.map((f) => (
          <div key={f.id} className={f.id === "bouteille" ? "format vedette" : "format"}>
            <div className="objet"><Objet id={f.id} /></div>
            <span className="mono nom">{f.nom}</span>
            <span className="q">{f.note}</span>
            <span className="prix">{prix.format(f.prix)}</span>
            <BoutonAjout libelle={t.ajouter} libelleAjoute={t.ajoute} />
          </div>
        ))}
      </div>
    </Chapitre>
  );
}
