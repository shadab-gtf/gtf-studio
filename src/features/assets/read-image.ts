import { ServiceError } from "@/services/errors/service-error";
import type { Asset } from "@/types/studio";
import { assertImageDimensions } from "./image-limits";

export async function readImage(file: File): Promise<Asset> {
  if (
    !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)
  )
    throw new ServiceError(
      "Choose a PNG, JPEG, WebP, or GIF image.",
      "VALIDATION",
    );
  if (file.size > 8 * 1024 * 1024)
    throw new ServiceError("Choose an image smaller than 8 MB.", "VALIDATION");
  const src = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Image could not be read."));
    reader.onerror = () => reject(new Error("Image could not be read."));
    reader.readAsDataURL(file);
  });
  const image = new Image();
  image.src = src;
  try {
    await image.decode();
  } catch {
    throw new ServiceError(
      "This image file is damaged or unsupported.",
      "VALIDATION",
    );
  }
  assertImageDimensions(image.naturalWidth, image.naturalHeight);
  return {
    id: crypto.randomUUID(),
    name: file.name.slice(0, 120),
    src,
    width: image.naturalWidth,
    height: image.naturalHeight,
    createdAt: new Date().toISOString(),
  };
}
