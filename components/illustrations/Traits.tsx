// components/illustrations/Traits.tsx — les 17 illustrations au trait (design-spec-addendum §3).
// Composants SERVEUR : du SVG pur, zéro JS envoyé. Le tracé au scroll est posé après coup par
// components/site/Habillage.tsx, qui lit deux attributs :
//   - svg[data-trace="scrub" | "once"] : régime (lié au scroll, réversible / déclenché une fois) ;
//   - g[data-o="0..n"] : ordre de tracé des groupes. Les <text> d'un groupe apparaissent après ses traits.
// Sans JS (ou en mouvement réduit), les dessins s'affichent complets.
// Classes : .t trait encre (ou oxyde-clair sur nuit), .ox détail oxyde, .pt pointillé (caché / souterrain).
// Trait 1,5 px non mis à l'échelle (vector-effect), bouts ronds : cf. styles/site.css, bloc « illustrations ».
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* T1 · Coupe du sol (ch. III), scrubbée                               */
/* ------------------------------------------------------------------ */

// Galets des graves (côté merlot, à droite) et grains des sables (côté cabernet franc, à gauche),
// repris du wireframe. Coordonnées dans un repère 800 × 540 (2 m de profondeur = 540).
const GALETS: [number, number, number, number][] = [
  [486, 116, 8, 6], [633, 105, 7, 5], [581, 146, 6, 6], [366, 166, 10, 6], [357, 156, 10, 5], [371, 108, 9, 6],
  [531, 211, 9, 5], [396, 126, 10, 7], [622, 228, 8, 6], [600, 151, 6, 6], [779, 102, 9, 7], [726, 136, 10, 5],
  [405, 111, 8, 6], [479, 209, 6, 5], [421, 176, 7, 4], [628, 147, 6, 6], [586, 104, 7, 5], [367, 124, 8, 7],
  [646, 155, 6, 5], [481, 177, 9, 7], [544, 137, 10, 7], [697, 193, 7, 5], [450, 175, 8, 7], [576, 218, 11, 4],
  [668, 135, 7, 5], [741, 208, 7, 5],
];
const GRAINS: [number, number][] = [
  [187, 151], [11, 187], [121, 220], [296, 248], [165, 232], [213, 104], [280, 268], [128, 182], [41, 235], [29, 107],
  [73, 129], [112, 104], [10, 126], [40, 174], [18, 290], [194, 126], [86, 171], [119, 120], [265, 316], [150, 201],
  [36, 115], [113, 152], [259, 128], [17, 307], [168, 125], [173, 98], [168, 313], [269, 249], [88, 175], [60, 266],
  [170, 268], [109, 142], [253, 315], [266, 274], [255, 259], [78, 209], [117, 99], [18, 155], [88, 249], [236, 182],
  [302, 160], [60, 300], [214, 290], [142, 286], [292, 116], [230, 230],
];
const NODULES: [number, number, number][] = [
  [763, 273, 6], [756, 397, 5], [763, 254, 5], [484, 222, 4], [475, 217, 4], [637, 377, 5], [719, 280, 4], [648, 354, 5], [432, 322, 6],
];

