import type {
  CreativeDocument,
  DocumentPage,
} from "@/core/document/schema";

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}
const escapeXml = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (char) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[char] ?? char,
  );
function polygon(width: number, height: number, star = false): number[] {
  if (!star) return [width / 2, 0, width, height, 0, height];
  return Array.from({ length: 10 }, (_, i) => {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const ratio = i % 2 ? 0.44 : 1;
    return [
      width / 2 + ((Math.cos(angle) * width) / 2) * ratio,
      height / 2 + ((Math.sin(angle) * height) / 2) * ratio,
    ];
  }).flat();
}
export function serializeSvg(
  document: CreativeDocument,
  page: DocumentPage,
): string {
  const content = page.elements
    .filter((element) => !element.hidden)
    .map((element) => {
      const { width, height } = element;
      let node: string;
      if (element.type === "text")
        node = `<text fill="${element.fill}" font-family="${escapeXml(element.fontFamily)}" font-size="${element.fontSize}" font-weight="${element.fontWeightValue ?? element.fontWeight}" font-style="${element.fontStyle ?? "normal"}" text-anchor="${element.align === "center" ? "middle" : element.align === "right" ? "end" : "start"}">${element.text
          .split("\n")
          .map(
            (line, index) =>
              `<tspan x="${element.align === "center" ? width / 2 : element.align === "right" ? width : 0}" y="${element.fontSize * (0.86 + index * element.lineHeight)}">${escapeXml(line)}</tspan>`,
          )
          .join("")}</text>`;
      else if (element.type === "image")
        node = `<image href="${escapeXml(element.src)}" width="${width}" height="${height}" preserveAspectRatio="none" transform="translate(${element.flipX ? width : 0} ${element.flipY ? height : 0}) scale(${element.flipX ? -1 : 1} ${element.flipY ? -1 : 1})" />`;
      else if (element.type === "path")
        node = `<polyline points="${element.points.join(" ")}" fill="none" stroke="${element.fill}" stroke-width="${element.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" transform="scale(${width / element.viewWidth} ${height / element.viewHeight})" />`;
      else if (element.shape === "ellipse")
        node = `<ellipse cx="${width / 2}" cy="${height / 2}" rx="${width / 2}" ry="${height / 2}" fill="${element.fill}" />`;
      else if (element.shape === "triangle" || element.shape === "star")
        node = `<polygon points="${polygon(width, height, element.shape === "star").join(" ")}" fill="${element.fill}" />`;
      else
        node = `<rect width="${width}" height="${height}" rx="${element.cornerRadius}" fill="${element.fill}" />`;
      return `<g transform="translate(${element.x} ${element.y}) rotate(${element.rotation})" opacity="${element.opacity}">${node}</g>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${document.width}" height="${document.height}" viewBox="0 0 ${document.width} ${document.height}"><rect width="100%" height="100%" fill="${page.background}"/>${content}</svg>`;
}
