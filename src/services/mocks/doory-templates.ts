import { z } from "zod";
import type { Template } from "@/types/studio";
import { studioDocumentSchema } from "@/core/document/studio-schema";
import { withStudioDocument } from "@/features/studio/document-bridge";
import source from "./doory-template-data.json";

const templateSource = z.object({
  version: z.literal(1),
  templates: z
    .array(
      z.object({
        slug: z.string().regex(/^[a-z0-9-]+$/),
        title: z.string(),
        description: z.string(),
        preset: z.string(),
        category: z.enum([
          "social-media",
          "presentations",
          "posters",
          "flyers",
          "invitations",
          "resumes",
          "youtube",
          "business",
        ]),
        document: studioDocumentSchema,
      }),
    )
    .length(10),
});
const category: Record<
  z.infer<typeof templateSource>["templates"][number]["category"],
  Template["category"]
> = {
  "social-media": "Social",
  presentations: "Presentation",
  posters: "Poster",
  flyers: "Flyer",
  invitations: "Invitation",
  resumes: "Resume",
  youtube: "Banner",
  business: "Business card",
};

/** The upstream starter set remains editable; the small image projection is only its gallery preview. */
export function createDooryTemplates(): Template[] {
  return templateSource.parse(source).templates.map((template) => ({
    id: `doory-${template.slug}`,
    title: template.title,
    category:
      template.preset === "instagram-story"
        ? "Story"
        : category[template.category],
    description: `${template.description} Original Doory starter template by Siam.`,
    document: withStudioDocument(
      structuredClone(template.document),
      `/images/doory-templates/${template.slug}.webp`,
    ),
  }));
}
