# GTF Studio

A frontend design studio with original templates, presentations, local autosave, and browser exports. Built with Next.js App Router, strict TypeScript, React, Fabric, Tailwind CSS, and IndexedDB. The primary editor uses Doory through a browser-local GTF service adapter.

## Run

Use Node 22.19+ and pnpm 12.11.2.

```sh
pnpm install --frozen-lockfile
pnpm dev --port 3100
```

Open http://localhost:3100. No credentials, database, or backend service are needed. The optional profile page stores a display name on this browser; it is not authentication.

For the install prompt and offline support, use a production build on localhost or HTTPS:

```sh
pnpm build
pnpm exec next start -p 3100
```

## Included

- Landing page, workspace, projects, template library, uploads, brand colors, trash, settings, and font credits.
- 56 original editable templates across 10 categories, including five ten-slide decks, plus 10 licensed Doory starter templates containing 13 pages. Standard presets and custom dimensions are available.
- 3,013 distinct catalog families from Google/Fontsource and Font Library. Fonts download on demand and cache locally. TTF, OTF, WOFF, and WOFF2 uploads are validated and stored on the device.
- Text, images, shapes, lines, grouped sticky notes and tables, signatures, layers, locking, alignment properties, context actions, undo/redo, and page management.
- A left-rail Tools flyout (select, draw, shapes, line, sticky note, text, signature, tables) with a freehand Draw instrument set — pen, marker, highlighter, and brush — and a full colour picker offering brand/design/default swatches, any custom colour, and linear/radial gradients with a stop editor.
- A floating action toolbar above the current selection, and whole-page selection that borders and transforms every element together.
- Element and page animations with a Canva-style panel (grouped presets, per-element and page tabs) and smooth live on-canvas hover previews.
- 26,119 elements across 27 packs, 112 bundled audio tracks/effects, local QR generation, and browser-local background removal using a pinned model.
- Autosave, local comments and named versions, cross-tab conflict detection, and portable JSON backups containing local assets and used uploaded fonts.
- Export for viewing from one menu: download a file, or create a device-local view-only link that opens the design read-only. Formats are PNG, JPG, SVG, raster PDF, and PPTX; supported text/simple shapes stay editable in PPTX while complex artwork uses raster fallback. MP4/WebM/GIF depend on browser capabilities, and presentation playback includes transitions and notes.
- Dark mode, responsive touch panels, install guidance, and offline reopening of previously visited designs.

## Quality commands

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chrome firefox webkit
# Keep the production server running on port 3100 in a second terminal.
pnpm test:e2e
pnpm run licenses
```

CI starts its own production server. Playwright includes desktop Chromium, a mobile viewport using Chromium, Firefox, and WebKit. Configured projects are not passing results; consult actual run output. Tests do not certify physical devices or PowerPoint rendering. Optional local hooks can be enabled with `pnpm exec husky`.

## Integration and limits

Set `NEXT_PUBLIC_DATA_MODE=api` and `NEXT_PUBLIC_API_BASE_URL` to select the workspace HTTP adapter at build time. Editor media, fonts, comments, and versions remain local; this switch alone does not provide a backend for them. See [architecture](docs/architecture.md), [service contracts](docs/service-contracts.md), and [font provenance](docs/fonts-and-assets.md).

Local documents belong to the current browser and origin. Clearing browser data removes them; download portable backups before resetting or changing devices. Portable backups embed used uploaded fonts and local media. Catalog fonts still require their provider or a local cache. Remote document assets must be downloaded and uploaded locally before a portable backup can include them.

PDF pages are raster images; SVG font embedding is best effort. PPTX does not embed font binaries, animation, or audio, and viewers can substitute fonts or lay out text differently. Browser codecs and recording permissions vary. No identical rendering or PowerPoint round-trip compatibility is promised.

Cloud authentication, public sharing, real-time collaboration, payments, hosted stock search, and PPTX import are not implemented. Local comments and versions do not synchronize across users. PWA installation is not a native app-store build. No complete Canva parity, Lighthouse score, or enterprise certification is claimed. See [security review](docs/security-review.md) for review scope and tool limitations.
