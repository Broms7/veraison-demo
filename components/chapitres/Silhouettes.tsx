// components/chapitres/Silhouettes.tsx — silhouettes SVG plates des autres formats
// (frise des millésimes, ligne d'allocation). La « vraie » bouteille, elle, est le modèle 3D.
const PROFIL = "M43,6 L43,95 C43,112 16,118 16,145 L16,348 Q16,358 26,358 L74,358 Q84,358 84,348 L84,145 C84,118 57,112 57,95 L57,6 Z";

export function SilhouetteBouteille({ hauteur }: { hauteur?: string }) {
  return (
    <svg viewBox="0 0 100 360" style={hauteur ? { height: hauteur } : undefined} aria-hidden="true">
      <path d={PROFIL} fill="var(--silhouette)" />
      <rect x="41" y="0" width="18" height="70" fill="var(--silhouette-capsule)" />
      <rect x="20" y="200" width="60" height="110" fill="var(--papier-2)" />
    </svg>
  );
}

export function Caisse() {
  return (
    <svg viewBox="0 0 120 80" style={{ height: "40%" }} aria-hidden="true">
      <rect x="2" y="14" width="116" height="64" fill="var(--bois)" stroke="var(--bois-trait)" />
      <path d="M2,14 L18,2 L118,2 L118,14" fill="var(--bois-clair)" stroke="var(--bois-trait)" />
      <line x1="30" y1="14" x2="30" y2="78" stroke="var(--bois-trait)" />
      <line x1="90" y1="14" x2="90" y2="78" stroke="var(--bois-trait)" />
    </svg>
  );
}

export function Coffret() {
  return (
    <svg viewBox="0 0 120 70" style={{ height: "34%" }} aria-hidden="true">
      <rect x="2" y="8" width="116" height="60" rx="2" fill="var(--hachure-nuit-2)" />
      <rect x="2" y="2" width="116" height="12" rx="2" fill="var(--bordeaux)" />
      <text x="60" y="44" textAnchor="middle" fontFamily="var(--f-titre)" fontSize="11" fill="var(--creme)">FERRUGINE</text>
    </svg>
  );
}
