import { board, type Artwork } from "./builder";

export function landscapeDesigns(): Artwork[] {
  const out: Artwork[] = [];
  let b = board(
    "Presentation",
    "digital-marketing",
    "Digital Marketing — Red Studio",
    "#cf0805",
  );
  b.photo("concert", 0, 190, 1000, 373);
  b.rect(0, 190, 1000, 373, "#df0805").opacity = 0.75;
  b.text("MARKETING", 20, -5, 960, 236, "Anton", "#060606");
  b.text("digital", 315, 25, 500, 160, "Allura", "#ffffff");
  b.text(
    "IDEAS THAT CONNECT. CAMPAIGNS THAT MOVE.",
    240,
    252,
    520,
    12,
    "Manrope",
    "#fff3e6",
    { align: "center", tracking: 100 },
  );
  b.text("Presented by", 360, 470, 280, 15, "Manrope", "#ffffff", {
    align: "center",
  });
  b.text("Samira Hadid", 300, 493, 400, 28, "Cormorant Garamond", "#ffffff", {
    italic: true,
    align: "center",
  });
  out.push(b.finish());

  b = board(
    "Presentation",
    "brand-campaign",
    "Brand Campaign — Fashion Direction",
    "#17291b",
  );
  b.photo("fashion-cream", 0, 0, 1000, 563, { focusX: 0.62 });
  b.rect(0, 0, 1000, 563, "#152516").opacity = 0.2;
  b.text("BRAND CAMPAIGN", 54, 18, 900, 179, "Six Caps", "#d62d29");
  b.text("Rimberio Collection", 82, 210, 440, 20, "Manrope", "#e63c30");
  b.text("July 2040", 790, 340, 160, 18, "Manrope", "#ef4936");
  b.footer("@reallygreatsite", "COLLECTION 01", "#ed4537");
  out.push(b.finish());

  b = board(
    "Presentation",
    "creative-brief-orange",
    "Creative Brief — Studio Shodwe",
    "#d73a18",
  );
  b.rect(0, 0, 1000, 25, "#190b06");
  b.rect(0, 538, 1000, 25, "#190b06");
  b.text("CREATIVE", 65, 55, 780, 220, "Bebas Neue", "#fff5db");
  b.text("BRIEF", 550, 270, 395, 220, "Bebas Neue", "#160d07");
  b.line(65, 281, 940, 281, "#fff5db", 3);
  b.text("STUDIO SHODWE", 68, 297, 420, 26, "Bebas Neue", "#fff5db");
  b.text("JULY 2027", 775, 235, 165, 27, "Bebas Neue", "#160d07");
  b.text(
    "A clear vision.\nAn unexpected perspective.\nA brand worth remembering.",
    68,
    389,
    300,
    20,
    "League Gothic",
    "#fff5db",
  );
  b.line(450, 457, 520, 387, "#fff5db", 5);
  b.line(452, 387, 520, 387, "#fff5db", 5);
  b.line(520, 387, 520, 455, "#fff5db", 5);
  out.push(b.finish());

  b = board(
    "Presentation",
    "brand-marketing-blue",
    "Brand Marketing — Blue Infinity",
    "#020511",
  );
  for (let i = 12; i >= 0; i--) {
    const opacity = 0.015 + i * 0.002;
    const e = b.ellipse(
      -220 - i * 12,
      -220 - i * 10,
      680 + i * 20,
      900 + i * 15,
      "#008fbd",
    );
    e.opacity = opacity;
  }
  b.ellipse(175, 135, 390, 310, "#005e82");
  b.ellipse(225, 185, 290, 210, "#020511");
  b.ellipse(450, 135, 390, 310, "#005e82");
  b.ellipse(500, 185, 290, 210, "#020511");
  b.text("Brand", 280, 200, 450, 83, "Manrope", "#ffffff", { align: "center" });
  b.text("Marketing", 240, 285, 560, 93, "Manrope", "#ffffff", {
    weight: 800,
    align: "center",
  });
  b.text(
    "presented by  OLIVIA WILSON",
    310,
    395,
    400,
    15,
    "Manrope",
    "#afdae7",
    { align: "center" },
  );
  b.text("Liceria & Co", 55, 50, 400, 16, "Manrope", "#ffffff");
  b.footer("www.reallygreatsite.com", "page 01", "#ffffff");
  out.push(b.finish());

  b = board(
    "Presentation",
    "fragrance-brief",
    "Creative Brief — Fragrance Campaign",
    "#eee9e2",
  );
  b.photo("perfume", 0, 0, 505, 510);
  b.text("CREATIVE\nBRIEF", 530, 47, 415, 77, "Manrope", "#4c4b46", {
    align: "right",
    lineHeight: 0.9,
  });
  b.text(
    "Borcelle Fragrances\nAdvertising Campaign",
    560,
    395,
    380,
    25,
    "Manrope",
    "#4c4b46",
    { align: "right" },
  );
  b.line(0, 510, 1000, 510, "#c9c4be");
  b.footer("01     JANUARY 2030", "PRESENTED BY HARPER RUSSO", "#494842");
  out.push(b.finish());

  b = board(
    "Landscape video",
    "fire-intro",
    "Firelight — Cinematic Intro",
    "#08090c",
  );
  b.photo("fire", 0, 0, 1000, 563);
  b.rect(0, 0, 1000, 563, "#07090e").opacity = 0.3;
  b.text("IGNITE", 150, 145, 700, 200, "Bebas Neue", "#fff2ce", {
    tracking: 160,
    align: "center",
  });
  b.text("YOUR NEXT CHAPTER", 220, 365, 560, 25, "Manrope", "#ffffff", {
    tracking: 240,
    align: "center",
  });
  out.push(b.finish());
  b = board(
    "Landscape video",
    "engagement-night",
    "Engagement Invitation — Starlit Gold",
    "#080a1b",
  );
  b.rect(55, 50, 890, 463, "transparent", 25, "#a78638");
  b.ellipse(425, 70, 150, 150, "#ad8739");
  b.ellipse(438, 83, 124, 124, "#dfb653");
  b.star(460, 105, 40, "#6d1630", 12, 0.5);
  for (let i = 0; i < 30; i++)
    b.ellipse(
      (i * 173 + 42) % 1000,
      (i * 79 + 22) % 563,
      2 + (i % 3),
      2 + (i % 3),
      "#ddd7a8",
    );
  [40, 880].forEach((x) => {
    for (let i = 0; i < 6; i++)
      b.ellipse(
        x - 70 + i * 5,
        190 + i * 7,
        190 - i * 10,
        190 - i * 10,
        "transparent",
        "#a78638",
      );
  });
  b.text(
    "ENGAGEMENT INVITATION",
    140,
    294,
    720,
    46,
    "Cormorant Garamond",
    "#edda9a",
    { align: "center" },
  );
  b.text("PRIYA & MOHIT", 250, 365, 500, 28, "Manrope", "#edda9a", {
    tracking: 150,
    align: "center",
  });
  out.push(b.finish());
  b = board(
    "Landscape video",
    "beautiful-village",
    "Beautiful Village — Travel Film",
    "#122d1d",
  );
  b.photo("road", 0, 0, 1000, 563);
  [
    [50, 50, 130, 50],
    [50, 50, 50, 130],
    [950, 50, 870, 50],
    [950, 50, 950, 130],
    [50, 513, 130, 513],
    [50, 513, 50, 433],
    [950, 513, 870, 513],
    [950, 513, 950, 433],
  ].forEach((p) => b.line(p[0], p[1], p[2], p[3], "#ffffff", 5));
  b.text("REC", 85, 72, 120, 40, "Bebas Neue", "#ffffff");
  b.ellipse(166, 79, 24, 24, "#fb1e22");
  b.text("BEAUTIFUL VILLAGE", 130, 235, 740, 90, "Anton", "#f5ea68", {
    align: "center",
  });
  out.push(b.finish());
  b = board(
    "Landscape video",
    "real-estate-film",
    "Real Estate — Agency Film",
    "#121a15",
  );
  b.photo("living-room", 0, 0, 1000, 563);
  b.rect(0, 0, 1000, 563, "#050b08").opacity = 0.57;
  b.text("REAL ESTATE", 100, 225, 800, 85, "Manrope", "#ffffff", {
    align: "center",
  });
  b.text("A G E N C Y", 200, 325, 600, 33, "Manrope", "#ffffff", {
    align: "center",
  });
  b.footer("www.reallygreatsite.com", "");
  out.push(b.finish());
  b = board(
    "Landscape video",
    "ceremony-crimson",
    "Wedding Ceremony — Crimson Gold",
    "#690600",
  );
  for (let i = 0; i < 7; i++) {
    b.ellipse(
      350 - i * 20,
      145 - i * 20,
      300 + i * 40,
      300 + i * 40,
      "transparent",
      "#9d742c",
    );
  }
  b.rect(0, 207, 1000, 154, "#8c0800");
  b.star(430, 60, 70, "#bb933b", 16, 0.72);
  b.text("PRIYA & MOHIT", 200, 226, 600, 65, "Cormorant Garamond", "#f2d690", {
    align: "center",
  });
  b.text("A CELEBRATION OF LOVE", 200, 308, 600, 20, "Manrope", "#e8ca7c", {
    align: "center",
    tracking: 150,
  });
  b.footer("20 NOVEMBER 2026", "UDAIPUR", "#e5c77c");
  out.push(b.finish());

  b = board(
    "Video thumbnail",
    "india-wild",
    "India — Into the Wild",
    "#142a29",
  );
  b.photo("elephant", 0, 0, 1000, 563);
  b.text("BEST NATIONAL PARKS IN", 150, 28, 700, 20, "Manrope", "#ffffff", {
    tracking: 250,
    align: "center",
  });
  b.text("INDIA", 70, 80, 860, 235, "Manrope", "#ffffff", {
    weight: 800,
    align: "center",
  });
  out.push(b.finish());
  b = board(
    "Video thumbnail",
    "new-song",
    "New Song — Daniel Gallego",
    "#a90608",
  );
  b.photo("concert", 0, 0, 1000, 563);
  b.rect(0, 0, 1000, 563, "#9b0004").opacity = 0.5;
  b.text("Daniel", 75, 25, 450, 110, "Allura", "#ffffff");
  b.text("NEW SONG", 30, 160, 940, 181, "Anton", "#ff161b");
  b.photo("portrait-man", 650, 180, 300, 330, { circle: true, gray: true });
  b.text("Gallego", 450, 380, 500, 115, "Allura", "#ffffff");
  out.push(b.finish());
  b = board(
    "Video thumbnail",
    "red-horizon",
    "Red Horizon — Retro Motion",
    "#140305",
  );
  b.rect(0, 225, 1000, 200, "#8f180f");
  for (let y = 15; y < 563; y += 38) b.line(0, y, 1000, y, "#8e3938", 1);
  for (let x = -1000; x < 2000; x += 130)
    b.line(500 + (x - 500) * 0.2, 240, x, 563, "#9d3531");
  b.text("AFTER HOURS", 100, 230, 800, 94, "Six Caps", "#f3bca6", {
    tracking: 200,
    align: "center",
  });
  b.footer("WWW.REALLYGREATSITE.COM", "", "#be6560");
  out.push(b.finish());
  b = board(
    "Video thumbnail",
    "shocking-moments",
    "Top 10 — Shocking Moments",
    "#a90c0b",
  );
  b.polygon(
    [
      [0, 0],
      [600, 0],
      [0, 563],
    ],
    "#e63425",
  );
  b.polygon(
    [
      [1000, 0],
      [550, 563],
      [1000, 563],
    ],
    "#720606",
  );
  b.photo("portrait-man", 0, 115, 410, 448);
  b.rect(520, 55, 170, 50, "#ffdc16", 8);
  b.text("PART 1", 530, 64, 150, 30, "Montserrat", "#121212", {
    weight: 800,
    align: "center",
  });
  b.text("TOP 10", 480, 132, 475, 78, "Anton", "#ffffff");
  b.text("SHOCKING", 430, 240, 540, 105, "Anton", "#ffdd12");
  b.text("MOMENTS", 450, 363, 500, 97, "Anton", "#ffffff");
  out.push(b.finish());
  b = board(
    "Video thumbnail",
    "cinematic-vlog",
    "Cinematic — A Quiet Journey",
    "#1c2410",
  );
  b.photo("forest", 0, 0, 1000, 563);
  b.rect(0, 0, 1000, 563, "#081000").opacity = 0.45;
  b.text("Cinematic", 70, 166, 840, 155, "Cormorant Garamond", "#f3de58", {
    italic: true,
  });
  b.text("Vlog", 710, 125, 190, 76, "Allura", "#f3de58");
  b.text("Current state of mind.", 300, 355, 400, 23, "Manrope", "#e5d885", {
    align: "center",
  });
  b.footer("Episode: 2", "shodwe studio", "#eee8b4");
  out.push(b.finish());

  return out.map((art) => {
    if (art.category === "Landscape video") {
      art.document.pages[0].objects.forEach((obj, i) => {
        obj.animation = {
          enter: {
            preset: obj.type === "textbox" ? "rise" : "fade",
            durationMs: 1100,
            delayMs: Math.min(i * 90, 850),
            easing: "ease-out",
          },
        };
      });
      art.document.audioTracks = [
        {
          id: `${art.id}-music`,
          kind: "music",
          name: "Bright Side",
          src: "/media/audio/music/bright-side.ogg",
          scope: { type: "design" },
          startMs: 0,
          trimStartMs: 0,
          trimEndMs: 6000,
          volume: 0.45,
          fadeInMs: 400,
          fadeOutMs: 700,
          loop: false,
          muted: false,
        },
      ];
    }
    return art;
  });
}

