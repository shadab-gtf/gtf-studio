import Image, { type ImageProps } from "next/image";

/** Editor previews include blobs, data URLs and local files that bypass the image server. */
export function PreviewImage({ width = 640, height = 480, alt, ...props }: ImageProps) {
  return <Image {...props} alt={alt} width={width} height={height} unoptimized />;
}
