import Image from "next/image";
import { DocumentPreview } from "@/core/renderer/document-preview";
import type { Template } from "@/types/studio";

export function TemplateArtwork({
  template,
  sizes,
  loading = "lazy",
  label = "",
}: {
  template: Template;
  sizes: string;
  loading?: "lazy" | "eager";
  label?: string;
}) {
  return template.collection === "reference" ? (
    <Image
      className="template-artwork"
      src={`/images/editorial-templates/${template.id}.webp`}
      alt={label}
      width={template.document.width}
      height={template.document.height}
      sizes={sizes}
      loading={loading}
    />
  ) : (
    <DocumentPreview
      className="template-artwork"
      document={template.document}
      page={template.document.pages[0]}
      label={label || template.title}
    />
  );
}
