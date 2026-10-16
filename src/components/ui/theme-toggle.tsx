"use client";

import { Sun, Moon } from "@/components/ui/icons";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      className="icon-button theme-toggle"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="sun-icon" size={19} />
      <Moon className="moon-icon" size={19} />
    </button>
  );
}
