import type {
  CanvasElement,
  CreativeDocument,
  DocumentPage,
} from "@/core/document/schema";
import type { Format, Template } from "@/types/studio";

export const formats: Format[] = [
  {
    id: "social",
    title: "Social post",
    description: "Square · 1080 × 1080",
    width: 1080,
    height: 1080,
    kind: "design",
    color: "pink",
  },
  {
    id: "presentation",
    title: "Presentation",
    description: "16:9 · 1920 × 1080",
    width: 1920,
    height: 1080,
    kind: "presentation",
    color: "blue",
  },
  {
    id: "story",
    title: "Story",
    description: "9:16 · 1080 × 1920",
    width: 1080,
    height: 1920,
    kind: "design",
    color: "purple",
  },
  {
    id: "poster",
    title: "Poster",
    description: "A3 · 3508 × 4961 · 300 dpi",
    width: 3508,
    height: 4961,
    kind: "design",
    color: "orange",
  },
  {
    id: "banner",
    title: "Banner",
    description: "Web · 1600 × 600",
    width: 1600,
    height: 600,
    kind: "design",
    color: "green",
  },
  {
    id: "logo",
    title: "Logo",
    description: "Square · 500 × 500",
    width: 500,
    height: 500,
    kind: "design",
    color: "blue",
  },
  {
    id: "resume",
    title: "Resume",
    description: "A4 · 2480 × 3508 · 300 dpi",
    width: 2480,
    height: 3508,
    kind: "design",
    color: "purple",
  },
  {
    id: "invitation",
    title: "Invitation",
    description: "5 × 7 in · 300 dpi",
    width: 1500,
    height: 2100,
    kind: "design",
    color: "pink",
  },
  {
    id: "flyer",
    title: "Flyer",
    description: "A5 · 1748 × 2480 · 300 dpi",
    width: 1748,
    height: 2480,
    kind: "design",
    color: "orange",
  },
  {
    id: "business-card",
    title: "Business card",
    description: "3.5 × 2 in · 300 dpi",
    width: 1050,
    height: 600,
    kind: "design",
    color: "green",
  },
  {
    id: "social-portrait",
    title: "Portrait post",
    description: "4:5 · 1080 × 1350",
    width: 1080,
    height: 1350,
    kind: "design",
    color: "pink",
  },
  {
    id: "youtube",
    title: "Video thumbnail",
    description: "16:9 · 1280 × 720",
    width: 1280,
    height: 720,
    kind: "design",
    color: "blue",
  },
  {
    id: "linkedin",
    title: "LinkedIn cover",
    description: "1584 × 396",
    width: 1584,
    height: 396,
    kind: "design",
    color: "purple",
  },
  {
    id: "a4",
    title: "A4 document",
    description: "210 × 297 mm · 300 dpi",
    width: 2480,
    height: 3508,
    kind: "design",
    color: "orange",
  },
  {
    id: "letter",
    title: "US Letter",
    description: "8.5 × 11 in · 300 dpi",
    width: 2550,
    height: 3300,
    kind: "design",
    color: "green",
  },
  {
    id: "slides-classic",
    title: "Classic slides",
    description: "4:3 · 1440 × 1080",
    width: 1440,
    height: 1080,
    kind: "presentation",
    color: "blue",
  },
];

/* ------------------------------------------------------------------ *
 * Creative template library
 * ------------------------------------------------------------------ *
 * Templates are composed from a small builder toolkit (true circles,
 * photo-frame placeholders, star / arrow accents) plus a set of
 * distinct layout recipes, rendered at each format's real size and
 * styled with self-hosted display fonts (see src/app/display-fonts.css).
 * Every text element carries fontFamily + fontWeightValue + fontRef so
 * the design renders in the SVG previews and restores in the editor.
 * ------------------------------------------------------------------ */

type Palette = {
  name: string;
  bg: string;
  ink: string;
  accent: string;
  onAccent: string;
  accent2: string;
  soft: string;
};

const PALETTES: Palette[] = [
  { name: "Noir", bg: "#111111", ink: "#f4efe6", accent: "#e8433a", onAccent: "#111111", accent2: "#e6b84a", soft: "#272727" },
  { name: "Cream", bg: "#f3efe6", ink: "#1c140e", accent: "#c2552c", onAccent: "#f3efe6", accent2: "#e0a93f", soft: "#e6dcc8" },
  { name: "Blush", bg: "#f7dbe6", ink: "#5c2338", accent: "#d9547f", onAccent: "#ffffff", accent2: "#f4c6d7", soft: "#fcebf1" },
  { name: "Sun", bg: "#fdf0a6", ink: "#4a3a10", accent: "#eb922c", onAccent: "#2a1e05", accent2: "#f6c94a", soft: "#fff7c9" },
  { name: "Sky", bg: "#9ad8f2", ink: "#0e3042", accent: "#1577a8", onAccent: "#ffffff", accent2: "#d4edfb", soft: "#d8f0fb" },
  { name: "Ember", bg: "#e23b2e", ink: "#f7efe2", accent: "#f7efe2", onAccent: "#e23b2e", accent2: "#1a1a1a", soft: "#c42f24" },
  { name: "Forest", bg: "#223528", ink: "#eef1e4", accent: "#a9c08a", onAccent: "#223528", accent2: "#d8b25a", soft: "#2f4634" },
  { name: "Mono", bg: "#f2f2f0", ink: "#121212", accent: "#121212", onAccent: "#f2f2f0", accent2: "#8a8a86", soft: "#e4e4e1" },
  { name: "Navy", bg: "#112542", ink: "#f2efe6", accent: "#e4b64a", onAccent: "#112542", accent2: "#4e76a6", soft: "#1b3557" },
  { name: "Plum", bg: "#2d1836", ink: "#f3e8f0", accent: "#dd8fc2", onAccent: "#2d1836", accent2: "#efc85f", soft: "#432449" },
  { name: "Clay", bg: "#d89d66", ink: "#3a2415", accent: "#7c3c1e", onAccent: "#f0e4d2", accent2: "#f0dcbb", soft: "#cc8c4f" },
  { name: "Mint", bg: "#d6f0e3", ink: "#134030", accent: "#2fa178", onAccent: "#ffffff", accent2: "#bfe7d4", soft: "#eaf8f1" },
  { name: "Sand", bg: "#ece2d3", ink: "#352c1d", accent: "#a98a4f", onAccent: "#fbf6ec", accent2: "#d6c29a", soft: "#e2d4bc" },
  { name: "Grape", bg: "#5a3fb0", ink: "#f2eefb", accent: "#f6c94a", onAccent: "#2a1e05", accent2: "#c3b1ef", soft: "#4a3098" },
];

