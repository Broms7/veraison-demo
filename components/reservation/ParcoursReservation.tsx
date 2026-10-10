"use client";
// components/reservation/ParcoursReservation.tsx — réservation de dégustation SIMULÉE (aucun backend).
// formule → date → créneau → personnes → récap (bon de sortie) → confirmation factice (Dialog).
// design-spec §3.10 à §3.15 et §6.4 (parcours complet au clavier). Zéro animation dans ce chapitre.
// Mobile : calendrier, créneaux, personnes, récap et confirmation dans un Drawer plein écran.
import { useMemo, useRef, useState } from "react";
import { RadioGroup } from "radix-ui";
import { fr as localeFr, enGB } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Sceau } from "@/components/ilots/Ilots";
import { usePauseScroll } from "@/lib/scroll";
import { useMobile, useMonte } from "@/lib/media";
import type { Dictionnaire, Langue } from "@/dictionnaires";

type T = Dictionnaire["resa"];
const PERSONNES_MIN = 1;
const PERSONNES_MAX = 8;
const MOIS_OUVERTS = 3;          // plage réservable : aujourd'hui + 3 mois
const DELAI_JOURS = 2;           // « au plus tard 48 heures avant »
const DUREE_VERIFICATION = 600;  // ms simulées avant la confirmation

/** Locale d'affichage : anglais britannique pour /en (semaine qui commence le lundi, « €110 »). */
const LOCALE: Record<Langue, string> = { fr: "fr-FR", en: "en-GB" };

interface Choix { date: Date | undefined; creneau: string; personnes: number }

