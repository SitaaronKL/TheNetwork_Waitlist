# Supabase Setup Instructions for Asteri Waitlist

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create an account)
2. Click "New Project"
3. Fill in the project details:
   - **Name**: `asteri-waitlist` (or whatever you prefer)
   - **Database Password**: Choose a strong password (save this somewhere safe)
   - **Region**: Choose the region closest to you
4. Click "Create new project" and wait for it to finish setting up (~2 minutes)

## Step 2: Get Your API Credentials

1. Once your project is created, go to **Project Settings** (gear icon in the sidebar)
2. Click on **API** in the left menu
3. You'll see two important values:
   - **Project URL** (looks like `https://xxxxxxxxxxxxx.supabase.co`)
   - **Project API keys** → Copy the `anon` `public` key (long string starting with `eyJ...`)

## Step 3: Add Environment Variables

Create a file named `.env.local` in your project root with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with the values from Step 2.

**Important:** Make sure `.env.local` is in your `.gitignore` file (it should be by default in Next.js projects).

## Step 4: Create the Database Table

1. In your Supabase dashboard, go to **SQL Editor** (from the left sidebar)
2. Click "New query"
3. Copy and paste the following SQL:

```sql
-- Create the waitlist table
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  school TEXT
);

-- Create an index on email for faster lookups
CREATE INDEX idx_waitlist_email ON waitlist(email);

-- Create an index on created_at for sorting
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at DESC);
```

4. Click **Run** (or press `Ctrl/Cmd + Enter`)
5. You should see "Success. No rows returned" - this means the table was created successfully!

## Step 5: Set Up Row Level Security (RLS)

By default, Supabase enables Row Level Security, which means no one can read or write to your table without explicit permission. We need to allow public inserts so anyone can submit the waitlist form.

1. Still in the SQL Editor, create a new query
2. Copy and paste the following SQL:

```sql
-- Enable Row Level Security (should already be enabled by default)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into the waitlist table
CREATE POLICY "Allow public inserts" ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- Optional: Allow authenticated users to read all waitlist entries
-- (Only if you want to create an admin dashboard later)
CREATE POLICY "Allow authenticated reads" ON waitlist
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

3. Click **Run**
4. You should see success messages for each policy created

## Step 6: Verify the Setup

You can verify your table is set up correctly by:

1. Going to **Table Editor** in your Supabase dashboard
2. You should see a `waitlist` table with all the columns
3. The table should be empty at first

## Step 7: Test Your Application

1. Make sure your `.env.local` file is properly configured with your credentials
2. Restart your Next.js development server:
   ```bash
   npm run dev
   ```
3. Navigate to `http://localhost:3000/waitlist`
4. Fill out and submit the form
5. Check your Supabase dashboard → **Table Editor** → `waitlist` to see if the entry was added

## Viewing Submissions

To view all waitlist submissions:

1. Go to your Supabase dashboard
2. Click **Table Editor** in the left sidebar
3. Select the `waitlist` table
4. You'll see all submissions with timestamps

You can also export the data:
- Click the three dots menu (⋮) in the table view
- Select "Download as CSV" to export all data

## Optional: Create an Admin Dashboard

If you want to create a protected admin page to view submissions:

1. Set up Supabase Auth (email/password or social login)
2. Create a protected route like `/admin/waitlist`
3. Use the authenticated policy we created to query all submissions
4. Display them in a table with sorting and filtering

## Troubleshooting

### "Failed to fetch" error
- Check that your environment variables are correct in `.env.local`
- Restart your Next.js dev server after adding `.env.local`
- Make sure the Supabase project is running (not paused)

### "Duplicate key value violates unique constraint"
- This means someone with that email has already signed up
- Emails must be unique in the waitlist

### "Permission denied" errors
- Make sure you ran the RLS policy SQL (Step 5)
- Check that the policy is enabled in **Authentication** → **Policies**

### Environment variables not working
- Variable names must start with `NEXT_PUBLIC_` to be available in the browser
- Restart your dev server after changing `.env.local`
- Never commit `.env.local` to git

## Security Notes

- The `anon` key is safe to use in client-side code
- Row Level Security (RLS) protects your data even with the anon key exposed
- Never expose your `service_role` key in client-side code
- Consider adding rate limiting for production to prevent spam

## Next Steps

Once you have submissions coming in, you might want to:
- Set up email notifications when someone joins the waitlist
- Create an automated email confirmation system
- Build an admin dashboard to manage submissions
- Export data periodically for your CRM or outreach tools

