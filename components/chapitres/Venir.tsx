// components/chapitres/Venir.tsx — XIV. Venir au Clos (addendum §2). La bouteille est partie avec le slot.
// Carte d'accès T15 tracée au scroll (le Clos en dernier) ; distances et horaires AUSSI en texte HTML.
// FAQ : Accordion shadcn (Radix, aria-expanded), « + / − » en mono ; balisage FAQPage (JSON-LD),
// sans schema LocalBusiness : l'adresse est fictive mais la route existe (content-plan §6).
import { Chapitre, Surtitre } from "./Chapitre";
import { CarteAcces } from "@/components/illustrations/Traits";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Dictionnaire } from "@/dictionnaires";

export function Venir({ t }: { t: Dictionnaire["venir"] }) {
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.r } })),
  };
  return (
    <Chapitre id="venir" folio="XIV" registre className="venir">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
      <div className="grille-v">
        <div className="feuille">
          <Surtitre folio="XIV">{t.surtitre}</Surtitre>
          <h2 className="titre">{t.titreAvant}<span className="vin">{t.titreAccent}</span></h2>
          <p className="chapeau">{t.chapeau}</p>
          <div className="acces-cadre"><CarteAcces t={t.carte} alt={t.alt} /></div>
          <span className="mono bloc-titre">{t.distancesTitre}</span>
          <ul className="distances">{t.distances.map((d) => <li key={d}>{d}</li>)}</ul>
        </div>
        <div className="feuille">
          <span className="mono bloc-titre">{t.horairesTitre}</span>
          <ul className="horaires">{t.horaires.map((h) => <li key={h}>{h}</li>)}</ul>
          <a className="btn" href="#resa">{t.cta}</a>
          <span className="mono bloc-titre faq-titre">{t.faqTitre}</span>
          <Accordion type="single" collapsible className="faq">
            {t.faq.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.r}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </Chapitre>
  );
}
