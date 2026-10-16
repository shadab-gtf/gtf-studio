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

const palettes = [
  {
    name: "Editorial",
    paper: "#f2eee5",
    ink: "#4c382e",
    accent: "#bf5e38",
    soft: "#e6b88a",
  },
  {
    name: "Electric",
    paper: "#172e8d",
    ink: "#ffffff",
    accent: "#c7e77b",
    soft: "#6f92df",
  },
  {
    name: "Botanical",
    paper: "#e9eedf",
    ink: "#243d30",
    accent: "#66865d",
    soft: "#bed0a2",
  },
  {
    name: "Studio",
    paper: "#f8dce7",
    ink: "#70203e",
    accent: "#d35b89",
    soft: "#efadca",
  },
  {
    name: "Minimal",
    paper: "#f5f7f8",
    ink: "#132d42",
    accent: "#29afe4",
    soft: "#c4e9f6",
  },
] as const;
const categories: {
  category: Template["category"];
  format: string;
  headlines: string[];
}[] = [
  {
    category: "Social",
    format: "social",
    headlines: [
      "Fresh\nperspectives.",
      "MAKE\nSOME NOISE",
      "A slower\nkind of day.",
      "Your next\nobsession.",
      "Less,\nbut better.",
    ],
  },
  {
    category: "Presentation",
    format: "presentation",
    headlines: [
      "The next\nchapter.",
      "A BOLDER\nDIRECTION",
      "Room\nto grow.",
      "Ideas\ninto impact.",
      "A clear\nway forward.",
    ],
  },
  {
    category: "Story",
    format: "story",
    headlines: [
      "A moment\nworth keeping.",
      "NEW\nENERGY",
      "Meet your\nnew ritual.",
      "Something\ngood is coming.",
      "Make space\nfor more.",
    ],
  },
  {
    category: "Poster",
    format: "poster",
    headlines: [
      "The art of\neveryday.",
      "OFF\nTHE GRID",
      "Gather\nand grow.",
      "FORM\n& FEELING",
      "A different\nperspective.",
    ],
  },
  {
    category: "Banner",
    format: "banner",
    headlines: [
      "Make room for possibility.",
      "Ideas with impact.",
      "Naturally, a little different.",
      "A fresh point of view.",
      "Designed around you.",
    ],
  },
  {
    category: "Logo",
    format: "logo",
    headlines: ["forma", "BOLD", "fern", "muse", "north"],
  },
  {
    category: "Resume",
    format: "resume",
    headlines: [
      "Alex Morgan",
      "Jordan Lee",
      "Sam Rivera",
      "Taylor Chen",
      "Casey Park",
    ],
  },
  {
    category: "Invitation",
    format: "invitation",
    headlines: [
      "An evening\ntogether.",
      "LET’S\nCELEBRATE",
      "A garden\ngathering.",
      "You’re\ninvited.",
      "A day\nto remember.",
    ],
  },
  {
    category: "Flyer",
    format: "flyer",
    headlines: [
      "Coffee &\nconversation.",
      "THE\nWEEKENDER",
      "Grow\nsomething good.",
      "A creative\nget-together.",
      "Your next\ngreat workshop.",
    ],
  },
  {
    category: "Business card",
    format: "business-card",
    headlines: [
      "Alex Morgan",
      "BOLD STUDIO",
      "Fern & Co.",
      "MUSE STUDIO",
      "North Design",
    ],
  },
];

