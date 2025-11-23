-- Supabase schema for CivicAI Autopilot

create table public.campaigns (
  id bigserial primary key,
  name text not null,
  niche text,
  target_description text,
  offer text,
  tone text,
  created_at timestamptz default now()
);

create table public.leads (
  id bigserial primary key,
  campaign_id bigint not null references public.campaigns(id) on delete cascade,
  name text,
  company text,
  email text not null,
  extra_data jsonb,
  status text default 'new',
  created_at timestamptz default now()
);

create table public.email_templates (
  id bigserial primary key,
  campaign_id bigint not null references public.campaigns(id) on delete cascade,
  type text not null, -- initial, followup1, followup2
  subject text not null,
  body text not null,
  created_at timestamptz default now()
);

create table public.scheduled_emails (
  id bigserial primary key,
  campaign_id bigint not null references public.campaigns(id) on delete cascade,
  lead_id bigint not null references public.leads(id) on delete cascade,
  template_id bigint not null references public.email_templates(id) on delete cascade,
  scheduled_for timestamptz not null,
  status text not null default 'pending', -- pending, sent, failed
  provider_message_id text,
  created_at timestamptz default now()
);

create table public.content_items (
  id bigserial primary key,
  campaign_id bigint not null references public.campaigns(id) on delete cascade,
  type text not null, -- linkedin_post, instagram_caption, ad_copy, video_script, etc.
  title text not null,
  body text not null,
  scheduled_for timestamptz,
  created_at timestamptz default now()
);
