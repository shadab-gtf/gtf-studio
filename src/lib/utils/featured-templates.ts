import type { Template } from "@/types/studio";

const FEATURED_IDS = [
  "editorial-semi-casual",
  "editorial-new-drop",
  "editorial-creative-brief-orange",
  "editorial-modern-house",
];

export function featuredTemplates(templates: readonly Template[]): Template[] {
  const featured = FEATURED_IDS.map((id) =>
    templates.find((template) => template.id === id),
  ).filter((template): template is Template => template !== undefined);
  return featured.length ? featured : templates.slice(0, 4);
}