export function logoDesigns(): Artwork[] {
  const out: Artwork[] = [];
  let b = board("Logo", "mn-logo", "MN — Personal Monogram", "#ffffff");
  b.ellipse(235, 345, 330, 330, "#3b3b39");
  b.text("m", 280, 300, 310, 310, "League Spartan", "#ffffff", { weight: 800 });
  b.text("n.", 500, 360, 340, 245, "League Spartan", "#3b3b39", {
    weight: 800,
  });
  b.text("murad naser", 510, 615, 300, 28, "Manrope", "#3b3b39", {
    weight: 800,
  });
  out.push(b.finish());
  b = board(
    "Logo",
    "modern-minimalist",
    "Modern Minimalist — Monogram",
    "#fdfcf8",
  );
  b.polygon(
    [
      [300, 300],
      [300, 460],
      [350, 430],
      [350, 380],
      [650, 550],
      [700, 520],
    ],
    "#222222",
  );
  b.polygon(
    [
      [300, 550],
      [700, 320],
      [700, 380],
      [300, 610],
    ],
    "#222222",
  );
  b.polygon(
    [
      [650, 430],
      [700, 400],
      [700, 610],
      [650, 580],
    ],
    "#222222",
  );
  b.text("MODERN\nMINIMALIST", 200, 660, 600, 54, "Manrope", "#222222", {
    align: "center",
    lineHeight: 0.9,
  });
  b.line(330, 840, 670, 840, "#222222");
  b.text("YOUR VISION, REFINED.", 200, 875, 600, 14, "Manrope", "#222222", {
    tracking: 150,
    align: "center",
  });
  out.push(b.finish());
  b = board(
    "Logo",
    "ava-victoria",
    "Ava Victoria — Luxury Branding",
    "#f3f0e6",
  );
  b.text("A", 260, 190, 510, 520, "Bodoni Moda", "#252525");
  b.text("v", 345, 380, 350, 330, "Allura", "#bc9867");
  b.rect(180, 488, 640, 58, "#f3f0e6");
  b.text("AVA VICTORIA", 180, 500, 640, 26, "Manrope", "#262626", {
    tracking: 230,
    align: "center",
  });
  b.text("LUXURY BRANDING STUDIO", 170, 810, 660, 16, "Manrope", "#262626", {
    tracking: 260,
    align: "center",
  });
  out.push(b.finish());
  b = board(
    "Logo",
    "studio-scribble",
    "Studio — Creative Signature",
    "#f3f1ed",
  );
  b.text("studio", 160, 375, 700, 180, "League Spartan", "#090909", {
    weight: 800,
  });
  for (let i = 0; i < 6; i++) {
    const e = b.ellipse(
      425 + i * 11,
      220 + i * 15,
      130,
      420,
      "transparent",
      "#f44727",
      5,
    );
    e.angle = -35 + i * 13;
  }
  b.text("DANIEL\nGALLEGO", 645, 640, 220, 19, "Manrope", "#222222", {
    align: "center",
    tracking: 100,
  });
  out.push(b.finish());
  b = board(
    "Logo",
    "pixel-electronics",
    "Pixel — Electronics Store",
    "#222222",
  );
  b.text("pixel", 170, 300, 660, 220, "League Spartan", "#ededed", {
    weight: 800,
  });
  for (let i = 0; i < 8; i++)
    b.line(180, 351 + i * 21, 840, 351 + i * 21, "#555555", 4);
  b.text("ELECTRONICS STORE", 200, 650, 600, 26, "Manrope", "#ffffff", {
    weight: 800,
    align: "center",
  });
  b.text(
    "INNOVATION\nEVERY DAY\nEST. 2026",
    320,
    710,
    360,
    14,
    "Manrope",
    "#d7d7d7",
    { align: "center" },
  );
  out.push(b.finish());
  return out;
}
