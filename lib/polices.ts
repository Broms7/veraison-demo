// lib/polices.ts — polices définitives (design-spec §1.3, pôle 3, 2026-10-09).
// Chaque police expose une variable CSS (--police-*) que styles/tokens.css relaie en --f-*.
// Titrage : Big Shoulders (variable). Sous Next 16, la famille « Display » n'existe plus : c'est
// l'axe optique `opsz` qui la remplace. On le charge ici et on force le cran Display (72) en CSS
// via --opsz-titre — sans ça, le navigateur sert le cran Texte, 7,6 % plus large, et les titres débordent.
import { Big_Shoulders, Instrument_Serif, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";

const titre = Big_Shoulders({ weight: "variable", axes: ["opsz"], subsets: ["latin", "latin-ext"], variable: "--police-titre", display: "swap" });
const ital = Instrument_Serif({ weight: "400", style: "italic", subsets: ["latin", "latin-ext"], variable: "--police-ital", display: "swap", preload: false });
const corps = Instrument_Sans({ weight: ["400", "500", "600"], subsets: ["latin", "latin-ext"], variable: "--police-corps", display: "swap" });
const mono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin", "latin-ext"], variable: "--police-mono", display: "swap", preload: false });

/** Classes à poser sur <html> pour déclarer les quatre variables. */
export const classesPolices = [titre.variable, ital.variable, corps.variable, mono.variable].join(" ");
