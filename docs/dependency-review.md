# Dependency review

Reviewed 2026-10-16 using installed package manifests, npm registry release metadata, source usage, and `pnpm audit`. `pnpm-lock.yaml` pins the exact dependency graph. Regenerate `dependency-licenses.json` with `pnpm run licenses` after changing dependencies; an earlier inventory predates the Fabric, audio/video, QR, and ONNX additions.

Package metadata and vendored asset licenses must be reviewed separately. Doory code and its starter templates require Attribution Assurance License notices and prominent launch attribution; Manrope uses OFL-1.1. Element packs, audio, model weights, and photos retain their individual notices. Iconsax is an older package; its React 19 default-prop behavior is handled in the shared wrapper. Boneyard has a small upstream footprint; checked-in skeleton definitions have a local fallback. SPDX declarations do not constitute a full legal audit.

Vitest is pinned to 5.0.5 and fflate to 0.8.3 after identified advisories. The Node-only image-size dependency of PptxGenJS is overridden to 2.0.4; PptxGenJS excludes it from browser bundles. Portable backup imports use bounded JSON rather than untrusted ZIP decompression. PPTX tests inspect generated Open XML; rendering fidelity still requires target-viewer checks.

One unpatched development-only advisory remains: [braces stack exhaustion](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), reached through Next's ESLint plugin and fast-glob. The input patterns here are repository-controlled lint paths, not user input or runtime request data. There is no published fixed version at this review date. Recheck the advisory when updating ESLint/Next tooling; do not feed untrusted glob patterns to the lint toolchain.

ESLint 9.39.5 is deprecated upstream but retained for current React/JSX accessibility plugin peer compatibility. Upgrade the group together after verifying supported peers. The reviewed audit reported no runtime advisories; this is a point-in-time result, not a continuing guarantee. Rerun the audit after lockfile changes.

A source-usage review found references for every runtime dependency. ONNX is used by background removal and the asset build; muxers/gifenc by video export; fflate by multi-file export; QRCode by local QR generation; Fabric by the main editor. This is not a bundle-size measurement. Types, test environments, and CLI tools can be used without explicit imports. Unused legacy editor dependencies are removed separately from this read-only review.
