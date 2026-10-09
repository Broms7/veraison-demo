// app/[lang]/page.tsx — la page unique : habillage fixe, scène 3D, puis les 11 chapitres.
// Composant serveur : seuls l'habillage, la scène et les îlots interactifs partent au client.
import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { estLangue, getDictionnaire } from "@/dictionnaires";
import { Fournisseur } from "@/components/site/Fournisseur";
import { PorteAge } from "@/components/habillage/PorteAge";
import { EnTete } from "@/components/habillage/EnTete";
import { Rail } from "@/components/habillage/Rail";
import { Scene } from "@/components/scene/Scene";
import { Ouverture } from "@/components/chapitres/Ouverture";
import { Cuvee } from "@/components/chapitres/Cuvee";
import { Geste } from "@/components/chapitres/Geste";
import { DansLeVerre } from "@/components/chapitres/DansLeVerre";
import { ATable } from "@/components/chapitres/ATable";
import { Domaine } from "@/components/chapitres/Domaine";
import { Millesimes } from "@/components/chapitres/Millesimes";
import { Allocation } from "@/components/chapitres/Allocation";
import { Reservation } from "@/components/chapitres/Reservation";
import { Journal } from "@/components/chapitres/Journal";
import { PiedDePage } from "@/components/chapitres/PiedDePage";

/** Le modèle Meshy est utilisé dès qu'il est déposé ; sinon, bouteille procédurale. Vérifié au build. */
const CHEMIN_MODELE = "/models/bouteille.glb";
const modele = fs.existsSync(path.join(process.cwd(), "public", CHEMIN_MODELE)) ? CHEMIN_MODELE : null;

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!estLangue(lang)) notFound();
  const t = getDictionnaire(lang);

  return (
    <Fournisseur langue={lang}>
      {/* Filtre « usure » du titre d'ouverture : bruit fractal seuillé, soustrait de la lettre. */}
      <svg width="0" height="0" className="defs" aria-hidden="true">
        <filter id="usure" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves={2} seed={11} result="bruit" />
          <feColorMatrix in="bruit" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 14 -8.6" result="trous" />
          <feComposite in="SourceGraphic" in2="trous" operator="out" />
        </filter>
      </svg>

      <PorteAge t={t.porte} />
      <EnTete t={t.tete} sommaire={t.sommaire} />
      <Rail libelle={t.rail} />
      <Scene modele={modele} alt={t.repli} />

      <main>
        <Ouverture t={t.ouverture} />
        <Cuvee t={t.cuvee} />
        <Geste t={t.geste} />
        <DansLeVerre t={t.verre} />
        <ATable t={t.table} />
        <Domaine t={t.domaine} />
        <Millesimes t={t.millesimes} />
        <Allocation t={t.allocation} langue={lang} />
        <Reservation t={t.resa} langue={lang} />
        <Journal t={t.journal} />
      </main>
      <PiedDePage t={t.pied} />
    </Fournisseur>
  );
}
