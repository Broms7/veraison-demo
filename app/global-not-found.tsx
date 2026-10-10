// app/global-not-found.tsx — page 404 du site (recette n° 20), pour toute adresse inconnue (/xx, /fr/inconnu).
// Elle court-circuite le layout : charte appliquée ici même (globals.css + polices), page bilingue.
import type { Metadata } from "next";
import "./globals.css";
import { classesPolices } from "@/lib/polices";

export const metadata: Metadata = { title: "Page introuvable · Page not found · Clos Ferrugine" };

export default function GlobalNotFound() {
  return (
    <html lang="fr" className={classesPolices}>
      <body className="introuvable">
        <main>
          <p className="mono">404 · Clos Ferrugine</p>
          <h1 className="titre">Rang <span className="vin">vide</span></h1>
          <p>Cette page n&apos;existe pas. Le domaine est par ici :</p>
          <p lang="en">This page does not exist. The estate is this way:</p>
          <nav aria-label="Langue · Language">
            <a className="btn" href="/fr">Véraison, en français</a>
            <a className="btn btn-secondaire" href="/en" lang="en">Véraison, in English</a>
          </nav>
        </main>
      </body>
    </html>
  );
}
