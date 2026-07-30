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

-- Lead Finder fields. Place IDs provide dependable duplicate detection.
alter table public.leads add column if not exists google_place_id text;
alter table public.leads add column if not exists google_maps_url text not null default '';
alter table public.leads add column if not exists source text not null default 'manual';
alter table public.leads add column if not exists source_rating numeric(2,1);
alter table public.leads add column if not exists source_review_count integer;

create unique index if not exists leads_google_place_id_unique
on public.leads (google_place_id)
where google_place_id is not null and google_place_id <> '';

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

-- Remove retired demonstration records from earlier SiteReveal versions.
delete from public.leads
where slug in (
  'spotless-solutions',
  'green-edge-landscaping',
  'crystal-clear-cleaning',
  'yard-king-sprinklers',
  'mm-property',
  'demo-landscaping',
  'demo-cleaning2',
  'demo-hvac',
  'cascade-hvac-services'
);

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
  ('Polished by Idella','polished-by-idella','nail artist','Coeur d''Alene, ID','(208) 964-2117','Verified','Site Review','available',399,'Details make it personal.','#5e3040','Independent nail artistry, custom details and appointment planning','sites/polished-by-idella/index.html',true)
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
  ('The Beauty Lounge','the-beauty-lounge','beauty salon','Coeur d''Alene, ID','(208) 666-1770','Verified','Site Review','available',399,'Your beauty team, all in one place.','#272321','Full-service salon for hair, color, blonding, nails and waxing','sites/the-beauty-lounge/index.html',true)
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
  ('VN Nails','vn-nails','nail salon','Coeur d''Alene, ID','(208) 966-4308','Verified','Site Review','available',399,'Color looks good on you.','#522552','Manicures, full sets, fills, custom nail designs and spa pedicures','sites/vn-nails/index.html',true)
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
  ('i Spa Nails','i-spa-nails','nail salon','Coeur d''Alene, ID','(208) 667-1666','Verified','Site Review','available',399,'Your look. Polished.','#171515','Manicures, acrylics, fills, French tips, nail art and pedicures','sites/i-spa-nails/index.html',true)
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
  ('Angelheart Pet Salon','angelheart-pet-salon','pet grooming','Coeur d''Alene, ID','(208) 667-8243','Verified','Site Review','available',399,'Care you can see in every detail.','#713f56','Established local pet grooming and attentive coat care','sites/angelheart-pet-salon/index.html',true)
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
  ('North Idaho School of Dog Obedience','north-idaho-school-dog-obedience','dog training','Hayden, ID','(208) 964-3638','Verified','Site Review','available',399,'Better manners begin together.','#102a43','Calm, clear, humane beginner obedience classes for dogs and owners','sites/north-idaho-school-dog-obedience/index.html',true)
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
insert into public.leads
  (business_name,slug,category,city,phone,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('J K Nails','jk-nails','nail salon','Post Falls, ID','(208) 981-0014','Verified','Site Review','available',399,'Polished with purpose.','#112747','Manicures, gel, dip powder, acrylic nails, nail art and pedicures','sites/jk-nails/index.html',true)
on conflict (slug) do update
set site_path = excluded.site_path,
    phone = excluded.phone,
    description = excluded.description,
    tagline = excluded.tagline,
    price = 399;

-- Price correction for any earlier $299 or $349 records.
-- Safe to run even if every record is already $399.
insert into public.leads
  (business_name,slug,category,city,phone,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('Bighouse Automotive','bighouse-automotive','mobile auto repair','Coeur d''Alene, ID','(208) 763-8426','Verified','Site Review','available',399,'The shop comes to you.','#111213','Mobile diagnostics, brakes, maintenance, electrical, engines, transmissions and roadside help','sites/bighouse-automotive/index.html',true)
on conflict (slug) do update
set site_path = excluded.site_path,
    phone = excluded.phone,
    description = excluded.description,
    tagline = excluded.tagline,
    price = 399;

-- Price correction for any earlier $299 or $349 records.
-- Safe to run even if every record is already $399.
insert into public.leads
  (business_name,slug,category,city,phone,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('Hanley''s Mobile Mechanics','hanleys-mobile-mechanics','mobile auto repair','Hayden, ID','(208) 620-9465','Verified','Site Review','available',399,'Good diagnosis comes first.','#173b31','Mobile diagnostics, repairs, used-vehicle inspections, diesel trucks and classic vehicles','sites/hanleys-mobile-mechanics/index.html',true)
on conflict (slug) do update
set site_path = excluded.site_path,
    phone = excluded.phone,
    description = excluded.description,
    tagline = excluded.tagline,
    price = 399;

-- Price correction for any earlier $299 or $349 records.
-- Safe to run even if every record is already $399.
insert into public.leads
  (business_name,slug,category,city,phone,verification,stage,status,price,tagline,color,description,site_path,published)
values
  ('Bonasera Mobile Repair LLC','bonasera-mobile-repair','boat & powersports repair','Hayden, ID','(208) 699-0121','Verified','Site Review','available',399,'Keep the season moving.','#0b2638','Boat, MerCruiser sterndrive, PWC, motorcycle and snowmobile service','sites/bonasera-mobile-repair/index.html',true)
on conflict (slug) do update
set site_path = excluded.site_path,
    phone = excluded.phone,
    description = excluded.description,
    tagline = excluded.tagline,
    price = 399;

-- Price correction for any earlier $299 or $349 records.
-- Safe to run even if every record is already $399.
UPDATE public.leads SET price = 399 WHERE price <> 399;
