-- scheduled parent reminders (notification only, no task to complete)
create table nudges (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  child_id uuid not null references profiles(id) on delete cascade,
  message text not null,
  sender_name text,
  remind_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table nudges enable row level security;
create policy nudges_fam on nudges for all
  using (family_id = my_family_id()) with check (family_id = my_family_id());
