# Lanka Map — Project Brief

## Project Overview

**Lanka Map** is an interactive tourist discovery platform for Sri Lanka. It presents 157 carefully curated locations on a Leaflet-powered map, allowing travellers to explore the island's beaches, temples, wildlife parks, waterfalls, hiking trails, historical sites, viewpoints, museums, and gardens — all in one place.

---

## Problem Statement

Sri Lanka is a compact but extraordinarily diverse destination. Travellers planning a trip face the challenge of discovering and comparing locations scattered across guide books, blog posts, and separate travel platforms. There is no single, fast, map-first resource that shows everything at a glance with accurate entry fees and opening hours.

---

## Goals

1. Give travellers an instant visual overview of all major tourist locations across Sri Lanka.
2. Enable rapid filtering by location type so users can plan category-specific itineraries (e.g. "show me all waterfalls").
3. Surface practical details (entry fee, hours, directions) with one click — without leaving the page.
4. Provide a lightweight admin interface so the content owner can keep location data accurate over time.

---

## Target Audience

| Segment | Description |
|---------|-------------|
| International Tourists | First-time visitors to Sri Lanka planning a multi-week trip |
| Budget Travellers | Backpackers comparing free vs paid attractions |
| Repeat Visitors | Travellers looking to discover off-the-beaten-track locations |
| Tour Operators | Small operators building custom itineraries |
| Content Owner | Admin user maintaining and growing the location database |

---

## Key Features (v1)

| Feature | Description |
|---------|-------------|
| Interactive Map | Leaflet map centred on Sri Lanka with OpenStreetMap tiles |
| Marker Clustering | Nearby markers group at lower zoom levels for readability |
| Category Filters | 10 category filters (Beach, Temple, Wildlife, Hiking, Waterfall, Historical, Viewpoint, Museum, Garden, Other) |
| Location Detail Panel | Slide-out panel with photo, description, entry fee, hours, and Google Maps link |
| Admin Dashboard | Password-protected CRUD interface for managing locations |
| Photo Upload | Admin can upload photos to Supabase Storage |
| Contact Page | Public contact form that delivers messages to the site owner |
| How-To Guide | In-app guide explaining how to use the map |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Map | Leaflet, react-leaflet, leaflet.markercluster |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Auth | Session-based (httpOnly cookie) |
| Email | Nodemailer (SMTP / Gmail) |
| Deployment | Vercel |

---

## Architecture

```
Browser
  └── Next.js App (Vercel)
        ├── Public Pages
        │     ├── / (Map + Filters + Location Panel)
        │     ├── /how-to (User Guide)
        │     └── /contact (Contact Form)
        ├── Admin Pages
        │     ├── /admin (Login)
        │     └── /admin/dashboard (CRUD)
        └── API Routes
              ├── GET  /api/locations
              ├── POST /api/admin/login
              ├── POST|PUT|DELETE /api/admin/locations
              ├── POST /api/admin/upload
              └── POST /api/contact
```

---

## Data Model

The core entity is a **Location**:

```
Location {
  id          UUID (PK)
  name        TEXT
  category    TEXT  (Beach | Temple | Wildlife | Hiking | Waterfall |
                     Historical | Viewpoint | Museum | Garden | Other)
  lat         FLOAT
  lng         FLOAT
  description TEXT
  entry_fee   TEXT
  hours       TEXT
  photo_url   TEXT (nullable)
  created_at  TIMESTAMP
}
```

157 locations are seeded via `scripts/seed.ts`. New locations are added through the admin dashboard.

---

## Project Structure

```
lanka-map/
├── app/
│   ├── layout.tsx            Global layout
│   ├── page.tsx              Home page (map)
│   ├── how-to/page.tsx       How-to guide
│   ├── contact/page.tsx      Contact form
│   ├── admin/
│   │   ├── page.tsx          Admin login
│   │   └── dashboard/page.tsx Admin dashboard
│   └── api/
│       ├── locations/        Public location fetch
│       ├── contact/          Contact email
│       └── admin/            Auth, location CRUD, upload
├── components/
│   ├── SiteHeader.tsx        Shared navigation header
│   ├── Map.tsx               Leaflet map wrapper
│   ├── CategoryFilter.tsx    Category filter bar
│   ├── LocationPanel.tsx     Location detail panel
│   ├── LocationPopup.tsx     Map marker popup
│   └── AdminLocationForm.tsx Admin add/edit form
├── lib/
│   ├── types.ts              TypeScript types
│   ├── supabase.ts           Supabase client
│   └── auth.ts               Admin session helper
├── scripts/
│   └── seed.ts               Database seed script
├── supabase/
│   └── schema.sql            Database schema
└── docs/
    ├── project-brief.md      This document
    ├── requirements.md       Functional & non-functional requirements
    └── locations.md          Full location directory
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin writes) |
| `ADMIN_PASSWORD` | Password for admin login |
| `SMTP_HOST` | SMTP server host (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (e.g. `587`) |
| `SMTP_USER` | SMTP username / Gmail address |
| `SMTP_PASS` | SMTP password / Gmail app password |
| `CONTACT_TO_EMAIL` | Destination email for contact form |

---

## Roadmap (Post-v1 Ideas)

| Feature | Notes |
|---------|-------|
| Search bar | Full-text search across location names and descriptions |
| Favourites | LocalStorage-based bookmark system |
| Trip planner | Drag-and-drop itinerary builder |
| User ratings | Star rating + short review per location |
| Seasonal filters | Filter by best-visit month |
| Budget filter | Free / budget / moderate / premium tiers |
| Multi-language | Sinhala and Tamil translations |
| PWA / Offline | Cache map tiles and location data for offline use |
| Nearby suggestions | Show closest locations when a marker is selected |
| Social sharing | Share a specific location via URL or WhatsApp |

---

## Contact

For queries about this project contact **aalwishewa@gmail.com** or use the in-app [Contact page](/contact).