// family display name -> fontsource catalog id (for editor restore via fontRef)
const FONT_ID: Record<string, string> = {
  "Playfair Display": "playfair-display",
  "DM Serif Display": "dm-serif-display",
  "Cormorant Garamond": "cormorant-garamond",
  "Bodoni Moda": "bodoni-moda",
  "Libre Baskerville": "libre-baskerville",
  "EB Garamond": "eb-garamond",
  Fraunces: "fraunces",
  Lora: "lora",
  Marcellus: "marcellus",
  "Crimson Pro": "crimson-pro",
  "Abril Fatface": "abril-fatface",
  Anton: "anton",
  "Bebas Neue": "bebas-neue",
  Oswald: "oswald",
  "Archivo Black": "archivo-black",
  Archivo: "archivo",
  Teko: "teko",
  "Barlow Condensed": "barlow-condensed",
  Staatliches: "staatliches",
  "Alfa Slab One": "alfa-slab-one",
  Bungee: "bungee",
  Montserrat: "montserrat",
  Poppins: "poppins",
  Inter: "inter",
  "Space Grotesk": "space-grotesk",
  Syne: "syne",
  "Josefin Sans": "josefin-sans",
  "Work Sans": "work-sans",
  Outfit: "outfit",
  Sora: "sora",
  Raleway: "raleway",
  Lexend: "lexend",
  "Great Vibes": "great-vibes",
  "Dancing Script": "dancing-script",
  "Pinyon Script": "pinyon-script",
  Sacramento: "sacramento",
  Allura: "allura",
  Pacifico: "pacifico",
  Caveat: "caveat",
  Parisienne: "parisienne",
};

// Font roles — family + an available self-hosted weight.
type Font = { f: string; w: number };
const FT = {
  playfair: { f: "Playfair Display", w: 700 },
  playfairX: { f: "Playfair Display", w: 900 },
  didone: { f: "DM Serif Display", w: 400 },
  bodoni: { f: "Bodoni Moda", w: 900 },
  bodoniMid: { f: "Bodoni Moda", w: 700 },
  cormorant: { f: "Cormorant Garamond", w: 600 },
  marcellus: { f: "Marcellus", w: 400 },
  garamond: { f: "EB Garamond", w: 600 },
  fraunces: { f: "Fraunces", w: 900 },
  frauncesMid: { f: "Fraunces", w: 600 },
  libre: { f: "Libre Baskerville", w: 700 },
  crimson: { f: "Crimson Pro", w: 600 },
  abril: { f: "Abril Fatface", w: 400 },
  anton: { f: "Anton", w: 400 },
  bebas: { f: "Bebas Neue", w: 400 },
  oswald: { f: "Oswald", w: 600 },
  oswaldX: { f: "Oswald", w: 700 },
  archivoBlack: { f: "Archivo Black", w: 400 },
  archivo: { f: "Archivo", w: 800 },
  teko: { f: "Teko", w: 700 },
  barlow: { f: "Barlow Condensed", w: 700 },
  staat: { f: "Staatliches", w: 400 },
  slab: { f: "Alfa Slab One", w: 400 },
  bungee: { f: "Bungee", w: 400 },
  mont: { f: "Montserrat", w: 700 },
  montX: { f: "Montserrat", w: 800 },
  montMid: { f: "Montserrat", w: 600 },
  montBody: { f: "Montserrat", w: 400 },
  poppins: { f: "Poppins", w: 600 },
  inter: { f: "Inter", w: 600 },
  interBody: { f: "Inter", w: 400 },
  space: { f: "Space Grotesk", w: 700 },
  spaceMid: { f: "Space Grotesk", w: 500 },
  syne: { f: "Syne", w: 800 },
  josefin: { f: "Josefin Sans", w: 600 },
  josefinThin: { f: "Josefin Sans", w: 300 },
  work: { f: "Work Sans", w: 600 },
  outfit: { f: "Outfit", w: 800 },
  sora: { f: "Sora", w: 800 },
  raleway: { f: "Raleway", w: 700 },
  ralewayThin: { f: "Raleway", w: 300 },
  lexend: { f: "Lexend", w: 700 },
  vibes: { f: "Great Vibes", w: 400 },
  dancing: { f: "Dancing Script", w: 700 },
  pinyon: { f: "Pinyon Script", w: 400 },
  sacramento: { f: "Sacramento", w: 400 },
  allura: { f: "Allura", w: 400 },
  pacifico: { f: "Pacifico", w: 400 },
  caveat: { f: "Caveat", w: 700 },
  parisienne: { f: "Parisienne", w: 400 },
} satisfies Record<string, Font>;

type ShapeKind = "rectangle" | "ellipse" | "triangle" | "star";
type TxtOpts = {
  font?: Font;
  fill?: string;
  align?: "left" | "center" | "right";
  italic?: boolean;
  lh?: number;
  op?: number;
};
type ShapeOpts = { r?: number; rot?: number; op?: number };

