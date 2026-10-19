# Validation

Development writes to `.next-dev/`; production builds use `.next/`. This keeps a parallel build from removing the running development server's files. Restart the development server after changing dependencies or switching package managers so it does not retain modules from the old installation.

Unit tests exercise schema rejection, template coverage, unique IDs, command history, SVG escaping, persisted transactions, revision conflicts, project lifecycle, pagination/cancellation, HTTP validation/errors, and font-catalog uniqueness/license metadata.

Playwright tests run against the production build. They create a blank design, edit text, await autosave, reload, undo, browse templates, create and present a ten-slide deck, draw a stroke, reopen offline, load/upload fonts, use context actions, and download actual export files. Desktop and mobile viewport workflows run in Chromium. The live font test intentionally contacts the provider; it can detect provider outages and should not be interpreted as an application-only regression.

Use `node scripts/capture-ui.mjs` for landing, dashboard, templates, and editor captures at 1440 and 390 px. Boneyard skeleton captures can be refreshed with:

```sh
pnpm exec boneyard-js build http://localhost:3100/dashboard http://localhost:3100/editor/welcome-bloom --breakpoints '390,768,1440' --wait 2500 --out ./src/bones --no-scan
```

REA analyzed the pinned references before integration. A task-local REA MCP and snapshot subsequently enabled source investigation on this Windows host; `artifacts/rea-gtf-mcp-summary.json` covers that snapshot, not the entire final source tree. `rea-studio-text-runtime.json` records a complete local Chrome scenario opening the studio canvas and double-clicking text. `rea-expanded-before.json` records the editor's pre-change state. The earlier `rea-gtf-runtime-before.json` capture is incomplete because its locator matched several project cards; it is not a passing workflow. See [reference evidence](reference-feature-audit.md).

Expanded studio tests cover text editing, undo/autosave/reload, images/fonts, groups, actual PNG/SVG/PDF downloads, templates/presentation, dark mode, and touch geometry. Playwright now configures desktop Chrome, mobile Chromium, Firefox, and WebKit; install browser binaries before running. Configured projects are not passing results. A mobile viewport is not a physical-device test.

The studio export unit tests check native/raster planning and generated PPTX Open XML, including editable text/shapes, notes, page counts, and registry preservation. Backup tests verify media/font round trips, fresh identifiers, rollback, bounded reads, and remote-URL rejection. Template tests validate 10 Doory templates containing 13 editable pages. Structural PPTX tests do not render PowerPoint.

Strix was not installed or run. The local free-only setup lacks a running Docker daemon, Strix CLI, and configured local model/provider. Source review and targeted tests are not a penetration test. Remaining checks also include animation/audio/video codecs, background-removal cancellation, quota errors, and large-document memory use.

Before a public launch, validate exported PPTX files in the actual target viewers, test physical low-memory devices and WebKit/Firefox, measure representative large documents and Lighthouse, and complete a manual screen-reader review. The current automated checks do not establish a Lighthouse 95 score, WCAG conformance certification, or full PowerPoint round-trip compatibility.
