# Lanka Map

Interactive map of tourist locations across Sri Lanka. Built with Next.js, Leaflet, and Supabase.

## Features

- Interactive map with marker clustering (Leaflet.js + OpenStreetMap)
- Clickable popups with location info, entry fees, hours, and Google Maps directions
- Category filter (Beach, Temple, Wildlife, Hiking, Waterfall, Historical, Viewpoint, Museum, Garden)
- Admin panel to add / edit / delete locations with photo upload
- ~150 seeded real locations to get started

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Map**: Leaflet + react-leaflet + leaflet.markercluster
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (photos)
- **Styling**: Tailwind CSS
- **Hosting**: Vercel

---

## Setup

### 1. Clone and install

```bash
cd Sites
git clone <your-repo> lanka-map
cd lanka-map
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the **SQL Editor** and run the contents of `supabase/schema.sql`
3. Copy your project URL and keys from **Settings → API**

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=choose-a-strong-password
```

### 4. Seed the database

```bash
npm run seed
```

This inserts ~150 real Sri Lanka tourist locations.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Admin Panel

Go to `/admin` and enter your `ADMIN_PASSWORD`.

From the dashboard you can:
- Add new locations (name, category, coordinates, description, fee, hours, photo)
- Edit existing locations
- Delete locations
- Upload photos (stored in Supabase Storage)

---

## Deploy to Vercel

1. Push the project to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add the four environment variables from `.env.local` in the Vercel dashboard
4. Deploy — done

---

## Getting Coordinates

To find lat/lng for a location:
1. Open [Google Maps](https://maps.google.com)
2. Right-click on the location
3. Click the coordinates at the top of the context menu to copy them

---

## Adding More Locations

Use the admin panel at `/admin/dashboard → Add Location`, or add entries directly to the `scripts/seed.ts` array and re-run `npm run seed`.
