import { DocumentPreview } from "@/core/renderer/document-preview";
import type { Template } from "@/types/studio";

const COLUMN_COUNT = 4;
const TEMPLATES_PER_COLUMN = 6;

export function HeroMarquee({ templates }: { templates: readonly Template[] }) {
  if (templates.length === 0) return null;

  const columns = Array.from({ length: COLUMN_COUNT }, (_, column) =>
    Array.from(
      { length: TEMPLATES_PER_COLUMN },
      (_, index) =>
        templates[(column + index * COLUMN_COUNT) % templates.length],
    ),
  );

  return (
    <div className="hero-marquee">
      <label className="hero-motion-control">
        <input
          className="sr-only"
          type="checkbox"
          aria-label="Pause template animation"
          aria-controls="hero-template-stream"
        />
        <span className="hero-motion-pause" aria-hidden="true">
          Pause motion
        </span>
        <span className="hero-motion-play" aria-hidden="true">
          Resume motion
        </span>
      </label>
      <div className="hero-stream" id="hero-template-stream" aria-hidden="true">
        {columns.map((column, columnIndex) => (
          <div className="hero-col" key={columnIndex}>
            {/* Equal groups include their trailing gap, keeping the loop seamless. */}
            {[0, 1].map((copy) => (
              <div className="hero-col-group" key={copy}>
                {column.map((template, index) => (
                  <div className="hero-card" key={`${template.id}-${index}`}>
                    <DocumentPreview
                      document={template.document}
                      page={template.document.pages[0]}
                      label={template.title}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
