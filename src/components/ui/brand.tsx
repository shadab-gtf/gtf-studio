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
        <path d="M3 3h14v14H3zM19 19h14v14H19z" fill="#29afe4" />
        <path d="M19 3h14v14H19zM3 19h14v14H3z" fill="#e24397" />
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
