# Reference feature audit

This investigation separates source evidence from behavior verified in a running application. It does not certify either reference as production ready.

## Evidence and scope

| Reference    | Pinned source                                                             | REA evidence                                                                                                      |
| ------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Doory        | `shaongitbd/doory` commit `96de4342093f277912ffd5c2a4137c3ca027b6b1`      | `artifacts/rea-doory.json`, evidence `ev_4f62bac6e6fdd5f86c1ff5d0a0b392a7300a96125b49cf29e336f7560f655486`        |
| Canva Editor | `kenvinlu/canva-editor` commit `ce54ec9ee6ae84393c50520877b41e27a84d9674` | `artifacts/rea-canva-editor.json`, evidence `ev_482562ea649d8f773c572099c428060a28bf16d32c27f64f7d7f21c650499643` |

REA's JavaScript application analyzer parsed 938 Doory JavaScript/TypeScript files with no parse failures, and 427 Canva Editor files with one parse failure. The Doory graph reports partial, truncated semantic coverage and resource limits; the Canva Editor graph has unresolved relationships. Both evidence envelopes have derived confidence. REA explicitly states that the source was parsed as inert text, and static relationships do not prove runtime execution. The two full reference applications have not been started for this audit. The GTF-specific MCP investigation is separate from these source records.

The follow-up source reads below resolve practical integration questions. A feature appearing in source or in an upstream test is evidence of an implementation, not evidence that it passes in GTF Studio. GTF behavior must be exercised after integration.

## Architecture and integration boundary

Doory's `frontend/src/editor/EditorApp.tsx` accepts a document, metadata, and an `EditorAdapter`. `frontend/src/types/adapter.ts` defines persistence, asset resolution/upload, font/element/template catalogs, optional brand kits, stock, versions, sharing, comments and real-time capabilities. Its canvas engine is Fabric, not Konva. A GTF integration must keep its document representation explicit and versioned; silently passing the existing Konva document into this engine would lose fields or fail.

The useful seam is the adapter. Keep the Next.js route server component, load the interactive editor below that boundary, preserve GTF's UI/theme, and implement browser-local adapters against IndexedDB. The reference `guestAdapter.ts` is insufficient by itself: it still calls HTTP font, element and template catalogs through `createPublicServices()`.

Do not import Doory's Vite application shell, React Router, Django authentication, backend settings or real-time transport into the GTF page tree. Its editor uses module CSS and explicit services, so those shell concerns can remain outside the integrated feature.

## Frontend integration checklist

| Capability                                                                         | Source evidence                                                                   | GTF integration requirement                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rich text, lists, curved text, font uploads/pairings                               | `frontend/src/editor/fonts/`, `toolbar/`, `engine/objects/`                       | Bridge the existing 3,013-family catalog and local uploaded font binaries; preserve font availability warnings and test export after reloading.                                                                                                         |
| Shapes, lines/arrows, layers, groups, transforms, snapping, rulers, per-page sizes | `frontend/src/editor/engine/`, `workspace/`, `panels/`                            | Preserve editable object data, group relationships and undo history; do not flatten to preview images for persistence.                                                                                                                                  |
| Image crop, masks, filters, recoloring                                             | `frontend/src/editor/engine/objects/`, `toolbar/`                                 | Resolve local asset URLs lazily, reject unavailable/corrupt assets clearly, retain original images for non-destructive editing.                                                                                                                         |
| Background removal                                                                 | `frontend/src/editor/engine/bgRemoval/`                                           | Install verified same-origin model and WASM assets, adapt the Vite `?url` import in `bundled.ts`, and initialize `configureBackgroundRemoval` from static configuration. Test worker cancellation and actual cutout.                                    |
| Graphics, emoji, illustrations, frames, QR                                         | `frontend/src/editor/panels/`, `backend/data/element_packs.json`                  | Serve licensed SVG catalogs as static assets. QR generation is browser-local. Keep Iconsax for GTF interface icons independently of artwork packs.                                                                                                      |
| Music, sound effects, uploaded audio, microphone recording                         | `frontend/src/editor/audio/`, `panels/Audio*`, `builtins/audio.tsx`               | Serve static audio index and files, persist uploads as blobs, preserve permission/error states for recording and browser codec fallback.                                                                                                                |
| Animation, page transitions, timeline                                              | `frontend/src/editor/animation/`, `workspace/TimelineLoader.tsx`                  | Keep intent in the persisted document; test playback, save/reopen, reduced motion and exports.                                                                                                                                                          |
| Presentation, timing, notes and presenter window                                   | `frontend/src/editor/presenter/`                                                  | Adapt the separate Vite presenter HTML entry to a Next route or supported local window; keep cross-window channel scoped to the document/session.                                                                                                       |
| PNG/JPEG/SVG/PDF and MP4/WebM/GIF                                                  | `frontend/src/editor/engine/export/`                                              | Lazy-load format modules and perform real downloads. Browser PDF is raster at 300 dpi with vector crop marks; do not label it fully editable/vector. Video depends on WebCodecs support. Keep GTF's PPTX path explicit about supported object fidelity. |
| Templates and project recovery                                                     | `frontend/src/types/adapter.ts`, `engine/persistence*`, `backend/data/templates/` | Adapt existing original GTF templates and local revision storage; test multi-page apply, blank choice, failed save and reopening.                                                                                                                       |
| Brand kits, comments, named versions                                               | Optional adapter services                                                         | Can be local-only with truthful wording and durable local persistence. They are not multi-user collaboration until a backend exists.                                                                                                                    |
| Shared links, permissions, real-time collaboration, authenticated stock search     | `frontend/src/features/editor/adapters/`, backend services                        | Keep unavailable for the frontend release. A local URL or fake account does not provide public sharing, authorization or remote synchronization. Stock API credentials must not enter the client.                                                       |

