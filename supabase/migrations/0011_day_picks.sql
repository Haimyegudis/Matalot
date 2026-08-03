-- catalog chores pulled into a specific day's board
create table day_picks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  chore_id uuid not null references chores(id) on delete cascade,
  day date not null,
  added_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  unique (chore_id, day)
);

alter table day_picks enable row level security;
create policy day_picks_fam on day_picks for all
  using (family_id = my_family_id()) with check (family_id = my_family_id());

alter publication supabase_realtime add table day_picks;
