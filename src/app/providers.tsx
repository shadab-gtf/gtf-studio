"use client";
import { ThemeProvider } from "next-themes";
import { InstallPrompt } from "@/features/pwa/install-prompt";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <InstallPrompt />
    </ThemeProvider>
  );
}
