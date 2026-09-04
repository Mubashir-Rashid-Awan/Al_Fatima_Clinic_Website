# Clinic Website — Online Appointment Booking

A production-ready clinic website with a real-time appointment booking system, admin
dashboard, and email confirmations. Built to be demoed to clinic clients and handed
over with minimal friction.

## Feature Overview

Public site
- Homepage with hero, trust stats, services overview, doctor highlights, testimonials
- Services page with full descriptions and per-service booking links
- Doctor profiles with "Book with this doctor" deep links
- Four-step booking flow: service and doctor, live date and time slots, patient details, confirmation
- Real appointment confirmation emails via Resend
- Contact page with form, clinic details, opening hours, and embedded Google Map
- FAQ page, About page, floating WhatsApp click-to-chat button
- SEO: per-page metadata, Open Graph tags, sitemap.xml, robots.txt
- Fully responsive, mobile-first

Admin dashboard (at /admin, protected by Supabase Auth)
- Appointments: stats, filterable table, one-click status changes (pending, confirmed, completed, cancelled)
- Doctors: add, edit, delete, show or hide
- Services: add, edit, delete, show or hide
- Messages: read contact form submissions, mark read or unread

Booking integrity
- Slots are computed from each doctor's weekly schedule, minus existing bookings, time off, and past times
- Double-booking is prevented twice: a re-check at submit time plus a database unique constraint as the final safety net
- Row Level Security: the public can only read active content and create bookings; everything else requires an authenticated admin

## Tech Stack

| Layer      | Choice                                  |
| ---------- | --------------------------------------- |
| Framework  | Next.js 16 (App Router) + TypeScript    |
| Styling    | Tailwind CSS v4 + shadcn/ui             |
| Database   | Supabase (PostgreSQL + Auth)            |
| Forms      | React Hook Form + Zod                   |
| Calendar   | React Day Picker (via shadcn Calendar)  |
| Email      | Resend                                  |
| Deployment | Vercel                                  |

Note: the project was scaffolded on the current Next.js release (16.x), which is the
direct successor to Next.js 15 with the same App Router architecture. The only
convention difference you will notice is that route protection lives in
`src/proxy.ts` (Next 16's name for what Next 15 called `middleware.ts`).

## Setup (about 15 minutes)

### 1. Install dependencies

```bash
npm install
```

### 2. Create the Supabase project

1. Go to https://supabase.com and create a free project.
2. In the dashboard, open SQL Editor, create a New Query, paste the entire contents
   of `supabase/schema.sql`, and Run it. This creates every table, all security
   policies, and seed data (placeholder doctors, services, testimonials).
3. Open Project Settings -> API and copy three values: the Project URL, the anon
   public key, and the service_role key.

### 3. Create the admin user

1. In Supabase, go to Authentication -> Users -> Add User -> Create new user.
2. Enter the email and password the clinic staff will use, and check
   "Auto Confirm User".
3. That login now works at `/admin/login` on the site.

### 4. Create the Resend account (email confirmations)

1. Go to https://resend.com and sign up (free tier).
2. Create an API key under API Keys.
3. For instant testing you can send from `onboarding@resend.dev`. For production,
   verify the clinic's domain under Domains and use an address like
   `bookings@yourclinic.com`.

Note that Resend's test address can only deliver to the email you signed up with
until a domain is verified. Bookings still succeed even if the email fails; the
email step never blocks the appointment.

### 5. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in every value in `.env.local`. Each variable is documented inside the file.

### 6. Run it

```bash
npm run dev
```

Open http://localhost:3000. The seed data means the site is fully populated from
the first load: doctors, services, testimonials, and bookable time slots
(Mon-Sat, 9:00-17:00, 30-minute slots for every doctor).

## Customizing for a Real Clinic

- Clinic name, tagline, phone, email, address, map coordinates, opening hours,
  WhatsApp number, and trust stats all live in the `clinic_settings` table
  (one row). Edit it in Supabase Table Editor.
- Doctors and services are managed from the admin dashboard at `/admin`.
- Doctor schedules live in `doctor_availability` (weekly recurring blocks) and
  `doctor_time_off` (specific dates off). Edit these in Supabase Table Editor.
- The color theme is defined in `src/app/globals.css` (`:root` block). The current
  palette is a clinical teal; changing `--primary` cascades through the whole UI.
- Site-wide SEO defaults are in `src/app/layout.tsx`.

## Deploying to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, import the repository. It auto-detects Next.js.
3. Add the same environment variables from `.env.local` in
   Project Settings -> Environment Variables, changing `NEXT_PUBLIC_SITE_URL`
   to the deployed URL (e.g. `https://yourclinic.vercel.app` or a custom domain).
4. Deploy. The free tier is sufficient for a demo and for most small clinics.

## Project Structure

```
supabase/schema.sql          Full database schema + RLS + seed data (run once)
src/proxy.ts                 Auth protection for /admin routes
src/app/                     Pages (public site + /admin dashboard + API routes)
src/components/site/         Header, footer, WhatsApp button, contact form, etc.
src/components/booking/      The four-step booking flow
src/components/admin/        Dashboard tables and forms
src/lib/supabase/            Browser, server, and admin Supabase clients
src/lib/booking/             Slot computation + booking/contact server actions
src/lib/admin/               Admin server actions (status updates, CRUD)
src/lib/email/               Resend confirmation email
src/lib/validations/         Zod schemas shared by client forms and server actions
src/types/database.types.ts  TypeScript types mirroring the database schema
```

## Troubleshooting

- "Missing Supabase environment variables": `.env.local` is missing or incomplete.
- Booking succeeds but no email arrives: check `RESEND_API_KEY`, and remember the
  test sender only delivers to your own Resend signup email until a domain is
  verified. The appointment is still saved either way.
- Admin login says invalid credentials: the user must exist in Supabase under
  Authentication -> Users with "Auto Confirm User" checked.
- No time slots appear: confirm `doctor_availability` has rows for that doctor and
  that the date is not in `doctor_time_off`. Sundays have no availability in the
  seed data by design.
