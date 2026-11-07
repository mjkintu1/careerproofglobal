import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b-8 border-teal-500 bg-ink text-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-bold text-white no-underline hover:text-white"
        >
          Career Proof
        </Link>
        <span className="text-sm">Uganda pilot</span>
      </div>
    </header>
  );
}
