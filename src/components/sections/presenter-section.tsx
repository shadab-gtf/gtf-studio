"use client";
import dynamic from "next/dynamic";
import { EditorSkeleton } from "@/components/feedback/skeletons";
const PresenterWindow = dynamic(() => import("@/features/studio/presenter-window"), { ssr: false, loading: () => <EditorSkeleton /> });
export function PresenterSection({ session }: { session: string }) { return <PresenterWindow session={session} />; }
