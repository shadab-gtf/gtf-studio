import { board, type Artwork, type Artboard } from "./builder";

function details(b: Artboard, color = "#ffffff") {
  b.footer("MAKE IT YOURS / @REALLYGREATSITE", "EST. 1993", color);
}
export function fashionDesigns(): Artwork[] {
  const out: Artwork[] = [];
  let b = board(
    "Poster",
    "semi-casual",
    "Semi Casual — Olive Editorial",
    "#e2e2e0",
  );
  const portrait = b.photo("semi-casual", 0, 0, 1000, b.h, { focusY: 0.48 });
  portrait.src = portrait.docSrc =
    "/media/templates/photos/semi-casual-portrait.webp";
  b.text("SEMI", 82, 90, 200, 35, "Manrope", "#485122", { tracking: 180 });
  b.text("CASUAL", 64, 116, 880, 247, "Italiana", "#485122");
  b.text("LOOK", 777, 346, 150, 35, "Manrope", "#485122", {
    tracking: 120,
    align: "right",
  });
  details(b);
  out.push(b.finish());

  b = board("Poster", "red-film", "RED — Independent Film", "#f0f0ed");
  b.text("RED", 65, 65, 870, 280, "Archivo Black", "#c80031");
  b.text("A FILM BY NEIL TRAN", 85, 350, 830, 30, "Montserrat", "#191919", {
    weight: 800,
    tracking: 70,
    align: "center",
  });
  b.text(
    "LARS PEETERS  /  DREW FEI  /  SAMIRA HADID",
    105,
    405,
    790,
    13,
    "Manrope",
    "#111111",
    { tracking: 90, align: "center" },
  );
  b.photo("fashion-cream", 90, 485, 820, b.h - 485, {
    gray: true,
    focusX: 0.62,
  });
  b.rect(0, 727, 1000, 108, "#cf0036");
  b.text(
    "NO ONE LEAVES UNCHANGED.",
    45,
    750,
    910,
    26,
    "Bebas Neue",
    "#ffffff",
    { tracking: 80, align: "center" },
  );
  out.push(b.finish());

  b = board("Poster", "jennie", "JENNIE — New Style", "#eee9e2");
  b.photo("fashion-cream", 110, 25, 790, 1030, { focusX: 0.65 });
  b.rect(24, 500, 260, 530, "#ffffff");
  b.photo("sunglasses", 36, 515, 236, 500);
  b.rect(697, 460, 279, 570, "#ffffff");
  b.photo("fashion-coat", 710, 474, 253, 542);
  b.text("JENNIE", 44, 35, 916, 190, "Bodoni Moda", "#ffffff");
  b.text("your", 90, 1080, 260, 60, "Allura", "#976c55");
  b.text("STYLE", 80, 1135, 800, 112, "League Spartan", "#976c55", {
    weight: 700,
  });
  details(b, "#332923");
  out.push(b.finish());

  b = board("Poster", "mirror-film", "MIRROR — Cinema Poster", "#dddddb");
  b.photo("sunglasses", 0, 260, 1000, b.h - 260, { gray: true });
  b.text("MIRROR", 70, 40, 860, 190, "Anton", "#111111");
  b.text("A FILM BY NEIL TRAN", 100, 262, 800, 27, "Bebas Neue", "#111111", {
    tracking: 150,
    align: "center",
  });
  b.rect(0, 660, 1000, 200, "#bf3c25").opacity = 0.56;
  b.text(
    "EVERY REFLECTION HAS A SECRET.",
    82,
    1220,
    840,
    24,
    "Manrope",
    "#ffffff",
    { tracking: 100, align: "center" },
  );
  details(b);
  out.push(b.finish());

  b = board("Poster", "harper-live", "HARPER RUSSO — Live", "#0b0808");
  b.text("HARPER RUSSO", 48, 24, 904, 274, "Six Caps", "#fa2516");
  b.ellipse(160, 350, 680, 680, "#ed3a13");
  b.photo("portrait-man", 212, 395, 570, 650, { circle: true, gray: true });
  b.text("20TH     AUGUST     2028", 70, 1090, 860, 106, "Six Caps", "#fff9e8");
  b.line(60, 1240, 940, 1240, "#ef351f", 3);
  b.text("FROM 06 PM — 08 PM", 65, 1270, 450, 25, "Bebas Neue", "#fff9e8");
  details(b);
  out.push(b.finish());

  b = board("Portrait post", "new-drop", "New Drop — Streetwear", "#cf0806");
  b.photo("menswear", 130, 240, 740, 1010, { focusY: 0.32 });
  b.text("NEW", 30, 32, 540, 210, "League Spartan", "#ffc728", { weight: 800 });
  b.text("DROP", 547, 22, 670, 205, "League Spartan", "#ffc728", {
    weight: 800,
    angle: 56,
  });
  b.line(45, 420, 240, 510, "#ffc728", 9);
  b.line(800, 820, 950, 890, "#ffc728", 9);
  details(b);
  out.push(b.finish());

  b = board(
    "Portrait post",
    "chapter-thirty",
    "Chapter 30 — Effortlessly Iconic",
    "#16281d",
  );
  b.photo("fashion-yellow", 0, 100, 1000, 1150, { focusX: 0.56 });
  b.rect(0, 0, 1000, 235, "#13241e");
  b.text("Chapter 30:", 160, 40, 680, 72, "Cormorant Garamond", "#f7d330", {
    italic: true,
    align: "center",
  });
  b.text(
    "effortlessly iconic",
    160,
    115,
    680,
    52,
    "Cormorant Garamond",
    "#f7d330",
    { italic: true, align: "center" },
  );
  b.rect(690, 410, 270, 580, "#fffbe4");
  b.photo("fashion-yellow", 704, 425, 243, 550, { focusX: 0.62 });
  out.push(b.finish());

  b = board(
    "Portrait post",
    "quiet-style",
    "Soft Structure — Editorial Collage",
    "#9a9b90",
  );
  b.rect(60, 60, 680, 1130, "#f4efe7");
  b.photo("fashion-cream", 80, 80, 640, 1090, { focusX: 0.66 });
  b.rect(593, 430, 355, 607, "#ece7df");
  b.photo("sunglasses", 614, 451, 313, 565);
  b.text("FORM / 26", 760, 65, 175, 15, "Manrope", "#ffffff", {
    tracking: 200,
  });
  out.push(b.finish());

  b = board(
    "Portrait post",
    "best-seller",
    "Best Seller — Boutique Edit",
    "#e8dedd",
  );
  b.text("Best", 220, 42, 560, 130, "Allura", "#211c1b", { align: "center" });
  b.text("Seller", 220, 158, 560, 110, "Bodoni Moda", "#211c1b", {
    align: "center",
  });
  b.text("GET UP TO 30% OFF", 200, 285, 600, 20, "Manrope", "#211c1b", {
    align: "center",
    tracking: 120,
  });
  b.photo("fashion-coat", 35, 510, 290, 570);
  b.photo("sunglasses", 300, 370, 425, 880);
  b.photo("fashion-cream", 735, 510, 230, 570);
  out.push(b.finish());

  b = board(
    "Portrait post",
    "modern-house",
    "Modern House — Property Launch",
    "#564539",
  );
  b.photo("architecture", 0, 0, 1000, 655);
  b.text("MODERN\nHOUSE", 55, 685, 650, 108, "Manrope", "#ffffff", {
    weight: 700,
    lineHeight: 1,
  });
  ["living-room", "bedroom", "interior"].forEach((p, i) =>
    b.photo(p, 748, 680 + i * 163, 215, 145),
  );
  b.text(
    "A home designed for the way you live.",
    58,
    950,
    630,
    23,
    "Manrope",
    "#f4eee8",
  );
  b.text(
    "3 bedrooms     2 bathrooms     1,840 sq ft",
    58,
    1035,
    650,
    22,
    "Manrope",
    "#ffffff",
  );
  b.rect(0, 1160, 1000, 90, "#eee8e0");
  b.footer("BOOK YOUR PRIVATE VIEWING", "PROPERTY / 05", "#302923");
  out.push(b.finish());

  b = board("Story", "explore-nature", "Explore — Mountain Escape", "#f2efe6");
  b.photo("mountains", 0, 260, 1000, b.h - 260);
  b.text("EXPLORE", 70, 80, 860, 165, "Archivo Black", "#171811");
  b.text("N A T U R E", 220, 260, 560, 27, "Bebas Neue", "#1d211a", {
    align: "center",
  });
  b.text(
    "Find a little wonder\nbeyond the everyday.",
    80,
    1470,
    800,
    43,
    "Cormorant Garamond",
    "#ffffff",
    { align: "center" },
  );
  details(b);
  out.push(b.finish());

  b = board("Story", "mens-style", "Styled Well — Menswear", "#343c31");
  b.photo("menswear", 0, 0, 1000, b.h);
  b.text("STYLED WELL", 50, 55, 900, 32, "Manrope", "#ffffff", {
    tracking: 100,
  });
  b.text(
    "DISCOVER\nOUR\nLATEST\nSTYLES",
    68,
    710,
    480,
    108,
    "Six Caps",
    "#ffffff",
  );
  ["menswear", "portrait-man", "fashion-red"].forEach((p, i) => {
    b.rect(600, 180 + i * 430, 350, 405, "#fffdf5");
    b.photo(p, 615, 195 + i * 430, 320, 375);
  });
  details(b);
  out.push(b.finish());

  b = board(
    "Story",
    "new-collection-neutral",
    "New Collection — Natural Tones",
    "#f6f4eb",
  );
  b.text("New", 100, 125, 800, 156, "Allura", "#7c8064", { align: "center" });
  b.text("COLLECTION", 80, 300, 840, 95, "Italiana", "#555c3d", {
    align: "center",
  });
  b.photo("sunglasses", 80, 465, 520, 925);
  b.photo("fashion-cream", 620, 465, 300, 440);
  b.photo("fashion-coat", 620, 925, 300, 465);
  b.text(
    "Effortless pieces.\nEveryday confidence.",
    160,
    1460,
    680,
    38,
    "Cormorant Garamond",
    "#485039",
    { align: "center" },
  );
  b.rect(310, 1595, 380, 74, "#646b4b", 37);
  b.text("Shop now", 330, 1608, 340, 32, "Manrope", "#ffffff", {
    align: "center",
  });
  out.push(b.finish());

  b = board("Story", "about-me", "About Me — Creator Portfolio", "#d4d4d2");
  b.text("About me", 85, 95, 830, 156, "Allura", "#202020", {
    align: "center",
  });
  b.photo("menswear", 85, 370, 540, 860);
  b.photo("portrait-man", 505, 710, 450, 790);
  b.text("BEN HARRINGTON", 65, 280, 870, 22, "Manrope", "#333333", {
    tracking: 180,
  });
  b.text(
    "Style is a form of\nself-expression.",
    65,
    1320,
    390,
    31,
    "Manrope",
    "#222222",
  );
  b.rect(560, 1490, 390, 70, "#1d1d1d");
  b.text("Ben Harrington", 575, 1507, 350, 25, "Manrope", "#ffffff");
  details(b, "#222222");
  out.push(b.finish());

  b = board(
    "Story",
    "white-edit",
    "New Collection — The White Edit",
    "#f8f7f3",
  );
  b.photo("fashion-cream", 345, 0, 655, 1030, { focusX: 0.65 });
  b.rect(55, 480, 380, 665, "#ffffff");
  b.photo("sunglasses", 70, 500, 350, 625);
  b.photo("fashion-coat", 500, 1060, 430, 400);
  b.text("New Collection", 65, 1490, 870, 89, "Bodoni Moda", "#302b26");
  b.text(
    "Our new collection is here.\nGrab it now and get 20% off.",
    70,
    1605,
    860,
    33,
    "Manrope",
    "#302b26",
  );
  out.push(b.finish());

  const profiles = [
    [
      "richard-profile",
      "Richard Sanchez",
      "portrait-man",
      "#151515",
      "#ffffff",
      "Creative Marketing Officer",
    ],
    [
      "shawn-profile",
      "Shawn Garcia",
      "menswear",
      "#0b0b0b",
      "#ffffff",
      "Fashion / Culture",
    ],
    [
      "blush-profile",
      "A moment for you",
      "fashion-cream",
      "#f7e2e6",
      "#916f73",
      "THE SOFT EDIT",
    ],
    [
      "sunshine-profile",
      "Hello, sunshine",
      "fashion-yellow",
      "#f4d20c",
      "#171810",
      "GOOD ENERGY ONLY",
    ],
    [
      "sacha-profile",
      "Sacha Dubois",
      "sunglasses",
      "#101010",
      "#ffffff",
      "CHIEF MARKETING OFFICER",
    ],
  ] as const;
  profiles.forEach(([id, title, p, bg, ink, role], i) => {
    const a = board("Profile picture", id, title, bg);
    if (i === 2) {
      a.ellipse(-220, -160, 650, 700, "#edcbd2");
      a.ellipse(730, 750, 450, 500, "#edcbd2");
    }
    if (i === 3) a.star(85, 85, 415, "#fff8de", 7, 0.84);
    a.photo(i === 2 ? "fashion-street" : p, 155, 120, 690, 690, {
      circle: true,
      gray: i === 4,
      focusY: i === 0 ? 0.5 : 0,
    });
    if (i !== 2 && i !== 3) {
      a.rect(140, 765, 720, 78, bg).opacity = 0.76;
      a.text(
        title,
        125,
        760,
        750,
        i === 4 ? 80 : 57,
        i === 4 ? "Allura" : "Manrope",
        ink,
        { weight: i === 4 ? 400 : 700, align: "center" },
      );
      a.text(role, 100, 875, 800, 17, "Manrope", ink, {
        align: "center",
        tracking: 180,
      });
    }
    out.push(a.finish());
  });
  return out;
}
