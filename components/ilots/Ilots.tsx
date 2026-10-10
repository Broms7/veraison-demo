"use client";
// components/ilots/Ilots.tsx — petits îlots client posés dans des chapitres serveur :
// bouton d'ajout, tiroir de lecture (Sheet), boucle vidéo, titre d'ouverture, sceau, lettre des vendanges.
import Image from "next/image";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSite } from "@/components/site/Fournisseur";
import { abonner, etat } from "@/lib/moteur";
import { allerA, usePauseScroll } from "@/lib/scroll";
import { changerQuantite, useAllocation } from "@/lib/allocation";
import { useMouvementReduit } from "@/lib/media";

gsap.registerPlugin(useGSAP, SplitText, CustomEase);
const EASE_SORTIE = CustomEase.create("sortie", "0.2,0.7,0.2,1");   // = --ease-sortie

/** Ajoute une unité d'un format à l'allocation (§3.3 bouton contour) : « Ajouté · n » pendant 1,6 s.
 *  Au maximum du format, le bouton se désactive et le dit (« Maximum atteint »). */
export function BoutonAjout({ format, max, libelle, libelleAjoute, libelleMax, className = "btn-contour" }: {
  format: string; max: number; libelle: string; libelleAjoute?: string; libelleMax: string; className?: string;
}) {
  const quantites = useAllocation();
  const q = quantites[format] ?? 0;
  const [fait, setFait] = useState(false);
  const minuteur = useRef(0);
  useEffect(() => () => window.clearTimeout(minuteur.current), []);
  if (q >= max) return <button className={className} disabled>{libelleMax}</button>;
  return (
    <button className={className} onClick={() => {
      changerQuantite(format, 1, max);
      if (!libelleAjoute) return;
      setFait(true);
      window.clearTimeout(minuteur.current);
      minuteur.current = window.setTimeout(() => setFait(false), 1600);
    }}>
      {fait && libelleAjoute ? `${libelleAjoute} · ${q}` : libelle}
    </button>
  );
}

