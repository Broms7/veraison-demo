// app/sitemap.ts — /sitemap.xml : les deux pages de langue, avec leurs alternatives hreflang.
import type { MetadataRoute } from "next";
import { langues } from "@/dictionnaires";
import { URL_SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const alternates = { languages: Object.fromEntries(langues.map((l) => [l, `${URL_SITE}/${l}`])) };
  return langues.map((l) => ({ url: `${URL_SITE}/${l}`, changeFrequency: "monthly", priority: l === "fr" ? 1 : 0.9, alternates }));
}
