# SiteReveal Stage 1 — guarded OpenAI generation

Stage 1 converts a verified, unpublished lead into a private review draft:

1. The admin sends the lead ID to a protected Vercel Function.
2. The function verifies the signed-in Supabase admin.
3. OpenAI returns a structured `SiteSpec` constrained to SiteReveal's six locked families.
4. SiteReveal's deterministic renderer creates the HTML.
5. Automated QA checks the draft and saves the job in Supabase.
6. The admin previews and downloads `index.html`.

The function does **not** publish the lead, write to GitHub, or deploy to Vercel. Human approval remains required.

## 1. Upgrade Supabase

Open Supabase → SQL Editor → New query.

Paste and run the complete contents of:

`automation-schema.sql`

This creates the private `generation_jobs` table and adds generation tracking fields to `leads`.

## 2. Create an OpenAI API key

Create a project API key in the OpenAI API dashboard. Do not paste the key into:

- `admin.html`
- `config.js`
- Supabase rows
- GitHub files

The key belongs only in Vercel's encrypted environment variables.

## 3. Add Vercel environment variables

In Vercel → SiteReveal project → Settings → Environment Variables, add:

| Key | Value | Environments |
| --- | --- | --- |
| `OPENAI_API_KEY` | Your OpenAI project API key | Production and Preview |
| `OPENAI_MODEL` | `gpt-5.6` | Production and Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings → API → service role secret | Production and Preview |

Keep the existing values:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ADMIN_EMAIL`
- `GOOGLE_PLACES_API_KEY`

`SUPABASE_SERVICE_ROLE_KEY` is server-only and highly privileged. Never expose it in browser code or commit it to GitHub.

## 4. Redeploy

After uploading this project to GitHub and adding the variables, redeploy the latest Vercel deployment so the new variables and `/api/generate-site` function become active.

## 5. Generate the first controlled draft

1. Sign in to `admin.html`.
2. Open an unpublished lead.
3. Set verification to `Verified`, set its stage to `Ready to Generate`, and save.
4. Reopen the lead.
5. Select **Generate review draft**.
6. Inspect the full preview and every QA check.
7. Confirm all business facts manually.
8. Download the generated `index.html`.

If you reload the admin, reopen the lead and select **Open latest draft**.

## Stage 1.1 quality review

The generation panel now accepts optional human review notes. Use these to correct
the next draft without editing prompts or code. For example:

> Make the copy more specific to painting decisions. Avoid repeating confirmation
> language. Use a warmer, craft-focused visual direction without claiming services
> that have not been verified.

Stage 1.1 also:

- normalizes a full street address into a clean locality label,
- requires distinct service topics and trust points,
- requires an industry-relevant visual motif,
- rejects repeated placeholder language,
- scores safety, content, design, and responsive behavior,
- blocks downloading a draft until every automated QA check passes.

## Stage 1.2 human-quality safeguards

The generator now also:

- limits hero headlines to eight words and a layout-safe length,
- generates business-specific section headings instead of fixed generic headings,
- rejects behind-the-scenes generation language in customer-facing copy,
- rejects known generic template filler,
- checks primary-color contrast against white text,
- uses a dark, high-contrast preview banner independent of the generated palette,
- makes the navigation call button dial the verified phone number,
- gives supported industries explicit positive and negative image instructions,
- falls back to category SVG artwork when no controlled image category exists,
- and warns human reviewers to reject images with unrelated tools or activities.

Automated QA still cannot understand image pixels. A human must confirm that the
activity, tools, setting, text, logos, anatomy, and overall image quality match the
business before catalog approval.

These checks improve draft quality but do not verify business claims. The complete
draft and every fact still require human review.

## Current safety gates

- Only the configured admin can call the generation endpoint.
- Unverified leads are rejected.
- Public leads are rejected.
- The model never writes raw HTML.
- Generated HTML contains no scripts.
- Repetitive or duplicate service cards fail QA.
- Full addresses are not presented as city names.
- Draft download is disabled when any QA check fails.
- The preview disclaimer is mandatory.
- Drafts remain private in Supabase.
- Publication is blocked until manual review and deployment.

## Recommended Stage 2 after five successful drafts

After five drafts pass human review without factual or layout problems:

- add controlled image selection,
- package the generated file into the exact `sites/<slug>/index.html` path,
- add a GitHub draft branch/commit workflow,
- run browser and mobile QA against the preview deployment,
- require one final admin approval before setting `published=true`.

Unattended publishing should remain disabled until this evidence exists.
