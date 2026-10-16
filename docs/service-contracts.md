# Service contracts and backend integration

`StudioServices` is the UI-facing contract. All timestamps use ISO 8601, identifiers are stable strings, lists return `{ items, nextCursor }`, and optional cursors are opaque to the UI. Responses are validated with the same Zod models used by the local adapter.

| Method and path              | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| GET /projects                | Search/filter/paginate project summaries |
| POST /projects               | Create from a validated document         |
| GET /projects/:id            | Load metadata and document               |
| PATCH /projects/:id          | Rename, archive, trash, restore          |
| POST /projects/:id/duplicate | Duplicate with new identifiers           |
| DELETE /projects/:id         | Permanently delete                       |
| PUT /projects/:id/document   | Save `{ document, expectedRevision }`    |
| GET /projects/:id/revisions  | Recovery revisions                       |
| GET /assets                  | List local-compatible raster assets      |
| PUT /assets/:id              | Save an asset                            |
| DELETE /assets/:id           | Delete an asset                          |
| GET /brand-kits              | List color/font kits                     |
| PUT /brand-kits/:id          | Save a kit                               |
| DELETE /brand-kits/:id       | Delete a kit                             |

Mutations without response bodies return HTTP 204. Project writes return a complete project with an incremented revision. Reject outdated `expectedRevision` with HTTP 409. The adapter maps HTTP status, network, validation, timeout, and cancellation failures consistently and presents local recovery messages. Backend error envelopes are not displayed verbatim.

The client uses native Fetch, credentials included, and a 15-second timeout. Implement an appropriate cookie/CORS/CSRF policy on the server. `NEXT_PUBLIC_*` values are public build configuration and must never contain secrets. If the backend uses different envelopes, normalize them inside the HTTP adapter; pages and sections do not change.

The template catalog is bundled read-only content: original GTF designs and the licensed Doory starter set. Browser exports are local jobs. A future remote template or export service can replace these boundaries when there is a concrete backend contract.

The expanded editor has a second explicit boundary: Doory's `EditorAdapter`, implemented by `services/repositories/studio-editor-adapter.ts`. It maps project saves into the workspace document service and provides local assets, fonts, templates, element packs, brand kits, comments, and named versions. Media blobs use durable `idb://` sources; `resolveSrc` creates temporary object URLs. The `.studio` document extension must be retained by a future backend without substituting the gallery preview.

Selecting workspace API mode does not automatically make these auxiliary editor services remote. Stock search, public sharing, real-time collaboration, account requirements, and server-print export remain unavailable. Comments are attributed to this device. Portable backups call the same upload/remove/font interfaces; restore creates a new project and removes resources it created if that operation fails.
