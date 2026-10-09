"use client";
// components/habillage/EnTete.tsx — en-tête fixe dans le cadre : menu (Sheet), marque,
// sélecteur FR / EN, compteur d'allocation, CTA permanent « Réserver une dégustation ».
// Il passe en clair quand un chapitre [data-sombre] (domaine, pied) glisse dessous :
// ScrollTrigger, synchronisé sur Lenis par le moteur.
import Link from "next/link";
import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSite } from "@/components/site/Fournisseur";
import { allerA, usePauseScroll } from "@/lib/scroll";
import { langues, type Dictionnaire } from "@/dictionnaires";

interface Props { t: Dictionnaire["tete"]; sommaire: Dictionnaire["sommaire"] }

const LIGNE_TETE = 40; // px depuis le haut : hauteur de lecture de l'en-tête

export function EnTete({ t, sommaire }: Props) {
  const { langue, panier } = useSite();
  const [sombre, setSombre] = useState(false);
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
          setSombre(actifs.size > 0);
        },
      }),
    );
    return () => declencheurs.forEach((d) => d.kill());
  }, []);

  return (
    <header className="tete" data-sombre={sombre || undefined}>
      <div className="marque">
        <Sheet open={menu} onOpenChange={setMenu}>
          <SheetTrigger className="burger" aria-label={t.menu} />
          <SheetContent side="left" className="menu">
            <SheetTitle className="mono menu-titre">{t.sommaire}</SheetTitle>
            <SheetDescription className="sr-only">{t.marque}</SheetDescription>
            <nav>
              {sommaire.map((s) => (
                <a
                  key={s.ancre}
                  href={`#${s.ancre}`}
                  className="titre menu-lien"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenu(false);
                    // On attend la fermeture du tiroir (qui verrouille le scroll) avant de défiler.
                    setTimeout(() => allerA(s.ancre), 320);
                  }}
                >
                  {s.titre}
                </a>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div>
          <b>{t.marque}</b>
          <small>{t.marqueSous}</small>
        </div>
      </div>
      <div className="droite">
        <nav className="mono langues" aria-label={t.langue}>
          {langues.map((l, i) => (
            <span key={l}>
              {i > 0 && " / "}
              <Link href={`/${l}`} hrefLang={l} aria-current={l === langue ? "true" : undefined}>
                {l.toUpperCase()}
              </Link>
            </span>
          ))}
        </nav>
        <a className="mono panier" href="#allocation">
          {t.allocation} (<span aria-live="polite">{panier}</span>)
        </a>
        <a className="btn btn-vin cta" href="#resa">{t.reserver}</a>
      </div>
    </header>
  );
}