## Canva Editor differences

The Canva Editor README labels its project unstable, marks PNG/PDF export in progress, and lists real-time collaboration and its plugin system as planned. Those are not verified completed capabilities to import.

Its core uses DOM/SVG layers and ProseMirror-based text, not Doory's Fabric objects. `libs/canva-editor/src/layers/text/textEffect.ts` and `utils/settings/sidebar/TextEffectSidebar.tsx` expose eight named text treatments: shadow, lift, hollow, splice, echo, neon, glitch and outline. Doory's inspected effects controls implement shadow, hollow, outline, glow and highlight; lift/splice/echo/glitch therefore remain explicit parity items rather than being assumed covered by basic shadow/glow.

Other distinctions to preserve as product requirements are frame image replacement/cropping (`layers/content/FrameContent.tsx`), template preview, sortable page/layer interfaces, and its Next.js shell's internationalization. Most core editing operations overlap Doory. A `Video` layer type name alone is not proof of a working video editor; the inspected resolver and implementation must back any such claim.

No Canva Editor source is required for the independently implemented GTF effect UI. Copying its source would introduce its separate no-resale license condition.

## Static assets and rebuild

`node scripts/sync-studio-assets.mjs` provisions editor assets from the pinned reference checkout (override its location with `DOORY_SOURCE`). It runs only standalone, standard-library Python geometry generators; it does not install or start Django. Python is needed for regeneration, not for the built frontend.

- `/media/audio/index.json`: upstream schema-1 audio catalog. All 112 committed Ogg files (24 music, 88 sound effects; 6,924,963 bytes) were checked against upstream size and SHA-256 before copying. These original audio works are CC0-1.0.
- `/studio-assets/background-removal.json`: `features` and `assets.background_removal_model` match the engine's configuration seam. The 4,574,861-byte U²-Net small model is pinned to SHA-256 `309c8469258dda742793dce0ebea8e6dd393174f89934733ecc8b14c76f4ddd8`. Inference still requires the browser worker and ONNX runtime/WASM integration.
- `/studio-assets/elements.json`: `{ schema: 1, packs: ElementPack[], items: ElementItem[] }` with **26,119 elements in 27 packs** and same-origin SVG URLs. This includes 572 generated geometric assets, pinned icon/emoji packs and all 125 indexed illustrations; no entries were rejected or unavailable in this provisioning run.
- `/studio-assets/packs.json` and `/studio-assets/catalogs/{packId}.json` allow loading only selected catalogs.
- `/studio-assets/provenance.json`: exact installed counts, model provenance, each written SVG's SHA-256 and any rejected/unavailable entries.
- `/studio-assets/licenses/`: notices and license texts distributed with the catalog.

Pinned npm archives are checked against the reference manifest's SHA-512 integrity before reading assets. The script reads archive members in memory and never executes package scripts. URL illustration sources are SHA-256 checked. SVGs with active content or external image/href resources are rejected. Unavailable illustration sources are recorded; they must not be included in displayed catalog counts.

## License obligations

## Integrated starter templates and GTF extensions

The pinned Doory checkout contains exactly 10 starter template documents with 13 pages, not a production-scale template database. They are now validated in `services/mocks/doory-templates.ts`, with full editable documents, 10 thumbnails, and five local photos. `scripts/sync-doory-templates.mjs` records original-file SHA-256 hashes and license evidence under `public/studio-assets/licenses/doory-templates`. All 11 font families used by these templates exist in GTF's 3,013-family catalog.

Doory's specific THIRD_PARTY.md template entry assigns the Attribution Assurance License; its generic NOTICE ending contains conflicting MIT wording. Distribution retains all notices and follows the specific template license and required creator/source attribution. The photos are separately listed as CC0. No restricted Canva Editor code was copied.

GTF's original PPTX extension uses the public export registry, keeps supported native text/shapes editable, and rasterizes complex runs in z-order. Portable JSON backups preserve local media and used uploaded fonts through the adapter, create fresh projects, and roll back failed restores. These features have focused behavior tests. Actual presentation-viewer fidelity and all browser codecs still need separate verification.

## License obligations

Doory's application code is under the Attribution Assurance License. Its source license/notice is retained at `licenses/doory/`. Any launch of a redistributed program using that code must prominently attribute **Siam, Creator and maintainer of Doory**, with `https://github.com/shaongitbd/doory`; a hidden credits page alone does not satisfy the stated launch-display condition. GTF branding can coexist with that attribution. The code's license and the independently licensed artwork/audio are distinct.

Canva Editor's license is MIT with an additional no-resale clause. It permits operating websites and selling services, but prohibits reselling or sublicensing the software or modified versions without written permission. It should not be described as ordinary MIT.

U²-Net's pinned upstream repository carries Apache-2.0. The upstream Doory manifest records the weight provenance and training-data uncertainty; pinning a model hash proves identity, not independent training-data clearance. Keep the model license and provenance with distribution. Icon/illustration pack notices travel in the static catalog; generated original geometry/audio use CC0.
