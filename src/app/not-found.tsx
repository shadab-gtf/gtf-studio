import Link from "next/link";
import { Brand } from "@/components/ui/brand";
export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <Brand />
      <h1>A little off-canvas.</h1>
      <p>
        We couldn’t find that page. Your next idea is waiting in the studio.
      </p>
      <Link className="button button--primary" href="/dashboard">
        Back to the studio
      </Link>
    </main>
  );
}