export function createTemplateCollection(): Template[] {
  return categories.flatMap(({ category, format, headlines }) =>
    palettes.map((palette, variant) => {
      const preset = formats.find((item) => item.id === format)!;
      const { width: w, height: h } = preset;
      const unit = Math.min(w, h);
      let sequence = 0;
      const id = `${format}-${palette.name.toLowerCase()}`;
      const base = (
        name: string,
        x: number,
        y: number,
        width: number,
        height: number,
      ) => ({
        id: `${id}-${sequence++}`,
        name,
        x: x * w,
        y: y * h,
        width: width * w,
        height: height * h,
        rotation: 0,
        opacity: 1,
        locked: false,
        hidden: false,
      });
      const shape = (
        x: number,
        y: number,
        width: number,
        height: number,
        fill: string,
        kind: "rectangle" | "ellipse" | "triangle" | "star" = "rectangle",
      ): CanvasElement => ({
        ...base(kind, x, y, width, height),
        type: "shape",
        shape: kind,
        fill,
        cornerRadius: 0,
      });
      const text = (
        value: string,
        x: number,
        y: number,
        width: number,
        size: number,
        fill: string = palette.ink,
        serif = variant === 0 || variant === 2,
      ): CanvasElement => ({
        ...base(
          value.split("\n")[0],
          x,
          y,
          width,
          Math.min(0.7, (size * unit * value.split("\n").length * 1.2) / h),
        ),
        type: "text",
        text: value,
        fontSize: size * unit,
        fontFamily: serif ? "Georgia" : "Manrope",
        fontWeight: "bold",
        fill,
        align: "left",
        lineHeight: 1.1,
      });
      const page = (
        name: string,
        elements: CanvasElement[],
        background: string = palette.paper,
      ): DocumentPage => ({
        id: `${id}-page-${sequence++}`,
        name,
        elements,
        background,
        notes: "",
        transition: "fade",
      });
      const decoration: CanvasElement[][] = [
        [
          shape(0.68, 0.05, 0.25, 0.025, palette.accent),
          shape(0.56, 0.6, 0.36, 0.3, palette.accent, "ellipse"),
          shape(0.64, 0.64, 0.2, 0.22, palette.soft, "ellipse"),
        ],
        [
          shape(0.68, 0, 0.32, 1, palette.soft),
          shape(0.7, 0.65, 0.25, 0.28, palette.accent, "star"),
        ],
        [
          shape(0.6, 0.46, 0.29, 0.44, palette.accent, "ellipse"),
          shape(0.76, 0.62, 0.18, 0.27, palette.soft, "ellipse"),
        ],
        [
          shape(0.48, 0.55, 0.5, 0.4, palette.accent),
          shape(0.61, 0.59, 0.3, 0.28, palette.soft, "ellipse"),
        ],
        [
          shape(0.07, 0.1, 0.09, 0.012, palette.accent),
          shape(0.68, 0.64, 0.24, 0.24, palette.accent, "triangle"),
        ],
      ];
      let elements = [
        ...decoration[variant],
        text(
          headlines[variant],
          0.075,
          0.22,
          0.85,
          category === "Banner" ? 0.085 : 0.105,
        ),
        text(
          category === "Presentation"
            ? "STRATEGY / VISION / OPPORTUNITY"
            : category === "Invitation"
              ? "SAVE THE DATE · 24 OCTOBER"
              : category === "Flyer"
                ? "COMMUNITY / CREATIVITY / CONNECTION"
                : "A NEW PERSPECTIVE",
          0.075,
          0.08,
          0.84,
          0.019,
          palette.ink,
          false,
        ),
        text(
          category === "Invitation"
            ? "6 PM · THE GARDEN HOUSE\nWe’d love to see you there."
            : category === "Flyer"
              ? "SATURDAY · 10 AM TO 4 PM\nYour venue · yourwebsite.com"
              : "YOUR STORY STARTS HERE",
          0.075,
          0.87,
          0.8,
          0.022,
          palette.ink,
          false,
        ),
      ];
      if (category === "Logo")
        elements = [
          shape(
            0.36,
            0.18,
            0.28,
            0.28,
            palette.accent,
            variant % 2 ? "star" : "ellipse",
          ),
          text(headlines[variant], 0.18, 0.57, 0.75, 0.15),
          text("MAKE YOUR MARK", 0.24, 0.78, 0.65, 0.03, palette.ink, false),
        ];
      if (category === "Business card")
        elements = [
          shape(0.82, 0, 0.18, 1, palette.accent),
          text(headlines[variant], 0.07, 0.18, 0.73, 0.07),
          text("CREATIVE DIRECTOR", 0.07, 0.37, 0.7, 0.025, palette.ink, false),
          text(
            "hello@yourstudio.com\n+1 555 010 2026\nyourstudio.com",
            0.07,
            0.65,
            0.7,
            0.03,
            palette.ink,
            false,
          ),
        ];
      if (category === "Resume")
        elements = [
          shape(0, 0, 0.025, 1, palette.accent),
          text(headlines[variant], 0.08, 0.07, 0.84, 0.075),
          text("PRODUCT DESIGNER", 0.08, 0.15, 0.8, 0.025, palette.ink, false),
          text(
            "hello@example.com · portfolio.example.com",
            0.08,
            0.21,
            0.84,
            0.021,
            palette.ink,
            false,
          ),
          text("PROFILE", 0.08, 0.3, 0.8, 0.028),
          text(
            "Thoughtful designer building useful, accessible products.\nFocused on clear communication and meaningful outcomes.",
            0.08,
            0.35,
            0.84,
            0.022,
            palette.ink,
            false,
          ),
          text("EXPERIENCE", 0.08, 0.46, 0.8, 0.028),
          text(
            "Senior Designer · Studio Name\n2022 – Present\nLed research, prototyping, and product design.\nCollaborated with engineering to ship accessible experiences.",
            0.08,
            0.51,
            0.84,
            0.022,
            palette.ink,
            false,
          ),
          text("EDUCATION & SKILLS", 0.08, 0.73, 0.8, 0.028),
          text(
            "BA Design · Your University\nResearch · Interaction design · Design systems",
            0.08,
            0.79,
            0.84,
            0.022,
            palette.ink,
            false,
          ),
        ];
      const pages = [page("Cover", elements)];
      if (category === "Presentation") {
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
        topics.forEach((topic, index) => {
          const content: CanvasElement[] = [
            text(
              String(index + 2).padStart(2, "0"),
              0.88,
              0.08,
              0.1,
              0.025,
              palette.accent,
              false,
            ),
            text(topic, 0.07, 0.14, 0.84, 0.065),
            shape(0.07, 0.3, 0.86, 0.004, palette.accent),
          ];
          if (index === 2 || index === 7) {
            [0.32, 0.48, 0.65, 0.83].forEach((value, i) => {
              content.push(
                shape(
                  0.14 + i * 0.2,
                  0.82 - value * 0.5,
                  0.12,
                  value * 0.5,
                  i === 3 ? palette.accent : palette.soft,
                ),
                text(
                  `${Math.round(value * 100)}%`,
                  0.14 + i * 0.2,
                  0.85,
                  0.16,
                  0.026,
                  palette.ink,
                  false,
                ),
              );
            });
            content.push(
              text(
                "Illustrative data · replace with your own",
                0.07,
                0.94,
                0.85,
                0.016,
                palette.ink,
                false,
              ),
            );
          } else if (index === 8)
            content.push(
              text(
                "One clear idea.\nA shared next step.",
                0.07,
                0.43,
                0.85,
                0.09,
              ),
              text(
                "yourwebsite.com · hello@yourstudio.com",
                0.07,
                0.85,
                0.85,
                0.025,
                palette.ink,
                false,
              ),
            );
          else
            for (let col = 0; col < 3; col++) {
              content.push(
                shape(0.07 + col * 0.3, 0.4, 0.26, 0.43, palette.soft),
                text(
                  ["Discover", "Create", "Deliver"][col],
                  0.09 + col * 0.3,
                  0.45,
                  0.23,
                  0.035,
                ),
                text(
                  [
                    "Understand the need.\nListen to the people\nwho matter most.",
                    "Build a focused idea.\nTest it early.\nMake it useful.",
                    "Turn plans into action.\nMeasure what changes.\nKeep improving.",
                  ][col],
                  0.09 + col * 0.3,
                  0.57,
                  0.23,
                  0.021,
                  palette.ink,
                  false,
                ),
              );
            }
          pages.push({
            ...page(topic, content),
            notes: `Introduce ${topic.toLowerCase()} and replace the sample content with your own research.`,
          });
        });
      }
      const document: CreativeDocument = {
        schemaVersion: 1,
        width: w,
        height: h,
        pages,
      };
      return {
        id,
        title: `${palette.name} ${category.toLowerCase()}`,
        category,
        description: `${palette.name} typography and an original, fully editable layout. ${category === "Presentation" ? "A complete ten-slide deck." : preset.description + "."}`,
        document,
      };
    }),
  );
}
