import { ServiceError } from "@/services/errors/service-error";

/** Check decoded dimensions before canvas allocation, filters, thumbnails or persistence. */
export function assertImageDimensions(width: number, height: number): void {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0)
    throw new ServiceError("This image has invalid dimensions.", "VALIDATION");
  if (width > 16_384 || height > 16_384 || width * height > 40_000_000)
    throw new ServiceError("Resize this image below 40 megapixels and 16,384 pixels per side first.", "VALIDATION");
}
