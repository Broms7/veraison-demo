// components/scene/materiaux.ts — matériaux de la bouteille (design-spec §4.2, §4.4, §4.6).
// Deux matériaux reçoivent un petit complément de shader (onBeforeCompile) :
//  - le verre : un liseré de Fresnel piloté par `uSil` (contre-jour du chapitre VI) ;
//  - l'étiquette : un masque par bandes piloté par `uEtape`, qui « imprime » chaque étape
//    de gauche à droite sans jamais redessiner ni re-téléverser la texture.
import * as THREE from "three";
import { BANDES } from "@/lib/etiquette";

/** Couleurs de la scène, lues dans les tokens CSS au montage. */
export interface CouleursScene {
  verre: string; sheen: string; contrejour: string; capsule: string; lisere: string;
  etiquette: string; etiquetteContrejour: string;
}

export interface UniformsVerre { uSil: { value: number }; uLisere: { value: THREE.Color } }
export interface UniformsEtiquette {
  uEtape: { value: THREE.Vector4 };   // x, y, z : étapes ①②③ (0 → 1, liées au scroll) ; w : ④ (tampon)
  uEchelle4: { value: number };       // compression d'échelle du tampon ④ (1,04 → 1)
  uPapier: { value: THREE.Color };    // couleur du papier vierge sous l'encre masquée
}

/** Verre vert-noir laqué (valeurs de l'aperçu validé) + liseré de contre-jour. */
export function creerVerre(c: CouleursScene): { materiau: THREE.MeshPhysicalMaterial; uniforms: UniformsVerre } {
  const uniforms: UniformsVerre = { uSil: { value: 0 }, uLisere: { value: new THREE.Color(c.lisere) } };
  const materiau = new THREE.MeshPhysicalMaterial({
    color: c.verre, metalness: 0, roughness: 0.07, clearcoat: 1, clearcoatRoughness: 0.04,
    sheen: 0.2, sheenColor: new THREE.Color(c.sheen), transmission: 0, envMapIntensity: 1.3,
  });
  materiau.onBeforeCompile = (shader) => {
    shader.uniforms.uSil = uniforms.uSil;
    shader.uniforms.uLisere = uniforms.uLisere;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uSil;\nuniform vec3 uLisere;")
      // Fresnel : fort sur les bords (normale perpendiculaire au regard), nul de face.
      .replace(
        "#include <opaque_fragment>",
        "float rim = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 3.0) * uSil * 1.8;\n" +
        "outgoingLight += uLisere * rim;\n#include <opaque_fragment>",
      );
  };
  materiau.customProgramCacheKey = () => "veraison-verre";
  return { materiau, uniforms };
}

/** Capsule : même géométrie que le verre, gonflée et découpée au-dessus de 80 % de la hauteur. */
export function creerCapsule(c: CouleursScene, plan: THREE.Plane): THREE.MeshPhysicalMaterial {
  // clipShadows : l'ombre portée respecte aussi la découpe (sinon toute la bouteille ombrerait deux fois).
  return new THREE.MeshPhysicalMaterial({
    color: c.capsule, metalness: 0.35, roughness: 0.42, clearcoat: 0.3, clippingPlanes: [plan], clipShadows: true,
  });
}

/** Étiquette avant : la texture est complète, le shader ne laisse voir que les étapes atteintes. */
export function creerEtiquetteAvant(texture: THREE.Texture, c: CouleursScene): { materiau: THREE.MeshStandardMaterial; uniforms: UniformsEtiquette } {
  const uniforms: UniformsEtiquette = {
    uEtape: { value: new THREE.Vector4(0, 0, 0, 0) },
    uEchelle4: { value: 1 },
    uPapier: { value: new THREE.Color(c.etiquette) },
  };
  const materiau = new THREE.MeshStandardMaterial({
    map: texture, roughness: 0.92, metalness: 0, polygonOffset: true, polygonOffsetFactor: -1,
  });
  const vec2 = (b: readonly [number, number]) => `vec2(${b[0].toFixed(3)}, ${b[1].toFixed(3)})`;
  materiau.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform vec4 uEtape;
uniform float uEchelle4;
uniform vec3 uPapier;
// Encre d'une bande : déposée de gauche à droite, fondu de 0,068 en u (≈ 6 mm).
float bande(vec2 uv, vec2 b, float e) {
  if (uv.y < b.x || uv.y > b.y) return 1.0;
  float seuil = e * 1.068 - 0.068;
  return 1.0 - smoothstep(seuil, seuil + 0.068, uv.x);
}`,
      )
      .replace(
        "#include <map_fragment>",
        `#ifdef USE_MAP
  vec2 uvE = vMapUv;
  vec2 b4 = ${vec2(BANDES[3])};
  // Tampon ④ : léger écrasement d'échelle autour du centre de sa bande.
  if (uvE.y > b4.x && uvE.y < b4.y) {
    vec2 centre = vec2(0.5, 0.5 * (b4.x + b4.y));
    uvE = centre + (uvE - centre) / uEchelle4;
  }
  vec4 texel = texture2D(map, uvE);
  float m = bande(vMapUv, ${vec2(BANDES[0])}, uEtape.x)
          * bande(vMapUv, ${vec2(BANDES[1])}, uEtape.y)
          * bande(vMapUv, ${vec2(BANDES[2])}, uEtape.z);
  if (vMapUv.y > b4.x && vMapUv.y < b4.y) m *= uEtape.w;
  diffuseColor *= vec4(mix(uPapier, texel.rgb, m), 1.0);
#endif`,
      );
  };
  materiau.customProgramCacheKey = () => "veraison-etiquette";
  return { materiau, uniforms };
}
