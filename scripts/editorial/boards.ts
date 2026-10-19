import { board, paragraph, type Artwork, type Artboard } from "./builder";

function swatches(
  b: Artboard,
  colors: readonly string[],
  x: number,
  y: number,
  w = 55,
) {
  colors.forEach((c, i) => b.rect(x + i * (w + 8), y, w, w, c));
}
function panel(
  b: Artboard,
  title: string,
  body: string,
  x: number,
  y: number,
  w: number,
  h: number,
  bg: string,
  ink = "#333333",
) {
  b.rect(x, y, w, h, bg, 10);
  b.text(title, x + 19, y + 16, w - 38, 23, "Manrope", ink, { weight: 700 });
  paragraph(b, body, x + 19, y + 58, w - 38, 14, ink);
}
export function boardDesigns(): Artwork[] {
  const out: Artwork[] = [];
  let b = board(
    "Whiteboard",
    "home-moodboard",
    "Dream Home — Material Moodboard",
    "#e6e5df",
  );
  b.text(
    "Dream Home Moodboard",
    35,
    32,
    850,
    55,
    "Cormorant Garamond",
    "#232820",
  );
  b.line(35, 105, 965, 105, "#a4aa99");
  b.photo("chair", 80, 150, 200, 315);
  b.photo("living-room", 350, 185, 250, 325);
  b.photo("interior", 615, 150, 230, 270);
  b.photo("coffee", 235, 320, 150, 185);
  swatches(b, ["#57594d", "#afb195", "#d0c8ad"], 700, 445);
  b.text("natural textures", 340, 123, 300, 36, "Allura", "#404734");
  b.text("a softer kind\nof everyday", 55, 470, 310, 28, "Caveat", "#404734");
  out.push(b.finish());
  b = board(
    "Whiteboard",
    "style-moodboard",
    "My Style — Fashion Moodboard",
    "#f3f3ef",
  );
  for (let x = 0; x < 1000; x += 20) b.line(x, 140, x, 563, "#d5d7ce", 0.5);
  for (let y = 140; y < 563; y += 20) b.line(0, y, 1000, y, "#d5d7ce", 0.5);
  b.text("My Style", 170, 35, 330, 70, "Manrope", "#151515");
  b.text("Moodboard", 480, 20, 430, 92, "Allura", "#151515");
  [
    ["fashion-coat", 60, 190, 180, 230],
    ["sunglasses", 295, 220, 160, 270],
    ["menswear", 515, 180, 190, 270],
    ["fashion-cream", 755, 240, 190, 240],
  ].forEach(([p, x, y, w, h]) => {
    b.rect(
      Number(x) - 12,
      Number(y) - 12,
      Number(w) + 24,
      Number(h) + 48,
      "#ffffff",
    );
    b.photo(String(p), Number(x), Number(y), Number(w), Number(h));
  });
  b.text("effortless", 85, 445, 230, 35, "Allura", "#303630");
  b.text("layers + texture", 510, 485, 270, 31, "Allura", "#303630");
  out.push(b.finish());
  b = board(
    "Whiteboard",
    "studio-floorplan",
    "Studio Floor Plan — Open Living",
    "#f8f5e9",
  );
  b.rect(0, 0, 340, 563, "#f78d28");
  b.text("STUDIO\nFLOOR\nPLAN", 40, 45, 265, 76, "Manrope", "#ffffff", {
    weight: 800,
    lineHeight: 0.95,
  });
  for (let x = 350; x < 1000; x += 19) b.line(x, 0, x, 563, "#e1ddcc", 0.6);
  for (let y = 0; y < 563; y += 19) b.line(340, y, 1000, y, "#e1ddcc", 0.6);
  b.rect(420, 100, 515, 340, "#fffefa", 0, "#242e35");
  b.rect(430, 110, 495, 320, "transparent", 0, "#242e35");
  b.line(665, 110, 665, 430, "#242e35", 5);
  b.line(665, 280, 925, 280, "#242e35", 5);
  b.rect(465, 150, 150, 100, "#b3d9e8", 8, "#4e859f");
  b.rect(485, 162, 110, 76, "#e1f1f6", 5, "#4e859f");
  b.rect(720, 130, 165, 75, "#8ebcdb", 8, "#4e859f");
  b.rect(720, 230, 165, 25, "#8ebcdb", 3);
  b.rect(725, 315, 160, 75, "#c4ddeb", 10, "#4e859f");
  b.rect(440, 320, 105, 78, "#b3d9e8", 8, "#4e859f");
  b.text("OPEN-PLAN STUDIO", 440, 470, 480, 27, "Manrope", "#242e35", {
    align: "center",
  });
  b.text("47 m²  /  506 sq ft", 490, 515, 380, 18, "Manrope", "#242e35", {
    align: "center",
  });
  out.push(b.finish());
  b = board(
    "Whiteboard",
    "renovation-plan",
    "Renovation Project Plan",
    "#eeeeed",
  );
  b.rect(0, 0, 1000, 95, "#323535");
  b.text("renovation project plan", 70, 15, 860, 63, "Manrope", "#ffffff", {
    align: "center",
  });
  const columns = [
    ["COLORS & MATERIALS", "chair"],
    ["FLOOR PLANS & SKETCHES", "architecture"],
    ["INSPIRATION", "living-room"],
  ] as const;
  columns.forEach(([title, photo], i) => {
    const x = 30 + i * 325;
    b.rect(x, 130, 290, 410, "#ffffff");
    b.rect(x, 130, 290, 50, "#777b78");
    b.text(title, x + 10, 148, 270, 13, "Manrope", "#ffffff", {
      align: "center",
      tracking: 60,
    });
    b.photo(photo, x + 20, 205, 250, 235);
    if (i === 0)
      swatches(b, ["#777e71", "#b5b5a7", "#dfd6c6"], x + 35, 470, 55);
    else
      b.text(
        i === 1 ? "space to breathe" : "warmth & natural light",
        x + 25,
        475,
        240,
        29,
        "Allura",
        "#434b3f",
      );
  });
  out.push(b.finish());
  b = board(
    "Whiteboard",
    "empathy-map",
    "Empathy Map — Cloudlet Tech",
    "#ffffff",
  );
  b.text("Cloudlet Tech", 40, 42, 290, 20, "Manrope", "#264a67", {
    weight: 700,
  });
  b.text("Empathy\nMap", 40, 135, 275, 58, "Manrope", "#151515", {
    weight: 800,
  });
  paragraph(
    b,
    "Understand your users’\nthoughts, feelings and\nbehaviors.",
    40,
    295,
    250,
    21,
  );
  b.rect(40, 420, 255, 105, "#b4d7f0");
  b.text(
    "USER\nName: __________________",
    55,
    439,
    225,
    18,
    "Manrope",
    "#285170",
  );
  panel(
    b,
    "Says",
    "“I need something simple.”\n“This is too complicated.”",
    340,
    55,
    290,
    205,
    "#edf7fc",
  );
  panel(
    b,
    "Thinks",
    "Doubts about usability.\nWants efficiency.",
    655,
    55,
    300,
    205,
    "#f6faee",
  );
  panel(
    b,
    "Does",
    "Uses mobile apps.\nSearches online.",
    340,
    285,
    290,
    240,
    "#eff8f9",
  );
  panel(
    b,
    "Feels",
    "Frustrated.\nConfused.\nMotivated.",
    655,
    285,
    300,
    240,
    "#edf4fa",
  );
  b.photo("portrait-man", 590, 227, 100, 100, { circle: true });
  out.push(b.finish());

  b = board(
    "Brainstorm",
    "daniel-persona",
    "Daniel Morton — User Persona",
    "#e5f0ff",
  );
  b.photo("portrait-man", 50, 65, 180, 190);
  b.text("Daniel Morton", 260, 55, 610, 47, "Manrope", "#3cb7e6", {
    weight: 700,
  });
  b.text("Senior Marketing Manager", 265, 115, 600, 19, "Manrope", "#55778b");
  panel(
    b,
    "Profile",
    "Age:  32 years old\nLocation:  Any City\nEducation:  Business degree",
    260,
    160,
    410,
    130,
    "#ffffff",
    "#456577",
  );
  panel(
    b,
    "Background",
    "Enjoys learning and sharing ideas.\nLooks for practical, reliable tools.\nValues collaboration.",
    700,
    55,
    255,
    235,
    "#ffffff",
    "#456577",
  );
  [
    [
      "Needs",
      "Save time on everyday work.\nBuild consistent content.\nOrganize creative assets.",
    ],
    [
      "Goals",
      "Increase team productivity.\nImprove communication.\nBuild stronger campaigns.",
    ],
    [
      "Pain Points",
      "Disconnected tools.\nRepetitive tasks.\nUnclear workflows.",
    ],
  ].forEach(([title, body], i) =>
    panel(b, title, body, 50 + i * 305, 320, 285, 190, "#ffffff", "#456577"),
  );
  out.push(b.finish());
  b = board(
    "Brainstorm",
    "laura-persona",
    "Laura Bennett — Customer Persona",
    "#88604d",
  );
  b.rect(50, 60, 340, 445, "#ffffff", 12);
  b.photo("fashion-cream", 70, 80, 300, 220, { focusX: 0.65 });
  b.text("Laura Bennett", 75, 330, 295, 37, "Manrope", "#643e33", {
    weight: 800,
  });
  b.text(
    "Age: 28 years old\nLocation: Any City\nOccupation: Marketing manager",
    75,
    405,
    290,
    18,
    "Manrope",
    "#643e33",
    { lineHeight: 1.6 },
  );
  panel(
    b,
    "Background",
    "Passionate about emerging technologies.\nEnjoys creative and collaborative projects.",
    420,
    60,
    275,
    135,
    "#ffffff",
    "#643e33",
  );
  panel(
    b,
    "Motivations",
    "Personal and professional growth.\nCreating work that makes an impact.",
    420,
    220,
    275,
    135,
    "#ffffff",
    "#643e33",
  );
  panel(
    b,
    "Pain Points",
    "Too many disconnected applications.\nTime-consuming repetitive tasks.",
    420,
    380,
    275,
    125,
    "#ffffff",
    "#643e33",
  );
  panel(
    b,
    "Consumer Preferences",
    "Personal recommendations\n\nEasy-to-use products\n\nFlexible, transparent pricing\n\nGood customer service",
    720,
    60,
    235,
    445,
    "#ffffff",
    "#643e33",
  );
  out.push(b.finish());
  b = board(
    "Brainstorm",
    "dark-mind-map",
    "Mind Map — Thinking Framework",
    "#181a19",
  );
  b.text("MIND\nMAP", 375, 180, 260, 105, "Anton", "#ffffff", {
    align: "center",
    lineHeight: 1,
  });
  const topics = [
    ["Logical Reasoning", "#df4b4e", 40, 45],
    ["Problem Solving", "#388db6", 40, 215],
    ["Analytical Thinking", "#dc8f24", 40, 385],
    ["Decision Making", "#8657bd", 715, 45],
    ["Argumentation", "#6d9b29", 715, 215],
    ["Evaluation", "#ce427f", 715, 385],
  ] as const;
  topics.forEach(([title, color, x, y]) => {
    b.line(x < 500 ? x + 245 : x, y + 60, x < 500 ? 375 : 635, 280, color, 3);
    b.rect(x, y, 245, 126, "#252725", 12, "#b0b3ac");
    b.rect(x, y, 245, 35, color, 10);
    b.text(title, x + 12, y + 9, 221, 15, "Manrope", "#ffffff", {
      align: "center",
      weight: 700,
    });
    paragraph(
      b,
      "Explore ideas, ask questions,\nconnect insights and make\na thoughtful next step.",
      x + 14,
      y + 51,
      217,
      13,
      "#deded9",
    );
  });
  out.push(b.finish());
  b = board(
    "Brainstorm",
    "customer-empathy",
    "Customer Empathy — Think Feel Do",
    "#ffffff",
  );
  b.rect(15, 15, 970, 533, "transparent", 0, "#303030");
  b.line(20, 20, 980, 545, "#dddedd");
  b.line(980, 20, 20, 545, "#dddedd");
  b.photo("fashion-cream", 435, 210, 130, 130, { circle: true, focusX: 0.65 });
  [
    ["THINK & FEEL", "Beliefs\nInspiration\nWorry Points", 390, 45, "#cff0f4"],
    ["HEAR", "Media Engagement\nReview\nRecommendations", 75, 220, "#eaf0c3"],
    [
      "SEE",
      "Environment\nMarket Changes\nFriends’ Products",
      750,
      220,
      "#fff0c0",
    ],
    ["SAY & DO", "Routine Activity\nUser Behavior", 390, 385, "#e9d6f5"],
    ["PAIN", "Frustrations\nChallenges Problems", 100, 460, "#ffc8c9"],
    ["GAIN", "What does success\nlook like?", 730, 460, "#d0ddfb"],
  ].forEach(([title, body, x, y, color]) => {
    b.rect(Number(x), Number(y), 180, 32, String(color), 5);
    b.text(
      String(title),
      Number(x),
      Number(y) + 7,
      180,
      13,
      "Manrope",
      "#303030",
      { align: "center", weight: 800 },
    );
    b.text(
      String(body),
      Number(x) - 10,
      Number(y) + 41,
      200,
      12,
      "Manrope",
      "#505050",
      { align: "center", lineHeight: 1.4 },
    );
  });
  out.push(b.finish());
  b = board(
    "Brainstorm",
    "olivia-persona",
    "Olivia Wilson — Research Canvas",
    "#ffffff",
  );
  b.rect(20, 20, 960, 40, "#101010");
  b.text("OLIVIA WILSON", 40, 29, 700, 21, "Manrope", "#ffffff", {
    tracking: 120,
  });
  b.text("PROFILE", 40, 85, 290, 22, "Manrope", "#222222", { weight: 800 });
  b.text(
    "Gender     Female\nAge          28\nEducation Bachelor’s degree\nLocation   Any City",
    40,
    125,
    290,
    16,
    "Manrope",
    "#333333",
    { lineHeight: 1.45 },
  );
  b.photo("fashion-cream", 40, 265, 290, 240, { focusX: 0.65 });
  [
    ["BIOGRAPHY", 375, 85, 330, 135],
    ["MOTIVATIONS", 375, 245, 330, 120],
    ["GOALS", 375, 390, 330, 115],
    ["PERSONALITY", 735, 85, 225, 135],
    ["TECHNOLOGY", 735, 245, 225, 120],
    ["BRANDS", 735, 390, 225, 115],
  ].forEach(([t, x, y, w, h]) => {
    b.text(
      String(t),
      Number(x),
      Number(y),
      Number(w),
      19,
      "Manrope",
      "#222222",
      { weight: 800 },
    );
    b.rect(Number(x), Number(y) + 35, Number(w), Number(h) - 30, "#eeeeee");
  });
  b.text(
    "Thoughtful, creative and curious.\nValues clear communication\nand meaningful work.",
    390,
    135,
    300,
    17,
    "Manrope",
    "#333333",
  );
  out.push(b.finish());
  return out;
}
