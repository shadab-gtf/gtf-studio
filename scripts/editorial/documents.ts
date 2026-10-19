import { board, paragraph, type Artwork, type Artboard } from "./builder";

function rule(b: Artboard, y: number, color = "#a5afb8") {
  b.line(70, y, 930, y, color);
}
function section(b: Artboard, title: string, y: number, color = "#174d68") {
  b.text(title, 70, y, 860, 31, "Manrope", color, { weight: 700 });
  rule(b, y + 53, color);
}
function invoiceRows(b: Artboard, y: number, color: string, filled: boolean) {
  if (filled) b.rect(70, y, 860, 55, color);
  else {
    rule(b, y, color);
    rule(b, y + 55, color);
  }
  const ink = filled ? "#ffffff" : color;
  [
    ["DESCRIPTION", 85, 480],
    ["QTY", 590, 75],
    ["RATE", 690, 90],
    ["AMOUNT", 810, 105],
  ].forEach(([t, x, w]) =>
    b.text(String(t), Number(x), y + 18, Number(w), 18, "Manrope", ink, {
      weight: 700,
    }),
  );
  const rows = [
    ["Brand discovery workshop", "1", "$450.00", "$450.00"],
    ["Visual identity design", "1", "$850.00", "$850.00"],
    ["Digital design assets", "5", "$70.00", "$350.00"],
    ["Project handover", "1", "$150.00", "$150.00"],
  ];
  rows.forEach((row, i) => {
    const top = y + 75 + i * 74;
    row.forEach((text, j) =>
      b.text(
        text,
        [85, 590, 690, 810][j],
        top,
        [480, 75, 90, 105][j],
        18,
        "Manrope",
        "#333333",
      ),
    );
    rule(b, top + 48, "#d3d3d3");
  });
  [
    ["Subtotal", "$1,800.00"],
    ["Tax (0%)", "$0.00"],
    ["TOTAL", "$1,800.00"],
  ].forEach(([title, amount], i) => {
    b.text(title, 620, y + 405 + i * 55, 180, 21, "Manrope", color, {
      weight: i === 2 ? 800 : 400,
    });
    b.text(amount, 805, y + 405 + i * 55, 125, 21, "Manrope", color, {
      weight: i === 2 ? 800 : 400,
      align: "right",
    });
  });
}
function makeInvoice(index: number, asDocument = false): Artwork {
  const names = [
    "Classic Invoice",
    "Fauget — Studio Invoice",
    "Minimal Invoice",
    "Wave — Business Invoice",
    "Alexander Company — Invoice",
  ];
  const colors = ["#141414", "#161616", "#5b5b56", "#444b49", "#11112f"];
  const b = board(
    asDocument ? "Document" : "Invoice",
    asDocument ? "document-invoice" : `invoice-${index + 1}`,
    names[index],
    index === 2 ? "#fffef9" : "#ffffff",
  );
  const c = colors[index];
  if (index === 4) {
    b.rect(0, 0, 1000, 240, c);
    b.text("INVOICE", 70, 65, 570, 91, "Manrope", "#ffffff", { weight: 800 });
    b.text("ALEXANDER\nCOMPANY", 680, 92, 250, 30, "Manrope", "#ffffff", {
      weight: 700,
    });
  } else if (index === 2) {
    b.line(70, 140, 430, 140, "#9b9b91");
    b.text("I N V O I C E", 470, 110, 460, 57, "Cormorant Garamond", c, {
      align: "right",
    });
  } else {
    b.text("INVOICE", 70, 72, 610, index === 1 ? 88 : 100, "Manrope", c, {
      weight: 800,
    });
    b.text(
      index === 1 ? "FAUGET" : "YOUR\nCOMPANY",
      755,
      80,
      180,
      23,
      "Manrope",
      c,
      { weight: 700, align: "right" },
    );
  }
  const top = index === 4 ? 290 : 280;
  b.text("BILLED TO", 70, top, 410, 20, "Manrope", c, { weight: 800 });
  paragraph(
    b,
    "Olivia Wilson\n123 Anywhere Street\nAny City, ST 12345\nhello@example.com",
    70,
    top + 40,
    410,
    20,
    c,
  );
  b.text(
    "INVOICE NO.   000123\nISSUED           20 MAY 2026\nDUE                03 JUN 2026",
    600,
    top + 5,
    330,
    20,
    "Manrope",
    c,
    { lineHeight: 1.8 },
  );
  invoiceRows(b, top + 250, c, index === 1 || index === 4);
  b.text("PAYMENT DETAILS", 70, top + 830, 440, 22, "Manrope", c, {
    weight: 800,
  });
  paragraph(
    b,
    "Bank: Your bank name\nAccount name: Your business\nAccount number: 1234 5678\nReference: INV-000123",
    70,
    top + 875,
    480,
    19,
    c,
  );
  b.text("Thank you!", 600, top + 900, 330, 65, "Allura", c, {
    align: "right",
  });
  if (index === 3) {
    b.ellipse(-200, b.h - 110, 850, 300, "#d2d5d3");
    b.ellipse(380, b.h - 65, 900, 240, "#444b49");
  } else
    b.footer("hello@yourcompany.com   /   +123 456 7890", "INVOICE 000123", c);
  return b.finish();
}
export function documentDesigns(): Artwork[] {
  const out: Artwork[] = [];
  let b = board(
    "Document",
    "neel-resume",
    "Neel Trehan — Professional Resume",
    "#ffffff",
  );
  b.rect(0, 0, 1000, 255, "#06476c");
  b.photo("portrait-man", 55, 38, 200, 217);
  b.text("Neel Trehan", 295, 72, 645, 65, "Manrope", "#ffffff", {
    weight: 700,
  });
  b.text("MARKETING STRATEGIST", 300, 165, 620, 22, "Manrope", "#bfe6f5", {
    tracking: 75,
  });
  paragraph(
    b,
    "Strategic thinker with a passion for clear communication and meaningful\ncustomer experiences. Building brands through research, creativity and care.",
    70,
    300,
    860,
    21,
  );
  section(b, "Education & Experience", 430);
  [
    [
      "2022 — NOW",
      "Marketing Manager",
      "Lead brand strategy, campaign planning and cross-functional launches.\nBuilt a consistent identity across digital and print channels.",
    ],
    [
      "2019 — 2022",
      "Brand Specialist",
      "Developed customer insights and supported integrated campaigns.\nCollaborated with creative teams to deliver measurable results.",
    ],
    [
      "2015 — 2019",
      "Bachelor of Business Administration",
      "University of Anywhere · Marketing and Communications",
    ],
  ].forEach(([date, title, body], i) => {
    const y = 535 + i * 220;
    b.text(date, 70, y, 200, 19, "Manrope", "#47758c");
    b.text(title, 295, y, 630, 28, "Manrope", "#17384a", { weight: 700 });
    paragraph(b, body, 295, y + 55, 630, 19);
  });
  section(b, "Skills & Interests", 1210);
  b.text(
    "Brand strategy  /  Research  /  Creative direction  /  Digital campaigns",
    70,
    1280,
    860,
    20,
    "Manrope",
    "#24485b",
  );
  out.push(b.finish());
  b = board(
    "Document",
    "biodata",
    "Professional Biodata — Blue Grey",
    "#ffffff",
  );
  b.rect(0, 0, 1000, 205, "#93aeb9");
  b.text("Biodata", 75, 72, 650, 65, "Manrope", "#17333d");
  b.photo("portrait-man", 790, 30, 150, 155);
  b.rect(65, 245, 870, 104, "#edf4f6");
  paragraph(
    b,
    "Use this profile to introduce your experience, interests and the strengths\nyou bring to your next opportunity.",
    90,
    265,
    820,
    20,
    "#335965",
  );
  const groups = [
    [
      "Personal details",
      ["Name", "Date of birth", "Address", "Email", "Nationality"],
    ],
    [
      "Family background",
      ["Father’s name", "Mother’s name", "Family location"],
    ],
    [
      "Education & profession",
      ["Highest qualification", "Institution", "Current role", "Organization"],
    ],
  ] as const;
  groups.forEach(([title, fields], i) => {
    const y = 405 + i * 318;
    section(b, title, y, "#547d8a");
    fields.forEach((field, j) => {
      b.text(field, 75, y + 80 + j * 40, 340, 19, "Manrope", "#384b50");
      b.line(440, y + 100 + j * 40, 925, y + 100 + j * 40, "#ccd7db");
    });
  });
  out.push(b.finish());
  b = board(
    "Document",
    "project-proposal",
    "Project Proposal — Interior Studio",
    "#fcfaf2",
  );
  b.rect(0, 0, 1000, 275, "#eae1d2");
  b.text(
    "Project\nProposal",
    60,
    35,
    550,
    95,
    "Cormorant Garamond",
    "#3c352b",
    { lineHeight: 0.9, italic: true },
  );
  b.photo("interior", 655, 35, 285, 215);
  b.text("PREPARED FOR", 70, 335, 430, 19, "Manrope", "#7a6b53", {
    weight: 700,
  });
  b.text("Olivia Wilson", 70, 375, 700, 35, "Cormorant Garamond", "#3c352b");
  [
    ["Project", "Residential interior design"],
    ["Location", "123 Anywhere Street, Any City"],
    ["Prepared by", "Borcelle Design Studio"],
    ["Date", "20 May 2026"],
  ].forEach(([label, value], i) => {
    const y = 465 + i * 66;
    b.text(label, 70, y, 235, 20, "Manrope", "#5f5444");
    b.text(value, 330, y, 600, 20, "Manrope", "#3c352b");
    rule(b, y + 45, "#c7b89e");
  });
  b.rect(65, 800, 870, 248, "#efeee8");
  b.text(
    "Table of Contents",
    90,
    835,
    800,
    46,
    "Cormorant Garamond",
    "#3c352b",
  );
  b.text(
    "01   About Us\n02   Project Overview\n03   Scope of Work\n04   Timeline & Investment",
    95,
    920,
    790,
    22,
    "Manrope",
    "#5f5444",
    { lineHeight: 1.6 },
  );
  b.text("About Us", 70, 1110, 860, 51, "Cormorant Garamond", "#3c352b");
  paragraph(
    b,
    "We create spaces with clarity, warmth and enduring character. This proposal\noutlines our shared vision, process and the steps to bring your project to life.",
    70,
    1190,
    860,
    21,
    "#5f5444",
  );
  out.push(b.finish());
  b = board(
    "Document",
    "wander-well",
    "Wander Well — Travel Journal",
    "#111111",
  );
  b.rect(120, 0, 760, b.h, "#f0efdf");
  b.text("Wander\nWell", 145, 60, 710, 180, "League Spartan", "#fe642b", {
    weight: 800,
    align: "center",
    lineHeight: 0.85,
  });
  b.photo("forest", 150, 445, 700, 760);
  b.text("SOLANNA NERI", 170, 1250, 660, 36, "Manrope", "#fe642b", {
    weight: 800,
    align: "center",
  });
  b.text(
    "A FIELD GUIDE TO SLOWER DAYS",
    160,
    1320,
    680,
    20,
    "Manrope",
    "#434b2d",
    { align: "center", tracking: 100 },
  );
  out.push(b.finish());
  out.push(makeInvoice(1, true));

  const letterStyles = [
    ["larana-letter", "LARANA, INC.", "#1458b8", "JOB OFFER LETTER"],
    [
      "olivia-letter",
      "OLIVIA WILSON",
      "#333333",
      "APPLICATION FOR ACCOUNT MANAGER",
    ],
    [
      "ginyard-letter",
      "GINYARD INTERNATIONAL CO.",
      "#1c725a",
      "JOB OFFER LETTER",
    ],
    ["borcelle-letter", "BORCELLE COMPANY", "#07465c", "Offer Letter"],
    ["minimal-letter", "OLIVIA\nWILSON", "#202020", "COVER LETTER"],
  ] as const;
  letterStyles.forEach(([slug, brand, color, subject], i) => {
    const a = board(
      "Letter",
      slug,
      `${brand.replace("\n", " ")} — ${subject}`,
      "#ffffff",
    );
    if (i === 0 || i === 2 || i === 3) {
      a.ellipse(-250, a.h - 125, 1300, 310, color);
      a.ellipse(-180, a.h - 170, 1200, 280, i === 3 ? "#f3b632" : "#c9e3e5");
      a.ellipse(-150, a.h - 205, 1180, 270, "#ffffff");
    }
    a.text(brand, 70, 65, 600, i === 4 ? 58 : 35, "Manrope", color, {
      weight: i === 4 ? 400 : 700,
      lineHeight: 1,
    });
    a.text(
      "+123 456 7890\nhello@reallygreatsite.com",
      680,
      75,
      250,
      16,
      "Manrope",
      color,
      { align: "right" },
    );
    rule(a, 195, color);
    a.text(subject, 70, 235, 860, 30, "Manrope", color, {
      align: i === 0 || i === 2 || i === 3 ? "center" : "left",
      weight: 700,
    });
    a.text("May 20, 2026", 695, 325, 235, 19, "Manrope", "#3c3c3c", {
      align: "right",
    });
    a.text(
      "To:\nOlivia Wilson\n123 Anywhere Street\nAny City, ST 12345",
      70,
      345,
      550,
      20,
      "Manrope",
      "#333333",
      { lineHeight: 1.4 },
    );
    const offer = i === 0 || i === 2 || i === 3;
    paragraph(
      a,
      offer ? "Dear Olivia," : "Dear Hiring Manager,",
      70,
      515,
      860,
      22,
    );
    paragraph(
      a,
      offer
        ? "We are pleased to offer you the position of Marketing Manager at our\ncompany. Your experience, ideas and commitment to thoughtful work\nwill be a valuable addition to our team."
        : "I am writing to express my interest in the Account Manager position.\nMy experience in client relationships, strategic planning and project\ndelivery has prepared me to contribute positively to your team.",
      70,
      580,
      860,
      21,
    );
    paragraph(
      a,
      offer
        ? "Your proposed start date is June 15, 2026. You will work closely with\nthe creative and operations teams to develop our brand and strengthen\nour customer relationships.\n\nThe attached employment agreement sets out compensation, benefits\nand other terms. Please review it and contact us with any questions."
        : "In my previous role, I coordinated cross-functional projects, developed\nlasting partnerships and turned complex requirements into clear plans.\nI value careful listening, transparent communication and reliable delivery.\n\nI would welcome the opportunity to discuss how these strengths could\nsupport your organization and the people you serve.",
      70,
      735,
      860,
      21,
    );
    paragraph(
      a,
      offer
        ? "We look forward to welcoming you to the team. Please confirm your\nacceptance by signing and returning the accompanying agreement."
        : "Thank you for considering my application. My resume is enclosed,\nand I look forward to the opportunity to speak with you.",
      70,
      1030,
      860,
      21,
    );
    a.text("Sincerely,", 70, 1150, 600, 21, "Manrope", "#333333");
    a.text(
      offer ? "Daniel Gallego" : "Olivia Wilson",
      70,
      1190,
      600,
      55,
      "Allura",
      color,
    );
    out.push(a.finish());
  });
  for (let i = 0; i < 5; i++) out.push(makeInvoice(i));
  return out;
}
