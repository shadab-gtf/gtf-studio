import { getMockCatalog } from "@/services/mocks/catalog";
import type { StudioCatalog } from "@/types/studio";

// Catalog content is bundled; private, mutable documents never enter server memory.
export async function getStudioCatalog(): Promise<StudioCatalog> {
  return getMockCatalog();
}