/** Date, créneau, nombre de personnes (§3.11 à §3.13). */
function Agenda({ t, langue, choix, maj }: { t: T; langue: Langue; choix: Choix; maj: (p: (c: Choix) => Partial<Choix>) => void }) {
  const monte = useMonte();
  // La date du jour n'est lue que dans le navigateur : au prérendu statique, elle serait figée au build.
  const bornes = useMemo(() => {
    if (!monte) return null;
    const auj = new Date();
    auj.setHours(0, 0, 0, 0);
    // Réservation au plus tard 48 h avant (FAQ, XIV) : premier jour possible = J + 2.
    const premier = new Date(auj.getFullYear(), auj.getMonth(), auj.getDate() + DELAI_JOURS);
    const fin = new Date(auj.getFullYear(), auj.getMonth() + MOIS_OUVERTS + 1, 0);
    // Fermeture annuelle du 20 décembre au 5 janvier (annoncée en XIV), pour l'hiver en cours et le suivant.
    const an = auj.getFullYear();
    const hivers = [an - 1, an].map((a) => ({ from: new Date(a, 11, 20), to: new Date(a + 1, 0, 5) }));
    return { auj, fin, fermes: [{ before: premier }, { after: fin }, { dayOfWeek: [0, 1] }, ...hivers] };
  }, [monte]);

  return (
    <div className="agenda-champs">
      <div className="ag-tete"><span className="mono">{t.date}</span><span className="mono">{t.ferme}</span></div>
      {bornes ? (
        <Calendar
          mode="single"
          locale={langue === "fr" ? localeFr : enGB}
          selected={choix.date}
          onSelect={(date) => maj(() => ({ date }))}
          disabled={bornes.fermes}
          startMonth={bornes.auj}
          endMonth={bornes.fin}
          showOutsideDays={false}
          className="calendrier"
          classNames={{
            caption_label: "cal-mois", weekday: "cal-jsem", day: "cal-jour",
            today: "cal-auj", disabled: "cal-ferme", button_previous: "cal-nav", button_next: "cal-nav",
          }}
        />
      ) : (
        <div className="calendrier" style={{ height: 330 }} aria-hidden="true" />
      )}

      <div className="mono ag-label" id="libelle-creneau">{t.creneau}</div>
      <ToggleGroup
        type="single"
        className="chips"
        aria-labelledby="libelle-creneau"
        value={choix.creneau}
        // Radix renvoie "" si on reclique l'élément actif : on garde alors le choix courant.
        onValueChange={(v) => v && maj(() => ({ creneau: v }))}
      >
        {t.creneaux.map((c) => (
          <ToggleGroupItem key={c.id} value={c.id} className="chip" disabled={c.complet} aria-disabled={c.complet || undefined}>
            {c.libelle}{c.complet ? ` · ${t.complet}` : ""}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="mono ag-label">{t.personnes}<span className="mention">{t.auPlus}</span></div>
      <div className="pas">
        <button type="button" aria-label={t.moins} disabled={choix.personnes <= PERSONNES_MIN}
          onClick={() => maj((c) => ({ personnes: Math.max(PERSONNES_MIN, c.personnes - 1) }))}>−</button>
        <output aria-live="polite">{choix.personnes}</output>
        <button type="button" aria-label={t.plus} disabled={choix.personnes >= PERSONNES_MAX}
          onClick={() => maj((c) => ({ personnes: Math.min(PERSONNES_MAX, c.personnes + 1) }))}>+</button>
      </div>
    </div>
  );
}

export function ParcoursReservation({ t, langue }: { t: T; langue: Langue }) {
  const mobile = useMobile();
  const [formuleId, setFormuleId] = useState(t.formules[0].id);
  const [choix, setChoix] = useState<Choix>({ date: undefined, creneau: t.creneaux[0].id, personnes: 2 });
  const [tiroir, setTiroir] = useState(false);
  const [verification, setVerification] = useState(false);
  const [confirme, setConfirme] = useState(false);
  const titreConfirmation = useRef<HTMLHeadingElement>(null);
  // Déclencheurs à qui rendre le focus à la fermeture de la confirmation (recette n° 7)
  const boutonReserver = useRef<HTMLButtonElement>(null);
  const boutonAgenda = useRef<HTMLButtonElement>(null);
  usePauseScroll(tiroir || confirme);
  // Mise à jour fonctionnelle : deux actions rapprochées ne s'écrasent pas.
  const maj = (p: (c: Choix) => Partial<Choix>) => setChoix((c) => ({ ...c, ...p(c) }));

  const loc = LOCALE[langue];
  const formule = t.formules.find((f) => f.id === formuleId) ?? t.formules[0];
  const creneau = t.creneaux.find((c) => c.id === choix.creneau) ?? t.creneaux[0];
  const euros = new Intl.NumberFormat(loc, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const total = euros.format(formule.prix * choix.personnes);
  const dateLongue = choix.date?.toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const jour = choix.date?.toLocaleDateString(loc, { weekday: "long" }) ?? "";

  const confirmer = () => {
    setVerification(true);
    window.setTimeout(() => {
      setVerification(false);
      setTiroir(false);
      setConfirme(true);
    }, DUREE_VERIFICATION);
  };

  const bonDeSortie = (
    <>
      <div className="recap">
        <dl>
          <dt>{t.formule}</dt><dd>{formule.nom}</dd>
          <dt>{t.date}</dt><dd>{dateLongue ?? "—"}</dd>
          <dt>{t.heure}</dt><dd>{creneau.libelle}</dd>
          <dt>{t.personnes}</dt><dd>{choix.personnes}</dd>
        </dl>
        <b className="total" aria-live="polite">{total}</b>
        <p className="mono recap-demo">{t.demo}</p>
      </div>
      <button ref={boutonReserver} className="btn confirmer" disabled={!choix.date || verification} aria-busy={verification || undefined} onClick={confirmer}>
        {verification ? t.verification : t.reserver}
      </button>
      <p className="mono manque-date" role="status">{choix.date ? "" : t.aChoisir}</p>
    </>
  );

  return (
    <div className="resa">
      <RadioGroup.Root className="formules" aria-label={t.formulesLibelle} value={formuleId} onValueChange={setFormuleId}>
        {t.formules.map((f) => (
          <RadioGroup.Item key={f.id} value={f.id} className="formule">
            <span className="num">{f.num}</span>
            <span className="nom">{f.nom}</span>
            <span className="meta">{f.meta}</span>
            <span className="prix">{euros.format(f.prix)}</span>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>

      <div className="agenda">
        {mobile ? (
          <Drawer open={tiroir} onOpenChange={setTiroir}>
            <DrawerTrigger ref={boutonAgenda} className="btn btn-secondaire ouvrir-agenda">{t.ouvrirAgenda}</DrawerTrigger>
            <DrawerContent className="tiroir-agenda">
              <DrawerTitle className="titre tiroir-titre">{formule.nom}</DrawerTitle>
              <Agenda t={t} langue={langue} choix={choix} maj={maj} />
              {bonDeSortie}
            </DrawerContent>
          </Drawer>
        ) : (
          <>
            <Agenda t={t} langue={langue} choix={choix} maj={maj} />
            {bonDeSortie}
          </>
        )}
      </div>

      <Dialog open={confirme} onOpenChange={setConfirme}>
        <DialogContent className="confirmation" showCloseButton={false}
          onOpenAutoFocus={(e) => { e.preventDefault(); titreConfirmation.current?.focus(); }}
          onCloseAutoFocus={(e) => { e.preventDefault(); (mobile ? boutonAgenda : boutonReserver).current?.focus(); }}>
          <Sceau texte="CLOS FERRUGINE · PLATEAU DE POMEROL ·" className="sceau-confirmation" tourne={false} />
          <p className="surtitre">{t.confirmationSurtitre}</p>
          <DialogTitle ref={titreConfirmation} tabIndex={-1} className="titre">
            {t.confirmationTitre.replace("{jour}", jour).replace("{heure}", creneau.libelle)}
          </DialogTitle>
          <div className="bon mono">
            <p className="numero">{t.numero}</p>
            <p>{formule.nom} · {dateLongue} · {creneau.libelle} · {choix.personnes} {t.pers} · {total}</p>
            <p>{t.adresse}</p>
          </div>
          <DialogDescription>{t.confirmationTexte} {t.demo}.</DialogDescription>
          <button className="btn btn-secondaire" onClick={() => setConfirme(false)}>{t.fermer}</button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
