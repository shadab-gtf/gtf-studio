"use client";
import Image from "next/image";
import { useRef } from "react";
import { Trash2, Upload } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/feedback/states";
import { ProjectGridSkeleton } from "@/components/feedback/skeletons";
import { useAssetLibrary } from "@/features/assets/use-assets";
export function AssetsSection() {
  const { query, upload, remove } = useAssetLibrary();
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <div className="workspace-title">
        <div>
          <h1>Your own kind of inspiration.</h1>
          <p>A home for the images that make your work yours.</p>
        </div>
      </div>
      <input
        ref={input}
        type="file"
        className="sr-only"
        aria-label="Upload an image"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload.mutate(file);
          event.target.value = "";
        }}
      />
      <div
        className="upload-zone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) upload.mutate(file);
        }}
      >
        <Upload size={30} />
        <h2>Drop a little inspiration here.</h2>
        <p>PNG, JPG, WebP, or GIF. Up to 8 MB per image.</p>
        <Button
          variant="primary"
          disabled={upload.isPending}
          onClick={() => input.current?.click()}
        >
          <Upload size={17} />
          {upload.isPending ? "Adding your image…" : "Choose an image"}
        </Button>
      </div>
      {(upload.isError || remove.isError) && (
        <p role="alert" className="error-text">
          {upload.error?.message || remove.error?.message}
        </p>
      )}
      {query.isPending ? (
        <ProjectGridSkeleton />
      ) : query.isError ? (
        <ErrorState
          message={query.error.message}
          retry={() => void query.refetch()}
        />
      ) : query.data.length === 0 ? (
        <EmptyState
          title="Make this space your own"
          description="Upload an image to use it in any design. Your files stay on this device."
        />
      ) : (
        <div className="asset-grid">
          {query.data.map((asset) => (
            <article className="asset-card" key={asset.id}>
              <Image
                src={asset.src}
                alt={asset.name}
                width={320}
                height={200}
                unoptimized
              />
              <div>
                <strong>{asset.name}</strong>
                <button
                  className="icon-button"
                  aria-label={`Remove ${asset.name} from uploads`}
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(asset.id)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
