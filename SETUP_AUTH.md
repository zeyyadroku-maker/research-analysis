# Supabase + Clerk Authentication Setup Guide

This guide walks you through setting up authentication and database persistence for the AI Research Analysis Platform.

## Step 1: Create Clerk Project (5 minutes)

1. Go to https://dashboard.clerk.com
2. Sign up or log in
3. Click "Create Application"
4. Choose your sign-in methods (Email, GitHub, Google recommended)
5. Copy your credentials:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
6. Go to "Webhooks" and note the URL (you'll use this in Step 2)

## Step 2: Create Supabase Project (5 minutes)

1. Go to https://app.supabase.com
2. Click "New Project"
3. Choose a name and password (save the password!)
4. Select your region
5. Wait for project to initialize
6. In Project Settings > API, copy:
   - `NEXT_PUBLIC_SUPABASE_URL` (from "Project URL")
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from "anon public" key)
   - `SUPABASE_SERVICE_ROLE_KEY` (from "service_role" key)

## Step 3: Set Up Database Schema (5 minutes)

1. In Supabase, go to SQL Editor
2. Click "New Query"
3. Paste the entire contents of `database.sql`
4. Click "Run"
5. Verify all tables created successfully

## Step 4: Configure Environment Variables (3 minutes)

1. Copy `.env.example` to `.env.local`
2. Fill in all the credentials from Steps 1-2:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CLAUDE_API_KEY=sk-ant-...
```

## Step 5: Set Up Clerk Webhook (5 minutes)

This syncs Clerk users to your Supabase database automatically.

1. In Clerk Dashboard, go to "Webhooks"
2. Create a new endpoint:
   - **URL**: `https://your-vercel-domain.vercel.app/api/webhooks/clerk`
   - **Events**: Select `user.created` and `user.updated`
3. Copy the "Signing Secret"
4. Add to `.env.local`:
   ```
   CLERK_WEBHOOK_SECRET=whsec_...
   ```
5. The webhook will be active once you deploy (see Step 7)

## Step 6: Test Locally (5 minutes)

```bash
npm run dev
```

Visit http://localhost:3000 and test:
1. Click sign-up link (should appear in header or go to `/sign-up`)
2. Create an account
3. Verify user appears in Supabase `users` table
4. Search for a paper and click bookmark (should create entry in `bookmarks` table)

## Step 7: Deploy to Vercel (10 minutes)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add Supabase + Clerk authentication"
   git push origin main
   ```

2. Go to Vercel dashboard
3. Import your repository
4. Add environment variables (same as `.env.local`)
5. Deploy!

6. Update Clerk webhook URL to your Vercel domain once deployed

## Troubleshooting

**"Clerk API Key not found"**
- Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are in `.env.local`
- Restart dev server after adding env vars

**"Supabase connection failed"**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check that Supabase project is active

**"Table doesn't exist"**
- Verify database.sql was fully executed in Supabase SQL Editor
- Check that RLS policies are enabled

**"User can't see bookmarks after reload"**
- Check Supabase RLS policies are correct
- Verify user's `id` matches the bookmark's `user_id` in database

**Webhook not syncing users**
- Check Clerk webhook settings match your deployment URL
- Verify `CLERK_WEBHOOK_SECRET` is in production env vars
- Check Supabase logs for errors

## What's Next

After successful setup:
- Users can sign up via Clerk (email/OAuth)
- Bookmarks persist to Supabase instead of localStorage
- Share insights page (locked to signed-in users)
- User data is private (RLS ensures users only see their own data)

## File Structure

```
app/
├── api/
│   ├── bookmarks/route.ts          # Bookmark CRUD operations
│   └── webhooks/clerk.ts           # User sync webhook
├── lib/
│   ├── supabase.ts                 # Supabase client config
│   └── bookmarks-db.ts             # Database helper functions
├── sign-in/page.tsx                # Clerk sign-in page
├── sign-up/page.tsx                # Clerk sign-up page
├── layout.tsx                       # Updated with ClerkProvider
middleware.ts                        # Protects /insights and /bookmarks routes
database.sql                         # Complete DB schema
.env.example                         # Environment variable template
```

## Questions?

- Clerk Docs: https://clerk.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
