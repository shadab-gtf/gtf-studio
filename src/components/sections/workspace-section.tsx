"use client";

import { useDeferredValue, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Grid2X2,
  LayoutTemplate,
  List,
  Plus,
  Presentation,
  Search,
  Smartphone,
  Square,
  FileImage,
  PanelTop,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SkeletonBoundary } from "@/components/feedback/skeleton-boundary";
import { ProjectGridSkeleton } from "@/components/feedback/skeletons";
import { EmptyState, ErrorState } from "@/components/feedback/states";
import { DocumentPreview } from "@/core/renderer/document-preview";
import {
  useCreateProject,
  useProjectActions,
  useProjects,
} from "@/features/projects/hooks/use-projects";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";
import { ProjectCard } from "@/features/projects/components/project-card";
import type { Format, Project, StudioCatalog, Template } from "@/types/studio";

export function WorkspaceSection({
  catalog,
  view,
}: {
  catalog: StudioCatalog;
  view: "dashboard" | "projects" | "templates" | "trash";
}) {
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState<Project["status"]>(
    view === "trash" ? "trashed" : "active",
  );
  const [listView, setListView] = useState(false);
  const [creating, setCreating] = useState(!!params.get("format"));
  const [format, setFormat] = useState<Format | undefined>(() =>
    catalog.formats.find((item) => item.id === params.get("format")),
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [template, setTemplate] = useState<Template | undefined>(() =>
    catalog.templates.find((item) => item.id === params.get("template")),
  );
  const query = useProjects({ status, search: deferredSearch, limit: 100 });
  const action = useProjectActions();
  const create = useCreateProject();
  const title = {
    dashboard: "A little inspiration. A lot of possibility.",
    projects: "Your creative collection.",
    templates: "Find your starting point.",
    trash: "A second chance for your ideas.",
  }[view];
  const filteredTemplates = catalog.templates.filter(
    (item) =>
      (category === "All" || item.category === category) &&
      item.title.toLowerCase().includes(deferredSearch.toLowerCase()),
  );
  return (
    <>
      <div className="workspace-title">
        <div>
          <h1>{title}</h1>
          <p>
            {view === "dashboard"
              ? "Welcome to your studio. What will you make today?"
              : view === "projects"
                ? "Everything you’re making, all in one place."
                : view === "templates"
                  ? "Original designs, ready for your own perspective."
                  : "Restore a project or delete it permanently. You’re in control."}
          </p>
        </div>
        {view !== "trash" && (
          <Button
            variant="primary"
            onClick={() => {
              setFormat(undefined);
              setCreating(true);
            }}
          >
            <Plus size={18} />
            Create a design
          </Button>
        )}
      </div>
      {view === "dashboard" && (
        <>
          <div className="workspace-welcome">
            <div>
              <span className="welcome-spark">
                <LayoutTemplate size={23} />
              </span>
              <h2>Good ideas start here.</h2>
              <p>A post, a pitch, a whole new possibility.</p>
              <Link href="/templates" className="button button--ink">
                Find a template <ArrowRight size={16} />
              </Link>
            </div>
            <div className="welcome-art">
              <DocumentPreview
                document={catalog.templates[0].document}
                page={catalog.templates[0].document.pages[0]}
              />
              <DocumentPreview
                document={catalog.templates[1].document}
                page={catalog.templates[1].document.pages[0]}
              />
            </div>
          </div>
          <div className="format-grid">
            {catalog.formats.slice(0, 5).map((item, index) => {
              const Icon = [
                Square,
                Presentation,
                Smartphone,
                FileImage,
                PanelTop,
              ][index % 5];
              return (
                <button
                  key={item.id}
                  className="format-card"
                  onClick={() => {
                    setFormat(item);
                    setCreating(true);
                  }}
                >
                  <span className={`format-icon ${item.color}`}>
                    <Icon size={23} />
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                  <Plus size={17} />
                </button>
              );
            })}
          </div>
        </>
      )}
      <div className="collection-toolbar">
        <h2>
          {view === "dashboard"
            ? "Pick up where you left off"
            : view === "templates"
              ? "Made for your next idea"
              : view === "trash"
                ? "Trashed projects"
                : "All your projects"}
        </h2>
        <div>
          <label className="search-field">
            <Search size={17} />
            <input
              type="search"
              aria-label={
                view === "templates" ? "Search templates" : "Search projects"
              }
              placeholder={
                view === "templates"
                  ? "Search templates"
                  : "Search your projects"
              }
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          {view === "projects" && (
            <select
              aria-label="Project status"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value === "archived" ? "archived" : "active",
                )
              }
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          )}
          {view !== "templates" && (
            <div className="segmented-control">
              <button
                aria-label="Grid view"
                aria-pressed={!listView}
                onClick={() => setListView(false)}
              >
                <Grid2X2 size={17} />
              </button>
              <button
                aria-label="List view"
                aria-pressed={listView}
                onClick={() => setListView(true)}
              >
                <List size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
      {view === "templates" ? (
        <>
          <p className="muted">Includes starter templates by <a href="https://github.com/shaongitbd/doory" target="_blank" rel="noreferrer">Siam, creator and maintainer of Doory</a>.</p>
          <div className="filter-tabs" aria-label="Template categories">
            {[
              "All",
              ...new Set(catalog.templates.map((item) => item.category)),
            ].map((item) => (
              <button
                key={item}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item === "All" ? "All templates" : item}
              </button>
            ))}
          </div>
          {filteredTemplates.length ? (
            <div className="template-grid">
              <button
                className="template-card blank-template"
                onClick={() => {
                  setFormat(
                    catalog.formats.find((item) =>
                      item.title
                        .toLowerCase()
                        .startsWith(category.toLowerCase()),
                    ),
                  );
                  setCreating(true);
                }}
              >
                <div className="template-card-art">
                  <Plus size={32} />
                  <strong>Create blank</strong>
                </div>
                <strong>Your idea, from scratch</strong>
                <span>Choose a standard or custom size</span>
              </button>
              {filteredTemplates.map((item) => (
                <button
                  className="template-card"
                  key={item.id}
                  onClick={() => setTemplate(item)}
                >
                  <div className={`template-card-art template-art--${item.id}`}>
                    <DocumentPreview
                      document={item.document}
                      page={item.document.pages[0]}
                    />
                  </div>
                  <strong>{item.title}</strong>
                  <span>
                    {item.category} · {item.document.width} ×{" "}
                    {item.document.height}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="A different search might do it"
              description="Try a shorter search or another category."
            />
          )}
        </>
      ) : query.isPending ? (
        <ProjectGridSkeleton />
      ) : query.isError ? (
        <ErrorState
          message={query.error.message}
          retry={() => void query.refetch()}
        />
      ) : !query.data.items.length ? (
        <EmptyState
          title={
            view === "trash"
              ? "Nothing in the trash"
              : search
                ? "No projects found"
                : "Your next idea goes here"
          }
          description={
            view === "trash"
              ? "Projects you move to the trash will appear here."
              : search
                ? "Try a different search."
                : "Start with a fresh canvas or make a template your own."
          }
        >
          {view !== "trash" && (
            <Button onClick={() => setCreating(true)}>
              <Plus size={16} />
              Create a design
            </Button>
          )}
        </EmptyState>
      ) : (
        <SkeletonBoundary name="project-grid" loading={false}>
          <div
            className={`project-grid ${listView ? "project-grid--list" : ""}`}
          >
            {query.data.items.map((project) => (
              <ProjectCard
                project={project}
                key={project.id}
                disabled={action.isPending}
                onAction={(type) => {
                  if (type === "delete") setDeleteId(project.id);
                  else if (type === "duplicate")
                    action.mutate({ id: project.id, type });
                  else
                    action.mutate({
                      id: project.id,
                      type: "status",
                      status:
                        type === "trash"
                          ? "trashed"
                          : type === "archive"
                            ? "archived"
                            : "active",
                    });
                }}
              />
            ))}
          </div>
        </SkeletonBoundary>
      )}
      {action.isError && (
        <p role="alert" className="error-text">
          {action.error.message}
        </p>
      )}
      {view === "dashboard" && (
        <div className="dashboard-template-prompt">
          <div>
            <LayoutTemplate size={28} />
            <span>
              <strong>A fresh perspective is waiting.</strong>
              <p>Find your next starting point in the template collection.</p>
            </span>
          </div>
          <Link className="text-link" href="/templates">
            Explore templates <ArrowRight size={17} />
          </Link>
        </div>
      )}
      <CreateProjectDialog
        open={creating}
        onOpenChange={setCreating}
        format={format}
        formats={catalog.formats}
      />
      <Modal
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete this project permanently?"
        description="The project and its saved revisions will be removed from this browser. This cannot be undone."
      >
        <div className="dialog-actions">
          <Button onClick={() => setDeleteId(null)}>Keep project</Button>
          <Button
            variant="danger"
            disabled={action.isPending}
            onClick={() => {
              if (deleteId)
                action.mutate(
                  { id: deleteId, type: "delete" },
                  { onSuccess: () => setDeleteId(null) },
                );
            }}
          >
            Delete permanently
          </Button>
        </div>
      </Modal>
      <Modal
        open={!!template}
        onOpenChange={(open) => {
          if (!open) setTemplate(undefined);
        }}
        title={template?.title ?? "Template"}
        description={template?.description ?? "Make this design your own."}
      >
        {template && (
          <>
            <div className="template-detail-preview">
              <DocumentPreview
                document={template.document}
                page={template.document.pages[0]}
              />
            </div>
            <p className="muted">
              {template.document.width} × {template.document.height} px ·{" "}
              {template.document.pages.length}{" "}
              {template.document.pages.length === 1 ? "page" : "pages"}
            </p>
            {create.isError && (
              <p role="alert" className="error-text">
                {create.error.message}
              </p>
            )}
            <Button
              className="full-width"
              variant="primary"
              disabled={create.isPending}
              onClick={() =>
                create.mutate({
                  title: template.title,
                  kind:
                    template.category === "Presentation"
                      ? "presentation"
                      : "design",
                  document: template.document,
                })
              }
            >
              {create.isPending ? "Creating your design…" : "Make it yours"}
              <ArrowRight size={16} />
            </Button>
          </>
        )}
      </Modal>
    </>
  );
}
