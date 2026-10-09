// app/[lang]/layout.tsx — layout racine, par langue (/fr, /en). Les deux pages sont générées
// en statique ; toute autre langue renvoie une 404 (notFound).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { classesPolices } from "@/lib/polices";
import { estLangue, getDictionnaire, langues } from "@/dictionnaires";

export function generateStaticParams() {
  return langues.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!estLangue(lang)) return {};
  const t = getDictionnaire(lang);
  return {
    title: t.meta.titre,
    description: t.meta.description,
    alternates: { languages: Object.fromEntries(langues.map((l) => [l, `/${l}`])) },
  };
}

export default async function LayoutLangue({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!estLangue(lang)) notFound();
  return (
    <html lang={lang} className={classesPolices}>
      {/* data-porte : la porte d'âge est fermée au premier rendu, le client l'ouvre (Fournisseur) */}
      <body data-porte="fermee">{children}</body>
    </html>
  );
}
