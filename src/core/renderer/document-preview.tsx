import type {
  CanvasElement,
  CreativeDocument,
  DocumentPage,
} from "@/core/document/schema";

function PreviewElement({ element }: { element: CanvasElement }) {
  if (element.hidden) return null;
  const { x, y, width, height, rotation, opacity } = element;
  let content: React.ReactNode;
  if (element.type === "text")
    content = (
      <text
        fill={element.fill}
        fontFamily={`${element.fontFamily}, sans-serif`}
        fontSize={element.fontSize}
        fontWeight={element.fontWeightValue ?? element.fontWeight}
        fontStyle={element.fontStyle ?? "normal"}
        textAnchor={
          element.align === "center"
            ? "middle"
            : element.align === "right"
              ? "end"
              : "start"
        }
      >
        {element.text.split("\n").map((line, index) => (
          <tspan
            key={index}
            x={
              element.align === "center"
                ? width / 2
                : element.align === "right"
                  ? width
                  : 0
            }
            y={element.fontSize * (0.86 + index * element.lineHeight)}
          >
            {line || " "}
          </tspan>
        ))}
      </text>
    );
  else if (element.type === "image")
    content = (
      <image
        href={element.src}
        width={width}
        height={height}
        preserveAspectRatio="none"
        transform={`translate(${element.flipX ? width : 0} ${element.flipY ? height : 0}) scale(${element.flipX ? -1 : 1} ${element.flipY ? -1 : 1})`}
      />
    );
  else if (element.type === "path")
    content = (
      <polyline
        points={element.points.join(" ")}
        fill="none"
        stroke={element.fill}
        strokeWidth={element.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={`scale(${width / element.viewWidth} ${height / element.viewHeight})`}
      />
    );
  else if (element.shape === "ellipse")
    content = (
      <ellipse
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        fill={element.fill}
      />
    );
  else if (element.shape === "triangle")
    content = (
      <polygon
        points={`${width / 2},0 ${width},${height} 0,${height}`}
        fill={element.fill}
      />
    );
  else if (element.shape === "star")
    content = (
      <polygon points={starPoints(width, height)} fill={element.fill} />
    );
  else
    content = (
      <rect
        width={width}
        height={height}
        rx={element.cornerRadius}
        fill={element.fill}
      />
    );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`} opacity={opacity}>
      {content}
    </g>
  );
}

export function starPoints(width: number, height: number): string {
  return Array.from({ length: 10 }, (_, index) => {
    const angle = (index * Math.PI) / 5 - Math.PI / 2;
    const ratio = index % 2 ? 0.44 : 1;
    return `${width / 2 + ((Math.cos(angle) * width) / 2) * ratio},${height / 2 + ((Math.sin(angle) * height) / 2) * ratio}`;
  }).join(" ");
}

export function DocumentPreview({
  document,
  page,
  className = "",
  label = "Design preview",
}: {
  document: Pick<CreativeDocument, "width" | "height">;
  page: DocumentPage;
  className?: string;
  label?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${document.width} ${document.height}`}
      className={`document-preview ${className}`}
      role="img"
      aria-label={label}
    >
      <rect
        width={document.width}
        height={document.height}
        fill={page.background}
      />
      {page.elements.map((element) => (
        <PreviewElement key={element.id} element={element} />
      ))}
    </svg>
  );
}
