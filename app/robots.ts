// app/robots.ts — /robots.txt : tout est indexable, le plan du site est déclaré.
import type { MetadataRoute } from "next";
import { URL_SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${URL_SITE}/sitemap.xml` };
}
