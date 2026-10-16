import { StudioProvider } from "@/services/provider";
export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudioProvider>{children}</StudioProvider>;
}
