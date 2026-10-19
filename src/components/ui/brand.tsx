import Link from "next/link";

export function Brand({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
  return (
    <Link href={href} className="brand" aria-label="GTF Studio home">
      <svg
        width="34"
        height="34"
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
      >
        <path d="M3 3h14v14H3z" fill="#F0A1CB" />
        <path d="M19 3h14v14H19z" fill="#94D6F1" />
        <path d="M3 19h14v14H3z" fill="#FEF49E" />
        <path d="M19 19h14v14H19z" fill="#F0A1CB" />
      </svg>
      {!compact && (
        <span>
          GTF<span className="brand-light"> Studio</span>
          <span className="brand-dot">.</span>
        </span>
      )}
    </Link>
  );
}
