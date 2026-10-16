import Link from "next/link";
import { Brand } from "@/components/ui/brand";

export function OfflineSection() {
  return (
    <main className="not-found" id="main">
      <Brand />
      <h1>A little time offline.</h1>
      <p>
        Your saved designs are still on this device. Open a previously visited
        workspace or reconnect to load this page.
      </p>
      <Link
        href="/dashboard"
        className="button button--primary"
        prefetch={false}
      >
        Open workspace
      </Link>
    </main>
  );
}
