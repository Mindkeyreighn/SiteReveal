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
  ('Quality Care Landscaping LLC','quality-care-landscaping','landscaping','Careywood, ID','(208) 603-9669','Verified','Site Review','available',399,'Good work shows. Quality care lasts.','#1f4933','Weekly lawn maintenance, de-thatching, property cleanups and snow removal','sites/quality-care-landscaping/index.html',true)
on conflict (slug) do update
set site_path = excluded.site_path,
    phone = excluded.phone,
    description = excluded.description,
    tagline = excluded.tagline,
    price = 399;

insert into public.leads
  (business_name,slug,category,city,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('Mullen Landscaping & Lawn Care','mullen-landscaping-lawn-care','landscaping','Rathdrum, ID','Verified','Site Review','available',399,'Built well. Kept sharp.','#a95032','Mowing, trimming, pruning, mulch, rock and irrigation','sites/mullen-landscaping-lawn-care/index.html',true)
on conflict (slug) do update
set business_name = excluded.business_name,
    site_path = excluded.site_path,
    description = excluded.description,
    tagline = excluded.tagline,
    price = 399;

insert into public.leads
  (business_name,slug,category,city,phone,email,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('Wize Guyz Irrigation LLC','wize-guyz-irrigation','irrigation','Post Falls, ID','(208) 704-8295','wizeguyzsprinklers@gmail.com','Verified','Site Review','available',399,'Better coverage. The Wize way.','#008fbd','Irrigation design, installation, repairs, blowouts and backflow testing','sites/wize-guyz-irrigation/index.html',true)
on conflict (slug) do update
set business_name = excluded.business_name,
    site_path = excluded.site_path,
    phone = excluded.phone,
    email = excluded.email,
    description = excluded.description,
    tagline = excluded.tagline,
    price = 399;

insert into public.leads
  (business_name,slug,category,city,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('Post Falls Lawn Care','post-falls-lawn-care','landscaping','Post Falls, ID','Verified','Site Review','available',399,'Less yard work. More weekend.','#173d2d','Local lawn mowing, edging, seasonal cleanup and property care','sites/post-falls-lawn-care/index.html',true)
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

insert into public.leads
  (business_name,slug,category,city,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('Whittaker''s Lawn Service','whittakers-lawn-service','landscaping','Coeur d''Alene, ID','Verified','Site Review','available',399,'A great lawn, without the hassle','#1464f4','Friendly local lawn mowing, edging and routine yard care','sites/whittakers-lawn-service/index.html',true)
on conflict (slug) do update
set site_path = excluded.site_path,
    description = excluded.description,
    tagline = excluded.tagline;

-- Price correction for any earlier $299 or $349 records.
insert into public.leads
  (business_name,slug,category,city,phone,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('Dawn''s Purple Poodle','dawns-purple-poodle','pet grooming','Coeur d''Alene, ID','(208) 704-4685','Verified','Site Review','available',399,'A fresh look with a gentle touch.','#4b2142','Caring local dog grooming, bathing, haircuts, nail trims and coat care','sites/dawns-purple-poodle/index.html',true)
on conflict (slug) do update
set site_path = excluded.site_path,
    phone = excluded.phone,
    description = excluded.description,
    tagline = excluded.tagline,
    price = 399;

-- Price correction for any earlier $299 or $349 records.
insert into public.leads
  (business_name,slug,category,city,phone,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('Apryl''s 3rd St Doghouse','apryls-3rd-st-doghouse','pet grooming','Coeur d''Alene, ID','(208) 664-5300','Verified','Site Review','available',399,'Where dogs are remembered by name.','#a84537','Friendly neighborhood dog grooming, haircuts, nail care and coat upkeep','sites/apryls-3rd-st-doghouse/index.html',true)
on conflict (slug) do update
set site_path = excluded.site_path,
    phone = excluded.phone,
    description = excluded.description,
    tagline = excluded.tagline,
    price = 399;

-- Price correction for any earlier $299 or $349 records.
insert into public.leads
  (business_name,slug,category,city,phone,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('Star''s Pet Grooming','stars-pet-grooming','pet grooming','Coeur d''Alene, ID','(208) 292-4547','Verified','Site Review','available',399,'Every dog deserves the star treatment.','#07192f','Experienced, patient grooming for different breeds, coats and temperaments','sites/stars-pet-grooming/index.html',true)
on conflict (slug) do update
set site_path = excluded.site_path,
    phone = excluded.phone,
    description = excluded.description,
    tagline = excluded.tagline,
    price = 399;

-- Price correction for any earlier $299 or $349 records.
insert into public.leads
  (business_name,slug,category,city,phone,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('Woof Pack Pet Spa','woof-pack-pet-spa','pet grooming','Coeur d''Alene, ID','(208) 610-8110','Verified','Site Review','available',399,'Fresh coat. Happy pup. Full tail wag.','#df735f','Bathing, haircuts, nail trims, ear cleaning and de-shedding','sites/woof-pack-pet-spa/index.html',true)
on conflict (slug) do update
set site_path = excluded.site_path,
    phone = excluded.phone,
    description = excluded.description,
    tagline = excluded.tagline,
    price = 399;

-- Price correction for any earlier $299 or $349 records.
insert into public.leads
  (business_name,slug,category,city,phone,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('B & R Boat Care Center','br-boat-care-center','boat repair','Rathdrum, ID','(208) 687-0820','Verified','Site Review','available',399,'Thirty years of keeping boats ready.','#102f29','Boat repair, storage, covers, upholstery and restoration care','sites/br-boat-care-center/index.html',true)
on conflict (slug) do update
set site_path = excluded.site_path,
    phone = excluded.phone,
    description = excluded.description,
    tagline = excluded.tagline,
    price = 399;

-- Price correction for any earlier $299 or $349 records.
insert into public.leads
  (business_name,slug,category,city,phone,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('Advance Marine and Industrial Coverings','advance-marine-industrial-coverings','marine upholstery','Hayden, ID','(208) 215-1768','Verified','Site Review','available',399,'Made to fit. Built to protect.','#123c65','Custom boat covers, upholstery, aircraft interiors, canvas goods and tarps','sites/advance-marine-industrial-coverings/index.html',true)
on conflict (slug) do update
set site_path = excluded.site_path,
    phone = excluded.phone,
    description = excluded.description,
    tagline = excluded.tagline,
    price = 399;

-- Price correction for any earlier $299 or $349 records.
insert into public.leads
  (business_name,slug,category,city,phone,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('Lake City Powder Coating','lake-city-powder-coating','powder coating','Coeur d''Alene, ID','(208) 664-9485','Verified','Site Review','available',399,'Color that works as hard as the metal.','#1264db','Custom powder coating for wheels, frames, vehicle parts and metal projects','sites/lake-city-powder-coating/index.html',true)
on conflict (slug) do update
set site_path = excluded.site_path,
    phone = excluded.phone,
    description = excluded.description,
    tagline = excluded.tagline,
    price = 399;

-- Price correction for any earlier $299 or $349 records.
insert into public.leads
  (business_name,slug,category,city,phone,email,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('NozWorx Mobile Detail','nozworx-mobile-detail','auto detailing','Post Falls, ID','(208) 889-2740','NozWorxMobile@gmail.com','Verified','Site Review','available',399,'We wash. We wax. You relax.','#718800','Mobile detailing, paint correction, ceramic coating and monthly care','sites/nozworx-mobile-detail/index.html',true)
on conflict (slug) do update
set site_path = excluded.site_path,
    phone = excluded.phone,
    email = excluded.email,
    description = excluded.description,
    tagline = excluded.tagline,
    price = 399;

-- Price correction for any earlier $299 or $349 records.
insert into public.leads
  (business_name,slug,category,city,phone,email,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('OCDetail','ocdetail','auto detailing','Post Falls, ID','(406) 396-9798','pnwocdetail@gmail.com','Verified','Site Review','available',399,'Showroom clean. Driveway convenient.','#1459e6','Luxury mobile interior, exterior and protection detailing','sites/ocdetail/index.html',true)
on conflict (slug) do update
set site_path = excluded.site_path,
    phone = excluded.phone,
    email = excluded.email,
    description = excluded.description,
    tagline = excluded.tagline,
    price = 399;

-- Price correction for any earlier $299 or $349 records.
insert into public.leads
  (business_name,slug,category,city,phone,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('Black Ops Detailing','black-ops-detailing','auto detailing','Hayden, ID','(208) 771-2405','Verified','Site Review','available',399,'Mission: Immaculate.','#e79a2d','Professional interior, exterior and complete vehicle detailing','sites/black-ops-detailing/index.html',true)
on conflict (slug) do update
set business_name = excluded.business_name,
    site_path = excluded.site_path,
    phone = excluded.phone,
    description = excluded.description,
    tagline = excluded.tagline,
    price = 399;

-- Price correction for any earlier $299 or $349 records.
-- Safe to run even if every record is already $399.
UPDATE public.leads SET price = 399 WHERE price <> 399;
