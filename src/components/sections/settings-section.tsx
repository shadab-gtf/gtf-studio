"use client";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useServices } from "@/services/provider";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { InstallButton } from "@/features/pwa/install-prompt";
import { errorMessage } from "@/services/errors/service-error";
export function SettingsSection() {
  const { theme, setTheme } = useTheme();
  const services = useServices();
  const cache = useQueryClient();
  const [reset, setReset] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <div className="workspace-title">
        <div>
          <h1>A studio that feels like you.</h1>
          <p>A few small preferences. A more personal space.</p>
        </div>
      </div>
      <section className="settings-panel">
        <h2>Make yourself comfortable</h2>
        <div className="settings-row">
          <div>
            <strong>Appearance</strong>
            <small>Choose the light that works for you.</small>
          </div>
          <select
            aria-label="Appearance"
            value={theme ?? "light"}
            onChange={(event) => setTheme(event.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">Use device setting</option>
          </select>
        </div>
        <div className="settings-row">
          <div>
            <strong>Install GTF Studio</strong>
            <small>Your creative space, one tap away.</small>
          </div>
          <InstallButton />
        </div>
      </section>
      <section className="settings-panel">
        <h2>Your work, your device</h2>
        <p>
          Projects, images, and brand kits are stored in this browser using
          IndexedDB. They aren’t uploaded to a server or synchronized between
          devices.
        </p>
        <p>
          Clearing browser data also removes your studio. Use the editor’s
          Export menu to download a GTF document backup you can import later.
        </p>
        <div className="settings-row">
          <div>
            <strong>Automatic saving</strong>
            <small>
              Changes save shortly after you stop editing. Each project keeps
              eight revisions.
            </small>
          </div>
          <span className="muted">Always on</span>
        </div>
        <div className="settings-row">
          <div>
            <strong>Reset this workspace</strong>
            <small>
              Permanently remove projects, comments, versions, uploads, fonts,
              brand kits, and local profile data from this browser.
            </small>
          </div>
          <Button variant="danger" onClick={() => setReset(true)}>
            Reset
          </Button>
        </div>
      </section>
      <Modal
        open={reset}
        onOpenChange={setReset}
        title="Start with a clean slate?"
          description="This permanently deletes projects, comments, saved versions, uploads, fonts, brand kits, and local profile data. Download backups of your work first."
      >
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <Button onClick={() => setReset(false)}>Keep my work</Button>
          <Button
            variant="danger"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await services.resetWorkspace();
                cache.clear();
                setReset(false);
                // Drop loaded fonts, object URLs and other in-memory copies after removing storage.
                window.location.reload();
              } catch (error) {
                setError(errorMessage(error));
              } finally {
                setBusy(false);
              }
            }}
          >
            Delete local workspace
          </Button>
        </div>
      </Modal>
    </>
  );
}
