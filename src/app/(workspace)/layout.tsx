import { StudioProvider } from "@/services/provider";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StudioProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </StudioProvider>
  );
}
