// lib/tokens.ts — lit les tokens CSS (styles/tokens.css) depuis le JS.
// La scène 3D et l'étiquette canvas n'ont pas accès aux var() : on les lit ici,
// pour que la phase 2 n'ait qu'un fichier CSS à remplacer.

/** Valeur brute d'une variable CSS de :root (chaîne vide si absente). */
export function lireToken(nom: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(nom).trim();
}
