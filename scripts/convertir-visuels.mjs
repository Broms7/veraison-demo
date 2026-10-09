// scripts/convertir-visuels.mjs — convertit les PNG/JPG Kling de public/visuels en WebP optimisés,
// puis déplace les originaux dans ../assets-kling/originaux (jamais supprimés, hors du build).
// Lancer : node scripts/convertir-visuels.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DOSSIER = path.join(process.cwd(), "public", "visuels");
const ORIGINAUX = path.join(process.cwd(), "..", "assets-kling", "originaux");
const COTE_MAX = 1600;   // plus grand côté ; affichage max ≈ 560 px × DPR 2,5
// 2016 et 2020 sortent trop bleus et saturés : on désature et on réchauffe les ombres.
const RECHAUFFER = new Set(["millesime-2016", "millesime-2020"]);

fs.mkdirSync(ORIGINAUX, { recursive: true });
for (const fichier of fs.readdirSync(DOSSIER)) {
  if (!/\.(png|jpe?g)$/i.test(fichier)) continue;
  const nom = path.parse(fichier).name;
  const source = path.join(DOSSIER, fichier);
  let image = sharp(source).resize({ width: COTE_MAX, height: COTE_MAX, fit: "inside", withoutEnlargement: true });
  if (RECHAUFFER.has(nom)) {
    image = image
      .modulate({ saturation: 0.8 })
      // a·x + b par canal (R, V, B) : on remonte le rouge dans les ombres, on retire du bleu.
      .linear([1.0, 0.99, 0.92], [8, 3, -4]);
  }
  await image.webp({ quality: 80 }).toFile(path.join(DOSSIER, `${nom}.webp`));
  fs.renameSync(source, path.join(ORIGINAUX, fichier));
  console.log(`${fichier} → ${nom}.webp`);
}
