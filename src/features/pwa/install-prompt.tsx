"use client";

import { useEffect, useState } from "react";
import { Download, Share, Smartphone, X } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [show, setShow] = useState(false);
  const [help, setHelp] = useState(false);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const onInstall = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallEvent);
      try {
        if (!localStorage.getItem("gtf-install-dismissed")) setShow(true);
      } catch {
        setShow(true);
      }
    };
    const onInstalled = () => {
      setInstalled(true);
      setShow(false);
      setPrompt(null);
    };
    const onOpen = () => setHelp(true);
    const display = window.matchMedia("(display-mode: standalone)");
    if (display.matches) queueMicrotask(onInstalled);
    window.addEventListener("beforeinstallprompt", onInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("gtf-install", onOpen);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production")
      void navigator.serviceWorker.register("/sw.js").catch(() => {
        /* Installation remains browser-controlled if offline registration fails. */
      });
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "development") {
      // A production preview may have registered our worker on this same origin.
      // Development chunks must always come from the running dev server.
      void navigator.serviceWorker.getRegistrations().then(async (registrations) => {
        for (const registration of registrations) {
          const worker = registration.active ?? registration.waiting ?? registration.installing;
          if (worker?.scriptURL === new URL("/sw.js", window.location.origin).href)
            await registration.unregister();
        }
        const keys = await caches.keys();
        await Promise.all(keys.filter(key => key.startsWith("gtf-studio-")).map(key => caches.delete(key)));
      }).catch(() => { /* Browsers may disable storage in private sessions. */ });
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("gtf-install", onOpen);
    };
  }, []);
  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem("gtf-install-dismissed", "true");
    } catch {
      /* Dismissal still applies to this session. */
    }
  };
  const install = async () => {
    if (!prompt) {
      setHelp(true);
      return;
    }
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") setShow(false);
    setPrompt(null);
  };
  return (
    <>
      {show && !installed && (
        <aside className="install-banner" aria-label="Install GTF Studio">
          <span className="install-icon">
            <Smartphone size={22} />
          </span>
          <div>
            <strong>Your studio. One tap away.</strong>
            <p>Install GTF Studio for a focused workspace.</p>
          </div>
          <Button variant="primary" onClick={() => void install()}>
            Install
          </Button>
          <button
            className="icon-button"
            aria-label="Dismiss install prompt"
            onClick={dismiss}
          >
            <X size={18} />
          </button>
        </aside>
      )}
      <Modal
        open={help}
        onOpenChange={setHelp}
        title={installed ? "GTF Studio is installed" : "Make yourself at home"}
        description="Keep your creative space a tap away."
      >
        <div className="install-help">
          <Smartphone size={46} />
          <p>
            {installed
              ? "Open GTF Studio from your home screen or applications."
              : "Install GTF Studio from your browser. On iPhone or iPad, open Safari, tap Share, then Add to Home Screen. On desktop or Android, use the browser’s Install app option when available."}
          </p>
          {prompt && (
            <Button variant="primary" onClick={() => void install()}>
              <Download size={16} />
              Install GTF Studio
            </Button>
          )}
          {!prompt && !installed && (
            <span className="muted">
              <Share size={16} /> Look in your browser’s share or menu options.
            </span>
          )}
        </div>
      </Modal>
    </>
  );
}

export function InstallButton() {
  return (
    <Button
      variant="ghost"
      onClick={() => window.dispatchEvent(new Event("gtf-install"))}
    >
      <Download size={17} />
      Install app
    </Button>
  );
}