/** Builder working in fractional (0..1) coordinates relative to the canvas. */
function makeBuilder(id: string, w: number, h: number) {
  const U = Math.min(w, h);
  let seq = 0;
  const els: CanvasElement[] = [];
  const state = { bg: "#ffffff" };
  const nid = () => `${id}-${seq++}`;
  const baseOf = (
    name: string,
    x: number,
    y: number,
    width: number,
    height: number,
    rotation = 0,
    opacity = 1,
  ) => ({
    id: nid(),
    name: name.slice(0, 40) || "layer",
    x: x * w,
    y: y * h,
    width: Math.max(1, width * w),
    height: Math.max(1, height * h),
    rotation,
    opacity,
    locked: false,
    hidden: false,
  });

  const addShape = (
    kind: ShapeKind,
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    o: ShapeOpts = {},
  ) => {
    els.push({
      ...baseOf(kind, x, y, width, height, o.rot ?? 0, o.op ?? 1),
      type: "shape",
      shape: kind,
      fill,
      cornerRadius: (o.r ?? 0) * U,
    });
  };

  const rect = (x: number, y: number, width: number, height: number, fill: string, o?: ShapeOpts) =>
    addShape("rectangle", x, y, width, height, fill, o);
  const ell = (x: number, y: number, width: number, height: number, fill: string, o?: ShapeOpts) =>
    addShape("ellipse", x, y, width, height, fill, o);
  const tri = (x: number, y: number, width: number, height: number, fill: string, o?: ShapeOpts) =>
    addShape("triangle", x, y, width, height, fill, o);
  const star = (x: number, y: number, width: number, height: number, fill: string, o?: ShapeOpts) =>
    addShape("star", x, y, width, height, fill, o);

  // true circle centred at (cx,cy) with radius rK (fraction of U)
  const circle = (cx: number, cy: number, rK: number, fill: string, op = 1) => {
    const rAbs = rK * U;
    const wf = (2 * rAbs) / w;
    const hf = (2 * rAbs) / h;
    addShape("ellipse", cx - wf / 2, cy - hf / 2, wf, hf, fill, { op });
  };

  const txt = (value: string, x: number, y: number, width: number, sizeK: number, o: TxtOpts = {}) => {
    const font = o.font ?? FT.mont;
    const fontSize = Math.max(6, Math.min(999, sizeK * U));
    const lines = value.split("\n").length;
    const lh = o.lh ?? 1.08;
    els.push({
      ...baseOf(value.split("\n")[0], x, y, width, (fontSize * lines * lh) / h, 0, o.op ?? 1),
      type: "text",
      text: value,
      fill: o.fill ?? "#111111",
      fontSize,
      fontFamily: font.f,
      fontWeight: font.w >= 600 ? "bold" : "normal",
      fontWeightValue: font.w,
      fontStyle: o.italic ? "italic" : "normal",
      fontRef: `${FONT_ID[font.f]}|${font.w}|${o.italic ? "italic" : "normal"}|latin`,
      align: o.align ?? "left",
      lineHeight: lh,
    });
  };

  // thin divider rule
  const rule = (x: number, y: number, width: number, fill: string, thick = 0.004) =>
    rect(x, y, width, thick, fill, { r: 0.4 });

  // right-pointing arrow (bar + head) built from a rect + triangle
  const arrow = (x: number, y: number, len: number, fill: string, k = 1) => {
    const t = 0.012 * k;
    const head = 0.05 * k;
    rect(x, y - t / 2, len, t, fill);
    tri(x + len - head / 2, y - head / 2, head, head, fill, { rot: 90 });
  };

  // photo-frame placeholder: soft block + subtle "image" glyph the user swaps out
  const photo = (x: number, y: number, pw: number, ph: number, fill: string, icon: string, radiusK = 0.018) => {
    rect(x, y, pw, ph, fill, { r: radiusK });
    const cx = x + pw / 2;
    const cy = y + ph / 2;
    const span = Math.min(pw * w, ph * h);
    const rK = (span * 0.11) / U;
    circle(cx - (pw * 0.14), cy - (ph * 0.12), rK, icon, 0.85);
    tri(cx - pw * 0.24, cy - ph * 0.02, pw * 0.26, ph * 0.22, icon, { op: 0.85 });
    tri(cx - pw * 0.04, cy - ph * 0.12, pw * 0.3, ph * 0.32, icon, { op: 0.85 });
  };

  return {
    get els() {
      return els;
    },
    get background() {
      return state.bg;
    },
    bg: (c: string) => {
      state.bg = c;
    },
    rect,
    ell,
    tri,
    star,
    circle,
    txt,
    rule,
    arrow,
    photo,
  };
}

type Builder = ReturnType<typeof makeBuilder>;
type Dims = { w: number; h: number; U: number; ar: number };
type Content = {
  name: string;
  eyebrow?: string;
  title: string;
  sub?: string;
  meta?: string;
  brand?: string;
  cta?: string;
  role?: string;
  contact?: string;
  tagline?: string;
  date?: string;
  variant?: number;
};
type Recipe = (B: Builder, D: Dims, p: Palette, c: Content) => void;

/* ----------------------------- layouts ----------------------------- */

// Editorial / fashion — large serif headline, thin eyebrow, meta, slim accent.
const editorial: (font?: Font) => Recipe =
  (font = FT.playfairX) =>
  (B, D, p, c) => {
    B.bg(p.bg);
    const wide = D.ar > 1.3;
    const k = wide ? 0.13 : D.ar < 0.75 ? 0.14 : 0.135;
    B.rect(0.08, 0.1, 0.16, 0.009, p.accent, { r: 0.4 });
    if (c.eyebrow) B.txt(c.eyebrow.toUpperCase(), 0.08, 0.075, 0.84, 0.019, { font: FT.mont, fill: p.ink });
    B.txt(c.title, 0.075, wide ? 0.27 : 0.33, wide ? 0.62 : 0.86, k, { font, fill: p.ink, lh: 0.98 });
    if (wide) B.photo(0.64, 0.12, 0.28, 0.76, p.soft, p.accent);
    if (c.sub) B.txt(c.sub, 0.08, wide ? 0.72 : 0.72, wide ? 0.52 : 0.8, 0.03, { font: FT.cormorant, fill: p.ink, italic: true });
    B.rule(0.08, wide ? 0.86 : 0.86, wide ? 0.5 : 0.84, p.accent);
    if (c.meta) B.txt(c.meta.toUpperCase(), 0.08, wide ? 0.89 : 0.89, 0.84, 0.018, { font: FT.mont, fill: p.ink });
  };

// Bold type on a color block + star/asterisk accent.
const boldBlock: (font?: Font) => Recipe =
  (font = FT.anton) =>
  (B, D, p, c) => {
    B.bg(p.accent);
    const wide = D.ar > 1.3;
    B.txt(
      c.title.toUpperCase(),
      0.06,
      wide ? 0.2 : 0.22,
      wide ? 0.74 : 0.9,
      wide ? 0.2 : D.ar < 0.75 ? 0.2 : 0.22,
      { font, fill: p.onAccent, lh: 0.9 },
    );
    B.star(wide ? 0.82 : 0.72, wide ? 0.14 : 0.1, wide ? 0.13 : 0.2, wide ? 0.22 : 0.18, p.accent2, { rot: 12 });
    if (c.eyebrow) B.txt(c.eyebrow.toUpperCase(), 0.06, 0.1, 0.8, 0.02, { font: FT.mont, fill: p.onAccent });
    if (c.sub) B.txt(c.sub, 0.06, wide ? 0.7 : 0.74, wide ? 0.6 : 0.82, 0.026, { font: FT.montBody, fill: p.onAccent });
    B.arrow(0.06, wide ? 0.88 : 0.9, wide ? 0.2 : 0.26, p.onAccent, wide ? 1.4 : 1.6);
    if (c.meta) B.txt(c.meta.toUpperCase(), wide ? 0.72 : 0.5, wide ? 0.88 : 0.9, 0.42, 0.018, { font: FT.mont, fill: p.onAccent, align: "right" });
  };

