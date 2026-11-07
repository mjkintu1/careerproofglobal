# Career Proof

Academic and career pathway platform. Uganda pilot.

- Strategy: [docs/master_strategy_technical_blueprint.md](docs/master_strategy_technical_blueprint.md)
- Build plan and milestones: [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)

## Layout

```
apps/web                 Next.js 16 app (App Router, Tailwind v4)
packages/rules-engine    Country-agnostic admission rules evaluator (pure TS, Vitest)
packages/db              Database types generated from Supabase
packages/sample-data     Illustrative Uganda and Kenya rule sets and programmes (demo only)
scripts/                 Seed generator
supabase/                Local Supabase config, migrations, seed
```

## Requirements

- Node 24 (see `.nvmrc`), npm
- Docker (only for the local Supabase stack)

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install all workspaces |
| `npm run dev` | Start the web app on http://localhost:3000 |
| `npm run check` | Lint, typecheck and test everything (what CI runs, minus the build) |
| `npm run build` | Production build of the web app |
| `npm run db:start` / `db:stop` | Start / stop local Supabase (Docker) |
| `npm run db:reset` | Recreate the local database from migrations + `supabase/seed.sql` |
| `npm run db:seed:generate` | Rebuild `supabase/seed.sql` from `packages/sample-data` (then `npm run db:reset`) |
| `npm run db:types` | Regenerate `packages/db/src/database.types.ts` from the local database |

## Environment

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in the values printed by `npm run db:start`.

## Design tokens

Defined in `apps/web/src/app/globals.css`. Brand teal `#00B4D8` and gold `#FDC500` are fills only (dark text on top). Use `teal-700` for buttons and links. Admission zones always pair colour with an icon and a text label.
