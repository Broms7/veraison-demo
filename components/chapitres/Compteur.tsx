// components/chapitres/Compteur.tsx — chiffre animé (number ticker, addendum §4.2), rendu serveur.
// La valeur FINALE est dans le HTML : sans JS ou en mouvement réduit, rien ne bouge et tout est lu.
// components/site/Habillage.tsx repart de 0 au déclenchement ([data-compte]).
// Accessibilité : chiffre animé aria-hidden, valeur finale dans un sr-only. Largeur réservée en ch
// (tabular-nums) : le comptage ne décale jamais la mise en page.
import type { Langue } from "@/dictionnaires";

export const locale = (langue: Langue) => (langue === "fr" ? "fr-FR" : "en-GB");

export function Compteur({ valeur, decimales = 0, libelle, langue }: { valeur: number; decimales?: number; libelle: string; langue: Langue }) {
  const texte = new Intl.NumberFormat(locale(langue), { minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(valeur);
  return (
    <div className="cpt">
      <b aria-hidden="true" data-compte={valeur} data-dec={decimales} data-locale={locale(langue)} style={{ minWidth: `${texte.length}ch` }}>{texte}</b>
      <span className="sr-only">{texte} </span>
      <span className="mono">{libelle}</span>
    </div>
  );
}
