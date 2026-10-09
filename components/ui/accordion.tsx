"use client"
// components/ui/accordion.tsx — Accordion shadcn (Radix), habillé pour Véraison (addendum §2, XIV) :
// indicateur « + / − » en mono au lieu des chevrons, aucune couleur ici (tout est dans styles/site.css,
// classes .faq-*). Ouverture 240 ms, fermeture 160 ms : hauteur pilotée par --radix-accordion-content-height.

import * as React from "react"
import { cn } from "cn"
import { Accordion as AccordionPrimitive } from "radix-ui"

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("faq-item", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn("faq-question", className)}
        {...props}
      >
        {children}
        {/* Indicateur texte, pas d'icône : « + » fermé, « − » ouvert (CSS sur aria-expanded) */}
        <span className="faq-signe" aria-hidden="true" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="faq-contenu"
      {...props}
    >
      <div className={cn("faq-reponse", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
