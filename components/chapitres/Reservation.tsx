// components/chapitres/Reservation.tsx — IX. Au domaine : la bouteille est rangée, place à la conversion.
// Pas de pose : le chapitre ne déclare rien, la bouteille reste ancrée dans le slot (au-dessus).
import { Chapitre } from "./Chapitre";
import { ParcoursReservation } from "@/components/reservation/ParcoursReservation";
import type { Dictionnaire, Langue } from "@/dictionnaires";

export function Reservation({ t, langue }: { t: Dictionnaire["resa"]; langue: Langue }) {
  return (
    <Chapitre id="resa" className="resa-ch">
      <div className="entete">
        <div>
          <p className="surtitre">{t.surtitre}</p>
          <h2 className="titre">{t.titreAvant}<br />{t.titreMilieu}<span className="vin">{t.titreAccent}</span></h2>
        </div>
        <p className="intro">{t.intro}</p>
      </div>
      <ParcoursReservation t={t} langue={langue} />
    </Chapitre>
  );
}
