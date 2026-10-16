import type { Metadata } from "next";
import { Suspense } from "react";
import { getStudioCatalog } from "@/lib/api/catalog";
import { EditorSection } from "@/components/sections/editor-section";
import { EditorSkeleton } from "@/components/feedback/skeletons";
export const metadata: Metadata = {
  title: "Design editor",
  robots: { index: false, follow: false },
};
async function EditorData({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [{ projectId }, catalog] = await Promise.all([
    params,
    getStudioCatalog(),
  ]);
  return <EditorSection id={projectId} catalog={catalog} />;
}
export default function EditorPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <EditorData params={params} />
    </Suspense>
  );
}
