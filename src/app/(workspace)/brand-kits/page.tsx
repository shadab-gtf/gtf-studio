import type { Metadata } from "next";
import { Suspense } from "react";
import { BrandKitsSection } from "@/components/sections/brand-kits-section";
import { WorkspaceSkeleton } from "@/components/feedback/skeletons";
export const metadata: Metadata = { title: "Brand kits" };
export default function Page() {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <BrandKitsSection />
    </Suspense>
  );
}
