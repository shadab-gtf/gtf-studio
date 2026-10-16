import { createTemplateCollection, formats } from "./template-collection";
import { createDooryTemplates } from "./doory-templates";
import type {
  CanvasElement,
  CreativeDocument,
  DocumentPage,
} from "@/core/document/schema";
import type { StudioCatalog, Template } from "@/types/studio";

const common = { rotation: 0, opacity: 1, locked: false, hidden: false };
const shape = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  kind: "rectangle" | "ellipse" | "triangle" | "star" = "rectangle",
  rotation = 0,
): CanvasElement => ({
  ...common,
  id,
  name: kind,
  type: "shape",
  x,
  y,
  width,
  height,
  fill,
  shape: kind,
  cornerRadius: 0,
  rotation,
});
const text = (
  id: string,
  value: string,
  x: number,
  y: number,
  width: number,
  size: number,
  fill: string,
  fontFamily: "Manrope" | "Georgia" | "Arial" = "Manrope",
): CanvasElement => ({
  ...common,
  id,
  name: value.split("\n")[0],
  type: "text",
  text: value,
  x,
  y,
  width,
  height: size * value.split("\n").length * 1.25,
  fill,
  fontSize: size,
  fontFamily,
  fontWeight: "bold",
  align: "left",
  lineHeight: 1.1,
});
const page = (
  id: string,
  background: string,
  elements: CanvasElement[],
): DocumentPage => ({
  id,
  name: "Page 1",
  background,
  elements,
  notes: "",
  transition: "fade",
});
const doc = (
  width: number,
  height: number,
  pages: DocumentPage[],
): CreativeDocument => ({ schemaVersion: 1, width, height, pages });

export const templates: Template[] = [
  {
    id: "bloom",
    title: "In full bloom",
    category: "Social",
    description: "A fresh perspective, in pink.",
    document: doc(1080, 1080, [
      page("bloom-page", "#f7cfe1", [
        shape("b1", 590, 60, 430, 430, "#de3c88", "ellipse"),
        shape("b2", 720, 580, 420, 420, "#bd1c67", "ellipse"),
        shape("b3", 565, 310, 350, 350, "#f669a4", "ellipse"),
        text("b4", "Ideas in\nfull bloom.", 76, 260, 880, 134, "#622341"),
        text("b5", "ROOM FOR SOMETHING NEW", 82, 85, 750, 25, "#622341"),
        text(
          "b6",
          "A fresh perspective starts here.",
          82,
          940,
          750,
          28,
          "#622341",
        ),
      ]),
    ]),
  },
  {
    id: "waves",
    title: "Make waves",
    category: "Social",
    description: "Bold shapes. A bigger impression.",
    document: doc(1080, 1080, [
      page("waves-page", "#163eae", [
        shape("w1", 650, -130, 700, 700, "#8dcfee", "ellipse"),
        shape("w2", -140, 710, 660, 660, "#e1f69d", "ellipse"),
        shape("w3", 750, 710, 240, 240, "#f5a6cd", "star", 18),
        text("w4", "Make\nwaves.", 90, 230, 900, 194, "#ffffff"),
        text(
          "w5",
          "A LITTLE DIFFERENT. A LOT OF YOU.",
          90,
          100,
          800,
          24,
          "#ffffff",
        ),
        text(
          "w6",
          "Create your own kind of impact.",
          90,
          950,
          870,
          30,
          "#ffffff",
        ),
      ]),
    ]),
  },
  {
    id: "sunday",
    title: "Slow Sunday",
    category: "Poster",
    description: "Good things take their time.",
    document: doc(840, 1188, [
      page("sunday-page", "#f2eee5", [
        shape("s1", 80, 550, 680, 500, "#aa4c2d"),
        shape("s2", 210, 600, 420, 420, "#e8b477", "ellipse"),
        shape("s3", 300, 695, 240, 240, "#683d2c", "ellipse"),
        text(
          "s4",
          "Good things\ntake time.",
          72,
          128,
          730,
          100,
          "#573a2b",
          "Georgia",
        ),
        text("s5", "SLOW SUNDAY STUDIO", 76, 60, 700, 22, "#573a2b"),
        text(
          "s6",
          "Take a breath. Make something.",
          80,
          1090,
          680,
          25,
          "#573a2b",
        ),
      ]),
    ]),
  },
  {
    id: "ordinary",
    title: "Less ordinary",
    category: "Social",
    description: "An electric new perspective.",
    document: doc(1080, 1080, [
      page("ordinary-page", "#d7f6ff", [
        shape("o1", 560, 480, 600, 600, "#29afe4", "ellipse"),
        shape("o2", 710, 680, 220, 220, "#f2f590", "star", 12),
        text("o3", "A little\nless ordinary.", 75, 180, 940, 126, "#123e57"),
        text("o4", "NEW IDEAS. FRESH ENERGY.", 80, 85, 800, 25, "#123e57"),
        text("o5", "Made to stand out.", 80, 940, 800, 32, "#123e57"),
      ]),
    ]),
  },
  {
    id: "perspective",
    title: "A new perspective",
    category: "Presentation",
    description: "Your next idea deserves a great introduction.",
    document: doc(1600, 900, [
      page("p-page1", "#f0f2ef", [
        shape("p1", 1040, 0, 560, 900, "#c5dbb5"),
        shape("p2", 1100, 160, 460, 570, "#315341", "ellipse"),
        text(
          "p3",
          "A new\nperspective.",
          110,
          230,
          1050,
          126,
          "#243e30",
          "Georgia",
        ),
        text("p4", "YOUR NEXT CHAPTER", 115, 100, 900, 25, "#243e30"),
        text(
          "p5",
          "An introduction to what comes next.",
          115,
          765,
          1000,
          28,
          "#243e30",
        ),
      ]),
      {
        ...page("p-page2", "#315341", [
          text(
            "p6",
            "Big ideas start\nwith a simple question.",
            110,
            150,
            1300,
            90,
            "#f0f2ef",
            "Georgia",
          ),
          text(
            "p7",
            "What could we do differently?",
            115,
            620,
            1200,
            38,
            "#c5dbb5",
          ),
        ]),
        name: "The idea",
      },
      {
        ...page("p-page3", "#c5dbb5", [
          text(
            "p8",
            "Let’s make\nit happen.",
            110,
            185,
            1350,
            140,
            "#243e30",
            "Georgia",
          ),
          text(
            "p9",
            "The next chapter is yours.",
            115,
            730,
            1200,
            35,
            "#243e30",
          ),
        ]),
        name: "Next steps",
      },
    ]),
  },
  {
    id: "studio",
    title: "The creative brief",
    category: "Presentation",
    description: "A clear canvas for your strongest ideas.",
    document: doc(1600, 900, [
      page("studio-page", "#192432", [
        shape("t1", 1100, 100, 400, 400, "#e24397", "ellipse"),
        shape("t2", 1120, 460, 380, 330, "#29afe4", "triangle"),
        text(
          "t3",
          "Good design.\nGreat stories.",
          100,
          230,
          1300,
          118,
          "#ffffff",
        ),
        text("t4", "THE CREATIVE BRIEF", 110, 100, 950, 25, "#93d8f4"),
        text("t5", "An idea worth sharing.", 110, 760, 1000, 30, "#ffffff"),
      ]),
    ]),
  },
];

templates.push(...createTemplateCollection());
templates.push(...createDooryTemplates());

export async function getMockCatalog(): Promise<StudioCatalog> {
  return structuredClone({ templates, formats });
}
