"use client";
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main>
          <h1>GTF Studio couldn’t open</h1>
          <p>Your saved work remains on this device. Please try again.</p>
          <button onClick={reset}>Try again</button>
        </main>
      </body>
    </html>
  );
}
