"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Route, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { mainNav, type NavGroup } from "@/lib/site-nav";

/** A link is current when its path (without #hash) is the page, or a parent of it (not the home page). */
function isCurrent(href: string, pathname: string) {
  const path = href.split("#")[0]!;
  if (href.includes("#")) return false; // in-page anchors never mark a whole page as current
  return path === pathname || (path !== "/" && pathname.startsWith(`${path}/`));
}
const groupHasCurrent = (g: NavGroup, pathname: string) => g.links.some((l) => isCurrent(l.href, pathname));
const panelId = (g: NavGroup, prefix: string) => `${prefix}-${g.label.replace(/\s+/g, "-").toLowerCase()}`;

/**
 * Main navigation (disclosure pattern).
 * Desktop: one dropdown at a time; opens on click, on hover for mouse users, closes on Escape, outside click or focus leaving.
 * Mobile: a full-height scrollable panel with collapsible groups and the "Plan my path" button.
 */
export function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [mobileTop, setMobileTop] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(() => mainNav.find((g) => groupHasCurrent(g, pathname))?.label ?? null);
  const navRef = useRef<HTMLElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);

  // Close everything when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(null);
    setMobile(false);
    setExpanded(mainNav.find((g) => groupHasCurrent(g, pathname))?.label ?? null);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const btn = navRef.current?.querySelector<HTMLButtonElement>("[data-open='true']");
      setOpen(null);
      setMobile(false);
      btn?.focus();
    };
    const onClick = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null); };
    // Leaving the mobile layout (rotate, resize) closes the mobile panel so desktop menus are not stuck open.
    const wide = window.matchMedia("(min-width: 1024px)");
    const onWide = () => { if (wide.matches || window.innerWidth >= 1024) setMobile(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    wide.addEventListener("change", onWide);
    window.addEventListener("resize", onWide);
    return () => {
      window.removeEventListener("resize", onWide);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
      wide.removeEventListener("change", onWide);
      window.clearTimeout(hoverTimer.current);
    };
  }, []);

  // Stop the page scrolling behind the open mobile panel, and move keyboard focus into it.
  useEffect(() => {
    if (!mobile) return;
    // The lock is a class whose CSS only applies below desktop width, so a desktop page can never stay locked.
    document.documentElement.classList.add("mobile-nav-open");
    document.querySelector<HTMLElement>("#mobile-nav button")?.focus();
    return () => document.documentElement.classList.remove("mobile-nav-open");
  }, [mobile]);

  const toggleMobile = () => {
    if (!mobile) setMobileTop(navRef.current?.closest("header")?.getBoundingClientRect().bottom ?? 0);
    setMobile((m) => !m);
  };
  const hover = (label: string | null) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpen(label), label ? 80 : 220);
  };
  const close = () => { setOpen(null); setMobile(false); };

  return (
    <nav aria-label="Main" ref={navRef} className="relative"
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(null); }}>
      {/* Desktop */}
      <ul className="hidden items-center gap-1 lg:flex">
        {mainNav.map((g, i) => {
          const isOpen = open === g.label;
          const active = groupHasCurrent(g, pathname);
          return (
            <li key={g.label} className="relative" onMouseEnter={() => hover(g.label)} onMouseLeave={() => hover(null)}>
              <button type="button" aria-expanded={isOpen} aria-controls={panelId(g, "nav")} data-open={isOpen}
                onClick={() => { window.clearTimeout(hoverTimer.current); setOpen(isOpen ? null : g.label); }}
                className={`inline-flex min-h-11 items-center gap-1 rounded-full px-4 font-semibold hover:bg-teal-50 hover:text-teal-800 ${active ? "text-teal-800" : "text-ink"}`}>
                {g.label}
                <ChevronDown aria-hidden="true" size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                {active && <span className="sr-only">(current section)</span>}
              </button>
              {/* pt-2 keeps the hover area continuous between the button and the panel */}
              {/* Opacity, movement and visibility all animate, so the panel eases out as smoothly as it eases in. */}
              <div className={`absolute top-full z-50 pt-2 transition-[opacity,translate,visibility] duration-200 ease-out motion-reduce:transition-none ${i === 0 ? "left-0" : "right-0"} ${isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"}`}>
                <ul id={panelId(g, "nav")}
                  className={`grid gap-1 rounded-2xl border border-line bg-white p-3 shadow-lg ${g.links.length > 3 ? "w-[34rem] grid-cols-2" : "w-80"}`}>
                  <NavLinks group={g} pathname={pathname} onNavigate={close} />
                </ul>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Mobile */}
      <button type="button" aria-expanded={mobile} aria-controls="mobile-nav" data-open={mobile} onClick={toggleMobile}
        className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold text-ink hover:bg-teal-50 lg:hidden">
        {mobile ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />} Menu
      </button>
      {/* Rendered into <body>: the header's backdrop blur would otherwise trap this fixed panel inside the header. */}
      {mobile && createPortal(
        <div id="mobile-nav" style={{ top: mobileTop }}
          className="fixed inset-x-0 bottom-0 z-50 overflow-y-auto overscroll-contain border-t border-line bg-white lg:hidden">
          <ul className="mx-auto max-w-xl space-y-1 p-3">
            {mainNav.map((g) => {
              const isOpen = expanded === g.label;
              return (
                <li key={g.label} className="border-b border-line last:border-0">
                  <button type="button" aria-expanded={isOpen} aria-controls={panelId(g, "mnav")} onClick={() => setExpanded(isOpen ? null : g.label)}
                    className={`flex min-h-12 w-full items-center justify-between px-2 text-left font-semibold ${groupHasCurrent(g, pathname) ? "text-teal-800" : "text-ink"}`}>
                    {g.label}
                    <ChevronDown aria-hidden="true" size={18} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <ul id={panelId(g, "mnav")} hidden={!isOpen} className="space-y-1 pb-3">
                    <NavLinks group={g} pathname={pathname} onNavigate={close} />
                  </ul>
                </li>
              );
            })}
          </ul>
          <div className="mx-auto max-w-xl p-3 pb-8">
            <Link href="/paths" onClick={close} className="btn-primary flex w-full justify-center">
              <Route aria-hidden="true" size={18} /> Plan my path
            </Link>
          </div>
        </div>,
        document.body,
      )}
    </nav>
  );
}

function NavLinks({ group, pathname, onNavigate }: { group: NavGroup; pathname: string; onNavigate: () => void }) {
  return (
    <>
      {group.links.map((l) => {
        const current = isCurrent(l.href, pathname);
        return (
          <li key={l.href}>
            <Link href={l.href} onClick={onNavigate} aria-current={current ? "page" : undefined}
              className={`block rounded-xl px-3 py-2.5 no-underline transition-colors hover:bg-teal-50 hover:text-teal-800 ${current ? "bg-teal-50 text-teal-800" : "text-ink"}`}>
              <span className="block font-semibold leading-snug">{l.label}</span>
              {l.description && <span className="block text-sm leading-snug text-ink-muted">{l.description}</span>}
            </Link>
          </li>
        );
      })}
    </>
  );
}
