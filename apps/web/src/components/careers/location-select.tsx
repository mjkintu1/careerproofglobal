"use client";

import { usePathname, useRouter } from "next/navigation";
import { CountrySearch } from "@/components/country-search";

interface Props {
  current: string;
  options: { code: string; name: string }[];
  /** "dark" for navy hero bands. */
  tone?: "light" | "dark";
}

/** Searchable switch for the location segment of /careers/{location}/...; keeps the rest of the path. */
export function LocationSelect({ current, options, tone = "light" }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function onSelect(next: string) {
    if (next === current) return;
    const parts = pathname.split("/");
    // ["", "careers", "{location}", ...rest]
    parts[2] = next;
    router.push(parts.join("/") || `/careers/${next}`);
  }

  return <CountrySearch options={options} current={current} onSelect={onSelect} label="Location" tone={tone} labelPosition="inline" className="w-full max-w-sm" />;
}
