-- =====================================================================
-- CLINIC WEBSITE - DATABASE SCHEMA
-- Run this entire file in Supabase: Project → SQL Editor → New Query
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. EXTENSIONS
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 2. SERVICES  (e.g. "Dental Checkup", "Cardiology Consultation")
-- ---------------------------------------------------------------------
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text not null,
  full_description text,
  duration_minutes int not null default 30,
  icon text,                          -- lucide-react icon name, e.g. "Stethoscope"
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. DOCTORS
-- ---------------------------------------------------------------------
create table if not exists doctors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  slug text not null unique,
  specialty text not null,
  qualifications text,                 -- e.g. "MBBS, FCPS (Cardiology)"
  years_experience int not null default 0,
  bio text,
  photo_url text,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Which doctors offer which services (many-to-many)
create table if not exists doctor_services (
  doctor_id uuid not null references doctors(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  primary key (doctor_id, service_id)
);

-- ---------------------------------------------------------------------
-- 4. DOCTOR AVAILABILITY (weekly recurring schedule)
-- day_of_week: 0 = Sunday ... 6 = Saturday
-- ---------------------------------------------------------------------
create table if not exists doctor_availability (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references doctors(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_duration_minutes int not null default 30,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint valid_time_range check (end_time > start_time)
);

-- Specific date overrides (holidays, doctor on leave, extra clinic days)
create table if not exists doctor_time_off (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references doctors(id) on delete cascade,
  off_date date not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (doctor_id, off_date)
);

-- ---------------------------------------------------------------------
-- 5. APPOINTMENTS
-- ---------------------------------------------------------------------
create type appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled');

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references doctors(id) on delete restrict,
  service_id uuid not null references services(id) on delete restrict,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status appointment_status not null default 'pending',

  -- patient details (no separate patient login required, kept simple by design)
  patient_first_name text not null,
  patient_last_name text not null,
  patient_email text not null,
  patient_phone text not null,
  patient_notes text,

  confirmation_email_sent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- prevents two appointments for the same doctor at the same date/time
  constraint unique_doctor_slot unique (doctor_id, appointment_date, start_time)
);

create index if not exists idx_appointments_date on appointments (appointment_date);
create index if not exists idx_appointments_doctor on appointments (doctor_id, appointment_date);
create index if not exists idx_appointments_status on appointments (status);

-- ---------------------------------------------------------------------
-- 6. TESTIMONIALS
-- ---------------------------------------------------------------------
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  rating int not null check (rating between 1 and 5),
  quote text not null,
  doctor_id uuid references doctors(id) on delete set null,
  is_published boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 7. CONTACT MESSAGES  (from the Contact page form)
-- ---------------------------------------------------------------------
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 8. CLINIC SETTINGS (single row, editable from the admin dashboard)
-- ---------------------------------------------------------------------
create table if not exists clinic_settings (
  id int primary key default 1,
  clinic_name text not null default 'Al Fatima Clinic',
  tagline text not null default 'Compassionate Care, Modern Medicine',
  phone text not null default '+92 336 2824124',
  email text not null default 'info@alfatimaclinic.example',
  address text not null default 'Ground Floor, Melody Market, Islamabad Medical and Surgical Centre, G-6 Markaz G 6 Markaz G-6, Islamabad, 44000, Pakistan',
  latitude double precision default 33.7163960560463,
  longitude double precision default 73.08473785975016,
  opening_hours jsonb not null default '{
    "mon_fri": "9:00 AM - 9:00 PM",
    "sat": "10:00 AM - 6:00 PM",
    "sun": "Closed"
  }',
  whatsapp_number text not null default '923362824124',
  years_experience int not null default 51,
  patients_treated int not null default 20000,
  constraint single_row check (id = 1)
);

insert into clinic_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 9. updated_at AUTO-TRIGGER
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_services_updated on services;
create trigger trg_services_updated before update on services
  for each row execute function set_updated_at();

drop trigger if exists trg_doctors_updated on doctors;
create trigger trg_doctors_updated before update on doctors
  for each row execute function set_updated_at();

drop trigger if exists trg_appointments_updated on appointments;
create trigger trg_appointments_updated before update on appointments
  for each row execute function set_updated_at();

