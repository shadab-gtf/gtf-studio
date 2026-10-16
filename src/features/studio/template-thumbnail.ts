import type { Template } from "@/types/studio";
import { serializeSvg } from "@/features/export/export-document";

export function templateThumbnail(template: Template): string {
  const page = template.document.pages[0];
  const preview = page.elements.find(element => element.type === "image" && element.name === "Design preview");
  if (preview?.type === "image") return preview.src;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializeSvg(template.document, page))}`;
}
