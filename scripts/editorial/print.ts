import { board, paragraph, type Artwork, type Artboard } from "./builder";

function propertyDetails(
  b: Artboard,
  x: number,
  y: number,
  ink: string,
  w = 800,
) {
  b.text("Property features", x, y, w, 23, "Manrope", ink, { weight: 700 });
  b.text(
    "3 bedrooms     2 bathrooms     2 car spaces",
    x,
    y + 51,
    w,
    22,
    "Manrope",
    ink,
  );
  b.line(x, y + 96, x + w, y + 96, ink, 1);
  paragraph(
    b,
    "A thoughtfully designed home with generous living spaces,\nnatural light and room for everything that matters.",
    x,
    y + 120,
    w,
    19,
    ink,
  );
}
function ornament(
  b: Artboard,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5;
    const leaf = b.ellipse(
      x + Math.cos(a) * size * 0.45,
      y + Math.sin(a) * size * 0.45,
      size * 0.22,
      size * 0.5,
      "transparent",
      color,
      1.6,
    );
    leaf.angle = i * 36;
  }
  b.ellipse(x - size * 0.13, y - size * 0.13, size * 0.26, size * 0.26, color);
}
export function printDesigns(): Artwork[] {
  const out: Artwork[] = [];
  let b = board(
    "Flyer",
    "navy-property",
    "House for Sale — Navy & Gold",
    "#1c254f",
  );
  b.photo("living-room", 0, 0, 480, 490);
  b.photo("house", 455, 130, 545, 500);
  b.polygon(
    [
      [0, 480],
      [520, 0],
      [650, 0],
      [0, 650],
    ],
    "#1c254f",
  );
  b.text("House\nfor sale", 70, 600, 820, 127, "Italiana", "#e6c575", {
    lineHeight: 0.92,
  });
  propertyDetails(b, 65, 930, "#fff6df");
  b.rect(65, 1160, 870, 58, "#e8b756", 29);
  b.text(
    "BOOK NOW       +123 456 7890       hello@reallygreatsite.com",
    90,
    1177,
    820,
    18,
    "Manrope",
    "#20274a",
  );
  out.push(b.finish());

  b = board("Flyer", "comfort-home", "Find Comfort in Every Corner", "#f5f3eb");
  b.text("FIND COMFORT IN\nEVERY CORNER", 55, 45, 530, 74, "Anton", "#8a734d");
  b.text("Starts at $895,000", 55, 225, 500, 29, "Bebas Neue", "#242725");
  b.photo("architecture", 0, 300, 1000, 450);
  b.photo("living-room", 670, 30, 300, 450);
  b.photo("interior", 615, 650, 355, 300);
  b.polygon(
    [
      [450, 1294],
      [1000, 1294],
      [1000, 960],
      [680, 960],
    ],
    "#32332c",
  );
  propertyDetails(b, 55, 830, "#292d23", 510);
  b.text("VIEWING BY APPOINTMENT", 55, 1165, 520, 28, "Bebas Neue", "#292d23");
  out.push(b.finish());

  b = board(
    "Flyer",
    "warm-property",
    "House for Sale — Warm Minimal",
    "#f4efdf",
  );
  b.photo("architecture", 60, 75, 880, 540);
  b.text("HOUSE\nFOR SALE", 75, 670, 510, 100, "Bebas Neue", "#504632");
  b.rect(620, 640, 380, 655, "#b8ab90");
  b.text("Property\nfeatures", 665, 680, 290, 35, "Manrope", "#ffffff", {
    weight: 700,
  });
  b.text(
    "3 Bedrooms\n\n2 Bathrooms\n\nSpacious living room\n\nGarden & parking",
    665,
    820,
    280,
    25,
    "Manrope",
    "#ffffff",
  );
  paragraph(
    b,
    "Your next chapter starts here.\nExplore a home built around\nthe way you want to live.",
    75,
    925,
    490,
    24,
    "#504632",
  );
  b.rect(75, 1135, 285, 65, "#a18b66", 32);
  b.text("BOOK NOW", 100, 1153, 235, 22, "Manrope", "#ffffff", {
    align: "center",
    weight: 700,
  });
  out.push(b.finish());

  b = board(
    "Flyer",
    "bright-property",
    "Rimberio Property — House for Sale",
    "#faf8ed",
  );
  b.text("RIMBERIO\nPROPERTY", 55, 50, 500, 22, "Manrope", "#785d3c", {
    tracking: 60,
  });
  b.text("HOUSE FOR SALE", 55, 185, 600, 74, "Bebas Neue", "#252b23");
  b.photo("villa", 40, 310, 670, 565);
  ["living-room", "bedroom", "interior"].forEach((p, i) =>
    b.photo(p, 735, 100 + i * 280, 225, 250),
  );
  propertyDetails(b, 55, 940, "#675739", 840);
  b.footer("CONTACT US / +123 456 7890", "BOOK NOW", "#675739");
  out.push(b.finish());

  b = board("Flyer", "nomade-opening", "NOMADE — Now Open", "#f4f2ea");
  b.text("NOMADE", 45, 55, 910, 164, "Archivo Black", "#20271e");
  b.photo("restaurant", 90, 245, 820, 680);
  b.text("NOW OPEN", 45, 925, 910, 136, "Archivo Black", "#20271e");
  b.text(
    "123 ANYWHERE ST., ANY CITY\n@REALLYGREATSITE",
    90,
    1150,
    820,
    23,
    "Bebas Neue",
    "#20271e",
    { align: "center", tracking: 110 },
  );
  out.push(b.finish());

  b = board(
    "Book cover",
    "sinister-shadow",
    "Sinister Shadow — A Novel",
    "#183e3a",
  );
  b.photo("sunglasses", 0, 0, 1000, 1500, { gray: true });
  b.rect(0, 0, 1000, 1500, "#0c4c43").opacity = 0.35;
  b.text("SINISTER", 50, 65, 900, 151, "Manrope", "#ffffff");
  b.text("SHADOW", 50, 250, 900, 162, "League Spartan", "#d83a32", {
    weight: 800,
  });
  b.text(
    "The truth was never meant to find her.",
    70,
    438,
    860,
    25,
    "Cormorant Garamond",
    "#ffffff",
    { align: "center" },
  );
  b.text("OLIVIA WILSON", 80, 1380, 840, 35, "Manrope", "#ffffff", {
    tracking: 180,
    align: "center",
  });
  out.push(b.finish());
  b = board("Book cover", "risk-algorithm", "The Risk Algorithm", "#080e10");
  b.photo("city", 0, 0, 1000, 1500, { gray: true });
  b.rect(0, 0, 1000, 1500, "#020908").opacity = 0.78;
  for (let i = 0; i < 23; i++) {
    const x = 65 + i * 39,
      y = 180 + Math.sin(i * 0.7) * 85;
    b.line(x, y - 25, x, y + 115, i % 3 ? "#749585" : "#d19144", 3);
    b.rect(x - 7, y, 14, 60, i % 3 ? "#749585" : "#d19144");
  }
  b.text("THE RISK\nALGORITHM", 70, 430, 860, 130, "Anton", "#edbc4b", {
    align: "center",
    lineHeight: 1,
  });
  b.line(85, 755, 915, 755, "#edbc4b", 3);
  b.text(
    "DECODING PROFIT\nIN UNCERTAIN\nTIMES",
    90,
    800,
    820,
    65,
    "Manrope",
    "#ffffff",
    { weight: 700, align: "center" },
  );
  b.rect(0, 1370, 1000, 130, "#f7c95c");
  b.text("HARPER RUSSO", 100, 1420, 800, 28, "Manrope", "#262718", {
    align: "center",
    tracking: 120,
  });
  out.push(b.finish());
  b = board(
    "Book cover",
    "recipe-book",
    "My Recipe Book — Collected Favourites",
    "#f8f4ed",
  );
  b.photo("food", 100, 75, 800, 540);
  b.ellipse(585, 640, 90, 90, "#d94129");
  b.line(630, 640, 665, 530, "#456039", 5);
  b.ellipse(649, 540, 90, 35, "#677d4a");
  b.text(
    "M Y\nR E C I P E\nB O O K",
    150,
    780,
    700,
    70,
    "Cormorant Garamond",
    "#202020",
    { align: "center", lineHeight: 1.5 },
  );
  b.text("BY OLIVIA WILSON", 120, 1390, 760, 22, "Manrope", "#222222", {
    tracking: 120,
    align: "center",
  });
  out.push(b.finish());
  b = board(
    "Book cover",
    "window-thriller",
    "Window — Psychological Thriller",
    "#050505",
  );
  b.text("JONATHAN PATTERSON", 70, 80, 860, 23, "Manrope", "#ffffff", {
    align: "center",
    tracking: 170,
  });
  b.rect(82, 190, 836, 890, "#eeeeea");
  b.photo("fashion-cream", 110, 215, 780, 836, { gray: true });
  b.rect(480, 200, 40, 860, "#070707");
  b.rect(95, 620, 810, 35, "#070707");
  b.text("WINDOW", 60, 1100, 880, 200, "Six Caps", "#ffffff", {
    align: "center",
  });
  b.text(
    "INSPIRED BY A REAL LIFE STORY",
    100,
    1350,
    800,
    28,
    "Bebas Neue",
    "#ffffff",
    { align: "center", tracking: 80 },
  );
  out.push(b.finish());
  b = board(
    "Book cover",
    "self-improvement",
    "Self Improvement — A Better Everyday",
    "#be5b06",
  );
  b.text("SELF", 80, 80, 840, 210, "League Spartan", "#ffe184", {
    weight: 800,
    align: "center",
  });
  b.text("I M P R O V E M E N T", 100, 335, 800, 31, "Manrope", "#fff0b7", {
    align: "center",
  });
  b.star(230, 500, 270, "#ffd554", 14, 0.55);
  b.ellipse(360, 640, 280, 280, "#bc5d08");
  b.text("GROW", 360, 725, 280, 63, "Bebas Neue", "#ffd554", {
    align: "center",
  });
  b.text(
    "Grow beyond your limits. Transform\nyour mind, habits, and life.",
    120,
    1125,
    760,
    37,
    "Cormorant Garamond",
    "#ffe9ab",
    { align: "center" },
  );
  b.text("Howard Ong", 200, 1375, 600, 31, "Manrope", "#fff0b7", {
    align: "center",
    weight: 700,
  });
  out.push(b.finish());

  b = board(
    "Invitation",
    "sarina-leon",
    "Sarina & Leon — Modern Wedding",
    "#b6563d",
  );
  b.text("SARINA\n& LEON", 60, 55, 880, 168, "Bodoni Moda", "#531b10", {
    lineHeight: 0.9,
  });
  b.photo("flowers", 210, 530, 590, 560);
  b.line(145, 450, 145, 1140, "#6c3021");
  b.text(
    "TOGETHER WITH THEIR FAMILIES\nINVITE YOU TO CELEBRATE",
    80,
    1180,
    840,
    21,
    "Manrope",
    "#f6d8bf",
    { align: "center", tracking: 70 },
  );
  b.footer("JUNE 20 / 2027", "THE ORANGERY", "#f6d8bf");
  out.push(b.finish());
  b = board(
    "Invitation",
    "spooky-halloween",
    "Spooky Halloween — Moonlit Invitation",
    "#171923",
  );
  b.ellipse(195, 100, 610, 610, "#e2e3dd");
  b.text("Spooky\nHALLOWEEN", 230, 235, 540, 95, "League Gothic", "#191b22", {
    align: "center",
    lineHeight: 1.1,
  });
  b.text(
    "October 31, 2035",
    120,
    800,
    760,
    70,
    "Cormorant Garamond",
    "#f1efe7",
    { align: "center" },
  );
  b.text(
    "AT 7:00 PM\n123 Anywhere St., Any City",
    130,
    925,
    740,
    27,
    "Manrope",
    "#f1efe7",
    { align: "center" },
  );
  for (let i = 0; i < 9; i++) {
    const x = i * 120;
    b.rect(x, 1180 + (i % 3) * 30, 95, 220, "#292b3d", 35);
    b.line(x + 48, 1210, x + 48, 1280, "#505365", 4);
    b.line(x + 20, 1240, x + 76, 1240, "#505365", 4);
  }
  out.push(b.finish());
  b = board(
    "Invitation",
    "cocktail-party",
    "Cocktail Party — Vintage Social",
    "#a6473d",
  );
  b.text("COCKTAIL", 45, 70, 910, 260, "Six Caps", "#f1e6cd");
  b.text("Party", 440, 300, 500, 150, "Allura", "#d4cf7c");
  b.photo("cocktail", 170, 490, 660, 560);
  b.text(
    "JOIN US FOR AN\nEXCEPTIONAL EVENING",
    70,
    1110,
    440,
    23,
    "Manrope",
    "#f6e8d4",
    { tracking: 80 },
  );
  b.text(
    "SAVE THE DATE\n20 MARCH 2027\nFROM 6:00 PM",
    550,
    1110,
    370,
    26,
    "Manrope",
    "#f6e8d4",
    { align: "right" },
  );
  out.push(b.finish());
  b = board(
    "Invitation",
    "ganesh-puja",
    "Ganesh Puja — Floral Celebration",
    "#f4e5bd",
  );
  ["flowers", "flowers"].forEach((p, i) =>
    b.photo(p, i ? 850 : 0, 0, 150, 1400),
  );
  b.rect(140, 35, 720, 1330, "#f5e8ca");
  ornament(b, 500, 270, 225, "#b07634");
  b.text(
    "With blessings and joyful hearts,\nwe invite you and your family\nto celebrate with us.",
    210,
    560,
    580,
    31,
    "Cormorant Garamond",
    "#785332",
    { align: "center", lineHeight: 1.5 },
  );
  b.text("Ganesh Puja", 170, 805, 660, 105, "Cormorant Garamond", "#8e3d21", {
    italic: true,
    align: "center",
  });
  b.text(
    "14 SEPTEMBER 2026\n10:00 AM ONWARDS",
    220,
    1020,
    560,
    27,
    "Manrope",
    "#785332",
    { align: "center", lineHeight: 1.5 },
  );
  b.text(
    "123 Anywhere St., Any City",
    200,
    1220,
    600,
    25,
    "Cormorant Garamond",
    "#785332",
    { align: "center" },
  );
  out.push(b.finish());
  b = board(
    "Invitation",
    "griha-pravesh",
    "Griha Pravesh — Housewarming",
    "#f4e8ab",
  );
  for (let i = 0; i < 10; i++) {
    b.ellipse(40 + i * 100, -35, 85, 110, i % 2 ? "#e58f18" : "#647632");
    b.ellipse(55 + i * 100, 80, 45, 45, "#f4ac29");
  }
  b.rect(65, 155, 870, 1160, "transparent", 100, "#9aa15b");
  b.text(
    "Mr. & Mrs. Wilson",
    150,
    390,
    700,
    44,
    "Cormorant Garamond",
    "#71381c",
    { align: "center", weight: 600 },
  );
  b.text(
    "cordially invite you to join us for",
    150,
    480,
    700,
    27,
    "Cormorant Garamond",
    "#71381c",
    { align: "center" },
  );
  b.text("Griha Pravesh", 100, 580, 800, 116, "Allura", "#b74916", {
    align: "center",
  });
  b.text("AN AUSPICIOUS BEGINNING", 200, 740, 600, 23, "Manrope", "#8d431e", {
    tracking: 70,
    align: "center",
  });
  b.text(
    "SUNDAY     15     AT 11 AM",
    120,
    920,
    760,
    36,
    "Cormorant Garamond",
    "#8d431e",
    { align: "center" },
  );
  b.text(
    "2026\n\n123 Anywhere St.\nAny City, ST 12345",
    190,
    1010,
    620,
    29,
    "Cormorant Garamond",
    "#71381c",
    { align: "center" },
  );
  out.push(b.finish());

  return out;
}

