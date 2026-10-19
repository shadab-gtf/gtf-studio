# Landing editor demo

The landing page's studio preview is a 20-second, 1920 × 1080, 60 fps H.264
video with AAC music and click sounds. It uses actual GTF editor captures,
edited with camera moves and a cursor overlay, followed by the editor's real
animated MP4 export. The capture sequence is condensed; it is not a continuous
20-second screen recording or an interactive editor embedded in the landing page.

The movie centers and enlarges the editor. It contains no marketing side panel,
chapter copy, progress bars, or corner wordmark. Camera crops preserve the
editor's aspect ratio, use fractional positions and gentle eased movement, and track
the active controls. The final exported post is centered with a short dissolve.
Drag and resize captures are motion-interpolated to 60 fps; the exported reveal
is sampled at 60 fps. Cursor targets use viewport coordinates, including the
scrolled animation and audio panels.

The current sequence builds an ivory-and-olive fashion editorial: original portrait
upload, dragging, proportional resizing, the CASUAL headline in Italiana, prepared
supporting text pasted as editable layers, staggered Rise, audio, timeline and
60 fps MP4 export. The typography and photo were edited in the real editor;
the six supporting labels use its native clipboard format. The project is named
“Semi Casual — Editor demo”. The separate catalog template is
“Semi Casual — Fashion Editorial” under Posters, at 1728 × 2428 px.

## Published assets

- `public/media/demo/studio-walkthrough.mp4`
- `public/media/demo/studio-walkthrough-poster.webp`
- `public/media/demo/studio-walkthrough.en.vtt`

`StudioDemoVideo` previews once, muted, when at least half the player is visible.
It pauses offscreen and when the tab becomes hidden. Reduced-motion visitors get
the poster until they choose play. “Watch with sound” restarts at the beginning
with sound after a user gesture. Native controls supply seeking, captions,
volume, pause, and fullscreen. A text walkthrough is also provided.

The video is not preloaded during initial page load. Its dimensions reserve the
layout space, and MP4 faststart places the index before the media data.

## Source and editing

Local authoring files are in the ignored `artifacts/casual-demo/` directory:
`source/shots.json` and PNG captures, `template-export.mp4`, extracted reveal
frames. Keep these together when re-editing.
`scripts/render-studio-demo.mts` reads those inputs and creates the movie with
Sharp and FFmpeg; it is an offline authoring utility, not part of the app build.
With those source files, Sharp, and FFmpeg available, run:

```powershell
node --experimental-strip-types scripts/render-studio-demo.mts
```

The portrait and font sources are recorded in
`public/media/templates/ATTRIBUTION.md`. The photograph matches the supplied
reference; Italiana is a free substitute for its unidentified display font.
Italiana and Manrope load locally in both the editor and export pipeline.
The soundtrack is `Bright Side`; clicks are `click-soft`, both from the bundled
CC0 audio library (`public/media/audio/index.json`).

## Verification

`tests/unit/studio-demo-video.test.tsx` covers viewport playback, reduced motion,
explicit sound playback, rejected autoplay, and the unavailable-media fallback.
Check the actual movie in the browser after asset changes, including native
controls, mobile layout, audio, and the final exported design.
