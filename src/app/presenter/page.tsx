import { Suspense } from "react";
import { PresenterSection } from "@/components/sections/presenter-section";
import { EditorSkeleton } from "@/components/feedback/skeletons";
export const metadata = { title: "Presenter view", robots: { index: false, follow: false } };
async function PresenterData({ searchParams }: { searchParams: Promise<{ session?: string }> }) { const { session = "" } = await searchParams; return <PresenterSection session={session} />; }
export default function PresenterPage(props: { searchParams: Promise<{ session?: string }> }) { return <Suspense fallback={<EditorSkeleton />}><PresenterData {...props} /></Suspense>; }
