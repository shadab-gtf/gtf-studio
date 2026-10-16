# Frontend architecture

Server pages in `src/app` obtain the immutable template/format catalog through `src/lib/api` and pass typed props into sections. Route loading boundaries and Suspense render layout-matched skeletons. Shared UI controls contain no project data access. Client boundaries belong to interactive features and browser APIs.

Browser-owned data is the deliberate exception to server fetching: IndexedDB cannot be read during server rendering. Feature hooks use a scoped service provider and TanStack Query to load projects, uploads, fonts, and brand kits after hydration. They never import a concrete adapter. Server processes never hold a mutable per-user singleton.

`services/contracts` defines the interface; `services/mocks` implements browser persistence; `services/http` validates REST responses through Zod. The selection happens once in `services/index.ts`. The font service remains local in both modes because font caching and custom uploads are browser capabilities in this release.

The primary `/editor/[projectId]` route dynamically loads the Fabric-based Doory editor through `features/studio`. GTF owns navigation, theme, attribution, recovery, portable backups, and the PPTX format. The reference Vite shell, React Router, Django backend, account system, and real-time transport are excluded. `services/repositories/studio-editor-adapter.ts` bridges the editor contract to GTF services and IndexedDB for media, brand kits, comments, and named versions. Optional stock, sharing, real-time, and server-print services remain unavailable.

The versioned `.studio` extension in the existing document envelope is authoritative for expanded designs; its preview projection exists for workspace cards. `features/studio/document-bridge.ts` converts original GTF elements into editable studio objects and preserves the full studio document on later saves. Studio exports operate on the editor document handle, never the preview projection. Selection, hover, panels, and viewport remain separate from persistent objects.

Editor autosave debounces document edits for 1,500 ms and title edits for 800 ms. It serializes writes and passes the expected revision. A local transaction commits the document, metadata, and recovery history together. A competing tab receives a conflict instead of overwriting newer work. The editor announces success only after persistence succeeds. Browser termination can interrupt a pending write; recovery can create a new project from the current editor document.

Permanent project deletion also removes comments and named versions. Workspace reset clears project, editor, font, and audio storage, applicable waveform caches, and local preferences before reload. Blocked database deletion produces an error rather than reporting complete removal.

The service worker caches the app shell and requested static assets. Navigation uses the network, then a previously cached route, then an offline screen. First-time editor routes require a connection. Font bytes live in IndexedDB. Increment the worker cache version when releasing changes to shell cache behavior. Do not enable the worker during development.

Canvas, PDF, PPTX, video, and background-removal code are loaded for their interactive workflows. Public landing components never import the editor. `scripts/build-assets.mjs` prepares same-origin ONNX runtime assets, the service worker, interface icons, and font. Boneyard captures at 390, 768, and 1440 px provide skeleton definitions; refresh them when layouts change.

The export registry retains built-in formats and adds PPTX. Supported text/simple shapes remain native; contiguous raster runs preserve complex-object z-order. Blending can require a full-page raster fallback. Portable backups use bounded JSON with embedded local assets and used uploaded fonts, reject remote dependencies, and restore fresh IDs/family names into a new project. Failed restoration rolls back imported resources. Catalog fonts remain external catalog dependencies.

Security boundaries: local profiles are not authorization. Studio and clipboard data are validated before Fabric loads them, with geometry, URL, nesting, text, and object budgets. Uploaded image dimensions are checked after browser decoding and before downstream canvas work/storage; fonts are signature checked, family names sanitized, and parsed by FontFace. These checks do not sandbox browser decoders. A future backend must enforce access control, file validation, revisions, and quotas independently. See [security review](security-review.md).
