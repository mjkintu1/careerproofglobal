"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { mainNav } from "@/lib/site-nav";

/** Dropdown navigation (disclosure pattern). Desktop: one panel at a time. Mobile: a menu button. */
export function MainNav() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);

  // Close everything when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) { setLastPath(pathname); setOpen(null); setMobile(false); }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); setMobile(false); } };
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, []);

  return (
    <nav aria-label="Main" ref={ref} className="relative">
      <button type="button" aria-expanded={mobile} aria-controls="main-nav-list" onClick={() => setMobile((m) => !m)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold text-ink lg:hidden">
        {mobile ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />} Menu
      </button>
      <ul id="main-nav-list"
        className={`${mobile ? "flex" : "hidden"} absolute right-0 top-full z-50 mt-2 w-[min(90vw,22rem)] flex-col gap-1 rounded-2xl border border-line bg-white p-2 shadow-lg lg:static lg:mt-0 lg:flex lg:w-auto lg:flex-row lg:items-center lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>
        {mainNav.map((group) => {
          const isOpen = open === group.label;
          const panelId = `nav-${group.label.replace(/\s+/g, "-").toLowerCase()}`;
          return (
            <li key={group.label} className="relative">
              <button type="button" aria-expanded={isOpen || mobile} aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : group.label)}
                className="inline-flex min-h-11 w-full items-center justify-between gap-1 rounded-full px-4 font-semibold text-ink hover:bg-teal-50 hover:text-teal-800 lg:w-auto">
                {group.label}
                <ChevronDown aria-hidden="true" size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""} lg:block`} />
              </button>
              <ul id={panelId}
                className={`${isOpen || mobile ? "block" : "hidden"} space-y-1 p-1 lg:absolute lg:left-0 lg:top-full lg:z-50 lg:mt-2 lg:w-80 lg:rounded-2xl lg:border lg:border-line lg:bg-white lg:p-2 lg:shadow-lg`}>
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="block rounded-xl px-3 py-2 text-ink no-underline hover:bg-teal-50 hover:text-teal-800">
                      <span className="block font-semibold">{l.label}</span>
                      {l.description && <span className="block text-sm text-ink-muted">{l.description}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
