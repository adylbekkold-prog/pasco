## PASCO Lab Portal

### Local launch

```bash
npm run dev
```

Open `http://localhost:3000`.

### LAN launch for another computer

For stable access from another computer on the same network, run:

```bash
npm run serve:lan
```

Then open the app on the second computer by the IP address of the server machine, for example:

```text
http://192.168.88.93:3000
```

If you need live development over the network, use:

```bash
npm run dev:lan
```

### Data provider modes

- `local` - only local JSON storage and local uploads.
- `hybrid` - local mirror + Supabase + sync queue for offline changes.
- `supabase` - strict remote mode without local fallback.

Set the mode with:

```bash
DATA_PROVIDER=hybrid
NEXT_PUBLIC_DATA_PROVIDER=hybrid
```

### Hybrid mode notes

- `hybrid` now keeps a queue in `data/sync-queue.json`.
- If Supabase is temporarily unavailable, local changes are stored and retried later.
- For two-way sync you need `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- The app also supports the legacy alias `SUPABASE_SERVICE_KEY`.
- In `hybrid` and `supabase` modes, admin routes use Supabase authentication.

### Important notes

- Do not use `localhost` on the second computer. `localhost` always means that second computer itself.
- Uploaded videos, PDFs and images are stored on the server machine in `public/uploads/labs/...`.
- The local database is stored on the server machine in `data/local-db.json`.
- If you use Supabase invite or password reset links over LAN, set `NEXT_PUBLIC_SITE_URL` to the server machine address, for example `http://192.168.88.93:3000`.
