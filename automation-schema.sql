-- SiteReveal Stage 1 automation upgrade
-- Run once in Supabase: SQL Editor > New query > paste > Run.
-- This adds a private generation queue. It does not publish any website.

alter table public.leads
  add column if not exists generation_status text not null default 'not_started',
  add column if not exists generation_attempts integer not null default 0,
  add column if not exists latest_generation_id uuid;

create table if not exists public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  status text not null default 'queued'
    check (status in ('queued','generating','review_ready','failed','approved','rejected')),
  model text not null default '',
  design_family text not null default '',
  site_spec jsonb,
  generated_html text,
  qa_results jsonb,
  error_message text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists generation_jobs_lead_created_idx
  on public.generation_jobs (lead_id, created_at desc);

alter table public.generation_jobs enable row level security;

drop policy if exists "Admin can manage generation jobs" on public.generation_jobs;
create policy "Admin can manage generation jobs"
on public.generation_jobs for all
to authenticated
using ((auth.jwt() ->> 'email') = 'freesevenluck@gmail.com')
with check ((auth.jwt() ->> 'email') = 'freesevenluck@gmail.com');

grant select, insert, update, delete on public.generation_jobs to authenticated;

-- Public/anonymous visitors intentionally receive no generation_jobs grants.
-- Keep generated drafts private until a human approves and deploys them.
