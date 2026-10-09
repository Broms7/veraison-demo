"use client";
// components/reservation/ParcoursReservation.tsx — réservation de dégustation SIMULÉE (aucun backend).
// formule → date → créneau → personnes → récap avec total → confirmation factice (Dialog).
// Sur mobile (< 760 px), date / créneau / personnes s'ouvrent dans un Drawer plein écran.
import { useMemo, useState, useSyncExternalStore } from "react";
import { fr as localeFr, enUS } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { usePauseScroll } from "@/lib/scroll";
import { LARGEUR_MOBILE } from "@/lib/poses";
import type { Dictionnaire, Langue } from "@/dictionnaires";

type T = Dictionnaire["resa"];
const PERSONNES_MIN = 1;
const PERSONNES_MAX = 8;

const pasDAbonnement = () => () => {};
/** true seulement côté client, après hydratation : le calendrier dépend de la date du jour,
 *  qui diffère entre le build statique et le navigateur. */
const useMonte = () => useSyncExternalStore(pasDAbonnement, () => true, () => false);

/** Suit une media query sans setState dans un effet. */
function useMobile() {
  const requete = `(max-width: ${LARGEUR_MOBILE - 1}px)`;
  return useSyncExternalStore(
    (cb) => { const m = matchMedia(requete); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => matchMedia(requete).matches,
    () => false,
  );
}

interface Choix { date: Date | undefined; creneau: string; personnes: number }

/** Date, créneau, nombre de personnes : en ligne sur desktop, dans le Drawer sur mobile. */
function Agenda({ t, langue, choix, setChoix }: { t: T; langue: Langue; choix: Choix; setChoix: (c: Choix) => void }) {
  const monte = useMonte();
  // Jours fermés : passés, dimanche (0) et lundi (1). La date du jour n'est lue que dans le
  // navigateur (monte) : au prérendu statique, elle serait figée à la date du build.
  const fermes = useMemo(() => {
    if (!monte) return [];
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    return [{ before: aujourdhui }, { dayOfWeek: [0, 1] }];
  }, [monte]);
  return (
    <div className="agenda-champs">
      <div className="ag-tete"><span className="mono">{t.date}</span><span className="mono ag-ferme">{t.ferme}</span></div>
      {monte ? (
        <Calendar
          mode="single"
          locale={langue === "fr" ? localeFr : enUS}
          selected={choix.date}
          onSelect={(date) => setChoix({ ...choix, date })}
          disabled={fermes}
          className="calendrier"
        />
      ) : (
        <div className="calendrier calendrier-attente" aria-hidden="true" />
      )}

      <div className="mono ag-label" id="libelle-creneau">{t.creneau}</div>
      <ToggleGroup
        type="single"
        className="chips"
        aria-labelledby="libelle-creneau"
        value={choix.creneau}
        // Radix renvoie "" si on reclique l'élément actif : on garde alors le choix courant.
        onValueChange={(v) => v && setChoix({ ...choix, creneau: v })}
      >
        {t.creneaux.map((c) => (
          <ToggleGroupItem key={c.id} value={c.id} className="chip" disabled={c.complet}>
            {c.libelle}{c.complet ? ` · ${t.complet}` : ""}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="mono ag-label">{t.personnes}</div>
      <div className="pas">
        <button type="button" aria-label={t.moins} disabled={choix.personnes <= PERSONNES_MIN}
          onClick={() => setChoix({ ...choix, personnes: Math.max(PERSONNES_MIN, choix.personnes - 1) })}>−</button>
        <output aria-live="polite">{choix.personnes}</output>
        <button type="button" aria-label={t.plus} disabled={choix.personnes >= PERSONNES_MAX}
          onClick={() => setChoix({ ...choix, personnes: Math.min(PERSONNES_MAX, choix.personnes + 1) })}>+</button>
      </div>
    </div>
  );
}

export function ParcoursReservation({ t, langue }: { t: T; langue: Langue }) {
  const mobile = useMobile();
  const [formuleId, setFormuleId] = useState(t.formules[0].id);
  const [choix, setChoix] = useState<Choix>({ date: undefined, creneau: t.creneaux[0].id, personnes: 2 });
  const [tiroir, setTiroir] = useState(false);
  const [confirme, setConfirme] = useState(false);
  usePauseScroll(tiroir || confirme);

  const formule = t.formules.find((f) => f.id === formuleId) ?? t.formules[0];
  const creneau = t.creneaux.find((c) => c.id === choix.creneau) ?? t.creneaux[0];
  const euros = new Intl.NumberFormat(langue, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const dateLisible = choix.date?.toLocaleDateString(langue, { weekday: "long", day: "numeric", month: "long" });
  const resume = `${dateLisible ?? t.aChoisir} · ${creneau.libelle} · ${choix.personnes} ${t.pers}`;

  return (
    <div className="resa">
      <ToggleGroup
        type="single"
        orientation="vertical"
        spacing={0}
        className="formules"
        aria-label={t.formulesLibelle}
        value={formuleId}
        onValueChange={(v) => v && setFormuleId(v)}
      >
        {t.formules.map((f) => (
          <ToggleGroupItem key={f.id} value={f.id} className="formule">
            <span className="num">{f.num}</span>
            <span className="nom">{f.nom}</span>
            <span className="meta">{f.meta}</span>
            <span className="prix">{euros.format(f.prix)}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="agenda">
        {mobile ? (
          <Drawer open={tiroir} onOpenChange={setTiroir}>
            <DrawerTrigger className="btn ouvrir-agenda">{t.ouvrirAgenda}</DrawerTrigger>
            <DrawerContent className="tiroir-agenda">
              <DrawerTitle className="titre">{formule.nom}</DrawerTitle>
              <Agenda t={t} langue={langue} choix={choix} setChoix={setChoix} />
              <DrawerClose className="btn btn-vin">{t.fermerAgenda}</DrawerClose>
            </DrawerContent>
          </Drawer>
        ) : (
          <Agenda t={t} langue={langue} choix={choix} setChoix={setChoix} />
        )}

        <div className="recap">
          <b>{euros.format(formule.prix * choix.personnes)}</b>
          {formule.nom}<br />
          <span className="recap-detail">{resume}</span>
        </div>
        <button className="btn btn-vin confirmer" disabled={!choix.date} onClick={() => setConfirme(true)}>
          {t.reserver}
        </button>
      </div>

      <Dialog open={confirme} onOpenChange={setConfirme}>
        <DialogContent className="confirmation">
          <DialogTitle className="titre">{t.confirmationTitre}</DialogTitle>
          <p className="confirmation-resume">{formule.nom} · {resume} · {euros.format(formule.prix * choix.personnes)}</p>
          <DialogDescription>{t.confirmationTexte}</DialogDescription>
          <button className="btn" onClick={() => setConfirme(false)}>{t.fermer}</button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
