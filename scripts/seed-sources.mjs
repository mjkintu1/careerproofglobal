// Registers external data sources (packages/reference-data/src/data-sources.json). Real metadata, not sample data.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export function sourceSeed(q) {
  const sources = JSON.parse(readFileSync(join(import.meta.dirname, "..", "packages", "reference-data", "src", "data-sources.json"), "utf8"));
  const cols = ["slug", "name", "publisher", "url", "licence", "licence_url", "access_method", "update_frequency", "status", "attribution", "notes"];
  return [
    "-- Data source registry (packages/reference-data/src/data-sources.json)",
    `insert into public.data_sources (${cols.join(", ")}) values`,
    sources.map((s) => `  (${cols.map((c) => q(s[c])).join(", ")})`).join(",\n") + ";",
  ];
}
