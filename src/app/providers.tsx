"use client";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { InstallPrompt } from "@/features/pwa/install-prompt";

export function AppProviders({ children }: { children: React.ReactNode }) {
  // The public /view share pages must show nothing but the design — keep the install banner off them.
  const pathname = usePathname();
  const isShareView = pathname?.startsWith("/view") ?? false;
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      {!isShareView && <InstallPrompt />}
    </ThemeProvider>
  );
}
