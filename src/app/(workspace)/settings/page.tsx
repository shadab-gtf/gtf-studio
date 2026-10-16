import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsSection } from "@/components/sections/settings-section";
import { WorkspaceSkeleton } from "@/components/feedback/skeletons";
export const metadata: Metadata = { title: "Settings" };
export default function Page() {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <SettingsSection />
    </Suspense>
  );
}
