SITEREVEAL PORTABLE EDITION
===========================

This folder is yours. It does not require ChatGPT hosting.

FILES
-----
index.html            Public SiteReveal website
admin.html            Private owner login and lead manager
config.js             Your Supabase public settings and Stripe Payment Link
supabase-schema.sql   Tables and security rules for Supabase
sites/                Complete business websites shown by SiteReveal

CURRENT COMPLETE WEBSITES
-------------------------
sites/northern-immortals/   Northern Immortals LLC
sites/tlc-lawn-care-landscaping/   TLC Lawn Care & Landscaping LLC
sites/whittakers-lawn-service/   Whittaker's Lawn Service
sites/post-falls-lawn-care/   Post Falls Lawn Care
sites/wize-guyz-irrigation/   Wize Guyz Irrigation LLC
sites/yard-king-lawn-care/   Yard King Lawn Care
sites/clear-cut-lawn/   Clear Cut Lawn LLC
sites/quality-care-landscaping/   Quality Care Landscaping LLC
sites/mullen-landscaping-lawn-care/   Mullen Landscaping & Lawn Care
sites/black-ops-detailing/   Black Ops Detailing
sites/ocdetail/   OCDetail
sites/nozworx-mobile-detail/   NozWorx Mobile Detail (redesign concept)
sites/lake-city-powder-coating/   Lake City Powder Coating
sites/advance-marine-industrial-coverings/   Advance Marine and Industrial Coverings
sites/br-boat-care-center/   B & R Boat Care Center
sites/woof-pack-pet-spa/   Woof Pack Pet Spa
sites/stars-pet-grooming/   Star's Pet Grooming
sites/apryls-3rd-st-doghouse/   Apryl's 3rd St Doghouse

FIRST-TIME DATABASE SETUP
-------------------------
1. Sign in to your Supabase project.
2. Open SQL Editor.
3. Create a new query.
4. Copy all contents of supabase-schema.sql into the query and click Run.
5. Under Authentication > Users, confirm freesevenluck@gmail.com exists.

TESTING LOCALLY
---------------
Do not double-click the HTML files for full testing. Browser security can block
database requests when a page is opened as file://.

Instead, serve this folder with any small local web server. For example:

  python -m http.server 8080

Then visit:
  http://localhost:8080/
  http://localhost:8080/admin.html

HOSTING IT ANYWHERE
-------------------
Upload all files in this folder, keeping them together. Static hosts such as
Netlify, Cloudflare Pages, GitHub Pages, and ordinary shared web hosting work.

After choosing a permanent domain, add these addresses in Supabase:
Authentication > URL Configuration

  Site URL:       https://yourdomain.com
  Redirect URL:  https://yourdomain.com/admin.html

SECURITY
--------
The anon key in config.js is a public browser key. Supabase Row Level Security
protects the records. Never put a service_role key in any HTML or JavaScript.

Only the authenticated account freesevenluck@gmail.com is allowed to create,
edit, or delete leads. Public visitors can only read published listings.

PRICING
-------
All sites are priced at $399 (flat fee). The admin panel defaults to $399
for every new lead. The supabase-schema.sql seeds starter records at $399.

PURCHASE AND PERSONALIZATION
----------------------------
The $399 purchase includes the website files, full ownership, one focused
personalization package, and one consolidated revision round. Personalization
includes one brand color/typography direction, the buyer's logo, up to six
buyer-supplied photos, verified updates to the existing business details and
services, selected visual accents, and one submitted list of up to ten edits.

Extra pages, major layout changes, advanced forms, booking, integrations,
new custom imagery, extensive copywriting, domain registration, hosting, and
launch assistance are separate quoted upgrades. The public purchase buttons
now open Stripe-hosted Checkout. The sandbox URL is stored once in config.js.
Every checkout includes the selected site's slug as Stripe's
client_reference_id for reconciliation. The buyer must still type the
business/site name into the required Stripe field.

STRIPE SANDBOX
--------------
Current test checkout:
  https://buy.stripe.com/test_bJedRbcw37H48mpfMw0Fi00

No Stripe secret key is stored in this project. Test payments are processed on
Stripe's hosted sandbox page and do not move real money.

Before accepting real payments:
1. Activate and verify the SiteReveal Stripe live account.
2. Copy or recreate the $399 product and Payment Link in live mode.
3. Confirm the live link collects name, business name, phone, selected website,
   and optional initial customization requests.
4. Set Stripe Checkout policy links to this site's terms.html and privacy.html.
5. Replace only stripePaymentLink in config.js with the live buy.stripe.com URL.
6. Change stripeMode in config.js from "sandbox" to "live".
7. Run one live verification before outreach begins.

If you ran an earlier version of this schema (v1, which used $299), the
SQL file now includes a correction UPDATE at the bottom. Run the full file
again in Supabase SQL Editor — the on conflict clause skips re-inserting
duplicates, and the UPDATE corrects any records still at $299.

PORTABILITY
-----------
To move SiteReveal, upload this same folder to the new host and update the
Supabase URL Configuration. The website files remain fully owned by you.

The Supabase project is also under your own account. You can export its database
later if you ever decide to move to another database provider.

LATEST SITE
-----------
sites/dawns-purple-poodle/   Dawn's Purple Poodle
sites/north-idaho-school-dog-obedience/   North Idaho School of Dog Obedience
sites/angelheart-pet-salon/   Angelheart Pet Salon
sites/i-spa-nails/   i Spa Nails
sites/vn-nails/   VN Nails
sites/the-beauty-lounge/   The Beauty Lounge
sites/polished-by-idella/   Polished by Idella
sites/jk-nails/             J K Nails
sites/bighouse-automotive/  Bighouse Automotive
sites/hanleys-mobile-mechanics/   Hanley's Mobile Mechanics
sites/bonasera-mobile-repair/   Bonasera Mobile Repair LLC
