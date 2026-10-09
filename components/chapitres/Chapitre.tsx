// components/chapitres/Chapitre.tsx — enveloppe commune des chapitres.
// Un chapitre DÉCLARE sa pose de bouteille via la prop `pose` (sérialisée dans data-pose) ;
// le moteur (lib/moteur.ts) lit tous les [data-pose] dans l'ordre du document.
// `sombre` signale un fond sombre : l'en-tête fixe passe alors en clair au-dessus.
// `folio` : chiffre romain du chapitre (rail « Niveau 37 % · VII », addendum §7).
// `registre` : filet de registre tracé en haut de la section (entre deux chapitres clairs).
import type { ReactNode } from "react";
import type { PoseChapitre } from "@/lib/poses";

interface Props {
  id: string;
  folio: string;
  pose?: PoseChapitre;
  sombre?: boolean;
  registre?: boolean;
  className?: string;
  children: ReactNode;
}

export function Chapitre({ id, folio, pose, sombre, registre, className, children }: Props) {
  return (
    <section
      id={id}
      className={["ch", className].filter(Boolean).join(" ")}
      data-pose={pose ? JSON.stringify(pose) : undefined}
      data-sombre={sombre ? "" : undefined}
      data-folio={folio}
      data-registre={registre ? folio : undefined}
    >
      {children}
    </section>
  );
}

/** Surtitre italique précédé du folio romain en oxyde (« III Le sol »). */
export function Surtitre({ folio, children, className = "" }: { folio: string; children: ReactNode; className?: string }) {
  return (
    <p className={`surtitre ${className}`}>
      <span className="folio">{folio}</span>
      {children}
    </p>
  );
}
