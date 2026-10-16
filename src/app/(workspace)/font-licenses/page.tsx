import { Suspense } from "react";
import { FontLicensesSection } from "@/components/sections/font-licenses-section";
import { WorkspaceSkeleton } from "@/components/feedback/skeletons";
export const metadata = { title: "Font licenses" };
export default function Page() {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <FontLicensesSection />
    </Suspense>
  );
}
