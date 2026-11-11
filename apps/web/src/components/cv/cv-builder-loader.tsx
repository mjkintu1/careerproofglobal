"use client";

import dynamic from "next/dynamic";
import type { CvCareer } from "@/lib/cv-careers";

/** The builder reads local storage on first render, so it only runs in the browser. */
const CvBuilder = dynamic(() => import("./cv-builder"), {
  ssr: false,
  loading: () => <p className="text-ink-muted">Loading the CV builder...</p>,
});

export function CvBuilderLoader({ careers }: { careers: CvCareer[] }) {
  return <CvBuilder careers={careers} />;
}