// Photo-led — large placeholder, color band with headline.
const photoHero: (font?: Font) => Recipe =
  (font = FT.bebas) =>
  (B, D, p, c) => {
    B.bg(p.bg);
    const wide = D.ar > 1.3;
    if (wide) {
      B.photo(0.42, 0, 0.58, 1, p.soft, p.accent);
      B.rect(0, 0, 0.46, 1, p.bg);
      if (c.eyebrow) B.txt(c.eyebrow.toUpperCase(), 0.07, 0.18, 0.36, 0.022, { font: FT.mont, fill: p.accent });
      B.txt(c.title, 0.07, 0.3, 0.36, 0.14, { font, fill: p.ink, lh: 0.94 });
      if (c.sub) B.txt(c.sub, 0.07, 0.62, 0.34, 0.026, { font: FT.montBody, fill: p.ink });
      if (c.meta) B.txt(c.meta.toUpperCase(), 0.07, 0.86, 0.36, 0.019, { font: FT.mont, fill: p.ink });
    } else {
      B.photo(0, 0, 1, 0.62, p.soft, p.accent);
      B.rect(0, 0.62, 1, 0.38, p.bg);
      if (c.eyebrow) B.txt(c.eyebrow.toUpperCase(), 0.07, 0.68, 0.86, 0.022, { font: FT.mont, fill: p.accent });
      B.txt(c.title, 0.07, 0.72, 0.9, 0.11, { font, fill: p.ink, lh: 0.94 });
      if (c.meta) B.txt(c.meta.toUpperCase(), 0.07, 0.92, 0.86, 0.019, { font: FT.mont, fill: p.ink });
    }
  };

// Two color fields split by a big diagonal triangle, headline + photo frame.
const duotone: (font?: Font) => Recipe =
  (font = FT.archivo) =>
  (B, D, p, c) => {
    B.bg(p.bg);
    const wide = D.ar > 1.3;
    B.tri(wide ? 0.4 : 0.0, wide ? -0.2 : 0.42, wide ? 1.0 : 1.4, wide ? 1.6 : 1.0, p.accent, { rot: wide ? 28 : 18, op: 1 });
    if (c.eyebrow) B.txt(c.eyebrow.toUpperCase(), 0.07, 0.1, 0.5, 0.02, { font: FT.mont, fill: p.ink });
    B.txt(c.title, 0.07, wide ? 0.32 : 0.14, wide ? 0.5 : 0.62, wide ? 0.15 : 0.15, { font, fill: p.ink, lh: 0.95 });
    if (c.sub) B.txt(c.sub, 0.07, wide ? 0.68 : 0.42, wide ? 0.44 : 0.5, 0.026, { font: FT.montBody, fill: p.ink });
    B.photo(wide ? 0.66 : 0.4, wide ? 0.2 : 0.62, wide ? 0.28 : 0.52, wide ? 0.58 : 0.3, p.soft, p.onAccent);
    if (c.meta) B.txt(c.meta.toUpperCase(), 0.07, 0.92, 0.5, 0.018, { font: FT.mont, fill: p.ink });
  };

// Modern grid — color modules, big sans headline, number accents.
const gridModule: (font?: Font) => Recipe =
  (font = FT.space) =>
  (B, D, p, c) => {
    B.bg(p.bg);
    const wide = D.ar > 1.3;
    if (c.eyebrow) B.txt(c.eyebrow.toUpperCase(), 0.07, 0.08, 0.8, 0.02, { font: FT.mont, fill: p.accent });
    B.txt(c.title, 0.07, wide ? 0.16 : 0.14, wide ? 0.86 : 0.86, wide ? 0.12 : 0.12, { font, fill: p.ink, lh: 0.96 });
    const cols = wide ? 3 : 2;
    const gap = 0.03;
    const cw = (0.86 - gap * (cols - 1)) / cols;
    const by = wide ? 0.46 : 0.5;
    const bh = wide ? 0.42 : 0.34;
    const fills = [p.accent, p.accent2, p.soft];
    const labels = ["01", "02", "03", "04"];
    const words = c.sub ? c.sub.split(" · ") : ["Discover", "Create", "Deliver"];
    for (let i = 0; i < cols; i++) {
      const bx = 0.07 + i * (cw + gap);
      B.rect(bx, by, cw, bh, fills[i % fills.length], { r: 0.02 });
      B.txt(labels[i], bx + 0.02, by + 0.03, cw, 0.03, { font: FT.space, fill: p.ink });
      B.txt(words[i] ?? "", bx + 0.02, by + bh - 0.12, cw - 0.03, 0.035, { font: FT.montMid, fill: p.ink, lh: 1 });
    }
    if (c.meta) B.txt(c.meta.toUpperCase(), 0.07, 0.92, 0.86, 0.018, { font: FT.mont, fill: p.ink });
  };

// Script-led — elegant script headline, serif sub, ornament & rule.
const scriptPoster: (font?: Font) => Recipe =
  (font = FT.vibes) =>
  (B, D, p, c) => {
    B.bg(p.bg);
    B.rect(0.05, 0.05, 0.9, 0.9, p.bg, { r: 0.01 });
    // thin inner border
    B.rect(0.06, 0.06, 0.88, 0.004, p.accent);
    B.rect(0.06, 0.94, 0.88, 0.004, p.accent);
    if (c.eyebrow) B.txt(c.eyebrow.toUpperCase(), 0, 0.14, 1, 0.022, { font: FT.mont, fill: p.ink, align: "center" });
    B.txt(c.title, 0, 0.3, 1, D.ar < 0.75 ? 0.17 : 0.2, { font, fill: p.accent, align: "center", lh: 0.95 });
    B.star(0.46, 0.2, 0.08, 0.08, p.accent2, { rot: 10 });
    if (c.sub) B.txt(c.sub, 0, D.ar < 0.75 ? 0.6 : 0.58, 1, 0.035, { font: FT.cormorant, fill: p.ink, align: "center", italic: true });
    B.rule(0.4, D.ar < 0.75 ? 0.68 : 0.68, 0.2, p.accent);
    if (c.meta) B.txt(c.meta.toUpperCase(), 0, 0.8, 1, 0.02, { font: FT.mont, fill: p.ink, align: "center", lh: 1.4 });
  };

