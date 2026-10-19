# Reference template collection

The Templates page includes 85 editable designs: five in each of the 17 unique
categories supplied in the reference screenshots. The repeated flyer screenshot
is one category. Choose **Reference collection** to browse these designs separately
from the existing catalog.

## Fidelity and assets

These are reference-inspired compositions, not verified pixel-perfect copies.
The screenshots do not identify the original fonts or all source photographs.
The Semi Casual portrait was identified as Pexels 18866328; Italiana is an open
font substitute for its unidentified headline face. Other designs use bundled,
free font and photo alternatives. They must not be described as exact original
font or photo matches. Sample names, addresses and contact details are editable
placeholders.

All artwork uses native text, image and shape layers. The WebP files in
`public/images/editorial-templates` are gallery previews only.

Font families: Anton, Bebas Neue, Six Caps, League Gothic, League Spartan,
Italiana, Bodoni Moda, Cormorant Garamond, DM Serif Display, Montserrat,
Great Vibes, Allura, Caveat, Playfair Display, Archivo Black, Space Grotesk,
and the existing Manrope. The font resolver serves the bundled weights locally
in the editor and exports. Source metadata lives in
`public/fonts/display/editorial-sources.json`; individual OFL license files are
next to the fonts. Photo sources and licenses are recorded in
`public/media/templates/editorial/sources.json`.

## Native sizes

| Category        | Canvas pixels | Intended format                 |
| --------------- | ------------- | ------------------------------- |
| Presentation    | 1920 × 1080   | 16:9                            |
| Portrait post   | 1080 × 1350   | 4:5                             |
| Poster          | 3508 × 4961   | A3, 300 dpi                     |
| Logo            | 500 × 500     | Square                          |
| Landscape video | 1920 × 1080   | Full HD                         |
| Document        | 2480 × 3508   | A4, 300 dpi                     |
| Letter          | 2550 × 3300   | US Letter, 300 dpi              |
| Flyer           | 2550 × 3300   | US Letter, 300 dpi              |
| Book cover      | 1800 × 2700   | 6 × 9 inch front cover, 300 dpi |
| Invitation      | 1500 × 2100   | 5 × 7 inch, 300 dpi             |
| Whiteboard      | 1920 × 1080   | Fixed 16:9 board                |
| Brainstorm      | 1920 × 1080   | Fixed 16:9 board                |
| Profile picture | 1080 × 1080   | Square                          |
| Story           | 1080 × 1920   | 9:16                            |
| Brochure        | 3300 × 2550   | 11 × 8.5 inch trifold, 300 dpi  |
| Invoice         | 2480 × 3508   | A4, 300 dpi                     |
| Video thumbnail | 1280 × 720    | 16:9                            |

Responsive gallery cards preserve these aspect ratios. They do not change the
document's native dimensions. The creation dialog also supports custom pixel
dimensions. Whiteboards are fixed canvases; book covers are front covers rather
than full wraps. Bleed and trim requirements remain printer-specific.

Print templates carry `meta.printDpi: 300`. The browser PDF exporter uses that
density for physical page dimensions, bleed and crop marks. Existing documents
without that metadata retain their 96 px/in behavior. This change does not alter
an external print server's contract.

## Authoring and regeneration

1. Edit native designs in `scripts/editorial/`.
2. Bundle and run the authoring entry:
   `pnpm exec esbuild scripts/editorial/build.ts --bundle --platform=node --format=esm --outfile=artifacts/reference-collection/build.mjs`
   then `node artifacts/reference-collection/build.mjs`.
3. Run `python scripts/render-editorial-templates.py` to compile native image
   crop coordinates, fit text, produce the JSON catalog and regenerate previews.

The renderer requires Pillow, fonttools and Brotli. Font and photo acquisition
scripts retain source manifests. The catalog loader validates generated documents
with the shared schema. Unit coverage checks category counts, editable layers,
local resources, native sizes and video animation/audio metadata.

## Verification on 2026-10-19

- Reviewed all 17 generated category contact sheets.
- Verified category filtering and five posters plus the blank starter in the
  real application at desktop and 390 px mobile width, without horizontal overflow.
- Opened Semi Casual from the gallery as a new editable document and downloaded
  its PDF through the editor. The PDF MediaBox is 297.011 × 420.031 mm, consistent
  with rounded A3 pixel dimensions at 300 dpi.
- Verified the creation dialog offers the selected A3 preset and accepts custom
  1200 × 1600 px dimensions.
- Proof files are under `artifacts/reference-collection/`: `gallery-desktop.png`,
  `gallery-mobile.png`, `editor-proof.png`, and `export-a3.pdf`.

This verifies structural and export behavior, not pixel equality with the
references. Original font identification remains unverified.
