"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Archive, Download, Upload, X } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import type { DoryDocument } from "@/vendor/doory/types/document";
import type { EditorAdapter } from "@/vendor/doory/types/adapter";
import type { StudioServices } from "@/services/contracts/studio-service";
import type { Project } from "@/types/studio";
import { downloadBlob } from "@/features/export/export-document";
import { sanitizeFilename } from "@/vendor/doory/editor/engine/export/registry";
import { withStudioDocument } from "../document-bridge";
import { createBackupResources } from "./backup-resources";
import {
  createStudioBackup,
  MAX_BACKUP_BYTES,
  parseStudioBackup,
  restoreStudioBackup,
} from "./portable-backup";
import styles from "./backup-controls.module.css";

interface StudioBackupControlsProps {
  getDocument(): DoryDocument;
  title: string;
  adapter: EditorAdapter;
  services: StudioServices;
  onImported(project: Project): void;
}

export function StudioBackupControls({
  getDocument,
  title,
  adapter,
  services,
  onImported,
}: StudioBackupControlsProps) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"export" | "import" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const resources = () => createBackupResources(adapter, services.fonts);

  async function download() {
    setBusy("export");
    setError(null);
    setMessage("Preparing your editable backup…");
    try {
      const backup = await createStudioBackup(
        getDocument(),
        title,
        resources(),
      );
      downloadBlob(
        new Blob([JSON.stringify(backup)], { type: "application/json" }),
        `${sanitizeFilename(title) || "GTF-design"}.gtf-backup.json`,
      );
      setMessage("Backup downloaded with local media and uploaded fonts.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The backup could not be created. Please retry.",
      );
      setMessage("");
    } finally {
      setBusy(null);
    }
  }

  async function restore(file: File) {
    setBusy("import");
    setError(null);
    setMessage("Checking and restoring your backup…");
    try {
      if (file.size > MAX_BACKUP_BYTES)
        throw new Error("Choose a GTF backup smaller than 64 MB.");
      const backup = parseStudioBackup(await file.text());
      const project = await restoreStudioBackup(
        backup,
        resources(),
        (document, name) =>
          services.projects.create({
            title: name,
            kind: document.pages.length > 1 ? "presentation" : "design",
            document: withStudioDocument(document),
          }),
      );
      setMessage("Backup restored as a new project.");
      onImported(project);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The backup could not be restored. Please retry.",
      );
      setMessage("");
    } finally {
      setBusy(null);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={styles.trigger}
          aria-label="Back up or restore design"
          title="Back up or restore design"
        >
          <Archive size={20} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={styles.dialog}
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          <div className={styles.heading}>
            <div>
              <Dialog.Title>Keep a copy of your work</Dialog.Title>
              <Dialog.Description>
                Save an editable GTF backup, or restore one as a new project.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className={styles.close}
                aria-label="Close backup dialog"
                disabled={!!busy}
              >
                <X size={22} />
              </button>
            </Dialog.Close>
          </div>
          <div className={styles.options} aria-busy={!!busy}>
            <div>
              <Download size={26} />
              <h3>Download a backup</h3>
              <p>
                Includes local images, audio and uploaded fonts. Catalog fonts
                remain linked to the font library.
              </p>
              <Button onClick={() => void download()} disabled={!!busy}>
                {busy === "export" ? "Preparing backup…" : "Download backup"}
              </Button>
            </div>
            <div>
              <Upload size={26} />
              <h3>Restore a backup</h3>
              <p>
                Choose a .gtf-backup.json file up to 64 MB. Your current design
                stays in your projects.
              </p>
              <Button onClick={() => input.current?.click()} disabled={!!busy}>
                {busy === "import" ? "Restoring backup…" : "Choose backup"}
              </Button>
              <input
                ref={input}
                type="file"
                accept=".json,application/json"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void restore(file);
                }}
              />
            </div>
          </div>
          {error ? (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          ) : (
            <p role="status" className={styles.status}>
              {message}
            </p>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
