"use client";
// components/habillage/EnTete.tsx — en-tête fixe dans le cadre (design-spec §3.1, §3.2).
// Desktop : burger + logotype à gauche ; FR/EN, « Allocation (n) », CTA à droite.
// Mobile : logotype, CTA court, burger à droite ; FR/EN et Allocation passent dans le sommaire.
// Fond sombre détecté à y = 40 px (domaine, pied) : ScrollTrigger pose body[data-fond="sombre"],
// lu en CSS par l'en-tête ET le rail.
import Link from "next/link";
import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSite } from "@/components/site/Fournisseur";
import { allerA, usePauseScroll } from "@/lib/scroll";
import { totalArticles, useAllocation } from "@/lib/allocation";
import { langues, type Dictionnaire, type Langue } from "@/dictionnaires";

interface Props { t: Dictionnaire["tete"]; sommaire: Dictionnaire["sommaire"]; ouvrirLibelle: string }

const LIGNE_TETE = 40; // px depuis le haut : hauteur de lecture de l'en-tête

/** Sélecteur de langue : deux liens, langue active marquée (§3.2). Réutilisé par la porte et le sommaire. */
export function Langues({ langue, libelle, className = "" }: { langue: Langue; libelle: string; className?: string }) {
  return (
    <nav className={`mono langues ${className}`} aria-label={libelle}>
      {langues.map((l, i) => (
        <span key={l}>
          {i > 0 && <span aria-hidden="true"> / </span>}
          <Link href={`/${l}`} hrefLang={l} lang={l} aria-current={l === langue ? "true" : undefined}>
            {l.toUpperCase()}
          </Link>
        </span>
      ))}
    </nav>
  );
}

/** Logotype : FERRUGINE / CLOS · POMEROL, point médian = carré oxyde (§3, logotype). */
function Logotype({ t }: { t: Props["t"] }) {
  return (
    <a className="logotype" href="#ouverture" aria-label={t.accueil}
      onClick={(e) => { e.preventDefault(); allerA("ouverture"); }}>
      <b>{t.marque}</b>
      <small aria-hidden="true">CLOS<i className="point" />POMEROL</small>
    </a>
  );
}

export function EnTete({ t, sommaire, ouvrirLibelle }: Props) {
  const { langue, ouvrirPanier } = useSite();
  const articles = totalArticles(useAllocation());
  const [menu, setMenu] = useState(false);
  usePauseScroll(menu);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const actifs = new Set<Element>();
    const declencheurs = [...document.querySelectorAll("[data-sombre]")].map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: `top ${LIGNE_TETE}px`,
        end: `bottom ${LIGNE_TETE}px`,
        onToggle: (st) => {
          if (st.isActive) actifs.add(el); else actifs.delete(el);
          document.body.dataset.fond = actifs.size > 0 ? "sombre" : "clair";
        },
      }),
    );
    return () => declencheurs.forEach((d) => d.kill());
  }, []);

  // « Allocation (n) » ouvre le récapitulatif (components/allocation/Panier.tsx) ; depuis le menu,
  // on ferme d'abord le sommaire (son verrou de scroll et son focus) avant d'ouvrir le panier.
  const lienPanier = (
    <button type="button" className="mono panier" aria-haspopup="dialog" aria-label={`${ouvrirLibelle} (${articles})`}
      onClick={() => { if (menu) { setMenu(false); window.setTimeout(() => ouvrirPanier(true), 320); } else ouvrirPanier(true); }}>
      {t.allocation} (<span aria-live="polite">{articles}</span>)
    </button>
  );

  return (
    <header className="tete">
      <div className="marque">
        <Sheet open={menu} onOpenChange={setMenu}>
          <SheetTrigger className="burger" aria-label={t.menu} />
          <SheetContent side="left" className="menu" data-lenis-prevent="">
            <SheetTitle className="mono">{t.sommaire}</SheetTitle>
            <SheetDescription className="sr-only">{t.marque}</SheetDescription>
            <nav>
              {sommaire.map((s) => (
                <a key={s.ancre} href={`#${s.ancre}`} className="titre menu-lien"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenu(false);
                    // On attend la fermeture du tiroir (qui verrouille le scroll) avant de défiler.
                    setTimeout(() => allerA(s.ancre), 320);
                  }}>
                  {s.titre}
                </a>
              ))}
            </nav>
            <div className="menu-pied">
              <Langues langue={langue} libelle={t.langue} />
              {lienPanier}
            </div>
          </SheetContent>
        </Sheet>
        <Logotype t={t} />
      </div>
      <div className="droite">
        <Langues langue={langue} libelle={t.langue} />
        {lienPanier}
        <a className="btn cta" href="#resa">{t.reserver}</a>
        <a className="btn cta-court" href="#resa">{t.reserverCourt}</a>
      </div>
    </header>
  );
}
