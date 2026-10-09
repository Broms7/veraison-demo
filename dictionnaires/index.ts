// dictionnaires/index.ts — accès aux textes par langue. Pas de bibliothèque i18n :
// deux objets typés suffisent pour un site d'une page en deux langues.
import { fr, type Dictionnaire } from "./fr";
import { en } from "./en";

const dictionnaires = { fr, en } satisfies Record<string, Dictionnaire>;

export type Langue = keyof typeof dictionnaires;
export type { Dictionnaire };
export const langues = Object.keys(dictionnaires) as Langue[];

export const estLangue = (v: string): v is Langue => v in dictionnaires;
export const getDictionnaire = (langue: Langue): Dictionnaire => dictionnaires[langue];
