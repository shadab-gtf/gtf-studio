import type { Metadata } from "next";
import { Suspense } from "react";
import { AssetsSection } from "@/components/sections/assets-section";
import { WorkspaceSkeleton } from "@/components/feedback/skeletons";
export const metadata: Metadata = { title: "Your uploads" };
export default function Page() {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <AssetsSection />
    </Suspense>
  );
}
