"use client";
// components/site/Habillage.tsx — mouvement de la phase 3 (design-spec-addendum §3 à §6), chargé en
// différé (dynamic, ssr: false, depuis Reveals) : rien de tout ça ne sert au-dessus de la ligne de flottaison
// avant que la porte s'ouvre. Un seul effet, tout est nettoyé au démontage (gsap.context + observateurs).
//   1. Tracés au trait : svg[data-trace="scrub"] liés au scroll (réversibles), "once" déclenchés à 60 %.
//   2. Compteurs [data-compte] (number ticker), jauges [data-jauges], filets de registre, bandeau en pause hors champ.
//   3. Transitions scrubbées : iris bordeaux (VII), rideau latéral (VIII), rideau bordeaux (IX, manifeste).
//   4. VIII épinglé à défilement horizontal (≥ 1024 px, sans mouvement réduit), accrochage par mois via Lenis.
//   5. Citation de Claire révélée ligne par ligne.
// Mouvement réduit : dessins complets, valeurs finales, aucune découpe, rangée native (CSS).
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { getLenis } from "@/lib/moteur";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
const EASE_TRACE = CustomEase.create("trace", "0.65,0,0.35,1");     // = --ease-trace (mouvement à l'écran)
const EASE_SORTIE = CustomEase.create("sortie", "0.2,0.7,0.2,1");   // = --ease-sortie (compteurs, entrées)
const FORMES = "path,line,polyline,polygon,circle,rect,ellipse";

/* ---------------- tracés ---------------- */

interface Groupe { traits: SVGGeometryElement[]; pointilles: SVGElement[]; textes: (SVGElement | HTMLElement)[] }

/** Prépare un dessin : chaque trait reçoit pathLength=1 (tirage de 1 → 0 sans getTotalLength).
 *  Les pointillés gardent leur motif : ils apparaissent en fondu au lieu d'être tirés. */
function preparer(svg: SVGSVGElement): Groupe[] {
  return [...svg.querySelectorAll<SVGGElement>("[data-o]")]
    .sort((a, b) => Number(a.dataset.o) - Number(b.dataset.o))
    .map((g) => {
      const formes = [...g.querySelectorAll<SVGGeometryElement>(FORMES)];
      const traits = formes.filter((f) => !f.classList.contains("pt"));
      traits.forEach((f) => { f.setAttribute("pathLength", "1"); f.style.strokeDasharray = "1"; f.style.strokeDashoffset = "1"; });
      const pointilles = formes.filter((f) => f.classList.contains("pt"));
      pointilles.forEach((f) => { f.style.opacity = "0"; });
      // Textes du groupe : <text> SVG des petits objets + libellés HTML en surimpression des grands dessins
      const libelles = svg.parentElement?.querySelectorAll<HTMLElement>(`[data-libelle="${g.dataset.o}"]`) ?? [];
      const textes: (SVGElement | HTMLElement)[] = [...g.querySelectorAll<SVGTextElement>("text"), ...libelles];
      textes.forEach((t) => { t.style.opacity = "0"; });
      return { traits, pointilles, textes };
    });
}

/** Avancement local d'un groupe (0 → 1) appliqué à ses traits, pointillés et textes. */
function dessinerGroupe(g: Groupe, local: number) {
  g.traits.forEach((f) => { f.style.strokeDashoffset = String(1 - local); });
  g.pointilles.forEach((f) => { f.style.opacity = String(local); });
  g.textes.forEach((t) => { t.style.opacity = local >= 1 ? "1" : "0"; });
}

/* ---------------- compteurs ---------------- */

