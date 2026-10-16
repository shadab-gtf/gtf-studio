# Security review and boundaries

This is a source-review and regression-test record for the frontend-only app, not a penetration test or certification. Local profiles, comments, and versions are not authenticated identities or multi-user collaboration. No active backend, public sharing, real-time transport, or stock-provider credentials are in scope.

Documents, clipboard objects, uploaded images/SVG/audio/fonts, and backups are untrusted. Studio validation checks supported objects, finite geometry, source schemes, styles, paths, filters, effects, audio, and graph budgets. Limits include 1,000 nested objects per page and 10,000 per document. Clipboard size/schema checks occur before Fabric instantiation; destination capacity is checked again at insertion.

Uploaded images are limited to 25 MiB, 40 megapixels, and 16,384 pixels per side. Pixel checks occur after browser decoding and before downstream canvas/storage work; they do not provide a pre-decoder memory guarantee. SVG uploads are used as image resources rather than arbitrary HTML. Fonts have signature checks, sanitized family names, and FontFace parsing. Browser decoder safety still requires updated browsers.

Portable backups use bounded JSON and base64 resources, not ZIP import: 64 MiB package, 40 MiB embedded-resource budget, and individual file/count limits. Missing dependencies, unsupported remote assets, invalid font signatures, and unused embedded resources are rejected. Restore creates new IDs/family names and removes created resources on failure.

Revision checks prevent silent stale saves. Permanent project deletion cascades to local comments/versions and blocks stale auxiliary writes. Workspace reset clears project/editor/font/audio databases, relevant waveform caches, and local preferences; blocked deletion is reported. See the schema, adapter, storage-cleanup, and backup unit tests for exercised boundaries and actual run output for pass status.

`fflate` is pinned to 0.8.3. A development-only braces 3.0.3 advisory remains through Next ESLint tooling, with repository-controlled lint patterns and no identified application runtime path. See [dependency review](dependency-review.md).

Strix has **not** been installed or run. Docker CLI 29.7.2 is present but its daemon is stopped; Strix CLI, Ollama/local model, `STRIX_LLM`, and `LLM_API_BASE` are absent. The requested free-only local setup is therefore not ready. No API key was supplied and no paid scan was started. REA source/runtime evidence is separate and must not be described as a Strix scan.

Source review does not establish exploitability or absence of vulnerabilities. Remaining work includes representative resource-exhaustion and malformed-media testing in isolated browser environments, physical-device memory checks, manual export/viewer review, and dependency re-audits. Future backends must independently enforce authorization, request/file validation, revisions, and storage quotas.
