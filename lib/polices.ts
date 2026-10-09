// lib/polices.ts — POLICES PROVISOIRES (phase 1, reprises du wireframe)
// Seul fichier à modifier en phase 2 pour changer de typographie, avec styles/tokens.css.
// Anton est provisoire : Romain veut une autre grotesque condensée en final.
// Chaque police expose une variable CSS (--police-*) que tokens.css relaie en --f-*.
import { Anton, Cormorant_Garamond, Instrument_Sans, JetBrains_Mono } from "next/font/google";

const titre = Anton({ weight: "400", subsets: ["latin"], variable: "--police-titre", display: "swap" });
const ital = Cormorant_Garamond({ weight: ["400", "500"], style: "italic", subsets: ["latin"], variable: "--police-ital", display: "swap" });
const corps = Instrument_Sans({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--police-corps", display: "swap" });
const mono = JetBrains_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--police-mono", display: "swap" });

/** Classes à poser sur <html> pour déclarer les quatre variables. */
export const classesPolices = [titre.variable, ital.variable, corps.variable, mono.variable].join(" ");
