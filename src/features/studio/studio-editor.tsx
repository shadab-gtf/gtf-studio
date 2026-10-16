"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useServices } from "@/services/provider";
import { createStudioEditorAdapter } from "@/services/repositories/studio-editor-adapter";
import { EditorApp } from "@/vendor/doory/editor/EditorApp";
import type { EditorHandle } from "@/vendor/doory/types/adapter";
import { toStudioDocument, withStudioDocument } from "./document-bridge";
import { registerStudioExports } from "./export/studio-pptx";
import { StudioBackupControls } from "./backup/backup-controls";
import { Brand } from "@/components/ui/brand";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { Project, StudioCatalog } from "@/types/studio";
import "./studio-theme.css";
import { configureBackgroundRemoval } from "@/vendor/doory/editor/engine/bgRemoval/install";
import removalConfig from "../../../public/studio-assets/background-removal.json";

configureBackgroundRemoval(removalConfig);
registerStudioExports();

export default function StudioEditor({ project, catalog }: { project: Project; catalog: StudioCatalog }) {
  const services = useServices();
  const router = useRouter();
  // A shared "view-only" link opens the design read-only; editing links (and normal opens) stay in account mode.
  const viewOnly = useSearchParams()?.get("view") === "1";
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [connection] = useState(() => createStudioEditorAdapter(project, catalog, services));
  const [document] = useState(() => toStudioDocument(project.document));
  const [title, setTitle] = useState(project.title);
  const editor = useRef<EditorHandle>(null);
  const cleanup = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (cleanup.current) clearTimeout(cleanup.current);
    connection.bindDocument(() => editor.current?.getDocument() ?? document);
    return () => { cleanup.current = setTimeout(() => connection.dispose(), 0); };
  }, [connection, document]);
  async function recoverCopy() {
    if (!editor.current) return;
    setRecoveryError(null);
    try {
      const copy = await services.projects.create({ title: `${title.slice(0,100)} (recovered copy)`, kind: project.kind, document: withStudioDocument(editor.current.getDocument()) });
      router.push(`/editor/${copy.id}`);
    } catch (cause) {
      setRecoveryError(cause instanceof Error ? cause.message : "Unable to save a recovery copy. Please retry.");
    }
  }
  return <main id="main" className="gtf-studio-shell  " >
    <aside className="studio-attribution" aria-label="Editor attribution">
      <span>Editor engine by <strong>GTF Studio</strong>, creator and maintainer of GTF Studio.</span>
      
    </aside>
    {recoveryError && <div role="alert">{recoveryError}</div>}
    <div className="studio-surface"><EditorApp ref={editor} document={document} meta={{ id: project.id, title, mode: viewOnly ? "shared-view" : "account", revision: project.revision }} adapter={connection.adapter} onTitleChange={setTitle}
      onConflictResolve={choice => { if (choice === "reload") window.location.reload(); else void recoverCopy(); }}
      topBarStart={<div className="gtf-studio-home"><Brand compact href="/projects" /></div>}
      topBarEnd={<><StudioBackupControls getDocument={() => editor.current?.getDocument() ?? document} title={title} adapter={connection.adapter} services={services} onImported={copy => router.push(`/editor/${copy.id}`)} /><ThemeToggle /></>} />
    </div>
  </main>;
}
