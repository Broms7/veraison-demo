// app/[lang]/layout.tsx — layout racine, par langue (/fr, /en). Les deux pages sont générées
// en statique ; toute autre langue renvoie une 404 (notFound).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { classesPolices } from "@/lib/polices";
import { estLangue, getDictionnaire, langues } from "@/dictionnaires";
import { URL_SITE } from "@/lib/site";

export function generateStaticParams() {
  return langues.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!estLangue(lang)) return {};
  const t = getDictionnaire(lang);
  // Recette n° 9 : URL absolues (metadataBase), canonical, hreflang absolus, Open Graph et carte Twitter.
  // L'image de partage vient de ./opengraph-image.tsx (ajoutée automatiquement par Next).
  return {
    metadataBase: new URL(URL_SITE),
    title: t.meta.titre,
    description: t.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: { ...Object.fromEntries(langues.map((l) => [l, `/${l}`])), "x-default": "/fr" },
    },
    openGraph: {
      type: "website",
      url: `/${lang}`,
      siteName: "Clos Ferrugine",
      title: t.meta.titre,
      description: t.meta.description,
      locale: lang === "fr" ? "fr_FR" : "en_GB",
      alternateLocale: lang === "fr" ? ["en_GB"] : ["fr_FR"],
    },
    twitter: { card: "summary_large_image", title: t.meta.titre, description: t.meta.description },
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