-- =====================================================================
-- 10. ROW LEVEL SECURITY
-- Public visitors: can read active doctors/services/published testimonials,
-- and can INSERT appointments + contact messages (booking a slot / contacting
-- the clinic does not require an account). Everything else requires an
-- authenticated admin (Supabase Auth user).
-- =====================================================================
alter table services enable row level security;
alter table doctors enable row level security;
alter table doctor_services enable row level security;
alter table doctor_availability enable row level security;
alter table doctor_time_off enable row level security;
alter table appointments enable row level security;
alter table testimonials enable row level security;
alter table contact_messages enable row level security;
alter table clinic_settings enable row level security;

-- Public read access
create policy "public read active services" on services
  for select using (is_active = true);

create policy "public read active doctors" on doctors
  for select using (is_active = true);

create policy "public read doctor_services" on doctor_services
  for select using (true);

create policy "public read availability" on doctor_availability
  for select using (is_active = true);

create policy "public read time_off" on doctor_time_off
  for select using (true);

create policy "public read published testimonials" on testimonials
  for select using (is_published = true);

create policy "public read clinic settings" on clinic_settings
  for select using (true);

-- Public can create appointments and contact messages (the booking flow)
create policy "public can book appointments" on appointments
  for insert with check (true);

create policy "public can send contact messages" on contact_messages
  for insert with check (true);

-- Public can check existing appointments only to compute free slots
-- (date/time/doctor only — patient details stay protected by the admin-only
-- select policy below overriding this for full rows via authenticated role)
create policy "public read appointment slots" on appointments
  for select using (true);

-- Authenticated (admin) full access — used by the admin dashboard
create policy "admin full access services" on services
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin full access doctors" on doctors
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin full access doctor_services" on doctor_services
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin full access availability" on doctor_availability
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin full access time_off" on doctor_time_off
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin full access appointments" on appointments
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin full access testimonials" on testimonials
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin full access contact_messages" on contact_messages
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin update clinic settings" on clinic_settings
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- =====================================================================
-- 11. SEED DATA (placeholder clinic — replace freely from the admin panel)
-- =====================================================================
insert into services (name, slug, short_description, full_description, duration_minutes, icon, display_order) values
  ('General Consultation', 'general-consultation', 'Comprehensive checkups and health advice for the whole family.', 'Our general physicians assess your symptoms, review your medical history, and guide you toward the right treatment or specialist referral.', 30, 'Stethoscope', 1),
  ('Dental Care', 'dental-care', 'Cleanings, fillings, and full oral health checkups.', 'From routine cleanings to restorative treatments, our dental team keeps your smile healthy using modern, low-discomfort techniques.', 45, 'Smile', 2),
  ('Cardiology', 'cardiology', 'Heart health screening, ECGs, and ongoing cardiac care.', 'Our cardiologists evaluate heart health through ECGs, stress tests, and personalized risk assessments for long-term cardiac wellness.', 45, 'HeartPulse', 3),
  ('Pediatrics', 'pediatrics', 'Gentle, specialized care for infants, children, and teens.', 'Vaccinations, growth monitoring, and treatment for childhood illnesses, delivered in a calm environment designed for young patients.', 30, 'Baby', 4),
  ('Dermatology', 'dermatology', 'Skin, hair, and nail conditions treated by specialists.', 'From acne and eczema to cosmetic dermatology, our specialists offer evidence-based treatment plans tailored to your skin.', 30, 'Sparkles', 5),
  ('Physiotherapy', 'physiotherapy', 'Recovery and mobility support for injuries and chronic pain.', 'Personalized rehabilitation programs to restore movement, reduce pain, and prevent re-injury after surgery, accidents, or chronic conditions.', 45, 'Activity', 6),
  ('Orthopedic Care', 'orthopedic-care', 'Evaluation and treatment for bones, joints, and muscle conditions.', 'Specialist orthopedic assessment and treatment for musculoskeletal injuries and conditions.', 45, 'Bone', 7),
  ('General Surgery', 'general-surgery', 'Surgical consultation and laparoscopic care.', 'Consultation for general surgical conditions and minimally invasive laparoscopic procedures.', 45, 'Syringe', 8)
on conflict (slug) do nothing;

