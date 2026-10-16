"use client";
import { Skeleton } from "boneyard-js/react";
import "@/bones/registry";
import type { ReactNode } from "react";

export function SkeletonBoundary({
  name,
  loading,
  fallback,
  children,
}: {
  name: string;
  loading: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Skeleton
      name={name}
      loading={loading}
      color="var(--line)"
      darkColor="var(--line)"
      animate="pulse"
      select="viewport"
      transition={180}
      fallback={fallback}
    >
      {children}
    </Skeleton>
  );
}
