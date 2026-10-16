"use client";
import { PresenterView } from "@/vendor/doory/editor/presenter/view/PresenterView";
import "./studio-theme.css";
export default function PresenterWindow({ session }: { session: string }) {
  return <main id="main" className="gtf-studio-shell"><PresenterView session={session} /></main>;
}
