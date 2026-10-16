import { Suspense } from "react";
import { getStudioCatalog } from "@/lib/api/catalog";
import { LandingSection } from "@/components/sections/landing-section";
import { WorkspaceSkeleton } from "@/components/feedback/skeletons";
async function LandingData() {
  const catalog = await getStudioCatalog();
  return <LandingSection catalog={catalog} />;
}
export default function HomePage() {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <LandingData />
    </Suspense>
  );
}
