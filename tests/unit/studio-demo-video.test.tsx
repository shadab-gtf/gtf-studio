import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioDemoVideo } from "@/components/ui/studio-demo-video";

let reducedMotion = false;
let notifyVisibility: (visible: boolean) => void;

beforeEach(() => {
  reducedMotion = false;
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.stubGlobal("matchMedia", () => ({
    matches: reducedMotion,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal(
    "IntersectionObserver",
    class implements IntersectionObserver {
      root = null;
      rootMargin = "0px";
      thresholds = [0, 0.5];
      disconnect = vi.fn();
      unobserve = vi.fn();
      takeRecords = () => [];
      constructor(private callback: IntersectionObserverCallback) {}
      observe(target: Element) {
        notifyVisibility = (visible) =>
          this.callback(
            [
              {
                target,
                time: 0,
                isIntersecting: visible,
                intersectionRatio: visible ? 1 : 0,
                boundingClientRect: target.getBoundingClientRect(),
                intersectionRect: target.getBoundingClientRect(),
                rootBounds: null,
              },
            ],
            this,
          );
      }
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("landing editor demo", () => {
  it("previews only when visible, pauses offscreen, and does not force a restart", async () => {
    render(<StudioDemoVideo />);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    await act(async () => notifyVisibility(true));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    act(() => notifyVisibility(false));
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    await act(async () => notifyVisibility(true));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  });

  it("keeps reduced-motion visitors on the poster until they choose to watch", async () => {
    reducedMotion = true;
    render(<StudioDemoVideo />);
    await act(async () => notifyVisibility(true));
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    const video = screen.getByLabelText(
      /create and export a design/,
    ) as HTMLVideoElement;
    video.currentTime = 12;
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Watch with sound" })),
    );
    expect(video.currentTime).toBe(0);
    expect(video.muted).toBe(false);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  });

  it("keeps controls usable if autoplay is blocked and explains a failed user play", async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(
      new Error("NotAllowedError"),
    );
    render(<StudioDemoVideo />);
    await act(async () => notifyVisibility(true));
    expect(screen.getByLabelText(/create and export a design/)).toHaveAttribute(
      "controls",
    );
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Watch with sound" })),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Press play in the video",
    );
  });

  it("offers the video file when the embedded player fails", () => {
    render(<StudioDemoVideo />);
    fireEvent.error(screen.getByLabelText(/create and export a design/));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The video couldn’t load",
    );
    expect(
      screen.getByRole("button", { name: "Watch with sound" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("link", { name: "Download the demo" }),
    ).toHaveAttribute("href", "/media/demo/studio-walkthrough.mp4?v=3");
  });
});