export function CoupeSol({ alt }: { alt: string }) {
  // Hachures de l'argile à 45° : une ligne tous les 34 unités, de x = −80 à 880 (rognées par le cadre).
  const argile = Array.from({ length: 29 }, (_, k) => -80 + k * 34);
  return (
    <svg className="dessin coupe" viewBox="0 0 800 540" preserveAspectRatio="none" data-trace="scrub" role="img" aria-label={alt}>
      <g data-o="0"><line className="t pt" x1="0" y1="81" x2="800" y2="81" /></g>
      <g data-o="1">
        {/* Limites : sables à gauche jusqu'à 1,2 m, graves à droite jusqu'à 90 cm */}
        <polyline className="t pt" points="320,81 320,324 0,324" />
        <line className="t pt" x1="320" y1="243" x2="800" y2="243" />
        {GALETS.map(([cx, cy, rx, ry]) => <ellipse key={`g${cx}-${cy}`} className="t" cx={cx} cy={cy} rx={rx} ry={ry} />)}
        {GRAINS.map(([cx, cy]) => <circle key={`s${cx}-${cy}`} className="t" cx={cx} cy={cy} r="1.2" />)}
      </g>
      <g data-o="2">
        {argile.map((x) => {
          // Sous les sables (x < 320), l'argile commence à 324 ; sous les graves, à 243.
          const haut = x + 110 < 320 ? 330 : 250;
          return <line key={x} className="t" x1={x} y1="540" x2={x + 110} y2={haut} />;
        })}
      </g>
      <g data-o="3">
        <polygon className="t ox" points="420,200 520,188 540,214 430,226" />
        <polygon className="t ox" points="560,262 680,250 702,282 575,292" />
        <polygon className="t ox" points="450,322 560,332 545,358 440,346" />
        <polygon className="t ox" points="640,178 760,172 772,200 650,206" />
        {NODULES.map(([cx, cy, r]) => <circle key={`n${cx}-${cy}`} className="t ox" cx={cx} cy={cy} r={r} />)}
      </g>
      <g data-o="4">
        {/* Racines : elles partent du pied de la bouteille (colonne gauche) et descendent à 2 m */}
        <path className="t ox" d="M200 0 C195 80 210 160 190 260 S205 420 198 540" />
        <path className="t ox" d="M196 120 C160 170 150 230 120 300" />
        <path className="t ox" d="M193 220 C240 260 262 330 300 420" />
        <path className="t ox" d="M199 360 C170 400 160 450 150 500" />
        <path className="t ox" d="M300 420 C330 440 360 452 410 470" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* T2 à T13 · objets du calendrier (ch. VIII), déclenchés              */
/* viewBox 180 × 180, 16 unités de marge, un seul détail oxyde         */
/* ------------------------------------------------------------------ */

function Objet({ children, taille }: { children: ReactNode; taille?: number }) {
  return (
    <svg className="dessin objet-trait" viewBox="0 0 180 180" data-trace="once" aria-hidden="true"
      style={taille ? { width: taille, height: taille } : undefined}>
      {children}
    </svg>
  );
}

/** T2 · Sécateur ouvert (janvier) : corps, puis lame oxyde. */
const T2 = () => (
  <Objet>
    <g data-o="0">
      <path className="t" d="M62 152 C56 122 70 102 88 92" />
      <path className="t" d="M118 152 C124 122 110 102 92 92" />
      <circle className="t" cx="90" cy="90" r="5" />
      <path className="t" d="M80 122 q10 -8 20 0" />
    </g>
    <g data-o="1">
      <path className="t" d="M92 90 L118 34 Q104 46 89 86" />
      <path className="t ox" d="M88 90 L68 28 Q82 40 93 86" />
    </g>
  </Objet>
);

/** T3 · Fagot de sarments lié (février) : sarments, puis lien oxyde. */
const T3 = () => (
  <Objet>
    <g data-o="0">
      <path className="t" d="M26 112 C64 98 106 72 146 38" />
      <path className="t" d="M28 120 C72 104 112 80 150 46" />
      <path className="t" d="M30 128 C70 112 110 86 154 54" />
      <path className="t" d="M34 136 C76 118 116 92 158 62" />
      <path className="t" d="M38 144 C80 124 120 100 162 72" />
      <path className="t" d="M58 116 l-12 -14" />
      <path className="t" d="M122 80 l4 -18" />
      <path className="t" d="M134 84 l14 4" />
    </g>
    <g data-o="1">
      <path className="t ox" d="M78 80 C84 90 90 100 96 108" />
      <path className="t ox" d="M88 74 C94 84 100 94 106 102" />
      <path className="t ox" d="M106 102 q8 6 4 14" />
    </g>
  </Objet>
);

/** T4 · Lien d'osier noué sur un fil (mars) : fil, baguette, nœud oxyde. */
const T4 = () => (
  <Objet>
    <g data-o="0">
      <line className="t" x1="16" y1="70" x2="164" y2="70" />
      <line className="t" x1="24" y1="62" x2="24" y2="164" />
    </g>
    <g data-o="1"><path className="t" d="M24 128 C56 100 96 76 164 74" /></g>
    <g data-o="2">
      <path className="t ox" d="M104 60 C118 56 124 82 110 86 C98 88 96 66 112 64" />
      <path className="t ox" d="M110 86 L102 102 M114 86 L122 100" />
    </g>
  </Objet>
);

/** T5 · Bourgeon ouvert, deux feuilles (avril) : bois, bourgeon, feuilles ; thermomètre −1 °C oxyde. */
const T5 = () => (
  <Objet>
    <g data-o="0">
      <path className="t" d="M16 132 C60 128 120 134 164 130" />
      <path className="t" d="M16 140 C60 136 120 142 164 138" />
    </g>
    <g data-o="1">
      <path className="t" d="M90 130 C86 118 88 108 92 100" />
      <path className="t" d="M86 124 q-7 -6 -3 -15" />
      <path className="t" d="M95 124 q7 -6 3 -15" />
    </g>
    <g data-o="2">
      <path className="t" d="M92 100 C70 96 54 80 60 62 C78 64 92 80 92 100 Z" />
      <path className="t" d="M92 100 C74 88 68 80 62 66" />
      <path className="t" d="M92 98 C108 84 126 80 138 90 C128 104 110 106 92 98 Z" />
      <path className="t" d="M92 98 C110 94 122 92 134 91" />
    </g>
    <g data-o="3">
      <path className="t ox" d="M144 62 L144 26 Q148 18 152 26 L152 62" />
      <circle className="t ox" cx="148" cy="70" r="8" />
      <line className="t ox" x1="140" y1="44" x2="136" y2="44" />
      <text x="132" y="48" textAnchor="end">−1 °C</text>
    </g>
  </Objet>
);

/** T6 · Rameau, bourgeon pincé (mai) : rameau, pousse retirée en pointillé oxyde. */
const T6 = () => (
  <Objet>
    <g data-o="0">
      <path className="t" d="M30 154 C60 122 92 100 150 36" />
      <path className="t" d="M68 118 C54 106 52 92 60 82 C70 90 74 104 68 118 Z" />
      <path className="t" d="M114 74 C128 66 142 70 146 80 C134 86 120 84 114 74 Z" />
      <path className="t" d="M150 36 l-4 -10 M150 36 l8 -6" />
    </g>
    <g data-o="1">
      <path className="t ox pt" d="M86 106 C102 102 116 108 128 120" />
      <path className="t ox" d="M126 116 l8 8 M134 116 l-8 8" />
    </g>
  </Objet>
);

// Grappillons de l'inflorescence : petits boutons groupés au bout de chaque ramification.
const BOUTONS: [number, number][] = [
  [62, 52], [68, 58], [60, 60], [118, 52], [112, 58], [120, 60], [68, 84], [74, 90], [66, 92], [112, 84], [106, 90], [114, 92],
  [84, 104], [96, 104], [90, 110], [82, 122], [98, 122], [90, 128], [86, 140], [94, 140], [90, 148],
];

/** T7 · Inflorescence (juin) : tige, puis grappillons. */
const T7 = () => (
  <Objet>
    <g data-o="0">
      <path className="t" d="M90 18 L90 140" />
      <path className="t" d="M90 40 L66 54 M90 40 L114 54 M90 66 L72 86 M90 66 L108 86" />
      <path className="t ox" d="M90 18 C100 12 112 14 120 22" />
    </g>
    <g data-o="1">{BOUTONS.map(([cx, cy]) => <circle key={`${cx}-${cy}`} className="t" cx={cx} cy={cy} r="3" />)}</g>
  </Objet>
);

/** T8 · Feuille de vigne (juillet) : contour, nervures ; soleil du matin en arc oxyde. */
const T8 = () => (
  <Objet>
    <g data-o="0">
      <path className="t" d="M96 156 C76 152 60 156 46 144 C36 132 46 122 36 110 C24 98 28 84 42 80 C40 66 52 54 66 60 C70 46 86 36 96 46 C106 36 122 46 126 60 C140 54 152 66 150 80 C164 84 168 98 156 110 C146 122 156 132 146 144 C132 156 116 152 96 156 Z" />
      <path className="t" d="M96 156 L96 170" />
    </g>
    <g data-o="1">
      <path className="t" d="M96 156 L96 52 M96 126 L48 90 M96 126 L144 90 M96 138 L54 138 M96 138 L138 138" />
    </g>
    <g data-o="2">
      <path className="t ox" d="M16 50 A34 34 0 0 1 50 16" />
      <path className="t ox" d="M16 34 l-2 -6 M28 22 l-4 -4 M34 16 l-6 -2" />
    </g>
  </Objet>
);

/** T9 · Grappe à moitié colorée (août) : rafle, baies ; la moitié hachurée en oxyde (la véraison). */
const T9 = () => {
  const baies: [number, number, boolean][] = [
    [68, 64, false], [86, 62, true], [104, 64, false], [118, 70, true], [60, 84, false], [78, 82, true], [96, 84, false],
    [114, 88, true], [70, 102, false], [88, 104, true], [106, 106, false], [80, 122, true], [98, 124, false], [90, 142, true],
  ];
  return (
    <Objet>
      <g data-o="0"><path className="t" d="M90 16 L90 40 M90 40 L68 54 M90 40 L112 54 M90 40 L90 70" /></g>
      <g data-o="1">{baies.map(([cx, cy, ox]) => <circle key={`${cx}-${cy}`} className={ox ? "t ox" : "t"} cx={cx} cy={cy} r="9" />)}</g>
    </Objet>
  );
};

/** T10 · Cagette de 12 kg (septembre, réutilisée en XII) : caisse, grappes, « 12 kg ». */
export const Cagette = ({ taille }: { taille?: number }) => (
  <Objet taille={taille}>
    <g data-o="0">
      <rect className="t" x="28" y="84" width="124" height="60" />
      <line className="t" x1="28" y1="104" x2="152" y2="104" />
      <line className="t" x1="28" y1="124" x2="152" y2="124" />
      <rect className="t" x="78" y="90" width="24" height="8" />
    </g>
    <g data-o="1">
      {[50, 66, 82, 98, 114, 130].map((cx, k) => <circle key={cx} className="t" cx={cx} cy={k % 2 ? 70 : 74} r="8" />)}
      <path className="t ox" d="M66 62 q6 -10 14 -4" />
      <text x="90" y="166" textAnchor="middle">12 kg</text>
    </g>
  </Objet>
);

/** T11 · Robinet de cuve en laiton (octobre) : cuve, robinet oxyde, goutte. */
const T11 = () => (
  <Objet>
    <g data-o="0">
      <rect className="t" x="20" y="16" width="88" height="148" />
      <line className="t" x1="20" y1="48" x2="108" y2="48" />
      <line className="t" x1="20" y1="132" x2="108" y2="132" />
      <circle className="t" cx="64" cy="90" r="16" />
    </g>
    <g data-o="1">
      <path className="t ox" d="M108 104 L132 104 L132 98 L142 98 L142 122 L134 122 L134 112 L108 112" />
      <path className="t ox" d="M137 98 L137 84 M128 84 L146 84" />
      <circle className="t ox" cx="138" cy="136" r="3" />
    </g>
  </Objet>
);

/** T12 · Barrique marquée à la craie (novembre) : douelles, cercles, marque oxyde. */
const T12 = () => (
  <Objet>
    <g data-o="0"><path className="t" d="M52 36 Q36 90 52 144 L128 144 Q144 90 128 36 Z" /></g>
    <g data-o="1">
      <path className="t" d="M46 58 Q90 64 134 58" />
      <path className="t" d="M42 122 Q90 128 138 122" />
      <path className="t" d="M70 36 Q62 90 70 144" />
      <path className="t" d="M110 36 Q118 90 110 144" />
    </g>
    <g data-o="2">
      <path className="t ox" d="M78 88 L102 88 M90 80 L90 98" />
      <text className="txt-ox" x="90" y="114" textAnchor="middle">ROUILLE · 11/21</text>
    </g>
  </Objet>
);

/** T13 · Broc d'ouillage (décembre) : broc, filet de vin oxyde. */
const T13 = () => (
  <Objet>
    <g data-o="0">
      <path className="t" d="M46 62 C40 92 40 130 54 152 L110 152 C122 130 122 92 116 62 Z" />
      <path className="t" d="M46 62 L116 62 M116 62 L144 44 M120 70 L144 44" />
      <path className="t" d="M46 78 C26 82 26 122 48 126" />
    </g>
    <g data-o="1">
      <path className="t ox" d="M144 44 C150 62 152 104 152 160" />
      <path className="t ox" d="M136 164 L168 164" />
    </g>
  </Objet>
);

/** Objets des douze mois, dans l'ordre de janvier à décembre. */
export const OBJETS_MOIS = [T2, T3, T4, T5, T6, T7, T8, T9, () => <Cagette />, T11, T12, T13];

/* ------------------------------------------------------------------ */
/* Libellés des grands dessins : HTML en surimpression (recette n° 1 et 5)
   Un <text> SVG est en unités du viewBox : il grossit avec le dessin (24 px à 2 000 px) et devient
   illisible sur mobile (6 à 8 px). Les libellés sont donc des <span> placés en % du viewBox, en taille
   écran fixe (mono 11 px). Le dessin garde son rapport (aspect-ratio = viewBox), le % reste exact.
   data-libelle="k" : le libellé apparaît avec le groupe de tracé k (Habillage.tsx).            */
/* ------------------------------------------------------------------ */

type Ancre = "start" | "middle" | "end";
interface Libelle { x: number; y: number; texte: string; o: number; ancre?: Ancre; classe?: string }

function Cadre({ vb, libelles, className, children, svg }: {
  vb: [number, number, number, number]; libelles: Libelle[]; className: string; children: ReactNode;
  svg: { trace: "scrub" | "once"; alt?: string };
}) {
  const [x0, y0, l, h] = vb;
  return (
    <div className={`dessin-cadre ${className}`} style={{ aspectRatio: `${l} / ${h}` }}>
      <svg className="dessin" viewBox={vb.join(" ")} data-trace={svg.trace}
        role={svg.alt ? "img" : undefined} aria-label={svg.alt} aria-hidden={svg.alt ? undefined : true}>
        {children}
      </svg>
      {libelles.map((lb) => (
        <span key={`${lb.texte}-${lb.x}`} aria-hidden="true" data-libelle={lb.o}
          className={`libelle a-${lb.ancre ?? "start"}${lb.classe ? ` ${lb.classe}` : ""}`}
          style={{ left: `${((lb.x - x0) / l) * 100}%`, top: `${((lb.y - y0) / h) * 100}%` }}>
          {/* Version courte (avant « · » ou « , ») pour les petits écrans : la distance reste dans la liste HTML */}
          <span className="long">{lb.texte}</span>
          <span className="court">{lb.texte.split(/ · |, /)[0]}</span>
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* T14 · Carte des parcelles (ch. VII), scrubbée, oxyde clair sur nuit */
/* ------------------------------------------------------------------ */

export function CarteParcelles({ t }: { t: { alt: string; clocher: string; route: string; libourne: string } }) {
  const libelles: Libelle[] = [
    { x: 212, y: 25, texte: t.clocher, o: 2 },
    { x: 200, y: 386, texte: t.route, o: 2, ancre: "middle" },
    { x: 12, y: 182, texte: t.libourne, o: 2 },
    { x: 212, y: 150, texte: "La Rouille", o: 3, ancre: "middle", classe: "nom" },
    { x: 324, y: 150, texte: "Le Puits", o: 3, ancre: "middle", classe: "nom" },
    { x: 95, y: 262, texte: "Les Sables", o: 3, ancre: "middle", classe: "nom" },
    { x: 238, y: 286, texte: "La Route", o: 3, ancre: "middle", classe: "nom" },
  ];
  return (
    <Cadre vb={[0, 0, 400, 400]} libelles={libelles} className="carte-parcelles" svg={{ trace: "scrub", alt: t.alt }}>
      <g data-o="0"><polygon className="t" points="60,70 340,60 350,330 70,340" /></g>
      <g data-o="1">
        <polyline className="t" points="120,68 126,338" />
        <polyline className="t" points="300,61 304,232" />
        <polyline className="t" points="126,236 346,230" />
        {/* Rangs : hachures orientées comme les vrais rangs (nord-sud au centre, est-ouest au sud) */}
        {[140, 156, 172, 188, 204, 220, 236, 252, 268, 284].map((x) => <line key={x} className="t rang" x1={x} y1={88 - (x - 140) * 0.02} x2={x + 1} y2="222" />)}
        {[318, 330].map((x) => <line key={x} className="t rang" x1={x} y1="80" x2={x} y2="220" />)}
        {[96, 116, 136, 156, 176, 196, 216].map((y) => <line key={y} className="t rang" x1="80" y1={y} x2="110" y2={y} />)}
        {[256, 296, 316].map((y) => <line key={y} className="t rang" x1="146" y1={y} x2="334" y2={y - 4} />)}
      </g>
      <g data-o="2">
        {/* Repères : clocher (nord), route (sud), flèche vers Libourne (ouest) */}
        <path className="t" d="M200 14 L200 36 M192 22 L208 22" />
        <path className="t" d="M20 368 L380 352" />
        <path className="t" d="M52 200 L14 200 M14 200 L24 192 M14 200 L24 208" />
      </g>
      <g data-o="3" />
    </Cadre>
  );
}

/* ------------------------------------------------------------------ */
/* T15 · Carte d'accès (ch. XIV), scrubbée, le Clos tracé en dernier   */
/* Retracée (recette n° 1) : Libourne au confluent de l'Isle et de la  */
/* Dordogne, la gare au sud, la N89 vers Bordeaux à l'ouest, la route  */
/* du plateau jusqu'au Clos, Saint-Émilion à l'est. Aucun libellé sur  */
/* un trait, rien hors du cadre.                                       */
/* ------------------------------------------------------------------ */

interface LibellesAcces { clos: string; clocher: string; libourne: string; gare: string; stEmilion: string; bordeaux: string; isle: string; dordogne: string }

export function CarteAcces({ t, alt }: { t: LibellesAcces; alt: string }) {
  const libelles: Libelle[] = [
    { x: 100, y: 24, texte: t.isle, o: 0 },
    { x: 392, y: 290, texte: t.dordogne, o: 0, ancre: "end" },
    { x: 8, y: 186, texte: t.bordeaux, o: 1 },
    { x: 164, y: 224, texte: t.libourne, o: 2 },
    { x: 120, y: 242, texte: t.gare, o: 2, ancre: "end" },
    { x: 392, y: 156, texte: t.stEmilion, o: 2, ancre: "end" },
    { x: 254, y: 58, texte: t.clocher, o: 2, ancre: "end" },
    { x: 268, y: 112, texte: t.clos, o: 3, classe: "ox" },
  ];
  return (
    <Cadre vb={[0, 0, 400, 300]} libelles={libelles} className="acces" svg={{ trace: "scrub", alt }}>
      <g data-o="0">
        {/* L'Isle descend du nord-ouest et rejoint la Dordogne à Libourne */}
        <path className="t pt" d="M44 0 C70 50 104 104 126 160 C136 186 146 214 156 246" />
        <path className="t pt" d="M0 262 C90 250 160 252 230 258 S340 250 400 238" />
      </g>
      <g data-o="1">
        {/* N89 vers Bordeaux, à l'ouest */}
        <path className="t" d="M150 200 L104 196 L56 200 L0 206" />
        {/* Route du plateau : Libourne → Clos */}
        <path className="t" d="M150 200 C186 182 214 150 248 112" />
        {/* Route de Saint-Émilion, à l'est */}
        <path className="t" d="M150 200 C214 206 280 192 340 176" />
        {/* Gare : embranchement au sud de la ville */}
        <path className="t" d="M150 200 L132 232" />
      </g>
      <g data-o="2">
        <circle className="t" cx="150" cy="200" r="6" />
        <rect className="t" x="126" y="230" width="9" height="9" />
        <circle className="t" cx="340" cy="176" r="4" />
        <path className="t" d="M264 48 L264 68 M257 55 L271 55" />
      </g>
      <g data-o="3"><rect className="t ox" x="250" y="100" width="12" height="12" /></g>
    </Cadre>
  );
}

/* ------------------------------------------------------------------ */
/* T16 · Roue des arômes (ch. V), déclenchée                           */
/* ------------------------------------------------------------------ */

type Famille = "fruit" | "sol" | "bois";
interface Arome { nom: string; famille: string; moment: string; intensite: number; ordre: number }
const COULEUR: Record<Famille, string> = { fruit: "var(--vin)", sol: "var(--oxyde)", bois: "var(--gris)" };

export function RoueAromes({ aromes, familles, alt }: { aromes: Arome[]; familles: Record<Famille, string>; alt: string }) {
  const pas = 360 / aromes.length;
  const pt = (angle: number, r: number) => {
    const a = (angle * Math.PI) / 180;
    return { x: 200 + r * Math.cos(a), y: 200 + r * Math.sin(a), c: Math.cos(a) };
  };
  const ancreDe = (c: number): Ancre => (c > 0.15 ? "start" : c < -0.15 ? "end" : "middle");
  // Ordre de tracé = ordre d'arrivée (ouverture → 20 min → 1 h → en bouche → finale), puis ordre de la liste.
  const ordre = aromes.map((_, i) => i).sort((a, b) => aromes[a].ordre - aromes[b].ordre || a - b);
  const rang = new Map(ordre.map((i, k) => [i, k + 1]));
  // Filets radiaux pointillés entre familles + nom de famille au milieu de son secteur.
  const bornes: { angle: number; famille: Famille; milieu: number }[] = [];
  let debut = 0;
  aromes.forEach((a, i) => {
    if (aromes[i + 1]?.famille !== a.famille) {
      bornes.push({ angle: -90 + (i + 0.5) * pas, famille: a.famille as Famille, milieu: -90 + ((debut + i) / 2) * pas });
      debut = i + 1;
    }
  });
  const libelles: Libelle[] = [
    ...aromes.map((a, i) => {
      const l = pt(-90 + i * pas, 192);
      return { x: l.x, y: l.y, texte: a.nom, o: rang.get(i) ?? 1, ancre: ancreDe(l.c) };
    }),
    ...bornes.map((b) => {
      const m = pt(b.milieu, 258);
      return { x: m.x, y: m.y, texte: familles[b.famille], o: aromes.length + 1, ancre: ancreDe(m.c), classe: "famille" };
    }),
  ];
  return (
    <Cadre vb={[-100, -34, 600, 468]} libelles={libelles} className="roue" svg={{ trace: "once", alt }}>
      <g data-o="0">
        {[1, 2, 3].map((k) => <circle key={k} className="t pt anneau" cx="200" cy="200" r={40 + 45 * k} />)}
        {bornes.map((b) => {
          const a = pt(b.angle, 40), z = pt(b.angle, 178);
          return <line key={b.angle} className="t pt anneau" x1={a.x} y1={a.y} x2={z.x} y2={z.y} />;
        })}
      </g>
      {ordre.map((i, k) => {
        const a = aromes[i];
        const angle = -90 + i * pas;
        const d = pt(angle, 40), f = pt(angle, 40 + 45 * a.intensite);
        const couleur = COULEUR[a.famille as Famille];
        return (
          <g key={a.nom} data-o={k + 1}>
            <line className="t rayon" style={{ stroke: couleur }} x1={d.x} y1={d.y} x2={f.x} y2={f.y} />
            <rect className="t" style={{ stroke: couleur, fill: couleur }} x={f.x - 3} y={f.y - 3} width="6" height="6" />
          </g>
        );
      })}
      <g data-o={aromes.length + 1} />
    </Cadre>
  );
}

/* ------------------------------------------------------------------ */
/* T17 · Profil en bouche (ch. V) : jauges à 5 crans, sans piste        */
/* ------------------------------------------------------------------ */

export function ProfilBouche({ profil, sur }: { profil: { critere: string; valeur: number; mot: string }[]; sur: string }) {
  return (
    <div className="jauges" data-jauges="">
      {profil.map((p) => (
        <div key={p.critere} className="jauge" role="img" aria-label={`${p.critere} : ${p.valeur} ${sur}, ${p.mot}`}>
          <span className="mono" aria-hidden="true">{p.critere}</span>
          <span className="crans" aria-hidden="true" data-v={p.valeur}>
            {[0, 1, 2, 3, 4].map((k) => <i key={k} className={k < p.valeur ? "plein" : undefined} />)}
          </span>
          <em aria-hidden="true">{p.mot}</em>
        </div>
      ))}
    </div>
  );
}