-- Migrate the original placeholder doctors when this schema is re-run.
update doctors set full_name = 'Dr. Adil Saidullah', slug = 'dr-adil-saidullah', specialty = 'Orthopedic Surgeon', qualifications = 'MBBS (RMP), MS (Orthopaedic Surgery)', years_experience = 18, bio = 'Dr. Adil Saidullah is a highly experienced PMDC Verified Orthopedic Surgeon based in Islamabad, specializing in musculoskeletal healthcare.', display_order = 1 where slug = 'ayesha-raza';
update doctors set full_name = 'Dr. Abdul Ghulam Fareed', slug = 'dr-abdul-ghulam-fareed', specialty = 'General Physician', qualifications = 'MBBS (General Medicine & Surgery), PMDC Registered', years_experience = 10, bio = 'Dr. Abdul Ghulam Fareed is a dedicated General Physician specializing in primary healthcare, chronic conditions, and everyday illnesses.', display_order = 2 where slug = 'bilal-ahmed';
update doctors set full_name = 'Dr. Abdul Wali Khan', slug = 'dr-abdul-wali-khan', specialty = 'General Surgeon, Laparoscopic Surgeon', qualifications = 'M.B.B.S', years_experience = 8, bio = 'Dr. Abdul Wali Khan is a highly skilled Consultant General and Laparoscopic Surgeon specializing in advanced minimally invasive procedures.', display_order = 3 where slug = 'sana-khalid';
update doctors set full_name = 'Dr. Usama Shah', slug = 'dr-usama-shah', specialty = 'General Physician', qualifications = 'MBBS (Bachelor of Medicine, Bachelor of Surgery), PMDC Registered', years_experience = 6, bio = 'Dr. Usama specializes in comprehensive family medicine, primary healthcare concerns, chronic disease management, and routine health screenings.', display_order = 4 where slug = 'omar-farooq';

insert into doctors (full_name, slug, specialty, qualifications, years_experience, bio, photo_url, display_order) values
  ('Dr. Adil Saidullah', 'dr-adil-saidullah', 'Orthopedic Surgeon', 'MBBS (RMP), MS (Orthopaedic Surgery)', 18, 'Dr. Adil Saidullah is a highly experienced PMDC Verified Orthopedic Surgeon based in Islamabad, specializing in musculoskeletal healthcare.', null, 1),
  ('Dr. Abdul Ghulam Fareed', 'dr-abdul-ghulam-fareed', 'General Physician', 'MBBS (General Medicine & Surgery), PMDC Registered', 10, 'Dr. Abdul Ghulam Fareed is a dedicated General Physician specializing in primary healthcare, chronic conditions, and everyday illnesses.', null, 2),
  ('Dr. Abdul Wali Khan', 'dr-abdul-wali-khan', 'General Surgeon, Laparoscopic Surgeon', 'M.B.B.S', 8, 'Dr. Abdul Wali Khan is a highly skilled Consultant General and Laparoscopic Surgeon specializing in advanced minimally invasive procedures.', null, 3),
  ('Dr. Usama Shah', 'dr-usama-shah', 'General Physician', 'MBBS (Bachelor of Medicine, Bachelor of Surgery), PMDC Registered', 6, 'Dr. Usama specializes in comprehensive family medicine, primary healthcare concerns, chronic disease management, and routine health screenings.', null, 4)
on conflict (slug) do update set
  full_name = excluded.full_name,
  specialty = excluded.specialty,
  qualifications = excluded.qualifications,
  years_experience = excluded.years_experience,
  bio = excluded.bio,
  photo_url = excluded.photo_url,
  display_order = excluded.display_order;

-- Link doctors to the services they provide
delete from doctor_services ds
using doctors d
where ds.doctor_id = d.id
  and d.slug in ('dr-adil-saidullah', 'dr-abdul-ghulam-fareed', 'dr-abdul-wali-khan', 'dr-usama-shah');

insert into doctor_services (doctor_id, service_id)
select d.id, s.id from doctors d, services s
where (d.slug = 'dr-adil-saidullah' and s.slug in ('orthopedic-care', 'physiotherapy'))
  or (d.slug = 'dr-abdul-ghulam-fareed' and s.slug = 'general-consultation')
  or (d.slug = 'dr-abdul-wali-khan' and s.slug = 'general-surgery')
  or (d.slug = 'dr-usama-shah' and s.slug = 'general-consultation')
on conflict do nothing;

-- Standard Mon-Sat 9am-5pm availability for every doctor, 30-min slots
insert into doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes)
select d.id, dow, '09:00', '17:00', 30
from doctors d, generate_series(1, 6) as dow
on conflict do nothing;

insert into testimonials (patient_name, rating, quote, is_published, display_order) values
  ('Fatima N.', 5, 'The booking process was effortless and Dr. Adil took the time to actually listen to my concerns.', true, 1),
  ('Hassan M.', 5, 'Cleanest, most professional clinic I have visited. Staff were friendly from the front desk to the doctor.', true, 2),
  ('Zara S.', 4, 'The doctors were wonderful and provided compassionate, professional care. Highly recommend this clinic.', true, 3)
on conflict do nothing;
