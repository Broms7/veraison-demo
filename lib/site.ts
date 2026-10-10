// lib/site.ts — adresse publique du site (métadonnées absolues : Open Graph, canonical, hreflang, sitemap).
// À définir au déploiement (Vercel : variable NEXT_PUBLIC_SITE_URL). La valeur par défaut est provisoire.
export const URL_SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://veraison-kairo.vercel.app").replace(/\/$/, "");
