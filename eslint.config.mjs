import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Scène R3F : les objets three.js (matériaux, géométries, plans) sont mutés image par image
  // dans useFrame, c'est le modèle de R3F. La règle « immutability » ne s'applique pas ici.
  { files: ["components/scene/**"], rules: { "react-hooks/immutability": "off" } },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
