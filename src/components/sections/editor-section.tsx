"use client";
import dynamic from "next/dynamic";
import { useProject } from "@/features/projects/hooks/use-projects";
import { EditorSkeleton } from "@/components/feedback/skeletons";
import { ErrorState } from "@/components/feedback/states";
import type { StudioCatalog } from "@/types/studio";
const StudioEditor = dynamic(() => import("@/features/studio/studio-editor"), { ssr: false, loading: () => <EditorSkeleton /> });
export function EditorSection({
  id,
  catalog,
}: {
  id: string;
  catalog: StudioCatalog;
}) {
  const query = useProject(id);
  if (query.isError)
    return (
      <main id="main">
        <ErrorState
          message={query.error.message}
          retry={() => void query.refetch()}
        />
      </main>
    );
  if (query.isPending) return <EditorSkeleton />;
  return <StudioEditor key={query.data.id} project={query.data} catalog={catalog} />;
}
