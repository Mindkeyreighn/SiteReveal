SITEREVEAL PORTABLE EDITION
===========================

This folder is yours. It does not require ChatGPT hosting.

FILES
-----
index.html            Public SiteReveal website
admin.html            Private owner login and lead manager
config.js             Your Supabase public connection settings
supabase-schema.sql   Tables and security rules for Supabase

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
