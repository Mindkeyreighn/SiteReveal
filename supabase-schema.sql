-- Run this entire file once in Supabase:
-- Dashboard > SQL Editor > New query > paste > Run

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  category text not null default 'trades',
  city text not null default '',
  phone text not null default '',
  email text,
  verification text not null default 'Needs Review',
  stage text not null default 'Research',
  status text not null default 'available',
  price numeric(10,2) not null default 399,
  tagline text not null default '',
  color text not null default '#1a56db',
  description text not null default '',
  site_path text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads enable row level security;

drop policy if exists "Public can view published leads" on public.leads;
create policy "Public can view published leads"
on public.leads for select
to anon
using (published = true);

drop policy if exists "Admin can manage all leads" on public.leads;
create policy "Admin can manage all leads"
on public.leads for all
to authenticated
using ((auth.jwt() ->> 'email') = 'freesevenluck@gmail.com')
with check ((auth.jwt() ->> 'email') = 'freesevenluck@gmail.com');

grant usage on schema public to anon, authenticated;
grant select on public.leads to anon;
grant select, insert, update, delete on public.leads to authenticated;

-- Optional starter placeholders. Remove this block if you want an empty database.
insert into public.leads
  (business_name,slug,category,city,verification,stage,status,price,tagline,color,description,published)
values
  ('Wize Guyz Irrigation','wize-guyz-irrigation','irrigation','Post Falls, ID','Verified','Ready to Generate','available',399,'Irrigation done smart','#0f6e56','Residential and commercial irrigation systems',true),
  ('Green Edge Landscaping','green-edge-landscaping','landscaping','Spokane Valley, WA','Needs Review','Research','available',399,'Landscapes that make an impression','#27500a','Full-service residential landscaping',true),
  ('Crystal Clear Cleaning Co.','crystal-clear-cleaning','cleaning','Coeur d''Alene, ID','Verified','Site Review','available',399,'Spotless every time','#185fa5','Residential deep cleaning and recurring service',true),
  ('Yard King Sprinklers','yard-king-sprinklers','irrigation','Coeur d''Alene, ID','Verified','Contacted','available',399,'Keep your yard thriving','#166534','Sprinkler installation and repair',true)
on conflict (slug) do nothing;

-- Safe upgrade for projects that created the leads table before site_path existed.
alter table public.leads add column if not exists site_path text not null default '';

insert into public.leads
  (business_name,slug,category,city,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('Northern Immortals LLC','northern-immortals','trades','North Idaho','Verified','Site Review','available',399,'Taxidermy and artisan jewelry','#4a1b0c','Custom taxidermy and handcrafted jewelry','sites/northern-immortals/index.html',true)
on conflict (slug) do update
set site_path = excluded.site_path,
    description = excluded.description,
    tagline = excluded.tagline;

insert into public.leads
  (business_name,slug,category,city,phone,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('TLC Lawn Care & Landscaping LLC','tlc-lawn-care-landscaping','landscaping','Coeur d''Alene, ID','(208) 967-2670','Verified','Site Review','available',399,'Your yard deserves a little more TLC','#123d2c','Lawn mowing, landscape maintenance, sod installation and yard cleanups','sites/tlc-lawn-care-landscaping/index.html',true)
on conflict (slug) do update
set site_path = excluded.site_path,
    phone = excluded.phone,
    description = excluded.description,
    tagline = excluded.tagline;

-- Price correction for any earlier $299 or $349 records.
-- Safe to run even if every record is already $399.
UPDATE public.leads SET price = 399 WHERE price <> 399;
