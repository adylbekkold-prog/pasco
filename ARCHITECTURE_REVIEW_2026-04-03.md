# Architecture Review — 2026-04-03

## What the project is now

- Next.js 16.2.1 App Router project on React 19.
- Public catalog + admin area in route groups: `app/(public)` and `app/(admin)`.
- Dual data layer:
  - local JSON mirror in `data/local-db.ru.json` and `data/local-db.ky.json`
  - remote Supabase catalog via `lib/queries.ts`
- Mutations are handled with Server Actions in [`app/actions/lab.actions.ts`](./app/actions/lab.actions.ts).

## Main architecture risks found

### 1. Hybrid mode was only half-implemented

Before this pass, `hybrid` behaved as:

- remote first
- local fallback
- local mirror on successful reads and writes

But it did **not** push local offline changes back to Supabase later. This meant:

- local-only created labs stayed local-only forever
- local updates could diverge from remote state
- deletes made offline were never replayed remotely

### 2. Local catalog IDs and Supabase IDs are different

Local data used IDs like:

- `subject-physics`
- `grade-9`
- `equipment-em-kit`

Supabase uses UUIDs for these tables. Without an ID bridge, offline-created labs could not be synced back safely because their foreign keys would fail in Supabase.

### 3. Remote catalogs were not localized for RU/KY UI

Supabase catalogs currently store English names like `Physics`, `Chemistry`, `Grade 8`. In `hybrid`/`supabase` mode this would leak English labels into the Russian/Kyrgyz interface.

### 4. Uploads are still local-file based

Files are written into `public/uploads/labs/...`. This works for the current single-server setup, but it is still a future migration point if media also needs to move fully into cloud storage.

## What was changed

### Data layer

- Added service-role server client in [`lib/supabase/admin.ts`](./lib/supabase/admin.ts).
- Added persistent sync queue in [`lib/sync-queue.ts`](./lib/sync-queue.ts).
- Added replay logic for offline `upsert/delete` lab mutations.
- Added mapping from local catalog IDs to remote UUIDs during replay.
- Added localization bridge for remote `subjects`, `grades`, and `equipment` in [`lib/queries.ts`](./lib/queries.ts).
- Connected Server Actions so failed remote writes in hybrid mode are queued instead of being lost.
- Connected reads so the app attempts to flush queued changes when remote access is available again.

### UI / product layer

- Rebuilt the public shell into a more portal-like, OpenEdu-inspired layout.
- Updated the homepage, catalog page, detail page, navbar, footer, search, and lab cards to use a single white/blue editorial system.
- Surfaced sync state on the public homepage so the current provider/queue status is visible.

## Recommended next steps

1. Move uploads to Supabase Storage if files must survive outside the current server.
2. Add tests for queue replay and ID mapping.
3. Extract catalog localization into a single canonical dictionary to avoid duplication between local JSON defaults and remote bridge logic.
4. Decide whether admin auth should stay strict in `hybrid` mode or whether a separate trusted LAN mode is needed.
