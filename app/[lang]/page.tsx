// app/[lang]/page.tsx — la page unique : habillage fixe, scène 3D, puis les 15 chapitres.
// Composant serveur : seuls l'habillage, la scène et les îlots interactifs partent au client.
import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { estLangue, getDictionnaire } from "@/dictionnaires";
import { Fournisseur } from "@/components/site/Fournisseur";
import { Reveals } from "@/components/site/Reveals";
import { PorteAge, Inerte } from "@/components/habillage/PorteAge";
import { EnTete } from "@/components/habillage/EnTete";
import { Rail } from "@/components/habillage/Rail";
import { Scene } from "@/components/scene/Scene";
import { Ouverture } from "@/components/chapitres/Ouverture";
import { Cuvee } from "@/components/chapitres/Cuvee";
import { Sol } from "@/components/chapitres/Sol";
import { Roue } from "@/components/chapitres/Roue";
import { Annee } from "@/components/chapitres/Annee";
import { Equipe } from "@/components/chapitres/Equipe";
import { Presse } from "@/components/chapitres/Presse";
import { Venir } from "@/components/chapitres/Venir";
import { Geste } from "@/components/chapitres/Geste";
import { DansLeVerre } from "@/components/chapitres/DansLeVerre";
import { ATable } from "@/components/chapitres/ATable";
import { Domaine } from "@/components/chapitres/Domaine";
import { Millesimes } from "@/components/chapitres/Millesimes";
import { Allocation } from "@/components/chapitres/Allocation";
import { Reservation } from "@/components/chapitres/Reservation";
import { Journal } from "@/components/chapitres/Journal";
import { PiedDePage } from "@/components/chapitres/PiedDePage";

/** Un fichier de public/ est utilisé s'il existe au build ; sinon le composant prend son repli. */
const siPresent = (chemin: string) => (fs.existsSync(path.join(process.cwd(), "public", chemin)) ? chemin : null);
const MODELE = siPresent("/models/bouteille.glb");                 // sinon bouteille procédurale
const VIDEO_CLAIRE = siPresent("/visuels/claire-geste.mp4");       // sinon image fixe
const VIDEO_PLATEAU = siPresent("/visuels/plateau-aube-1600.mp4"); // sinon image fixe
// Portraits (IX) et photos de millésimes (X) : emplacement hachuré tant que le WebP n'est pas posé.
const PORTRAITS = Object.fromEntries(["equipe-claire", "equipe-paul", "equipe-joaquim", "equipe-odile"].map((n) => [n, siPresent(`/visuels/${n}.webp`)]));
const PHOTOS_MILLESIMES = Object.fromEntries(["2016", "2017", "2018", "2019", "2020", "2021"].map((a) => [a, siPresent(`/visuels/millesime-${a}.webp`)]));

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

      <PorteAge t={t.porte} libelleLangue={t.tete.langue} />
      <Inerte>
        <a className="evitement" href="#resa">{t.tete.evitement}</a>
        <EnTete t={t.tete} sommaire={t.sommaire} />
        <Rail libelle={t.rail} />
        <Scene modele={MODELE} alt={t.repli} />

        <main>
          <Ouverture t={t.ouverture} langue={lang} />
          <Cuvee t={t.cuvee} />
          <Sol t={t.sol} />
          <Geste t={t.geste} video={VIDEO_CLAIRE} tv={t.video} />
          <DansLeVerre t={t.verre} />
          <Roue t={t.roue} />
          <ATable t={t.table} />
          <Domaine t={t.domaine} video={VIDEO_PLATEAU} tv={t.video} langue={lang} />
          <Annee t={t.annee} />
          <Equipe t={t.equipe} portraits={PORTRAITS} />
          <Millesimes t={t.millesimes} photos={PHOTOS_MILLESIMES} />
          <Presse t={t.presse} />
          <Allocation t={t.allocation} langue={lang} />
          <Reservation t={t.resa} langue={lang} />
          <Venir t={t.venir} />
          <Journal t={t.journal} />
        </main>
        <PiedDePage t={t.pied} />
      </Inerte>
      <Reveals />
    </Fournisseur>
  );
}
