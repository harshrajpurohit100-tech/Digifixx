# First Admin Setup

Use this setup once your Supabase project is ready. Do not commit real passwords or secrets.

1. Create a user manually in Supabase Auth:
   Supabase Dashboard -> Authentication -> Users -> Add user

2. Copy the new user's UUID from the Supabase Auth user details page.

3. Run the SQL setup file in the Supabase SQL Editor:
   `supabase/sql/001_admin_profiles.sql`

4. Insert the first admin profile manually:

```sql
insert into public.admin_profiles (user_id, full_name, email, role, status)
values (
  'PASTE_AUTH_USER_UUID_HERE',
  'Harshvardhan Rajpurohit',
  'harshrajpurohit100@gmail.com',
  'super_admin',
  'active'
);
```

5. Add real Supabase values to your local `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

6. Start the app and sign in:
   `http://localhost:3001/admin/login`

The SQL file intentionally starts with safe RLS policies: authenticated users can read only their own admin profile, and client-side profile inserts/updates are not allowed.
