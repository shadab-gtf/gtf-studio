import { describe, expect, it } from "vitest";
import {
  logoPreviewSource,
  refToAsset,
} from "@/vendor/doory/editor/panels/brandOps";
import type { AssetRef } from "@/vendor/doory/types/adapter";

const uploadedLogo: AssetRef = {
  id: "logo",
  name: "Brand logo",
  kind: "image",
  width: 192,
  height: 192,
  url: "idb://logo",
  thumbUrl: "blob:http://localhost/expired-session",
};

describe("brand logo persistence", () => {
  it("stores a durable thumbnail reference for a locally uploaded logo", () => {
    expect(refToAsset(uploadedLogo).thumb_url).toBe("idb://logo");
  });

  it("recovers previews from kits saved with an expired blob thumbnail", () => {
    const legacy = {
      ...refToAsset(uploadedLogo),
      thumb_url: uploadedLogo.thumbUrl,
    };
    expect(logoPreviewSource(legacy)).toBe("idb://logo");
  });

  it("preserves a persistent thumbnail when one is available", () => {
    const asset = refToAsset({
      ...uploadedLogo,
      thumbUrl: "/images/logo-thumb.webp",
    });
    expect(logoPreviewSource(asset)).toBe("/images/logo-thumb.webp");
    expect(logoPreviewSource(undefined)).toBe("");
  });
});
