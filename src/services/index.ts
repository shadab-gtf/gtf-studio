import type { StudioServices } from "./contracts/studio-service";
import { createLocalServices } from "./mocks/local-services";
import { createHttpServices } from "./http/studio-services";

export function createStudioServices(): StudioServices {
  const mode = process.env.NEXT_PUBLIC_DATA_MODE ?? "mock";
  if (mode === "mock") return createLocalServices();
  if (mode === "api") {
    const url = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!url || !/^https?:\/\//.test(url))
      throw new Error("Configure NEXT_PUBLIC_API_BASE_URL to use API mode.");
    return createHttpServices(url);
  }
  throw new Error(`Unsupported data mode: ${mode}`);
}
