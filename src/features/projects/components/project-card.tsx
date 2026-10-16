"use client";
import Link from "next/link";
import { ContextActionMenu } from "@/components/ui/action-menu";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import {
  Archive,
  Copy,
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from "@/components/ui/icons";
import { DocumentPreview } from "@/core/renderer/document-preview";
import type { ProjectSummary } from "@/types/studio";

export function ProjectCard({
  project,
  onAction,
  disabled,
}: {
  project: ProjectSummary;
  onAction: (
    type: "duplicate" | "trash" | "restore" | "delete" | "archive",
  ) => void;
  disabled: boolean;
}) {
  const items =
    project.status === "active"
      ? [
          { label: "Make a copy", run: () => onAction("duplicate") },
          { label: "Archive", run: () => onAction("archive") },
          {
            label: "Move to trash",
            run: () => onAction("trash"),
            danger: true,
          },
        ]
      : [
          { label: "Restore project", run: () => onAction("restore") },
          {
            label: "Delete permanently",
            run: () => onAction("delete"),
            danger: true,
          },
        ];
  return (
    <ContextActionMenu actions={items.map((item) => ({ ...item, disabled }))}>
      <article className="project-card">
        <Link
          href={`/editor/${project.id}`}
          className={`project-art project-art--${project.kind}`}
          aria-label={`Edit ${project.title}`}
        >
          <DocumentPreview
            document={project}
            page={project.preview}
            label={project.title}
          />
          {project.pageCount > 1 && (
            <span className="page-count">{project.pageCount} pages</span>
          )}
        </Link>
        <div className="project-meta">
          <div>
            <Link href={`/editor/${project.id}`} className="project-title">
              {project.title}
            </Link>
            <p>
              {project.kind === "presentation" ? "Presentation" : "Design"}{" "}
              <span>·</span>{" "}
              {new Date(project.updatedAt).toLocaleDateString("en", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <Dropdown.Root>
            <Dropdown.Trigger
              className="icon-button"
              aria-label={`Options for ${project.title}`}
              disabled={disabled}
            >
              <MoreHorizontal size={20} />
            </Dropdown.Trigger>
            <Dropdown.Portal>
              <Dropdown.Content
                className="dropdown-menu"
                align="end"
                sideOffset={5}
              >
                {project.status === "active" ? (
                  <>
                    <Dropdown.Item onSelect={() => onAction("duplicate")}>
                      <Copy size={16} />
                      Make a copy
                    </Dropdown.Item>
                    <Dropdown.Item onSelect={() => onAction("archive")}>
                      <Archive size={16} />
                      Archive
                    </Dropdown.Item>
                    <Dropdown.Item
                      onSelect={() => onAction("trash")}
                      className="danger"
                    >
                      <Trash2 size={16} />
                      Move to trash
                    </Dropdown.Item>
                  </>
                ) : (
                  <>
                    <Dropdown.Item onSelect={() => onAction("restore")}>
                      <RotateCcw size={16} />
                      Restore project
                    </Dropdown.Item>
                    <Dropdown.Item
                      onSelect={() => onAction("delete")}
                      className="danger"
                    >
                      <Trash2 size={16} />
                      Delete permanently
                    </Dropdown.Item>
                  </>
                )}
              </Dropdown.Content>
            </Dropdown.Portal>
          </Dropdown.Root>
        </div>
      </article>
    </ContextActionMenu>
  );
}