// Festive — scattered stars/circles pattern behind a bold centred headline.
const festive: (font?: Font) => Recipe =
  (font = FT.playfairX) =>
  (B, D, p, c) => {
    B.bg(p.bg);
    const dots: [number, number, number][] = [
      [0.12, 0.12, 0.05], [0.86, 0.1, 0.07], [0.2, 0.84, 0.06], [0.8, 0.8, 0.05],
      [0.5, 0.08, 0.04], [0.1, 0.5, 0.035], [0.9, 0.52, 0.04], [0.5, 0.92, 0.045],
    ];
    dots.forEach(([x, y, r], i) => {
      if (i % 2) B.circle(x, y, r, p.accent2, 0.9);
      else B.star(x - r, y - r, r * 2, r * 2, p.accent, { op: 0.9, rot: 8 });
    });
    if (c.eyebrow) B.txt(c.eyebrow.toUpperCase(), 0, 0.2, 1, 0.024, { font: FT.mont, fill: p.accent2, align: "center" });
    B.txt(c.title, 0, D.ar < 0.75 ? 0.34 : 0.34, 1, D.ar < 0.75 ? 0.17 : 0.18, { font, fill: p.ink, align: "center", lh: 0.95 });
    if (c.sub) B.txt(c.sub, 0, D.ar < 0.75 ? 0.58 : 0.58, 1, 0.03, { font: FT.montBody, fill: p.ink, align: "center" });
    B.rule(0.42, 0.68, 0.16, p.accent2);
    if (c.meta) B.txt(c.meta.toUpperCase(), 0, 0.78, 1, 0.02, { font: FT.mont, fill: p.ink, align: "center", lh: 1.5 });
  };

/* ---------- bespoke layouts: logo / business card / resume ---------- */

const logoMark: Recipe = (B, _D, p, c) => {
  B.bg(p.bg);
  const v = c.variant ?? 0;
  const initial = c.title.replace(/[^A-Za-z]/g, "").slice(0, 1).toUpperCase() || "A";
  if (v === 0) {
    B.circle(0.5, 0.36, 0.17, p.accent, 1);
    B.txt(initial, 0, 0.26, 1, 0.19, { font: FT.playfairX, fill: p.onAccent, align: "center" });
    B.txt(c.title, 0, 0.6, 1, 0.1, { font: FT.marcellus, fill: p.ink, align: "center" });
  } else if (v === 1) {
    B.rect(0.3, 0.3, 0.16, 0.16, p.accent);
    B.txt(c.title.toUpperCase(), 0, 0.36, 1, 0.16, { font: FT.archivoBlack, fill: p.ink, align: "center" });
  } else if (v === 2) {
    B.txt(c.title, 0, 0.38, 0.98, 0.17, { font: FT.cormorant, fill: p.ink, align: "center" });
    B.circle(0.74, 0.47, 0.016, p.accent, 1);
  } else if (v === 3) {
    B.circle(0.42, 0.37, 0.12, p.accent, 1);
    B.circle(0.56, 0.37, 0.12, p.accent2, 0.75);
    B.txt(c.title.toUpperCase(), 0, 0.58, 1, 0.09, { font: FT.josefin, fill: p.ink, align: "center" });
  } else {
    B.star(0.42, 0.16, 0.16, 0.16, p.accent, { rot: 6 });
    B.txt(c.title, 0, 0.42, 1, 0.14, { font: FT.libre, fill: p.ink, align: "center" });
  }
  if (c.tagline) B.txt(c.tagline.toUpperCase(), 0, v === 1 ? 0.56 : v === 4 ? 0.62 : 0.74, 1, 0.038, { font: FT.mont, fill: p.ink, align: "center" });
};

const cardFront: Recipe = (B, _D, p, c) => {
  B.bg(p.bg);
  const v = c.variant ?? 0;
  if (v === 0) B.rect(0.78, 0, 0.22, 1, p.accent);
  else if (v === 1) B.rect(0, 0, 1, 0.26, p.accent);
  else if (v === 2) B.tri(0.6, 0.3, 0.7, 0.9, p.accent, { rot: 24 });
  else if (v === 3) B.circle(0.86, 0.84, 0.26, p.accent, 1);
  else B.rect(0, 0, 0.1, 1, p.accent);
  const nameFont = v % 2 ? FT.space : FT.playfair;
  B.txt(c.title, 0.08, 0.2, 0.62, 0.1, { font: nameFont, fill: p.ink });
  if (c.role) B.txt(c.role.toUpperCase(), 0.08, 0.38, 0.62, 0.04, { font: FT.mont, fill: p.accent });
  if (c.contact) B.txt(c.contact, 0.08, 0.6, 0.66, 0.045, { font: FT.montBody, fill: p.ink, lh: 1.5 });
};

