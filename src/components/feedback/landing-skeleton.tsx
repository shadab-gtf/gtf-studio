export function LandingSkeleton() {
  return (
    <div className="marketing-page" role="status" aria-label="Loading studio…">
      <div aria-hidden="true">
        <div className="marketing-header">
          <div className="marketing-nav">
            <div className="skeleton landing-skeleton-brand" />
            <div className="skeleton landing-skeleton-button" />
          </div>
        </div>
        <div className="hero">
          <div className="hero-stream">
            {[0, 1, 2, 3].map((column) => (
              <div className="hero-col-group" key={column}>
                {[0, 1, 2].map((card) => (
                  <div className="skeleton landing-skeleton-card" key={card} />
                ))}
              </div>
            ))}
          </div>
          <div className="hero-copy landing-skeleton-copy">
            <div className="skeleton landing-skeleton-heading" />
            <div className="skeleton landing-skeleton-heading" />
            <div className="skeleton landing-skeleton-description" />
            <div className="hero-actions">
              <div className="skeleton landing-skeleton-button" />
              <div className="skeleton landing-skeleton-button" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