function compter(el: HTMLElement, delai = 0) {
  const cible = Number(el.dataset.compte);
  const dec = Number(el.dataset.dec || 0);
  const format = new Intl.NumberFormat(el.dataset.locale, { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const etatCompte = { v: 0 };
  return gsap.to(etatCompte, {
    v: cible, duration: 1.2, delay: delai, ease: EASE_SORTIE,
    onUpdate: () => { el.textContent = format.format(etatCompte.v); },
  });
}

/** Appelle `fn` dès que la porte d'âge est franchie (body[data-porte="ouverte"]). */
function quandPorteOuverte(fn: () => void): () => void {
  if (document.body.dataset.porte === "ouverte") { fn(); return () => {}; }
  const obs = new MutationObserver(() => {
    if (document.body.dataset.porte === "ouverte") { obs.disconnect(); fn(); }
  });
  obs.observe(document.body, { attributes: true, attributeFilter: ["data-porte"] });
  return () => obs.disconnect();
}

export default function Habillage() {
  useEffect(() => {
    const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const racine = document.documentElement;
    racine.dataset.js = "";            // les replis « sans JS » du CSS cessent de s'appliquer
    const nettoyages: (() => void)[] = [];
    const observer = (cible: Element, rappel: () => void, options: IntersectionObserverInit) => {
      const io = new IntersectionObserver((entrees, obs) => {
        if (entrees.some((e) => e.isIntersecting)) { obs.disconnect(); rappel(); }
      }, options);
      io.observe(cible);
      nettoyages.push(() => io.disconnect());
    };

    const ctx = gsap.context(() => {
      /* --- filets de registre : tracés de gauche à droite à l'entrée du chapitre --- */
      document.querySelectorAll<HTMLElement>(".ch[data-registre]").forEach((sec) => {
        observer(sec, () => sec.classList.add("vu"), { rootMargin: "0px 0px -15% 0px" });
      });

      /* --- bandeau : en pause dès que l'ouverture sort de la fenêtre --- */
      const bandeau = document.querySelector<HTMLElement>(".bandeau");
      const ouverture = document.getElementById("ouverture");
      if (bandeau && ouverture) {
        const io = new IntersectionObserver(([e]) => bandeau.toggleAttribute("data-pause", !e.isIntersecting));
        io.observe(ouverture);
        nettoyages.push(() => io.disconnect());
      }

      if (reduit) return;   // tout ce qui suit est du mouvement

      /* --- 1. tracés --- */
      document.querySelectorAll<SVGSVGElement>("svg[data-trace]").forEach((svg) => {
        const groupes = preparer(svg);
        const N = groupes.length;
        if (svg.dataset.trace === "scrub") {
          // Coupe du sol : légende et mot « fer » suivent le tracé (réversible, comme lui).
          const coupe = svg.classList.contains("coupe");
          const legende = coupe ? [...document.querySelectorAll<HTMLElement>("#sol [data-legende]")] : [];
          const fer = coupe ? document.querySelector<HTMLElement>("#sol [data-fer]") : null;
          fer?.setAttribute("data-encre", "");
          const proxy = { p: 0 };
          gsap.to(proxy, {
            p: 1, ease: "none",
            // Fin avancée (addendum : « center 45% ») pour que le dessin soit complet à l'ancre du chapitre,
            // là où le lecteur s'arrête ; il reste réversible.
            scrollTrigger: { trigger: svg, start: "top 85%", end: "center 62%", scrub: 0.6 },
            onUpdate: () => {
              groupes.forEach((g, k) => dessinerGroupe(g, gsap.utils.clamp(0, 1, proxy.p * N - k)));
              if (!coupe) return;
              const fait = (k: number) => proxy.p * N - k >= 1;
              legende.forEach((li) => li.classList.toggle("on", fait(Number(li.dataset.legende))));
              fer?.toggleAttribute("data-encre", !fait(3));   // les plaques de fer tracées : l'encre sèche en vin
            },
          });
        } else {
          // Déclenché une fois, à 60 % de visibilité (fonctionne aussi dans la piste horizontale :
          // IntersectionObserver tient compte des transformations).
          const pas = svg.classList.contains("roue") ? 0.06 : 0.12;
          const duree = Math.max(0.3, 0.9 - (N - 1) * pas);
          observer(svg, () => {
            groupes.forEach((g, k) => {
              const avance = { v: 0 };
              gsap.to(avance, { v: 1, duration: duree, delay: k * pas, ease: EASE_TRACE, onUpdate: () => dessinerGroupe(g, avance.v) });
            });
          }, { threshold: 0.6 });
        }
      });

      /* --- 2. jauges du profil en bouche : cran par cran --- */
      document.querySelectorAll<HTMLElement>("[data-jauges]").forEach((bloc) => {
        // Valeur lue sur data-v (et non sur les classes) : l'effet peut être rejoué (StrictMode, HMR).
        const lignes = [...bloc.querySelectorAll<HTMLElement>(".crans")].map((c) => [...c.querySelectorAll("i")].slice(0, Number(c.dataset.v)));
        bloc.querySelectorAll("i.plein").forEach((i) => i.classList.remove("plein"));
        observer(bloc, () => {
          lignes.forEach((crans, l) => crans.forEach((i, k) => {
            gsap.delayedCall(l * 0.12 + k * 0.08, () => i.classList.add("plein"));
          }));
        }, { threshold: 0.6 });
      });

      /* --- compteurs : de 0 à la valeur, une fois --- */
      document.querySelectorAll<HTMLElement>("[data-compte]").forEach((el) => {
        const dec = Number(el.dataset.dec || 0);
        el.textContent = new Intl.NumberFormat(el.dataset.locale, { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(0);
        if (el.closest("#ouverture")) {
          // Hero : après l'entrée du titre (≈ 2 s après l'ouverture de la porte).
          nettoyages.push(quandPorteOuverte(() => compter(el, 2)));
        } else {
          observer(el, () => compter(el), { rootMargin: "0px 0px -12% 0px" });
        }
      });

      /* --- 3. transitions de chapitres (scrubbées, réversibles) --- */
      const domaine = document.getElementById("domaine");
      const iris = domaine?.querySelector<HTMLElement>(".iris");
      if (domaine && iris) {
        // T-a · iris bordeaux : cercle nuit centré sur la bouteille (x 0,33 → 83 % de la largeur),
        // la section bordeaux dépasse d'un anneau de 1,6vmax.
        ScrollTrigger.create({
          trigger: domaine, start: "top bottom", end: () => `top ${innerHeight * 0.1}px`, scrub: true,
          onUpdate: (st) => {
            const p = st.progress;
            if (p >= 1) { domaine.style.clipPath = ""; iris.style.clipPath = ""; return; }
            const haut = domaine.getBoundingClientRect().top;
            const R = p * Math.hypot(innerWidth, innerHeight) * 1.1;
            const anneau = Math.max(innerWidth, innerHeight) * 0.016;
            const cx = innerWidth * (innerWidth < 760 ? 0.5 : 0.83);
            const cy = innerHeight * 0.52 - haut;
            domaine.style.clipPath = `circle(${p > 0 ? R + anneau : 0}px at ${cx}px ${cy}px)`;
            iris.style.clipPath = `circle(${R}px at ${cx}px ${cy}px)`;
          },
          onLeave: () => { domaine.style.clipPath = ""; iris.style.clipPath = ""; },
        });
      }

      const annee = document.getElementById("annee");
      const collant = annee?.querySelector<HTMLElement>(".collant");
      const bord = annee?.querySelector<HTMLElement>(".bord-rideau");
      if (annee && collant && bord) {
        // T-b · rideau latéral : le papier de VIII entre de la gauche, bord d'attaque bordeaux de 10 px.
        ScrollTrigger.create({
          trigger: annee, start: "top bottom", end: "top top", scrub: true,
          onUpdate: (st) => {
            const p = st.progress;
            const fini = p >= 1;
            collant.style.clipPath = fini ? "" : `inset(0 ${(1 - p) * 100}% 0 0)`;
            bord.style.display = fini || p <= 0 ? "none" : "block";
            bord.style.transform = `translateX(calc(${p * 100}vw - 100%))`;
          },
        });
      }

      const manifeste = document.querySelector<HTMLElement>(".manifeste");
      if (manifeste) {
        // T-c · rideau bordeaux qui tombe sur le manifeste.
        ScrollTrigger.create({
          trigger: manifeste, start: "top bottom", end: "top 30%", scrub: true,
          onUpdate: (st) => { manifeste.style.clipPath = st.progress >= 1 ? "" : `inset(0 0 ${(1 - st.progress) * 100}% 0)`; },
        });
        // 5. Citation de Claire : lignes masquées, 900 ms, 60 ms entre lignes ; signature 200 ms après.
        const citation = manifeste.querySelector<HTMLElement>("blockquote p");
        const signature = manifeste.querySelector<HTMLElement>("cite");
        if (citation && signature) {
          gsap.set(signature, { opacity: 0 });
          SplitText.create(citation, {
            type: "lines", mask: "lines", autoSplit: true,
            onSplit: (self) => gsap.timeline({ scrollTrigger: { trigger: manifeste, start: "top 50%", once: true } })
              .from(self.lines, { yPercent: 105, duration: 0.9, stagger: 0.06, ease: EASE_SORTIE })
              .to(signature, { opacity: 1, duration: 0.4, ease: EASE_SORTIE }, "+=0.2"),
          });
        }
      }
    });

    /* --- 4. VIII épinglé à défilement horizontal --- */
    const mm = gsap.matchMedia();
    const annee = document.getElementById("annee");
    const piste = annee?.querySelector<HTMLElement>(".piste");
    const regle = annee ? [...annee.querySelectorAll<HTMLElement>(".regle-mois span")] : [];
    const marquer = (cour: number) => regle.forEach((sp, k) => {
      sp.classList.toggle("fait", k <= cour);
      sp.classList.toggle("cour", k === cour);
    });
    if (annee && piste) {
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        annee.classList.add("epingle");
        // Course = largeur réelle de la piste − fenêtre (panneau d'ouverture 44vw + 12 × 26vw ≈ 356vw).
        const distance = () => {
          const dernier = piste.lastElementChild as HTMLElement;
          return Math.max(0, dernier.offsetLeft + dernier.offsetWidth - innerWidth);
        };
        const tween = gsap.to(piste, {
          x: () => -distance(), ease: "none",
          scrollTrigger: {
            id: "annee", trigger: annee, start: "top top", end: () => `+=${distance()}`,
            pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
            // Les déclencheurs créés AVANT celui-ci (en-tête, titres) sont plus bas dans la page :
            // l'épinglage doit être recalculé en premier pour que leurs positions comptent son espaceur.
            refreshPriority: 1,
            // Règle des mois : mois courant = cran le plus proche (cran 0 = panneau d'ouverture).
            onUpdate: (st) => marquer(st.progress <= 0 ? -1 : Math.min(11, Math.round(st.progress * 12) - 1)),
          },
        });

        // Accrochage par mois (§6) : on se pose sur un cran, jamais entre deux. Fait par Lenis plutôt que
        // par le `snap` de ScrollTrigger, qui se bat avec le défilement lissé de Lenis.
        let minuteur = 0;
        let enCours = false;   // notre propre défilement d'accrochage ne doit pas se relancer lui-même
        const accrocher = () => {
          const st = tween.scrollTrigger;
          const lenis = getLenis();
          if (!st || !lenis || enCours) return;
          const y = scrollY;
          if (y <= st.start + 2 || y >= st.end - 2) return;
          const cran = Math.round(((y - st.start) / (st.end - st.start)) * 12) / 12;
          const cibleY = st.start + cran * (st.end - st.start);
          const ecart = Math.abs(cibleY - y);
          if (ecart < 2) return;
          enCours = true;
          // power2.inOut, 0,2 à 0,5 s selon l'écart (addendum §6)
          lenis.scrollTo(cibleY, {
            duration: gsap.utils.clamp(0.2, 0.5, ecart / 900),
            easing: (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
            onComplete: () => { enCours = false; },
          });
          // Filet de sécurité : si le visiteur reprend la molette, Lenis abandonne sans onComplete.
          window.setTimeout(() => { enCours = false; }, 700);
        };
        const surScroll = () => { window.clearTimeout(minuteur); minuteur = window.setTimeout(accrocher, 120); };
        const lenis = getLenis();
        lenis?.on("scroll", surScroll);
        return () => {
          lenis?.off("scroll", surScroll);
          window.clearTimeout(minuteur);
          annee.classList.remove("epingle");
          gsap.set(piste, { clearProps: "x" });
        };
      });

      // Sans épinglage : la règle suit le défilement natif de la rangée (scroll d'un élément, pas de la page).
      const surRangee = () => {
        if (annee.classList.contains("epingle")) return;
        const ref = piste.getBoundingClientRect().left + piste.clientWidth * 0.4;
        let cour = -1;
        piste.querySelectorAll<HTMLElement>(".mois").forEach((m, k) => { if (m.getBoundingClientRect().left < ref) cour = k; });
        marquer(cour);
      };
      piste.addEventListener("scroll", surRangee, { passive: true });
      // Le pin-spacer change la hauteur du document : tout le monde re-mesure (dont le moteur de poses),
      // dans l'ordre de la page.
      const image = requestAnimationFrame(() => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
      nettoyages.push(() => cancelAnimationFrame(image));
      nettoyages.push(() => piste.removeEventListener("scroll", surRangee));
    }

    return () => {
      ctx.revert();
      mm.revert();
      nettoyages.forEach((n) => n());
      delete racine.dataset.js;
    };
  }, []);
  return null;
}
