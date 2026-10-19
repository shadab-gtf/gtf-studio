"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DocumentPreview } from "@/core/renderer/document-preview";
import type { CreativeDocument } from "@/core/document/schema";
import styles from "./design-viewer.module.css";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const clampZoom = (value: number) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 100) / 100));

/**
 * Renders a design read-only with nothing but the artwork and a small zoom control. All pages are stacked so
 * multi-page documents can be scrolled through. No header, footer, logo, or editor chrome — it reuses the pure
 * DocumentPreview renderer, so it needs no services or providers and works for any format.
 */
export function DesignViewer({
  document: doc,
  title,
}: {
  document: CreativeDocument;
  title?: string;
}) {
  const [zoom, setZoom] = useState(1);
  const [current, setCurrent] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pages = doc.pages;
  const multiPage = pages.length > 1;

  const zoomIn = useCallback(() => setZoom((z) => clampZoom(z * 1.25)), []);
  const zoomOut = useCallback(() => setZoom((z) => clampZoom(z / 1.25)), []);
  const resetZoom = useCallback(() => setZoom(1), []);

  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomIn();
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        zoomOut();
      } else if (event.key === "0") {
        event.preventDefault();
        resetZoom();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomIn, zoomOut, resetZoom]);

  // Ctrl/Cmd + wheel zooms the artwork instead of the browser page.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      setZoom((z) => clampZoom(z * (event.deltaY < 0 ? 1.1 : 0.9)));
    };
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  const onScroll = useCallback(() => {
    if (!multiPage) return;
    const container = scrollRef.current;
    if (!container) return;
    const middle = container.scrollTop + container.clientHeight / 2;
    let nearest = 1;
    let nearestDistance = Infinity;
    pageRefs.current.forEach((element, index) => {
      if (!element) return;
      const center = element.offsetTop + element.offsetHeight / 2;
      const distance = Math.abs(center - middle);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index + 1;
      }
    });
    setCurrent(nearest);
  }, [multiPage]);

  return (
    <div
      className={styles.viewer}
      ref={scrollRef}
      onScroll={onScroll}
      role="region"
      aria-label="Design preview"
    >
      <div
        className={styles.pages}
        style={{ ["--zoom"]: zoom } as React.CSSProperties}
      >
        {pages.map((page, index) => (
          <div
            className={styles.page}
            key={page.id}
            ref={(element) => {
              pageRefs.current[index] = element;
            }}
          >
            <DocumentPreview
              document={doc}
              page={page}
              label={multiPage ? `Page ${index + 1} of ${pages.length}` : "Design"}
            />
          </div>
        ))}
      </div>
      <div className={styles.controls} role="toolbar" aria-label="Zoom">
        <button
          type="button"
          className={styles.btn}
          onClick={zoomOut}
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          type="button"
          className={styles.pct}
          onClick={resetZoom}
          aria-label="Reset zoom to 100 percent"
          title="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          className={styles.btn}
          onClick={zoomIn}
          aria-label="Zoom in"
        >
          +
        </button>
        {multiPage && (
          <span className={styles.pageInfo} aria-live="polite">
            {current} / {pages.length}
          </span>
        )}
      </div>
    </div>
  );
}
