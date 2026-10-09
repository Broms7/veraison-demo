// components/chapitres/Releves.tsx — relevés techniques au trait (design-spec §3.8, décision 4) :
// magnum, demi, millésimes passés, caisse et coffret. Seule la 2021 a du volume (la bouteille 3D).
// Trait 1 px `currentColor`, `vector-effect: non-scaling-stroke` : l'épaisseur ne suit pas l'échelle.
// Chaque trait porte pathLength="1" : le tracé au scroll (components/site/Reveals.tsx) tire de 1 à 0.

/** Profil de la bouteille, tiré du modèle Meshy (viewBox 229 × 1000) : corps 0–68 %, épaule 68–77 %, col. */
const PROFIL = "M71,0 L71,175 C71,215 0,240 0,320 L0,985 Q0,1000 15,1000 L214,1000 Q229,1000 229,985 L229,320 C229,240 158,215 158,175 L158,0 Z";

interface PropsReleve { hauteur?: string; epuise?: boolean; cote?: string }

export function ReleveBouteille({ hauteur, epuise = false, cote }: PropsReleve) {
  return (
    <svg className={`releve${epuise ? " epuise" : ""}`} viewBox="-2 -2 233 1004" style={hauteur ? { height: hauteur } : undefined} aria-hidden="true">
      <path className="trait" pathLength={1} d={PROFIL} />
      <line className="trait" pathLength={1} x1="71" y1="200" x2="158" y2="200" />           {/* bord de la capsule (80 %) */}
      <rect className="trait" pathLength={1} x="9" y="502" width="211" height="335" />          {/* étiquette 4:5 à 33 % */}
      {cote && <title>{cote}</title>}
    </svg>
  );
}

/** Caisse bois de six, en perspective cavalière. */
export function ReleveCaisse() {
  return (
    <svg className="releve" viewBox="-2 -2 124 84" style={{ height: "40%" }} aria-hidden="true">
      <rect className="trait" pathLength={1} x="0" y="16" width="104" height="64" />
      <path className="trait" pathLength={1} d="M0,16 L16,0 L120,0 L104,16 M104,80 L120,64 L120,0" />
      <path className="trait" pathLength={1} d="M30,16 L30,80 M74,16 L74,80" />
    </svg>
  );
}

/** Coffret dégustation, même construction, couvercle marqué. */
export function ReleveCoffret() {
  return (
    <svg className="releve" viewBox="-2 -2 124 74" style={{ height: "34%" }} aria-hidden="true">
      <rect className="trait" pathLength={1} x="0" y="14" width="104" height="56" />
      <path className="trait" pathLength={1} d="M0,14 L14,0 L118,0 L104,14 M104,70 L118,56 L118,0 M0,26 L104,26 L118,12" />
    </svg>
  );
}