const resumeLayout: Recipe = (B, _D, p, c) => {
  B.bg(p.bg);
  const v = c.variant ?? 0;
  const sidebarLeft = v === 0 || v === 3;
  const topBand = v === 2;
  const serif = v === 1 || v === 3;
  const nameFont = serif ? FT.playfair : FT.space;
  if (topBand) {
    B.rect(0, 0, 1, 0.2, p.accent);
    B.txt(c.title, 0.07, 0.05, 0.86, 0.055, { font: nameFont, fill: p.onAccent });
    if (c.role) B.txt(c.role.toUpperCase(), 0.07, 0.13, 0.86, 0.02, { font: FT.mont, fill: p.onAccent });
  } else {
    const sx = sidebarLeft ? 0 : 0.68;
    B.rect(sx, 0, 0.32, 1, v === 4 ? p.soft : p.accent);
    const col = v === 4 ? p.ink : p.onAccent;
    B.txt("CONTACT", sx + 0.03, 0.3, 0.26, 0.02, { font: FT.mont, fill: col });
    if (c.contact) B.txt(c.contact, sx + 0.03, 0.34, 0.27, 0.016, { font: FT.montBody, fill: col, lh: 1.6 });
    B.txt("SKILLS", sx + 0.03, 0.52, 0.26, 0.02, { font: FT.mont, fill: col });
    B.txt("Research\nInteraction design\nDesign systems\nPrototyping", sx + 0.03, 0.56, 0.27, 0.016, { font: FT.montBody, fill: col, lh: 1.7 });
    const mx = sidebarLeft ? 0.38 : 0.07;
    B.txt(c.title, mx, 0.07, 0.55, 0.05, { font: nameFont, fill: p.ink });
    if (c.role) B.txt(c.role.toUpperCase(), mx, 0.14, 0.55, 0.018, { font: FT.mont, fill: p.accent });
  }
  const mx = topBand ? 0.07 : sidebarLeft ? 0.38 : 0.07;
  const top = topBand ? 0.26 : 0.24;
  B.txt("PROFILE", mx, top, 0.55, 0.022, { font: FT.mont, fill: p.accent });
  B.rule(mx, top + 0.035, 0.52, p.accent);
  B.txt(
    "Thoughtful designer building useful, accessible products with a\nfocus on clear communication and measurable outcomes.",
    mx,
    top + 0.05,
    0.55,
    0.015,
    { font: FT.montBody, fill: p.ink, lh: 1.6 },
  );
  B.txt("EXPERIENCE", mx, top + 0.16, 0.55, 0.022, { font: FT.mont, fill: p.accent });
  B.rule(mx, top + 0.195, 0.52, p.accent);
  B.txt(
    "Senior Product Designer · Studio Name · 2022–Now\nLed research, prototyping and systems across web and mobile.\n\nProduct Designer · Agency · 2019–2022\nShipped accessible, well-tested experiences with engineering.",
    mx,
    top + 0.21,
    0.55,
    0.015,
    { font: FT.montBody, fill: p.ink, lh: 1.6 },
  );
  B.txt("EDUCATION", mx, top + 0.46, 0.55, 0.022, { font: FT.mont, fill: p.accent });
  B.rule(mx, top + 0.495, 0.52, p.accent);
  B.txt("BA Design · Your University · 2019", mx, top + 0.51, 0.55, 0.015, { font: FT.montBody, fill: p.ink, lh: 1.6 });
};

/* ----------------------------- content ----------------------------- */

type CategorySpec = {
  category: Template["category"];
  format: string;
  palettes: number[];
  recipes: Recipe[];
  content: Content[];
};

