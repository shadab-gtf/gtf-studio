"use client";
import { ErrorState } from "@/components/feedback/states";
export default function Error({ reset }: { reset: () => void }) {
  return <ErrorState message="Your workspace could not open." retry={reset} />;
}
