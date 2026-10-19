"use client";

import { useEffect, useState } from "react";
import { DesignViewer } from "@/components/sections/design-viewer";
import { decodeDocument } from "@/lib/share/share-document";
import type { CreativeDocument } from "@/core/document/schema";
import styles from "@/components/sections/design-viewer.module.css";

type ViewState =
  | { status: "loading" }
  | { status: "ready"; document: CreativeDocument }
  | { status: "invalid" };

/**
 * Opens a design shared via the URL fragment (`/view#d=<encoded>`). The document travels inside the link, so
 * there is no server lookup, no account, and no stored state — it just decodes, validates, and displays.
 */
export default function HashViewPage() {
  const [state, setState] = useState<ViewState>({ status: "loading" });

  useEffect(() => {
    let next: ViewState;
    try {
      const fragment = window.location.hash.replace(/^#/, "");
      const encoded = new URLSearchParams(fragment).get("d");
      next = encoded
        ? { status: "ready", document: decodeDocument(encoded) }
        : { status: "invalid" };
    } catch {
      next = { status: "invalid" };
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading location.hash is a post-mount browser sync
    setState(next);
  }, []);

  if (state.status === "loading") return null;
  if (state.status === "invalid")
    return (
      <div className={styles.message}>This link is invalid or has expired.</div>
    );
  return <DesignViewer document={state.document} />;
}
