## TheNetwork Waitlist - Technical Overview

This document explains the waitlist counter behavior, client-side persistence, the secure Supabase submission flow, how to test locally and in production, and common troubleshooting notes.

### What shipped
- Sticky per-visitor counter that persists across visits
- Smooth intro animation from 0 to the visitor’s saved max (or real server count if first visit)
- Gentle drift increments over time to avoid a “static” feel
- Server-side API route to submit the waitlist form securely
- IP-based rate limiting and validation on the server


## Counter behavior (per-visitor)

Terminology:
- displayCount: number shown to this visitor
- realCount: base count from Supabase (read-only, aggregated, may lag by a few seconds)
- maxSeen (localStorage key `waitlistDisplayCount`): visitor’s personal max ever seen

Algorithm:
1) On hydration, the counter animates from 0 → target:
   - target = max(maxSeen, realCount) if maxSeen exists
   - target = realCount if no maxSeen yet
   - We persist `target` back to localStorage.
2) After intro completes, if `realCount` later surpasses `displayCount`, we jump up to the new max and persist it.
3) Drift: every 15–30s we bump by +1 or +2 and persist.
4) The value never decreases for a given visitor.

Notes:
- localStorage is origin-scoped. `https://thenetwork.life` and `https://www.thenetwork.life` don’t share storage. Pick one canonical domain.
- Incognito windows do not share storage with normal sessions.


## Secure waitlist submission

Path: `app/api/waitlist/route.ts`

What it does:
- Accepts POST with `{ name, email, school? }`
- Validates:
  - name: 1..100 chars
  - email: basic format, <= 255 chars
  - school: optional, <= 200 chars
- Rate limits by IP: 3 submissions/hour (configurable in code)
- Inserts into Supabase `waitlist` table
- Handles duplicate email (409), validation (400), rate limit (429), generic (500)

Environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` (required)
- One of:
  - `SUPABASE_SERVICE_ROLE_KEY` (recommended for server-side security)
  - or `NEXT_PUBLIC_SUPABASE_ANON_KEY` (fallback for non-admin inserts)

Do NOT expose the service role key to client code; it is only read in the server route.


## Files to know
- `app/page.tsx`
  - `LiveCounter` component: counter animation, localStorage persistence, drift, sync
  - Waitlist form and client → `/api/waitlist` POST
- `app/api/waitlist/route.ts`: server API for inserts, validation, rate limiting
- `lib/supabase.ts`: client read-only Supabase setup (for realCount polling)


## Local development

1) Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
# Optional, recommended for server route security:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2) Run the app:
```bash
npm run dev
```
Open `http://localhost:3000`.


## Testing guide

### Counter persistence
1) Load the page, wait ~15–30s for a drift bump.
2) Refresh: it should animate 0 → your previously seen number (or higher).
3) Application → Local Storage → look for `waitlistDisplayCount` and confirm it matches.

### Form submission
1) Submit with valid fields → expect success view.
2) Submit again with the same email → expect duplicate email error.
3) Submit 4+ times quickly (different emails) → expect rate limit (429) after 3rd.

### API direct tests (optional)
```bash
# Success
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","school":"NY"}'

# Rate limit test (run 4 times quickly)
for i in {1..4}; do
  curl -s -X POST http://localhost:3000/api/waitlist \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test $i\",\"email\":\"test$i@example.com\"}"
  echo ""
done
```


## Deployment notes
- Ensure env vars are set in your host (Vercel → Project → Settings → Environment Variables).
- Stick to one canonical domain to avoid separate localStorage pools.
- If you change rate limits/policies, redeploy the API route by pushing code.


## Troubleshooting

- Hydration mismatch: We always animate from 0 after hydration to avoid SSR mismatch. Hard refresh (Cmd/Ctrl+Shift+R) if needed.
- Counter not persisting: Check Application → Local Storage for `waitlistDisplayCount`. Confirm the domain matches the one used earlier.
- Service role key errors: Ensure `SUPABASE_SERVICE_ROLE_KEY` is only used in server route (never in browser code).
- Rate limit too strict: Adjust `RATE_LIMIT_MAX` or `RATE_LIMIT_WINDOW` in `app/api/waitlist/route.ts`.


## Future improvements (optional)
- Add hCaptcha/Turnstile to API route
- Replace in-memory rate limit with Redis (cluster-safe)
- Expose a tiny admin dashboard for analytics (auth required)