const SPECS: CategorySpec[] = [
  {
    category: "Social",
    format: "social",
    palettes: [1, 5, 2, 11, 7],
    recipes: [editorial(FT.playfairX), boldBlock(FT.anton), photoHero(FT.bebas), gridModule(FT.space), scriptPoster(FT.dancing)],
    content: [
      { name: "Semi Casual", eyebrow: "Lookbook — 2025", title: "Semi\nCasual.", sub: "A quiet edit for everyday ease.", meta: "@yourstudio" },
      { name: "Big Sale", eyebrow: "Limited time", title: "Big\nSale", sub: "Up to 50% off, this week only.", meta: "shop now" },
      { name: "Slow Living", eyebrow: "Journal", title: "Slow\nLiving", meta: "@yourstudio · the edit" },
      { name: "The Method", eyebrow: "How we work", title: "The\nMethod", sub: "Discover · Create · Deliver", meta: "yourstudio.com" },
      { name: "Weekend Sale", eyebrow: "This weekend", title: "Sale", sub: "New season markdowns, now live.", meta: "yourstudio.com" },
    ],
  },
  {
    category: "Portrait post",
    format: "social-portrait",
    palettes: [2, 0, 9, 5, 3],
    recipes: [photoHero(FT.bebas), editorial(FT.bodoni), boldBlock(FT.archivoBlack), duotone(FT.archivo), scriptPoster(FT.allura)],
    content: [
      { name: "New Collection", eyebrow: "Fresh fit", title: "New\nCollection", sub: "Everyday pieces for in-between moments.", meta: "shop the look" },
      { name: "Editorial", eyebrow: "Issue 02", title: "In Full\nBloom.", sub: "A fresh perspective, in colour.", meta: "yourstudio.com" },
      { name: "Drop Alert", eyebrow: "Just landed", title: "The\nDrop", sub: "Limited run. Once it's gone, it's gone.", meta: "shop now" },
      { name: "Feature", eyebrow: "Spotlight", title: "Meet the\nmaker.", sub: "A story worth sharing.", meta: "@yourstudio" },
      { name: "Celebrate", eyebrow: "You're invited", title: "Celebrate", sub: "an evening of good company.", meta: "RSVP · yourstudio.com" },
    ],
  },
  {
    category: "Story",
    format: "story",
    palettes: [0, 3, 1, 10, 4],
    recipes: [photoHero(FT.bebas), boldBlock(FT.anton), editorial(FT.playfairX), scriptPoster(FT.vibes), gridModule(FT.space)],
    content: [
      { name: "Explore", eyebrow: "On the road", title: "Explore\nNature", sub: "Wander a little further.", meta: "swipe up" },
      { name: "Flash Sale", eyebrow: "24 hours only", title: "Flash\nSale", sub: "Tap to shop the markdowns.", meta: "ends tonight" },
      { name: "New Ritual", eyebrow: "Daily", title: "A new\nritual.", sub: "Small moments, made better.", meta: "@yourstudio" },
      { name: "Thank You", eyebrow: "With love", title: "Thank\nyou.", sub: "for being part of the story.", meta: "yourstudio.com" },
      { name: "The Menu", eyebrow: "Now serving", title: "The\nMenu", sub: "Fresh · Local · Seasonal", meta: "book a table" },
    ],
  },
  {
    category: "Presentation",
    format: "presentation",
    palettes: [5, 8, 1, 13, 0],
    recipes: [boldBlock(FT.archivo), gridModule(FT.space), editorial(FT.playfairX), duotone(FT.syne), photoHero(FT.oswald)],
    content: [
      { name: "Creative Brief", eyebrow: "Studio Showe", title: "Creative\nBrief", sub: "A clear canvas for your strongest ideas.", meta: "2025 · page 01" },
      { name: "Brand Strategy", eyebrow: "Building brands that last", title: "Brand\nStrategy", sub: "Discover · Define · Deliver", meta: "presented by you" },
      { name: "The Next Chapter", eyebrow: "Introduction", title: "The next\nchapter.", sub: "An introduction to what comes next.", meta: "yourstudio.com" },
      { name: "Brand Marketing", eyebrow: "Lioria & Co", title: "Brand\nMarketing", sub: "A bolder direction for the year ahead.", meta: "next slide →" },
      { name: "Campaign", eyebrow: "Rimberio Collection", title: "The\nCampaign", sub: "Ideas into impact.", meta: "July 2025" },
    ],
  },
  {
    category: "Video thumbnail",
    format: "youtube",
    palettes: [0, 5, 6, 9, 1],
    recipes: [boldBlock(FT.anton), photoHero(FT.bebas), duotone(FT.archivoBlack), gridModule(FT.space), editorial(FT.bodoni)],
    content: [
      { name: "Top 10", eyebrow: "You won't believe #1", title: "Top 10\nMoments", meta: "new video" },
      { name: "Explore India", eyebrow: "Travel vlog", title: "Explore\nIndia", sub: "Best places you have to see.", meta: "watch now" },
      { name: "Last Summer", eyebrow: "New album", title: "Last\nSummer", meta: "out now" },
      { name: "How To", eyebrow: "Step by step", title: "How To\nStart", sub: "A beginner's guide, made simple.", meta: "full tutorial" },
      { name: "The Review", eyebrow: "Honest take", title: "The\nReview", sub: "Everything you need to know.", meta: "watch now" },
    ],
  },
  {
    category: "Poster",
    format: "poster",
    palettes: [1, 0, 2, 10, 12],
    recipes: [editorial(FT.bodoni), boldBlock(FT.anton), photoHero(FT.bebas), festive(FT.playfairX), scriptPoster(FT.vibes)],
    content: [
      { name: "New Season", eyebrow: "Autumn / Winter", title: "New\nSeason", sub: "The art of the everyday.", meta: "in stores now · yourstudio.com" },
      { name: "Live Show", eyebrow: "One night only", title: "Live\non Stage", sub: "Doors 8pm · Saturday", meta: "tickets at yourvenue.com" },
      { name: "Modern House", eyebrow: "Open house", title: "Modern\nHouse", sub: "Designed to impress.", meta: "123 Anywhere St · $100,000" },
      { name: "Art Festival", eyebrow: "A weekend of", title: "Art\nFestival", sub: "music · makers · community", meta: "24–26 October · the park" },
      { name: "Grand Opening", eyebrow: "You're invited", title: "Grand\nOpening", sub: "Join us for the celebration.", meta: "Friday · 50% off everything" },
    ],
  },
  {
    category: "Banner",
    format: "banner",
    palettes: [5, 1, 8, 11, 3],
    recipes: [boldBlock(FT.archivo), gridModule(FT.space), editorial(FT.playfair), duotone(FT.syne), scriptPoster(FT.dancing)],
    content: [
      { name: "Sale Banner", eyebrow: "Limited time", title: "Mid-Season Sale", sub: "Up to 40% off sitewide.", meta: "shop now" },
      { name: "Launch", eyebrow: "Now live", title: "We just launched.", sub: "Discover · Create · Deliver", meta: "yourstudio.com" },
      { name: "Headline", eyebrow: "A fresh point of view", title: "Designed around you.", sub: "Everyday tools for big ideas.", meta: "get started" },
      { name: "Event", eyebrow: "Save the date", title: "The Big Event", sub: "Join us this October.", meta: "register today" },
      { name: "Welcome", eyebrow: "Hello there", title: "Welcome in.", sub: "come on in and stay a while.", meta: "yourstudio.com" },
    ],
  },
  {
    category: "Logo",
    format: "logo",
    palettes: [8, 0, 12, 5, 9],
    recipes: [logoMark, logoMark, logoMark, logoMark, logoMark],
    content: [
      { name: "Monogram", title: "Atelier", tagline: "Studio · est. 2025", variant: 0 },
      { name: "Studio Block", title: "Studio", tagline: "creative agency", variant: 1 },
      { name: "Chic Serif", title: "chic", tagline: "quiet luxury design", variant: 2 },
      { name: "Twin Dot", title: "Muse", tagline: "brand & design", variant: 3 },
      { name: "Emblem", title: "North", tagline: "field & supply co.", variant: 4 },
    ],
  },
  {
    category: "Resume",
    format: "resume",
    palettes: [8, 1, 9, 11, 2],
    recipes: [resumeLayout, resumeLayout, resumeLayout, resumeLayout, resumeLayout],
    content: [
      { name: "Sidebar", title: "Alex Morgan", role: "Product Designer", contact: "hello@example.com\n+1 555 010 2025\nportfolio.example.com\nNew York, NY", variant: 0 },
      { name: "Serif Pro", title: "Jordan Lee", role: "Brand Designer", contact: "hello@example.com\n+1 555 010 2025\njordanlee.design", variant: 1 },
      { name: "Top Band", title: "Sam Rivera", role: "Art Director", contact: "hello@example.com\n+1 555 010 2025\nsamrivera.co", variant: 2 },
      { name: "Right Rail", title: "Taylor Chen", role: "UX Designer", contact: "hello@example.com\n+1 555 010 2025\ntaylorchen.me", variant: 3 },
      { name: "Soft Tone", title: "Casey Park", role: "Design Lead", contact: "hello@example.com\n+1 555 010 2025\ncaseypark.studio", variant: 4 },
    ],
  },
  {
    category: "Invitation",
    format: "invitation",
    palettes: [3, 2, 9, 13, 0],
    recipes: [scriptPoster(FT.pinyon), editorial(FT.cormorant), festive(FT.playfairX), photoHero(FT.cormorant), scriptPoster(FT.allura)],
    content: [
      { name: "Evening", eyebrow: "Together at last", title: "You're\nInvited", sub: "to an evening of celebration", meta: "Saturday · 24 October · 7pm\nThe Garden House" },
      { name: "The Wedding", eyebrow: "Save the date", title: "Sarah &\nLeon", sub: "request the pleasure of your company", meta: "12 June 2026 · Udaipur" },
      { name: "Festival", eyebrow: "Shubh Deepavali", title: "Happy\nDiwali", sub: "may the lights guide your year", meta: "join us · 24 October" },
      { name: "Cocktails", eyebrow: "You're invited", title: "Cocktail\nParty", sub: "an evening of small plates & company", meta: "9 Sept · 7pm · Artsy Cafe" },
      { name: "Soirée", eyebrow: "Please join us", title: "A Garden\nSoirée", sub: "dinner under the stars", meta: "RSVP by 1 October" },
    ],
  },
  {
    category: "Flyer",
    format: "flyer",
    palettes: [11, 0, 5, 3, 1],
    recipes: [photoHero(FT.oswald), boldBlock(FT.anton), gridModule(FT.space), festive(FT.playfairX), editorial(FT.bodoni)],
    content: [
      { name: "House for Sale", eyebrow: "Just listed", title: "House\nfor Sale", sub: "3 bed · 2 bath · open plan", meta: "schedule a visit · $450,000" },
      { name: "Food Festival", eyebrow: "This weekend", title: "Food\nFestival", sub: "street eats from across the city", meta: "Sat–Sun · 12–8pm · the square" },
      { name: "Workshop", eyebrow: "Hands-on", title: "Design\nWorkshop", sub: "Learn · Make · Share", meta: "Saturday · 10am–4pm · book now" },
      { name: "Grand Opening", eyebrow: "Now open", title: "Grand\nOpening", sub: "come celebrate with us", meta: "Friday · free treats all day" },
      { name: "Open House", eyebrow: "Real estate", title: "Open\nHouse", sub: "a home designed to impress", meta: "Sunday 1–4pm · 123 Anywhere St" },
    ],
  },
  {
    category: "Business card",
    format: "business-card",
    palettes: [8, 0, 9, 12, 2],
    recipes: [cardFront, cardFront, cardFront, cardFront, cardFront],
    content: [
      { name: "Classic", title: "Alex Morgan", role: "Creative Director", contact: "hello@yourstudio.com\n+1 555 010 2025\nyourstudio.com", variant: 0 },
      { name: "Top Band", title: "Bold Studio", role: "Design Agency", contact: "hello@boldstudio.com\n+1 555 010 2025\nboldstudio.com", variant: 1 },
      { name: "Diagonal", title: "Fern & Co.", role: "Floral Design", contact: "hello@fernandco.com\n+1 555 010 2025\nfernandco.com", variant: 2 },
      { name: "Circle", title: "Muse Studio", role: "Photography", contact: "hello@muse.studio\n+1 555 010 2025\nmuse.studio", variant: 3 },
      { name: "Minimal", title: "North Design", role: "Brand & Web", contact: "hello@northdesign.co\n+1 555 010 2025\nnorthdesign.co", variant: 4 },
    ],
  },
];

