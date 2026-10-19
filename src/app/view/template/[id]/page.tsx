import type { Metadata } from "next";
import { getStudioCatalog } from "@/lib/api/catalog";
import { DesignViewer } from "@/components/sections/design-viewer";
import styles from "@/components/sections/design-viewer.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const catalog = await getStudioCatalog();
  const template = catalog.templates.find((item) => item.id === id);
  return {
    title: template ? `${template.title} — view only` : "View only",
    robots: { index: false, follow: false },
  };
}

export default async function TemplateViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const catalog = await getStudioCatalog();
  const template = catalog.templates.find((item) => item.id === id);
  if (!template)
    return (
      <div className={styles.message}>This design isn’t available.</div>
    );
  return <DesignViewer document={template.document} title={template.title} />;
}
