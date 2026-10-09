// components/chapitres/Chapitre.tsx — enveloppe commune des chapitres.
// Un chapitre DÉCLARE sa pose de bouteille via la prop `pose` (sérialisée dans data-pose) ;
// le moteur (lib/moteur.ts) lit tous les [data-pose] dans l'ordre du document.
// `sombre` signale un fond sombre : l'en-tête fixe passe alors en clair au-dessus.
import type { ReactNode } from "react";
import type { PoseChapitre } from "@/lib/poses";

interface Props {
  id: string;
  pose?: PoseChapitre;
  sombre?: boolean;
  className?: string;
  children: ReactNode;
}

export function Chapitre({ id, pose, sombre, className, children }: Props) {
  return (
    <section
      id={id}
      className={["ch", className].filter(Boolean).join(" ")}
      data-pose={pose ? JSON.stringify(pose) : undefined}
      data-sombre={sombre ? "" : undefined}
    >
      {children}
    </section>
  );
}