/** Tiroir latéral de lecture (fiche technique, fiche millésime). Radix pose aria-expanded sur le déclencheur. */
export function Tiroir({ declencheur, titre, texte, classeDeclencheur = "lien", libelle }: {
  declencheur: ReactNode; titre: string; texte: string; classeDeclencheur?: string; libelle?: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  usePauseScroll(ouvert);
  return (
    <Sheet open={ouvert} onOpenChange={setOuvert}>
      <SheetTrigger className={classeDeclencheur} aria-label={libelle}>{declencheur}</SheetTrigger>
      <SheetContent side="right">
        <SheetHeader className="p-0">
          <SheetTitle className="titre tiroir-titre">{titre}</SheetTitle>
          <SheetDescription className="tiroir-texte">{texte}</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

/** Fiche d'un millésime (addendum §2, X) : photo 4:5, année, statut + stock, météo, dégustation.
 *  Pour la 2021 (`allocation`), un lien ferme la fiche et défile jusqu'à l'allocation (XII). */
interface AnneeFiche { annee: string; statut: string; stock: string; meteo: string; degustation: string; alt: string }
export function FicheMillesime({ a, photo, t, declencheur, classeDeclencheur, allocation = false }: {
  a: AnneeFiche; photo: string | null; declencheur: ReactNode; classeDeclencheur: string; allocation?: boolean;
  t: { fermer: string; meteo: string; degustation: string; voirAllocation: string };
}) {
  const [ouvert, setOuvert] = useState(false);
  usePauseScroll(ouvert);
  return (
    <Sheet open={ouvert} onOpenChange={setOuvert}>
      <SheetTrigger className={classeDeclencheur}>{declencheur}</SheetTrigger>
      <SheetContent side="right" className="fiche-m">
        <div className="media fiche-photo">
          {photo ? <Image src={photo} alt={a.alt} fill sizes="(max-width: 759px) 92vw, 500px" /> : <span className="hachure mono">{a.annee}</span>}
        </div>
        <SheetHeader className="p-0">
          <SheetTitle className="titre fiche-an">{a.annee}</SheetTitle>
          <SheetDescription className="mono fiche-stock">{a.statut} · {a.stock}</SheetDescription>
        </SheetHeader>
        <div className="fiche-corps">
          <span className="mono">{t.meteo}</span>
          <p>{a.meteo}</p>
          <span className="mono">{t.degustation}</span>
          <p>{a.degustation}</p>
          {allocation && (
            <button type="button" className="btn" onClick={() => { setOuvert(false); setTimeout(() => allerA("allocation"), 340); }}>
              {t.voirAllocation}
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Boucle vidéo muette (chapitres IV et VII), bouton pause 44 px (WCAG 2.2.2).
 * Performance (recette n° 8) : l'image fixe (next/image, chargement différé) est toujours dessous ;
 * la <video> n'est montée qu'une fois la porte d'âge franchie ET le bloc à moins d'un écran de la fenêtre :
 * rien n'est téléchargé avant. Elle apparaît en fondu à sa première image lue.
 * Mouvement réduit ou fichier absent : l'image fixe seule. `decorative` : aria-hidden, image sans alt.
 */
export function BoucleVideo({ video, poster, alt, sizes, pause, lecture, decorative = false, className = "" }: {
  video: string | null; poster: string; alt: string; sizes: string; pause: string; lecture: string; decorative?: boolean; className?: string;
}) {
  const reduit = useMouvementReduit();
  const { entree } = useSite();
  const cadre = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const [proche, setProche] = useState(false);       // le bloc approche de la fenêtre
  const [lue, setLue] = useState(false);             // première image affichée : fondu
  const [enPause, setEnPause] = useState(false);     // pause demandée par le visiteur
  const voulue = useRef(false);                      // miroir de enPause lisible par l'observateur

  // 1. Approche : un écran de marge, une seule fois.
  useEffect(() => {
    const el = cadre.current;
    if (!el || !video || reduit || !entree) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setProche(true); obs.disconnect(); } }, { rootMargin: "100% 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [video, reduit, entree]);

  // 2. Lecture quand 30 % visible, pause hors champ.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // React ne reflète pas l'attribut `muted` : sans la propriété, Chrome refuse la lecture automatique.
    v.muted = true;
    v.defaultMuted = true;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !voulue.current) v.play().catch(() => { /* lecture refusée : l'image reste */ });
      else v.pause();
    }, { threshold: 0.3 });
    obs.observe(v);
    return () => obs.disconnect();
  }, [proche]);

  const basculer = () => {
    const v = ref.current;
    if (!v) return;
    voulue.current = !enPause;
    if (enPause) v.play().catch(() => {}); else v.pause();
    setEnPause(!enPause);
  };

  const active = !!video && proche && !reduit;
  return (
    <div ref={cadre} className={`media ${className}`}>
      <Image src={poster} alt={decorative ? "" : alt} fill sizes={sizes} />
      {active && (
        <>
          <video ref={ref} src={video} muted loop playsInline preload="auto" data-lue={lue || undefined}
            onPlaying={() => setLue(true)}
            aria-hidden={decorative || undefined} aria-label={decorative ? undefined : alt} />
          <button type="button" className="media-pause" onClick={basculer} aria-label={enPause ? lecture : pause}>
            {enPause ? (
              <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true"><path d="M1 1 13 8 1 15Z" fill="currentColor" /></svg>
            ) : (
              <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true"><path d="M2 1h3v14H2zM9 1h3v14H9z" fill="currentColor" /></svg>
            )}
          </button>
        </>
      )}
    </div>
  );
}

/** Pause du bandeau défilant de l'ouverture (WCAG 2.2.2) : pose data-arret sur .bandeau (CSS). */
export function PauseBandeau({ pause, lecture }: { pause: string; lecture: string }) {
  const [arret, setArret] = useState(false);
  return (
    <button type="button" className="bandeau-pause" aria-label={arret ? lecture : pause} onClick={() => {
      document.querySelector(".bandeau")?.toggleAttribute("data-arret", !arret);
      setArret(!arret);
    }}>
      {arret ? (
        <svg width="12" height="14" viewBox="0 0 14 16" aria-hidden="true"><path d="M1 1 13 8 1 15Z" fill="currentColor" /></svg>
      ) : (
        <svg width="12" height="14" viewBox="0 0 14 16" aria-hidden="true"><path d="M2 1h3v14H2zM9 1h3v14H9z" fill="currentColor" /></svg>
      )}
    </button>
  );
}

/** Titre d'ouverture : lettres révélées une à une (masque) quand l'iris s'ouvre (§5.2, ch. I). */
export function TitreOuverture({ texte }: { texte: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const { entree } = useSite();
  useGSAP(() => {
    if (!entree || !ref.current) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.from(ref.current, { opacity: 0, duration: 0.2 });
      return;
    }
    const split = SplitText.create(ref.current, { type: "chars", mask: "chars" });
    // L'interligne de 0,86 couperait les accents (le É) : on agrandit chaque masque vers le haut.
    split.masks.forEach((m) => { (m as HTMLElement).style.paddingTop = "0.3em"; (m as HTMLElement).style.marginTop = "-0.3em"; });
    gsap.from(split.chars, { yPercent: 105, duration: 0.8, ease: EASE_SORTIE, stagger: 0.04, delay: 0.9 });
  }, { dependencies: [entree], scope: ref });
  // tabIndex -1 : le focus y est posé quand la porte d'âge s'ouvre (recette n° 7)
  return <h1 ref={ref} className="titre titre-ouverture" tabIndex={-1}>{texte}</h1>;
}

/** Sceau du domaine : texte sur cercle + monogramme F dans le clos. Tourne avec le scroll (0,06°/px). */
export function Sceau({ texte, className = "sceau", tourne = true }: { texte: string; className?: string; tourne?: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const id = useId();
  useEffect(() => {
    if (!tourne) return;
    return abonner(() => {
      if (ref.current && !etat.reduit) ref.current.style.transform = `rotate(${etat.sy * 0.06}deg)`;
    });
  }, [tourne]);
  return (
    <svg ref={ref} className={className} viewBox="0 0 120 120" aria-hidden="true">
      <defs><path id={id} d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth=".8" />
      <circle cx="60" cy="60" r="36" fill="none" stroke="currentColor" strokeWidth=".5" />
      <text className="sceau-texte" fill="currentColor"><textPath href={`#${id}`}>{texte}</textPath></text>
      {/* Monogramme : le F dans le clos (carré à coins adoucis, rayon 12 % du côté) */}
      <rect x="49" y="49" width="22" height="22" rx="2.6" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <text x="60" y="66.5" textAnchor="middle" fill="currentColor" fontFamily="var(--f-titre)" fontWeight="900" fontSize="17">F</text>
    </svg>
  );
}

/** Lettre des vendanges : inscription simulée, avec message d'erreur relié au champ (§3.18). */
export function Lettre({ email, inscrire, inscrit, erreur }: { email: string; inscrire: string; inscrit: string; erreur: string }) {
  const [etatForm, setEtatForm] = useState<"repos" | "erreur" | "inscrit">("repos");
  const id = useId();
  return (
    <form className="inscr" noValidate onSubmit={(e) => {
      e.preventDefault();
      const champ = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
      setEtatForm(champ.value && champ.checkValidity() ? "inscrit" : "erreur");
    }}>
      <label className="mono" htmlFor={`${id}-email`}>{email}</label>
      <input id={`${id}-email`} name="email" type="email" required placeholder="nom@exemple.fr" autoComplete="email"
        aria-invalid={etatForm === "erreur" || undefined} aria-describedby={`${id}-retour`} />
      <button className="mono">{inscrire}</button>
      <p id={`${id}-retour`} className={`mono inscr-retour ${etatForm === "erreur" ? "erreur" : ""}`} role="status">
        {etatForm === "erreur" ? erreur : etatForm === "inscrit" ? inscrit : ""}
      </p>
    </form>
  );
}
