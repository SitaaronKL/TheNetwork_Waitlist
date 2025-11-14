# Quick Start: Source Tracking

Want to track where your waitlist signups come from? Here's the 2-minute setup:

## 1. Update Your Database (One Time)

Run this in your Supabase SQL Editor:

```sql
ALTER TABLE waitlist ADD COLUMN source TEXT;
CREATE INDEX idx_waitlist_source ON waitlist(source);
```

## 2. Create Tracking URLs

Any path works automatically! Just add it to your domain:

```
https://thenetwork.life/path-1
https://thenetwork.life/stanford
https://thenetwork.life/booth-3
```

## 3. Generate QR Codes

Use any QR code generator and point it to your tracking URL.

## 4. View Results

Go to Supabase → Table Editor → `waitlist` table → check the `source` column!

---

**That's it!** No code changes needed to add more paths.

📖 For detailed instructions, see [`TRACKING_PATHS_GUIDE.md`](TRACKING_PATHS_GUIDE.md)

