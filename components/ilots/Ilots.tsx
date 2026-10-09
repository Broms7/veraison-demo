"use client";
// components/ilots/Ilots.tsx — les petits îlots client posés dans des chapitres serveur :
// bouton d'ajout à l'allocation, tiroir de lecture (Sheet), vidéo (Dialog), titre d'ouverture,
// sceau qui tourne, lettre des vendanges. Regroupés ici : chacun fait quelques lignes.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSite } from "@/components/site/Fournisseur";
import { abonner, etat } from "@/lib/moteur";
import { usePauseScroll } from "@/lib/scroll";

gsap.registerPlugin(useGSAP, SplitText);

/** Ajoute une unité au panier d'allocation (état local, pas de backend). */
export function BoutonAjout({ libelle, libelleAjoute, className = "ajout" }: { libelle: string; libelleAjoute?: string; className?: string }) {
  const { ajouter } = useSite();
  const [fait, setFait] = useState(false);
  return (
    <button className={className} onClick={() => { ajouter(); setFait(true); }}>
      {fait && libelleAjoute ? libelleAjoute : libelle}
    </button>
  );
}

/** Tiroir latéral de lecture (fiche technique, fiche millésime). */
export function Tiroir({ declencheur, titre, texte, classeDeclencheur = "lien" }: { declencheur: ReactNode; titre: string; texte: string; classeDeclencheur?: string }) {
  const [ouvert, setOuvert] = useState(false);
  usePauseScroll(ouvert);
  return (
    <Sheet open={ouvert} onOpenChange={setOuvert}>
      <SheetTrigger className={classeDeclencheur}>{declencheur}</SheetTrigger>
      <SheetContent side="right" className="tiroir">
        <SheetHeader>
          <SheetTitle className="titre tiroir-titre">{titre}</SheetTitle>
          <SheetDescription className="tiroir-texte">{texte}</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

/** Vignette vidéo : ouvre une modale plein cadre (la vidéo Kling viendra plus tard). */
export function VideoGeste({ vignette, libelle, titre, attente }: { vignette: string; libelle: string; titre: string; attente: string }) {
  const [ouvert, setOuvert] = useState(false);
  usePauseScroll(ouvert);
  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <div className="video ph">
        {vignette}
        <DialogTrigger className="play" aria-label={libelle}>
          <svg viewBox="0 0 10 12" width="12" height="14" aria-hidden="true"><path d="M0 0 10 6 0 12Z" fill="currentColor" /></svg>
        </DialogTrigger>
      </div>
      <DialogContent className="modale-video">
        <DialogTitle className="titre">{titre}</DialogTitle>
        <div className="ph sombre modale-video-ecran">{attente}</div>
        <DialogDescription className="sr-only">{attente}</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

/** Titre d'ouverture : révélé lettre par lettre (SplitText) quand l'iris s'ouvre. */
export function TitreOuverture({ texte }: { texte: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const { entree } = useSite();
  useGSAP(() => {
    if (!entree || !ref.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const split = SplitText.create(ref.current, { type: "chars", mask: "chars" });
    // L'interligne de 0,82 couperait les accents (le É) : on agrandit chaque masque vers le haut.
    split.masks.forEach((m) => { (m as HTMLElement).style.paddingTop = "0.3em"; (m as HTMLElement).style.marginTop = "-0.3em"; });
    gsap.from(split.chars, { yPercent: 105, duration: 1.1, ease: "power4.out", stagger: 0.06, delay: 0.7 });
  }, { dependencies: [entree], scope: ref });
  return <h1 ref={ref} className="titre titre-ouverture">{texte}</h1>;
}

/** Sceau du domaine : tourne avec le scroll (lu sur l'état du moteur). */
export function Sceau({ texte }: { texte: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => abonner(() => {
    if (ref.current) ref.current.style.transform = `rotate(${etat.sy * 0.06}deg)`;
  }), []);
  return (
    <svg ref={ref} className="sceau" viewBox="0 0 120 120" aria-hidden="true">
      <defs><path id="cercle-sceau" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth=".8" />
      <circle cx="60" cy="60" r="36" fill="none" stroke="currentColor" strokeWidth=".5" />
      <text className="sceau-texte" fill="currentColor"><textPath href="#cercle-sceau">{texte}</textPath></text>
      <text className="sceau-f" x="60" y="66" textAnchor="middle" fill="currentColor">F</text>
    </svg>
  );
}

/** Lettre des vendanges : inscription simulée, rien n'est envoyé. */
export function Lettre({ email, inscrire, inscrit }: { email: string; inscrire: string; inscrit: string }) {
  const [fait, setFait] = useState(false);
  return (
    <form className="inscr" onSubmit={(e) => { e.preventDefault(); setFait(true); }}>
      <input type="email" required placeholder={email} aria-label={email} autoComplete="email" />
      <button className="mono">{inscrire}</button>
      <p className="mono inscr-retour" role="status">{fait ? inscrit : ""}</p>
    </form>
  );
}
