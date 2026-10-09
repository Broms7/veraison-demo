"use client";
// components/site/Reveals.tsx — apparitions au scroll (design-spec §5.1, §5.2), une seule fois chacune.
//  - Titres (h2, h3 .titre) : chaque ligne dans un masque, translateY(105 % → 0), 800 ms, 40 ms entre lignes,
//    déclenché quand le haut du titre atteint 85 % de la fenêtre. Le surtitre qui précède : fondu 400 ms.
//  - Blocs [data-apparition] : fondu + 16 px, 600 ms, 120 ms après le titre.
//  - Relevés au trait [data-trace] : tracé (stroke-dashoffset), 800 ms, décalé de 80 ms.
// Mouvement réduit : opacité seule, 200 ms ; relevés affichés déjà tracés.
// Le chapitre IX (réservation) n'a que son titre : zéro animation sur les contrôles.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase);

// Courbe exacte de --ease-sortie (design-spec §1.1) : JS et CSS bougent de la même façon.
const EASE = CustomEase.create("sortie", "0.2,0.7,0.2,1");
const DEPART = "top 85%";

export function Reveals() {
  useGSAP(() => {
    const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const titres = gsap.utils.toArray<HTMLElement>("main h2.titre, main h3.titre, .pied h3.titre");

    titres.forEach((titre) => {
      const surtitre = titre.previousElementSibling?.classList.contains("surtitre") ? titre.previousElementSibling : null;
      const declencheur = { trigger: titre, start: DEPART, once: true };
      if (reduit) {
        gsap.from([surtitre, titre].filter(Boolean), { opacity: 0, duration: 0.2, scrollTrigger: declencheur });
        return;
      }
      if (surtitre) gsap.from(surtitre, { opacity: 0, duration: 0.4, ease: EASE, scrollTrigger: declencheur });
      SplitText.create(titre, {
        type: "lines", mask: "lines", autoSplit: true,
        onSplit(self) {
          // Interligne serré : on agrandit les masques vers le haut pour ne pas rogner les accents.
          self.masks.forEach((m) => { (m as HTMLElement).style.paddingTop = "0.25em"; (m as HTMLElement).style.marginTop = "-0.25em"; });
          // onComplete : le titre retrouve son DOM d'origine une fois révélé (doc SplitText).
          return gsap.from(self.lines, { yPercent: 105, duration: 0.8, ease: EASE, stagger: 0.04, scrollTrigger: declencheur, onComplete: () => self.revert() });
        },
      });
    });

    gsap.utils.toArray<HTMLElement>("[data-apparition]").forEach((el) => {
      gsap.from(el, reduit
        ? { opacity: 0, duration: 0.2, scrollTrigger: { trigger: el, start: DEPART, once: true } }
        : { opacity: 0, y: 16, duration: 0.6, delay: 0.12 + Number(el.dataset.apparition || 0), ease: EASE, scrollTrigger: { trigger: el, start: DEPART, once: true } });
    });

    if (!reduit) {
      gsap.utils.toArray<HTMLElement>("[data-trace]").forEach((groupe) => {
        // pathLength="1" sur chaque trait : le tirage 1 → 0 dessine le trait sur toute sa longueur.
        // Un relevé (une année) après l'autre, décalés de 80 ms ; les épuisés restent en pointillé, sans tracé.
        groupe.querySelectorAll(".releve:not(.epuise)").forEach((releve, i) => {
          const traits = releve.querySelectorAll(".trait");
          gsap.fromTo(traits, { strokeDasharray: 1, strokeDashoffset: 1 }, {
            strokeDashoffset: 0, duration: 0.8, ease: EASE, delay: i * 0.08,
            scrollTrigger: { trigger: groupe, start: DEPART, once: true },
            onComplete: () => gsap.set(traits, { clearProps: "strokeDasharray,strokeDashoffset" }),
          });
        });
      });
    }
  });
  return null;
}
