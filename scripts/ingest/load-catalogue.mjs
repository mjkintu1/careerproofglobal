// Loads the ISCO-08, ESCO and O*NET snapshots (packages/reference-data/src/snapshots) into Supabase.
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/ingest/load-catalogue.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SNAP = join(import.meta.dirname, "..", "..", "packages", "reference-data", "src", "snapshots");
const read = (f) => JSON.parse(readFileSync(join(SNAP, f), "utf8"));
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: KEY } = process.env;
if (!SUPABASE_URL || !KEY) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");

async function db(path, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=representation", ...(init.headers ?? {}) },
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`${path}: ${res.status} ${body.slice(0, 300)}`);
  return body ? JSON.parse(body) : null;
}

async function upsert(table, rows, conflict) {
  for (let i = 0; i < rows.length; i += 500) {
    await db(`${table}?on_conflict=${conflict}`, {
      method: "POST",
      body: JSON.stringify(rows.slice(i, i + 500)),
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    });
  }
  return rows.length;
}

async function withRun(sourceSlug, fn) {
  const [{ id: sourceId }] = await db(`data_sources?slug=eq.${sourceSlug}&select=id`);
  const [{ id: runId }] = await db("ingestion_runs", { method: "POST", body: JSON.stringify({ source_id: sourceId, params: { loader: "load-catalogue" } }) });
  try {
    const n = await fn();
    await db(`ingestion_runs?id=eq.${runId}`, { method: "PATCH", body: JSON.stringify({ status: "succeeded", finished_at: new Date().toISOString(), rows_read: n, rows_written: n }) });
    await db(`data_sources?id=eq.${sourceId}`, { method: "PATCH", body: JSON.stringify({ status: "active", last_checked_at: new Date().toISOString() }) });
    console.log(`${sourceSlug}: ${n} rows`);
  } catch (err) {
    await db(`ingestion_runs?id=eq.${runId}`, { method: "PATCH", body: JSON.stringify({ status: "failed", finished_at: new Date().toISOString(), error: String(err) }) });
    throw err;
  }
}

const isco = read("isco-08.json").groups;
const esco = read("esco-occupations.json").occupations;
const onet = read("onet-occupations.json").occupations;
const xwalk = read("esco-onet-crosswalk.json").map;

await withRun("esco", async () => {
  // Parents first, so the parent_code foreign key always resolves.
  let n = 0;
  for (const level of [1, 2, 3, 4]) {
    n += await upsert("isco_groups", isco.filter((g) => g.level === level).map((g) => ({
      code: g.code, level: g.level, title: g.title, description: g.description || null, parent_code: g.parent,
    })), "code");
  }
  n += await upsert("esco_occupations", esco.map((o) => ({
    code: o.code, uri: o.uri, title: o.title, description: o.description || null, alt_labels: o.altLabels,
    isco_code: o.isco, broader_code: o.broader, regulated: o.regulated, essential_skills: o.skills,
  })), "code");
  return n;
});

await withRun("onet", async () => {
  let n = await upsert("onet_occupations", Object.values(onet).map((o) => ({
    soc_code: o.code, title: o.title, description: o.description, tasks: o.tasks, skills: o.skills, riasec: o.riasec,
    education: o.education, job_zone: o.jobZone, reported_titles: o.reportedTitles, related_soc_codes: o.related,
  })), "soc_code");
  const links = Object.entries(xwalk).flatMap(([esco_code, socs]) => socs.map((soc_code) => ({ esco_code, soc_code })));
  n += await upsert("esco_onet_links", links, "esco_code,soc_code");
  return n;
});
