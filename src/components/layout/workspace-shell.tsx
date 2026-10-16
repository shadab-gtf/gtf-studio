"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  Folder,
  Home,
  ImageIcon,
  LayoutTemplate,
  Menu,
  Monitor,
  Settings,
  ShieldCheck,
  Trash2,
  X,
} from "@/components/ui/icons";
import { Brand } from "@/components/ui/brand";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { InstallButton } from "@/features/pwa/install-prompt";

const navigation = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/projects", label: "Your projects", icon: Folder },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/assets", label: "Your uploads", icon: ImageIcon },
  { href: "/brand-kits", label: "Brand kits", icon: BookOpen },
];
const subscribeProfile = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};
const getProfileName = () => {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem("gtf-profile") ?? "null",
    );
    if (
      value &&
      typeof value === "object" &&
      "name" in value &&
      typeof value.name === "string"
    )
      return value.name.slice(0, 60);
  } catch {
    /* A profile is optional. */
  }
  return "Creator";
};
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const name = useSyncExternalStore(
    subscribeProfile,
    getProfileName,
    () => "Creator",
  );
  const [menu, setMenu] = useState(false);
  return (
    <div className="workspace">
      <aside className={`workspace-sidebar ${menu ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <Brand />
          <button
            className="icon-button mobile-only"
            aria-label="Close navigation"
            onClick={() => setMenu(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace-profile">
          <div className="profile-avatar">{name[0]?.toUpperCase()}</div>
          <div>
            <strong>{name}’s workspace</strong>
            <span>Personal space</span>
          </div>
          <ChevronRight size={16} />
        </div>
        <nav aria-label="Studio navigation">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              className={`sidebar-link ${pathname === href ? "active" : ""}`}
              href={href}
              onClick={() => setMenu(false)}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon size={19} />
              {label}
              {href === "/templates" && (
                <span className="nav-new">Explore</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-badge">
            <ShieldCheck size={19} />
            <div>
              <strong>A space of your own</strong>
              <p>Your work stays on this device.</p>
            </div>
          </div>
          <Link
            className={`sidebar-link ${pathname === "/trash" ? "active" : ""}`}
            href="/trash"
          >
            <Trash2 size={18} />
            Trash
          </Link>
          <Link
            className={`sidebar-link ${pathname === "/settings" ? "active" : ""}`}
            href="/settings"
          >
            <Settings size={18} />
            Settings
          </Link>
          <InstallButton />
        </div>
      </aside>
      {menu && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="workspace-body">
        <header className="workspace-header">
          <div>
            <button
              className="icon-button mobile-only"
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
            >
              <Menu size={21} />
            </button>
            <span className="workspace-breadcrumb">
              Your workspace <ChevronRight size={14} />{" "}
              <strong>
                {navigation.find((item) => item.href === pathname)?.label ??
                  (pathname === "/trash" ? "Trash" : "Settings")}
              </strong>
            </span>
          </div>
          <div className="nav-actions">
            <span className="device-indicator">
              <Monitor size={15} />
              Local workspace
            </span>
            <ThemeToggle />
            <div
              className="profile-avatar small"
              aria-label="Personal workspace"
            >
              {name[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <main id="main" className="workspace-main">
          {children}
        </main>
      </div>
    </div>
  );
}
