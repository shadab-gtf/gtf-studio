"use client";
import { ErrorState } from "@/components/feedback/states";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main">
      <ErrorState
        message="This view could not be opened. Your saved projects are still on this device."
        retry={reset}
      />
    </main>
  );
}
