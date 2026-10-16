import { SkeletonBoundary } from "./skeleton-boundary";
export function ProjectGridSkeleton() {
  return (
    <SkeletonBoundary
      name="project-grid"
      loading
      fallback={
        <div
          className="project-grid"
          aria-busy="true"
          aria-label="Loading projects"
        >
          {[0, 1, 2, 3].map((id) => (
            <div key={id} className="skeleton-card">
              <div className="skeleton skeleton-preview" />
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-caption" />
            </div>
          ))}
        </div>
      }
    >
      {null}
    </SkeletonBoundary>
  );
}
export function WorkspaceSkeleton() {
  return (
    <div className="workspace-loading">
      <div className="skeleton skeleton-heading" />
      <div className="skeleton skeleton-banner" />
      <ProjectGridSkeleton />
    </div>
  );
}
export function EditorSkeleton() {
  return (
    <SkeletonBoundary
      name="editor"
      loading
      fallback={
        <div
          className="editor-skeleton"
          aria-busy="true"
          aria-label="Loading editor"
        >
          <div className="skeleton editor-skeleton-header" />
          <div className="editor-skeleton-body">
            <div className="skeleton editor-skeleton-panel" />
            <div className="skeleton editor-skeleton-canvas" />
            <div className="skeleton editor-skeleton-panel" />
          </div>
        </div>
      }
    >
      {null}
    </SkeletonBoundary>
  );
}
