"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createStudioServices } from "@/services";
import type { StudioServices } from "./contracts/studio-service";

const ServicesContext = createContext<StudioServices | null>(null);
export function StudioProvider({ children }: { children: ReactNode }) {
  const [services] = useState(createStudioServices);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );
  return (
    <ServicesContext.Provider value={services}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ServicesContext.Provider>
  );
}
export function useServices(): StudioServices {
  const services = useContext(ServicesContext);
  if (!services) throw new Error("StudioProvider is required.");
  return services;
}
