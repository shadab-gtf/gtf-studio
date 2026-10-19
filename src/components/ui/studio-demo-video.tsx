"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "@/components/ui/icons";
import styles from "./studio-demo-video.module.css";

const DEMO_SOURCE = "/media/demo/studio-walkthrough.mp4?v=3";

export function StudioDemoVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoplayAttempted = useRef(false);
  const [failed, setFailed] = useState(false);
  const [playbackMessage, setPlaybackMessage] = useState("");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pauseWhenHidden = () => {
      if (document.hidden) video.pause();
    };
    const respectMotionPreference = () => {
      if (motion.matches) video.pause();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) {
          video.pause();
        } else if (
          !autoplayAttempted.current &&
          !motion.matches &&
          !document.hidden
        ) {
          // Preview once. Scrolling back must not override a visitor's pause.
          autoplayAttempted.current = true;
          void video.play().catch(() => {
            // Native controls remain available when autoplay is blocked.
          });
        }
      },
      { threshold: [0, 0.5] },
    );

    observer.observe(video);
    document.addEventListener("visibilitychange", pauseWhenHidden);
    motion.addEventListener("change", respectMotionPreference);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      motion.removeEventListener("change", respectMotionPreference);
      video.pause();
    };
  }, []);

  async function watchWithSound() {
    const video = videoRef.current;
    if (!video) return;
    autoplayAttempted.current = true;
    video.currentTime = 0;
    video.muted = false;
    setPlaybackMessage("");
    video.scrollIntoView?.({
      block: "center",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    try {
      await video.play();
    } catch {
      setPlaybackMessage("Press play in the video to start the demo.");
    }
  }

  return (
    <figure className={styles.demo}>
      <div className={styles.screen}>
        <video
          ref={videoRef}
          className={styles.video}
          width={1920}
          height={1080}
          poster="/media/demo/studio-walkthrough-poster.webp?v=3"
          preload="none"
          muted
          playsInline
          controls
          aria-label="GTF Studio: create and export a design in 20 seconds"
          aria-describedby="studio-demo-description"
          onError={() => setFailed(true)}
          onPlay={() => {
            autoplayAttempted.current = true;
          }}
        >
          <source src={DEMO_SOURCE} type="video/mp4" />
          <track
            kind="captions"
            src="/media/demo/studio-walkthrough.en.vtt"
            srcLang="en"
            label="English"
          />
          <a href={DEMO_SOURCE}>Download the 20-second editor demo</a>
        </video>
        {failed && (
          <p className={styles.error} role="alert">
            The video couldn’t load.{" "}
            <a href={DEMO_SOURCE} download>
              Download the demo
            </a>{" "}
            to watch it.
          </p>
        )}
      </div>
      <figcaption className={styles.caption}>
        <p className={styles.description} id="studio-demo-description">
          Create an editorial fashion poster, from blank canvas to animated
          export, in this condensed 20-second editor walkthrough.
        </p>
        <button
          className={styles.soundButton}
          type="button"
          onClick={watchWithSound}
          disabled={failed}
        >
          <Play size={17} aria-hidden="true" />
          Watch with sound
        </button>
      </figcaption>
      <p className={styles.status} role="status">
        {playbackMessage}
      </p>
      <details className={styles.transcript}>
        <summary>Read the walkthrough</summary>
        <p>
          Start with a blank portrait canvas and choose an ivory background.
          Upload the green-blazer portrait, drag it into place and resize it.
          Add the CASUAL headline, style it with Italiana and olive color, and
          paste the prepared supporting text. Apply Rise to the composition. Add
          the Bright Side soundtrack, inspect the timeline, and export a 60 fps
          MP4 with sound. The finished editorial poster is revealed. Upbeat
          instrumental music and soft clicks accompany the demo; there is no
          spoken narration.
        </p>
      </details>
    </figure>
  );
}
