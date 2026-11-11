"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Container } from "@/components/container";

/** Branded fallback for unexpected errors in a page; the header and footer stay in place. */
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <Container className="py-20">
      <h1 className="font-display text-3xl font-extrabold">Something went wrong</h1>
      <p className="mt-3 max-w-xl text-ink-muted">This page didn&apos;t load properly. Try again, or go back to the home page.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className="btn-primary">Try again</button>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-xl px-4 font-semibold text-teal-800 hover:bg-teal-50">Home page</Link>
      </div>
    </Container>
  );
}
