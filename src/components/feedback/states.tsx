"use client";

import { AlertCircle, FolderOpen, RotateCcw } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="feedback-state" role="alert">
      <AlertCircle size={30} />
      <h2>Let’s try that again</h2>
      <p>{message}</p>
      {retry && (
        <Button onClick={retry}>
          <RotateCcw size={16} />
          Try again
        </Button>
      )}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="feedback-state">
      <FolderOpen size={34} />
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  );
}
