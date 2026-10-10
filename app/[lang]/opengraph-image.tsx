// app/[lang]/opengraph-image.tsx — image de partage (Open Graph et Twitter), générée au build en local
// par next/og (aucun service externe). Bordeaux du cadre, titre papier, monogramme du Clos, bouteille de repli.
// Police : celle embarquée par next/og (Big Shoulders n'existe pas en TTF dans le projet).
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { estLangue, getDictionnaire, langues } from "@/dictionnaires";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Véraison 2021, Clos Ferrugine, Pomerol";

export function generateStaticParams() {
  return langues.map((lang) => ({ lang }));
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = getDictionnaire(estLangue(lang) ? lang : "fr");
  const bouteille = await readFile(join(process.cwd(), "public", "bouteille-repli.svg"));
  const src = `data:image/svg+xml;base64,${bouteille.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#4a0e19", padding: 28 }}>
        <div style={{ flex: 1, display: "flex", background: "#eee5dd", borderRadius: 18, padding: "56px 64px", position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {/* Monogramme : le F dans le clos */}
              <div style={{ width: 56, height: 56, border: "3px solid #7d1a2b", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#7d1a2b", fontSize: 34, fontWeight: 900 }}>F</div>
              <div style={{ fontSize: 22, letterSpacing: 6, color: "#5e5257" }}>CLOS FERRUGINE · POMEROL</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 168, fontWeight: 900, color: "#7d1a2b", letterSpacing: -2, lineHeight: 0.9 }}>VÉRAISON</div>
              <div style={{ fontSize: 30, color: "#1e1215", marginTop: 26, maxWidth: 700, lineHeight: 1.35 }}>{t.ouverture.baseline}</div>
            </div>
            <div style={{ fontSize: 20, letterSpacing: 4, color: "#8a4b22" }}>MMXXI · 18 · 85/15</div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendu par next/og, pas par le navigateur */}
          <img src={src} width={104} height={454} alt="" style={{ position: "absolute", right: 120, top: 64, transform: "rotate(-12deg)" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
