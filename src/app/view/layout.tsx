import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "View only — GTF Studio",
  robots: { index: false, follow: false },
};

export default function ViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