export function brochureDesigns(): Artwork[] {
  const out: Artwork[] = [];
  let b = board(
    "Brochure",
    "property-brochure",
    "Your Next Chapter — Property Trifold",
    "#eeeeec",
  );
  b.rect(667, 0, 333, b.h, "#203e64");
  b.text(
    "ELEVATE\nYOUR\nEVERYDAY\nLIVING",
    35,
    70,
    290,
    51,
    "Manrope",
    "#203e64",
    { weight: 800, lineHeight: 1 },
  );
  b.photo("interior", 35, 345, 280, 295);
  b.photo("architecture", 385, 70, 235, 270);
  b.text("READY TO FIND\nYOUR HOME?", 370, 390, 270, 39, "Manrope", "#203e64", {
    weight: 800,
  });
  b.text(
    "+123 456 7890\n\nreallygreatsite.com\n\nhello@reallygreatsite.com",
    370,
    530,
    270,
    18,
    "Manrope",
    "#203e64",
  );
  b.text("WELCOME TO", 700, 55, 260, 22, "Manrope", "#ffffff");
  b.text("YOUR NEXT\nCHAPTER", 700, 105, 270, 45, "Manrope", "#ffffff", {
    weight: 800,
  });
  b.photo("living-room", 700, 365, 265, 310);
  b.footer("10% SPECIAL OFFER", "123 Anywhere St.", "#203e64");
  out.push(b.finish());
  b = board(
    "Brochure",
    "industrial-brochure",
    "Arowwai Industries — Company Profile",
    "#fffef8",
  );
  b.text("OUR SERVICES", 40, 70, 270, 39, "Bebas Neue", "#19481d");
  paragraph(
    b,
    "Sustainable engineering.\nPurposeful architecture.\nA better built environment.",
    40,
    150,
    270,
    19,
    "#24402b",
  );
  b.photo("city", 40, 350, 260, 300);
  b.text("ABOUT US", 375, 70, 270, 39, "Bebas Neue", "#19481d");
  paragraph(
    b,
    "We work with ambitious\npartners to create spaces\nthat support communities.\n\nOur approach brings\nclarity, care and craft\nto every project.",
    375,
    150,
    260,
    19,
    "#24402b",
  );
  b.text("CONTACT US", 375, 535, 270, 39, "Bebas Neue", "#19481d");
  b.text(
    "+123 456 7890\nwww.reallygreatsite.com",
    375,
    605,
    270,
    18,
    "Manrope",
    "#24402b",
  );
  b.photo("architecture", 710, 130, 245, 290);
  b.text("AROWWAI\nINDUSTRIES", 710, 495, 250, 63, "Bebas Neue", "#19481d");
  out.push(b.finish());
  b = board(
    "Brochure",
    "agency-brochure",
    "Creative Agency — Yellow Trifold",
    "#ffdf32",
  );
  b.rect(333, 0, 334, b.h, "#242424");
  b.text("About Us!", 65, 140, 235, 32, "Manrope", "#191919", { weight: 800 });
  paragraph(
    b,
    "We turn ambitious ideas\ninto distinctive brands.\nStrategy, identity and\ndigital experiences\nmade with purpose.",
    65,
    210,
    235,
    20,
    "#191919",
  );
  b.text("Contact Us", 65, 510, 235, 32, "Manrope", "#191919", { weight: 800 });
  b.text(
    "hello@reallygreatsite.com\n+123 456 7890",
    65,
    585,
    245,
    18,
    "Manrope",
    "#191919",
  );
  b.text("Our Service", 380, 115, 240, 32, "Manrope", "#ffffff", {
    weight: 800,
  });
  ["Brand strategy", "Visual identity", "Digital design"].forEach((s, i) => {
    b.rect(380, 220 + i * 150, 240, 37, "#ffdf32");
    b.text(s, 390, 225 + i * 150, 220, 19, "Manrope", "#222222", {
      align: "center",
      weight: 700,
    });
    paragraph(
      b,
      "A clear direction. A cohesive\nexperience. Made for people.",
      380,
      275 + i * 150,
      240,
      17,
      "#ffffff",
    );
  });
  b.text(
    "Creative\nAgency\nBrochure",
    710,
    130,
    250,
    59,
    "Manrope",
    "#191919",
    { lineHeight: 1.02 },
  );
  b.ellipse(735, 490, 410, 410, "#242424");
  b.rect(930, 480, 70, 310, "#ffdf32");
  out.push(b.finish());
  b = board(
    "Brochure",
    "interior-brochure",
    "Design That Reflects Your Style",
    "#f2dec8",
  );
  b.rect(0, 0, 333, b.h, "#c89d76");
  b.photo("chair", 45, 90, 250, 255);
  b.text(
    "DESIGN THAT\nREFLECTS YOUR\nSTYLE",
    40,
    400,
    270,
    54,
    "Bebas Neue",
    "#201d17",
  );
  b.text("ABOUT US", 375, 65, 250, 38, "Bebas Neue", "#201d17");
  paragraph(
    b,
    "Warm, considered spaces\nfor the way you live.\n\nFrom an initial idea to\nthe finishing touches,\nwe help you feel at home.",
    375,
    145,
    250,
    19,
    "#342d24",
  );
  b.photo("living-room", 375, 430, 250, 230);
  b.text("OUR SERVICES", 705, 65, 260, 38, "Bebas Neue", "#201d17");
  paragraph(
    b,
    "Residential interiors\n\nSpace planning\n\nFurniture selection\n\nStyling & finishing",
    705,
    150,
    250,
    21,
    "#342d24",
  );
  b.photo("interior", 705, 480, 250, 230);
  out.push(b.finish());
  b = board(
    "Brochure",
    "music-festival-brochure",
    "Music Festival — Programme",
    "#d4e800",
  );
  b.text("MUSIC\nFESTIVAL", 38, 140, 260, 122, "Manrope", "#101010", {
    lineHeight: 0.95,
  });
  b.photo("concert", 360, 45, 600, 270);
  b.line(350, 345, 965, 345, "#252700");
  [
    ["4:00 pm", "DJ Alba Castro"],
    ["6:00 pm", "DJ Pedro Fernández"],
    ["8:00 pm", "Daniel Gallego"],
  ].forEach(([time, title], i) => {
    b.text(time, 370, 390 + i * 110, 560, 20, "Manrope", "#111111");
    b.text(title, 370, 420 + i * 110, 570, 39, "Manrope", "#111111", {
      weight: 700,
    });
  });
  out.push(b.finish());
  return out;
}
