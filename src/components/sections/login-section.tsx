"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
export function LoginSection() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <main id="main" className="profile-entry">
      <header>
        <Brand />
        <ThemeToggle />
      </header>
      <div className="profile-entry-content">
        <div className="profile-entry-art">
          <span>
            YOUR SPACE
            <br />
            TO CREATE.
          </span>
          <div aria-hidden="true" />
        </div>
        <section>
          <h1>
            Make yourself
            <br />
            at home.
          </h1>
          <p>A name for your workspace. A fresh canvas for your ideas.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              try {
                localStorage.setItem(
                  "gtf-profile",
                  JSON.stringify({ name: name.trim() || "Creator" }),
                );
                router.push("/dashboard");
              } catch {
                setError(
                  "Browser storage is unavailable. Enable it for this site to keep your work.",
                );
              }
            }}
          >
            <label className="field">
              Your name
              <input
                autoComplete="given-name"
                maxLength={60}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="What should we call you?"
              />
            </label>
            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}
            <Button className="full-width" variant="primary" type="submit">
              Enter your studio
            </Button>
          </form>
          <p className="panel-hint">
            This is a local workspace. No password or cloud account is required.
            Your designs are saved in this browser.
          </p>
        </section>
      </div>
    </main>
  );
}
