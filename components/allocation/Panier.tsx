"use client";
// components/allocation/Panier.tsx — récapitulatif de l'allocation (décision de Romain, option B).
// Sheet à droite sur desktop, Drawer (tiroir du bas) sur mobile, ouvert depuis « Allocation (n) » de l'en-tête.
// Lignes par format : nom, quantité (− / +, bornée au maximum du format), prix unitaire, sous-total, retrait ;
// total ; mention « sans paiement en ligne » ; « Envoyer la demande » mène à une confirmation simulée.
// Radix gère le piège du focus et le rend au déclencheur à la fermeture ; à la confirmation, le focus va au titre.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { useSite } from "@/components/site/Fournisseur";
import { changerQuantite, retirerFormat, useAllocation, viderAllocation } from "@/lib/allocation";
import { useMobile } from "@/lib/media";
import { allerA, usePauseScroll } from "@/lib/scroll";
import type { Dictionnaire, Langue } from "@/dictionnaires";

const DUREE_ENVOI = 600;   // ms simulées

interface Props { t: Dictionnaire["panier"]; formats: Dictionnaire["allocation"]["formats"]; langue: Langue }

export function Panier({ t, formats, langue }: Props) {
  const { panierOuvert, ouvrirPanier } = useSite();
  const mobile = useMobile();
  const quantites = useAllocation();
  const [etape, setEtape] = useState<"liste" | "envoi" | "envoye">("liste");
  const titreConfirmation = useRef<HTMLHeadingElement>(null);
  usePauseScroll(panierOuvert);

  const euros = new Intl.NumberFormat(langue === "fr" ? "fr-FR" : "en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const lignes = formats.filter((f) => (quantites[f.id] ?? 0) > 0);
  const total = lignes.reduce((s, f) => s + f.prix * (quantites[f.id] ?? 0), 0);

  // La confirmation prend le focus dès qu'elle s'affiche (le contenu du tiroir change sous le lecteur).
  useEffect(() => { if (etape === "envoye") titreConfirmation.current?.focus(); }, [etape]);

  const fermer = (ouvert: boolean) => {
    ouvrirPanier(ouvert);
    if (!ouvert && etape === "envoye") setEtape("liste");
  };
  // Ouvert par état (pas par un Trigger Radix) : on rend nous-mêmes le focus au bouton de l'en-tête,
  // ou au burger sur mobile (le bouton « Allocation » y vit dans le sommaire refermé).
  const rendreFocus = (e: Event) => {
    e.preventDefault();
    document.querySelector<HTMLElement>(mobile ? ".tete .burger" : ".tete .droite .panier")?.focus();
  };
  const envoyer = () => {
    setEtape("envoi");
    window.setTimeout(() => { viderAllocation(); setEtape("envoye"); }, DUREE_ENVOI);
  };

  const corps: ReactNode = etape === "envoye" ? (
    <div className="panier-confirmation">
      <h3 ref={titreConfirmation} tabIndex={-1} className="titre">{t.confirmationTitre}</h3>
      <p className="mono numero">{t.numero}</p>
      <p>{t.confirmationTexte}</p>
      <button type="button" className="btn btn-secondaire" onClick={() => fermer(false)}>{t.fermer}</button>
    </div>
  ) : lignes.length === 0 ? (
    <div className="panier-vide">
      <p>{t.vide}</p>
      <button type="button" className="lien" onClick={() => { fermer(false); window.setTimeout(() => allerA("allocation"), 340); }}>{t.voir}</button>
    </div>
  ) : (
    <>
      <ul className="panier-lignes">
        {lignes.map((f) => {
          const q = quantites[f.id] ?? 0;
          return (
            <li key={f.id} className="panier-ligne">
              <span className="nom">{f.nom}</span>
              <span className="mono pu">{euros.format(f.prix)} {t.unite}</span>
              <div className="pas" role="group" aria-label={f.nom}>
                <button type="button" aria-label={`${t.moins} : ${f.nom}`} onClick={() => changerQuantite(f.id, -1, f.max)}>−</button>
                <output aria-live="polite">{q}</output>
                <button type="button" aria-label={`${t.plus} : ${f.nom}`} disabled={q >= f.max} onClick={() => changerQuantite(f.id, 1, f.max)}>+</button>
              </div>
              <b className="sous-total">{euros.format(f.prix * q)}</b>
              <button type="button" className="lien retirer" onClick={() => retirerFormat(f.id)}>{t.retirer}<span className="sr-only"> : {f.nom}</span></button>
            </li>
          );
        })}
      </ul>
      <div className="panier-total"><span className="mono">{t.total}</span><b aria-live="polite">{euros.format(total)}</b></div>
      <p className="panier-mention">{t.mention}</p>
      <button type="button" className="btn panier-envoyer" disabled={etape === "envoi"} aria-busy={etape === "envoi" || undefined} onClick={envoyer}>
        {etape === "envoi" ? t.envoi : t.envoyer}
      </button>
    </>
  );

  return mobile ? (
    <Drawer open={panierOuvert} onOpenChange={fermer}>
      <DrawerContent className="panier-feuille panier-tiroir" onCloseAutoFocus={rendreFocus} data-lenis-prevent="">
        <DrawerTitle className="titre panier-titre">{t.titre}</DrawerTitle>
        <DrawerDescription className="mono panier-sous">{t.sousTitre}</DrawerDescription>
        {corps}
      </DrawerContent>
    </Drawer>
  ) : (
    <Sheet open={panierOuvert} onOpenChange={fermer}>
      <SheetContent side="right" className="panier-feuille" onCloseAutoFocus={rendreFocus} data-lenis-prevent="">
        <SheetTitle className="titre panier-titre">{t.titre}</SheetTitle>
        <SheetDescription className="mono panier-sous">{t.sousTitre}</SheetDescription>
        {corps}
      </SheetContent>
    </Sheet>
  );
}
