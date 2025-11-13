# Source Tracking Paths Guide

This guide explains how to create, manage, and track different waitlist signup sources using custom URL paths.

## How It Works

The website now supports **dynamic path-based tracking**. Any path you create automatically tracks signups without requiring code changes.

When someone visits `https://thenetwork.app/your-path` and joins the waitlist, "your-path" is automatically saved in the database.

## Creating New Tracking Paths

### No Code Required! 🎉

You don't need to edit any code to create new tracking paths. Simply use any URL path you want:

**Examples:**
- `https://thenetwork.app/path-1` → Tracks as "path-1"
- `https://thenetwork.app/stanford` → Tracks as "stanford"
- `https://thenetwork.app/booth-3` → Tracks as "booth-3"
- `https://thenetwork.app/sf-meetup-jan24` → Tracks as "sf-meetup-jan24"

### Creating QR Codes

1. **Choose a unique path name** (see naming best practices below)
2. **Create the full URL**: `https://thenetwork.app/[your-path-name]`
3. **Generate a QR code** using any QR code generator:
   - [QR Code Generator](https://www.qr-code-generator.com/)
   - [QR Code Monkey](https://www.qrcode-monkey.com/)
   - [Canva QR Code Generator](https://www.canva.com/qr-code-generator/)
4. **Print or display the QR code** at your desired location

### Example Workflow

Let's say you want to track signups from Stanford:

1. Create URL: `https://thenetwork.app/stanford`
2. Generate QR code pointing to that URL
3. Print QR code and place it on campus
4. When students scan and sign up, "stanford" is automatically saved as their source

## Best Practices for Path Names

### ✅ Good Path Names

- **Descriptive**: `stanford`, `harvard`, `mit`
- **Location-based**: `sf-event`, `ny-meetup`, `boston-conference`
- **Numbered for scale**: `path-1`, `path-2`, `path-3`
- **Event-specific**: `techcrunch-2024`, `demo-day`, `career-fair-fall`
- **Venue-specific**: `booth-a`, `booth-3`, `table-1`

### ❌ Avoid

- Spaces: `my path` → Use `my-path` instead
- Special characters: `booth@3`, `path#1` → Use `booth-3`, `path-1`
- Very long names: Keep it concise and memorable

### Naming Convention Recommendations

Choose a consistent naming scheme for your organization:

**By Institution:**
```
/stanford
/harvard
/mit
/berkeley
```

**By Event:**
```
/techcrunch-disrupt-2024
/y-combinator-demo-day
/stanford-career-fair
```

**By Location + Number:**
```
/stanford-1
/stanford-2
/mit-1
/mit-2
```

**By Date:**
```
/jan-2024
/feb-2024
/q1-2024
```

## Managing Existing Paths

### Changing Path Names

If you want to change a path name, you have two options:

#### Option 1: Create a New Path (Recommended)
Simply create a new QR code with the new path name. The old path will still work if people have saved it.

Example:
- Old: `/path-1` 
- New: `/stanford-booth-1`
- Both will continue to work and track separately

#### Option 2: Keep Using the Same Path
Continue using the existing path even if the name doesn't perfectly match the new location/context. The data in your database will still show the original path name.

### Viewing Your Data

To see how each path is performing:

1. **Go to Supabase Dashboard**: https://supabase.com
2. **Navigate to**: Table Editor → `waitlist` table
3. **View the `source` column**: Shows which path each user came from
4. **Filter by source**: 
   - Click the `source` column header
   - Use the filter icon
   - Enter the path name you want to view

### Analyzing Performance

To see which paths are most effective:

1. **Export your data**:
   - In Supabase Table Editor
   - Click the three dots (⋮) menu
   - Select "Download as CSV"

2. **Analyze in Excel/Google Sheets**:
   - Create a pivot table
   - Count signups by source
   - Calculate conversion rates

3. **SQL Query in Supabase**:
   ```sql
   SELECT source, COUNT(*) as signups
   FROM waitlist
   WHERE source IS NOT NULL
   GROUP BY source
   ORDER BY signups DESC;
   ```

## Examples

### Example 1: University Campaign

You're running a campaign at 3 universities:

```
/stanford    → 45 QR codes printed, placed around campus
/harvard     → 30 QR codes at student center
/mit         → 25 QR codes at engineering buildings
```

After a week, check your Supabase dashboard to see:
- Stanford: 127 signups
- Harvard: 89 signups
- MIT: 156 signups

### Example 2: Event Tracking

You're at a conference with multiple booths:

```
/booth-1     → Main entrance booth
/booth-2     → Food court booth
/booth-3     → Tech showcase booth
```

This helps you understand which booth locations drive the most signups.

### Example 3: Time-Based Tracking

Track signups by month or quarter:

```
/jan-2024
/feb-2024
/mar-2024
```

Useful for measuring growth over time.

## Testing Your Paths

Before printing QR codes, always test:

1. Visit your path in a browser: `https://thenetwork.app/your-path-name`
2. Join the waitlist with a test email
3. Check Supabase to confirm the source was recorded correctly
4. If testing locally: `http://localhost:3000/your-path-name`

## Troubleshooting

### Path not working?
- Make sure you're using lowercase letters and hyphens only
- Avoid special characters like `@`, `#`, `%`, etc.
- Check that you don't have spaces in the URL

### Source not appearing in database?
- Ensure you ran the database migration (see main README)
- Verify the `source` column exists in your `waitlist` table
- Check that signups are going through successfully

### Duplicate sources?
If you accidentally create similar paths like `/stanford` and `/Stanford`, they will track separately (paths are case-sensitive).

## Advanced: Reserved Paths

The following paths are already used by the website and cannot be used for tracking:

- `/memo` - Memo page
- `/phtogrph` - Photography page
- `/privacy` - Privacy policy
- `/terms` - Terms of service

Any other path is available for tracking!

## Support

If you need help:
1. Check Supabase dashboard for any errors
2. Review the database schema to ensure `source` column exists
3. Test with a simple path like `/test` first

## Quick Reference

| Task | Steps |
|------|-------|
| Create new path | Just use the URL - no code needed! |
| Generate QR code | Use any QR generator with your full URL |
| View signups by source | Supabase → Table Editor → Filter by `source` |
| Change path name | Create new QR code with new URL |
| Test a path | Visit the URL and submit a test signup |
| Export data | Supabase → Download as CSV |

---

**Remember**: The beauty of this system is its simplicity. Create a URL, make a QR code, and you're done! ✨

