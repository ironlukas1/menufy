# Supabase setup

## Connect the app

Copy `app/.env.example` to `app/.env.local`, then set the Project URL and publishable key from Supabase **Project Settings → API**. The publishable key is intended for client apps; never use a service-role key in the app.

The app uses the database for sign-in, favorites, preferences, notifications, reviews, restaurant applications, and menus. Restaurant browsing uses active database restaurants when Supabase is configured; without configuration it shows the local prototype data.

## Initialize a new project

Run these files in the Supabase SQL Editor, in order:

1. `migrations/0001_init.sql`
2. `user_data.sql`
3. `owner_portal.sql`
4. `member_reviews.sql`

Optional restaurant sample data can be loaded with `real_restaurants.sql` and `more_restaurants.sql`.

Email sign-in is enabled in the Menufy project. The native app sends email confirmation and recovery links to the project's allowed `https://menufy.misaligned.dev/verified` callback; keep that URL allowlisted in **Authentication → URL Configuration**.
