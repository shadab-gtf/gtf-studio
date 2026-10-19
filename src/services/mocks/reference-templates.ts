import { withStudioDocument } from "@/features/studio/document-bridge";
import type { Template } from "@/types/studio";
import type { DocObject, DoryDocument } from "@/vendor/doory/types/document";

const olive = "#485122";
const origin = { originX: "left", originY: "top", visible: true };

function label(
  id: string,
  text: string,
  left: number,
  top: number,
  width: number,
  fontSize: number,
  options: Partial<DocObject> = {},
): DocObject {
  return {
    ...origin,
    id,
    name: text,
    type: "textbox",
    text,
    left,
    top,
    width,
    fontSize,
    fontFamily: "Manrope",
    fontWeight: 400,
    fill: olive,
    lineHeight: 1,
    splitByGrapheme: false,
    animation: {
      enter: {
        preset: "fade",
        durationMs: 700,
        delayMs: 200,
        easing: "ease-out",
      },
    },
    ...options,
  };
}

/** Reference proportions are preserved at 4× resolution; every layer is editable. */
export function createSemiCasualDocument(): DoryDocument {
  return {
    schemaVersion: 1,
    unit: "px",
    width: 1728,
    height: 2428,
    pages: [
      {
        id: "semi-casual-cover",
        name: "Semi Casual — fashion editorial",
        durationSec: 5,
        background: { type: "solid", color: "#e2e2e0" },
        objects: [
          {
            ...origin,
            id: "semi-casual-portrait",
            name: "Green blazer portrait — Hoang Phi Hong",
            type: "image",
            src: "/media/templates/photos/semi-casual-portrait.webp",
            docSrc: "/media/templates/photos/semi-casual-portrait.webp",
            alt: "Fashion portrait of a woman wearing an olive green blazer, with her hands beside her head.",
            left: -72,
            top: -236,
            width: 2400,
            height: 3600,
            scaleX: 0.872,
            scaleY: 0.872,
            animation: {
              enter: {
                preset: "fade",
                durationMs: 850,
                delayMs: 0,
                easing: "ease-out",
              },
            },
          },
          label("semi-casual-kicker", "SEMI", 140, 174, 300, 72, {
            charSpacing: 165,
          }),
          label("semi-casual-title", "CASUAL", 124, 207, 1600, 440, {
            fontFamily: "Italiana",
            scaleX: 0.965,
            animation: {
              enter: {
                preset: "rise",
                durationMs: 950,
                delayMs: 100,
                easing: "ease-out",
              },
            },
          }),
          label("semi-casual-look", "LOOK", 1336, 618, 280, 72, {
            fontStyle: "italic",
            charSpacing: 120,
            textAlign: "right",
          }),
          label("semi-casual-caption", "Make it yours!", 152, 2140, 720, 52, {
            fill: "#fffdf1",
          }),
          label("semi-casual-handle", "@REALLYGREATSITE", 152, 2200, 780, 52, {
            fill: "#fffdf1",
            fontWeight: 800,
          }),
          label("semi-casual-est", "EST.", 1408, 2140, 168, 52, {
            fill: "#fffdf1",
            fontWeight: 800,
            textAlign: "right",
          }),
          label("semi-casual-year", "1993", 1408, 2208, 168, 52, {
            fill: "#fffdf1",
            fontWeight: 800,
            textAlign: "right",
          }),
        ],
      },
    ],
  };
}

export function createReferenceTemplates(): Template[] {
  return [
    {
      id: "semi-casual-editorial",
      title: "Semi Casual — Fashion Editorial",
      category: "Poster",
      description:
        "Olive editorial typography, the original green-blazer portrait, and precise full-bleed composition. Editable photo and type with locally bundled free fonts.",
      document: withStudioDocument(
        createSemiCasualDocument(),
        "/images/reference-templates/semi-casual.webp",
      ),
    },
  ];
}
