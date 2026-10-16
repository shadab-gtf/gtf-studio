import type { Metadata } from "next";
import { Suspense } from "react";
import { getStudioCatalog } from "@/lib/api/catalog";
import { WorkspaceSection } from "@/components/sections/workspace-section";
import { WorkspaceSkeleton } from "@/components/feedback/skeletons";
export const metadata: Metadata = { title: "Dashboard" };
async function WorkspaceData() {
  const catalog = await getStudioCatalog();
  return <WorkspaceSection catalog={catalog} view="dashboard" />;
}
export default function Page() {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <WorkspaceData />
    </Suspense>
  );
}
