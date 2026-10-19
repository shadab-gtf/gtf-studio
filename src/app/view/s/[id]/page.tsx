import type { Metadata } from "next";
import { loadShareDocument } from "@/lib/share/share-blob";
import { DesignViewer } from "@/components/sections/design-viewer";
import styles from "@/components/sections/design-viewer.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "View only",
  robots: { index: false, follow: false },
};

export default async function SharedViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const document = await loadShareDocument(id).catch(() => null);
  if (!document)
    return <div className={styles.message}>This design isn’t available.</div>;
  return <DesignViewer document={document} />;
}