function createPresentationPages(
  id: string,
  width: number,
  height: number,
  palette: Palette,
): DocumentPage[] {
  const topics = [
    "The challenge",
    "Our approach",
    "The opportunity",
    "How it works",
    "Our audience",
    "The roadmap",
    "The team",
    "Measuring success",
    "Let’s make it happen",
  ];

  return topics.map((topic, index) => {
    const pageId = `${id}-page-${index + 2}`;
    const builder = makeBuilder(pageId, width, height);
    const heading = { font: FT.mont, fill: palette.ink };
    const body = { font: FT.montBody, fill: palette.ink, lh: 1.4 };
    builder.bg(palette.bg);
    builder.txt(String(index + 2).padStart(2, "0"), 0.88, 0.08, 0.1, 0.025, body);
    builder.txt(topic, 0.07, 0.14, 0.84, 0.065, heading);
    builder.rule(0.07, 0.3, 0.86, palette.accent);

    if (index === 2 || index === 7) {
      [0.32, 0.48, 0.65, 0.83].forEach((value, column) => {
        const x = 0.14 + column * 0.2;
        builder.rect(x, 0.82 - value * 0.5, 0.12, value * 0.5,
          column === 3 ? palette.accent : palette.soft);
        builder.txt(`${Math.round(value * 100)}%`, x, 0.85, 0.16, 0.026, body);
      });
      builder.txt("Illustrative data · replace with your own", 0.07, 0.94, 0.85, 0.016, body);
    } else if (index === 8) {
      builder.txt("One clear idea.\nA shared next step.", 0.07, 0.43, 0.85, 0.09, heading);
      builder.txt("yourwebsite.com · hello@yourstudio.com", 0.07, 0.85, 0.85, 0.025, body);
    } else {
      const cards = [
        ["Discover", "Understand the need.\nListen to the people\nwho matter most."],
        ["Create", "Build a focused idea.\nTest it early.\nMake it useful."],
        ["Deliver", "Turn plans into action.\nMeasure what changes.\nKeep improving."],
      ];
      cards.forEach(([title, description], column) => {
        const x = 0.07 + column * 0.3;
        builder.rect(x, 0.4, 0.26, 0.43, palette.soft);
        builder.txt(title, x + 0.02, 0.45, 0.23, 0.035, heading);
        builder.txt(description, x + 0.02, 0.57, 0.23, 0.021, body);
      });
    }

    return {
      id: pageId,
      name: topic,
      background: builder.background,
      elements: builder.els,
      notes: `Introduce ${topic.toLowerCase()} and replace the sample content with your own research.`,
      transition: "fade",
    };
  });
}

export function createTemplateCollection(): Template[] {
  const out: Template[] = [];
  for (const spec of SPECS) {
    const preset = formats.find((f) => f.id === spec.format)!;
    const { width: w, height: h } = preset;
    const D: Dims = { w, h, U: Math.min(w, h), ar: w / h };
    spec.recipes.forEach((recipe, i) => {
      const id = `${spec.format}-${i + 1}`;
      const palette = PALETTES[spec.palettes[i] ?? i % PALETTES.length];
      const B = makeBuilder(id, w, h);
      recipe(B, D, palette, spec.content[i]);
      const page: DocumentPage = {
        id: `${id}-page`,
        name: spec.category === "Presentation" ? "Cover" : "Design",
        background: B.background,
        elements: B.els,
        notes: "",
        transition: "fade",
      };
      const document: CreativeDocument = {
        schemaVersion: 1,
        width: w,
        height: h,
        pages: spec.category === "Presentation"
          ? [page, ...createPresentationPages(id, w, h, palette)]
          : [page],
      };
      out.push({
        id,
        title: spec.content[i].name,
        category: spec.category,
        description: `${palette.name} · ${preset.description}. ${spec.category === "Presentation" ? "A complete ten-slide deck." : "A fully editable, original layout."}`,
        document,
      });
    });
  }
  return out;
}
