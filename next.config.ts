import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,   // recette n° 22 : ne pas annoncer « X-Powered-By: Next.js »
  experimental: { globalNotFound: true },   // page 404 à la charte (app/global-not-found.tsx)
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Langue par défaut : la racine renvoie vers /fr (pas besoin de proxy pour une redirection fixe).
  // En-têtes de sécurité de base (recette n° 22). HSTS est posé par l'hébergeur (Vercel).
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        // Intégrable seulement par la vitrine Kaïro (fiche projet en iframe) : kaïro.fr en punycode, plus localhost pour la preview.
        // Remplace X-Frame-Options: DENY, qui bloquait aussi la vitrine.
        { key: "Content-Security-Policy", value: "frame-ancestors 'self' https://xn--karo-6pa.fr https://www.xn--karo-6pa.fr http://localhost:*" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
  // Langue inconnue (/xx) : le layout [lang] répond 404, mais avec la page d'erreur par défaut.
  // On la réécrit vers une route inexistante sous /fr pour servir la 404 à la charte (app/global-not-found.tsx).
  async rewrites() {
    return { beforeFiles: [{ source: "/:lang((?!fr$|en$)[^/.]+)", destination: "/fr/introuvable" }], afterFiles: [], fallback: [] };
  },
  async redirects() {
    return [{ source: "/", destination: "/fr", permanent: false }];
  },
};

export default nextConfig;
