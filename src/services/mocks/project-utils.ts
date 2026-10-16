import type {
  Project,
  ProjectQuery,
  ProjectSummary,
  PaginatedResult,
} from "@/types/studio";

export function summarize(project: Project): ProjectSummary {
  const { document, ...summary } = project;
  return {
    ...summary,
    width: document.width,
    height: document.height,
    preview: document.pages[0],
    pageCount: document.pages.length,
  };
}
export function paginate(
  projects: Project[],
  query: ProjectQuery = {},
): PaginatedResult<ProjectSummary> {
  const limit = Math.min(100, Math.max(1, Math.floor(query.limit || 24)));
  const offset = Math.max(0, Number.parseInt(query.cursor || "0", 10) || 0);
  const filtered = projects
    .filter(
      (project) =>
        project.status === (query.status || "active") &&
        (!query.kind || project.kind === query.kind) &&
        (!query.search ||
          project.title
            .toLowerCase()
            .includes(query.search.trim().toLowerCase())),
    )
    .sort(
      (a, b) =>
        b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id),
    );
  return {
    items: filtered.slice(offset, offset + limit).map(summarize),
    nextCursor:
      offset + limit < filtered.length ? String(offset + limit) : null,
  };
}
