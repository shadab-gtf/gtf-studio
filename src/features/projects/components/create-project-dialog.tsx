"use client";
import { useState } from "react";
import { createDocument } from "@/core/document/schema";
import { toStudioDocument } from "@/features/studio/document-bridge";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useCreateProject } from "@/features/projects/hooks/use-projects";
import type { Format } from "@/types/studio";

function CreateForm({
  format,
  formats,
}: {
  format?: Format;
  formats: Format[];
}) {
  const create = useCreateProject();
  const [title, setTitle] = useState("");
  const [preset, setPreset] = useState(format?.id ?? "custom");
  const [width, setWidth] = useState(1080),
    [height, setHeight] = useState(1080);
  const selected =
    formats.find((item) => item.id === preset) ??
    (preset === format?.id ? format : undefined);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const document = createDocument(
          selected?.width ?? width,
          selected?.height ?? height,
        );
        if (selected?.printDpi)
          document.studio = {
            ...toStudioDocument(document),
            meta: { presetId: selected.id, printDpi: selected.printDpi },
          };
        create.mutate({
          title:
            title.trim() ||
            `Untitled ${selected?.title.toLowerCase() ?? "design"}`,
          kind: selected?.kind ?? "design",
          document,
        });
      }}
    >
      <label className="field">
        Project name
        <input
          autoFocus
          maxLength={120}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="My next big idea"
        />
      </label>
      <label className="field">
        Design size
        <select
          value={preset}
          onChange={(event) => setPreset(event.target.value)}
        >
          <option value="custom">Custom dimensions</option>
          {formats.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title} · {item.description}
            </option>
          ))}
        </select>
      </label>
      <div className="field-row">
        <label className="field">
          Width (px)
          <input
            type="number"
            min={64}
            max={8000}
            required
            value={selected?.width ?? width}
            disabled={!!selected}
            onChange={(event) => setWidth(Number(event.target.value))}
          />
        </label>
        <label className="field">
          Height (px)
          <input
            type="number"
            min={64}
            max={8000}
            required
            value={selected?.height ?? height}
            disabled={!!selected}
            onChange={(event) => setHeight(Number(event.target.value))}
          />
        </label>
      </div>
      <p className="panel-hint">
        Print presets use 300 pixels per inch. Add printer-specific bleed before
        sending artwork to print.
      </p>
      {create.isError && (
        <p role="alert" className="error-text">
          {create.error.message}
        </p>
      )}
      <Button
        variant="primary"
        type="submit"
        className="full-width"
        disabled={create.isPending}
      >
        {create.isPending ? "Creating your canvas…" : "Create design"}
      </Button>
    </form>
  );
}
export function CreateProjectDialog({
  open,
  onOpenChange,
  format,
  formats = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  format?: Format;
  formats?: Format[];
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Start with a fresh canvas"
      description="Give your idea a name and choose the right dimensions."
    >
      <CreateForm
        key={format?.id ?? "custom"}
        format={format}
        formats={formats}
      />
    </Modal>
  );
}
