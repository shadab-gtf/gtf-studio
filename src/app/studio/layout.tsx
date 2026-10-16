import { StudioProvider } from "@/services/provider";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <StudioProvider>{children}</StudioProvider>;
}
