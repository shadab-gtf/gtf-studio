import { StrictMode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VideoResult } from "@/vendor/doory/editor/dialogs/video/VideoResult";
import type { VideoResult as ExportResult } from "@/vendor/doory/editor/engine/export/video/types";

const scrollDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");

afterEach(() => {
  cleanup();
  if (scrollDescriptor) {
    Object.defineProperty(Element.prototype, "scrollIntoView", scrollDescriptor);
  } else {
    Reflect.deleteProperty(Element.prototype, "scrollIntoView");
  }
  vi.restoreAllMocks();
});

describe("finished video preview", () => {
  it("stays usable when scrolling returns a Promise, including effect cleanup", () => {
    const scrollIntoView = vi.fn(() => Promise.resolve());
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    const result: ExportResult = {
      blob: new Blob(["video"], { type: "video/mp4" }),
      filename: "design.mp4",
      mime: "video/mp4",
      format: "mp4",
      durationMs: 6000,
      width: 1080,
      height: 1080,
      fps: 30,
      frames: 180,
      video: "H.264",
      audio: "AAC",
      warnings: [],
      elapsedMs: 100,
    };
    const { unmount } = render(
      <StrictMode>
        <VideoResult result={result} url="blob:finished-video" />
      </StrictMode>,
    );

    expect(screen.getByTestId("video-result")).toHaveAttribute("data-format", "mp4");
    expect(screen.getByTestId("video-preview")).toHaveAttribute("src", "blob:finished-video");
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
    expect(() => unmount()).not.toThrow();
  });
});
