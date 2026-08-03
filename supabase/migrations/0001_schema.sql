-- Matalot core schema
create table families (
  id uuid primary key default gen_random_uuid(),
  owner_uid uuid not null unique references auth.users(id),
  name text not null,
  parent_pin_hash text not null
);

create table profiles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  role text not null check (role in ('parent','child')),
  avatar jsonb,
  photo_url text,
  color text not null default '#f59e0b',
  sort int not null default 0
);

create table chores (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  icon text not null default 'star',
  points int not null default 1 check (points between 1 and 99),
  assigned_to uuid references profiles(id) on delete set null,
  is_shower boolean not null default false,
  active boolean not null default true,
  sort int not null default 0
);

create table completions (
  id uuid primary key default gen_random_uuid(),
  chore_id uuid not null references chores(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  completed_at timestamptz not null default now(),
  day date not null,
  revoked_by uuid references profiles(id)
);

-- one live completion per chore+day+child (covers assigned chores and shower)
create unique index uq_per_child_completion
  on completions (chore_id, day, profile_id) where revoked_by is null;

-- shared non-shower chore: only one live completion per day total
create or replace function enforce_shared_single() returns trigger as $$
declare
  c_assigned uuid;
  c_shower boolean;
begin
  select assigned_to, is_shower into c_assigned, c_shower from chores where id = new.chore_id;
  if c_assigned is null and not c_shower then
    if exists (
      select 1 from completions
      where chore_id = new.chore_id and day = new.day and revoked_by is null
    ) then
      raise exception 'ALREADY_DONE' using errcode = '23505';
    end if;
  end if;
  return new;
end $$ language plpgsql;

create trigger trg_shared_single before insert on completions
  for each row execute function enforce_shared_single();

create table tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  child_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  icon text not null default 'star',
  points int not null default 1 check (points between 1 and 99),
  remind_at timestamptz,
  reminded_at timestamptz,
  status text not null default 'pending' check (status in ('pending','done')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  endpoint text not null unique,
  keys jsonb not null,
  device_label text,
  created_at timestamptz not null default now()
);

-- RLS
create or replace function my_family_id() returns uuid
language sql stable security definer set search_path = public as
$$ select id from families where owner_uid = auth.uid() $$;

alter table families enable row level security;
alter table profiles enable row level security;
alter table chores enable row level security;
alter table completions enable row level security;
alter table tasks enable row level security;
alter table push_subscriptions enable row level security;

create policy fam_own on families for all
  using (owner_uid = auth.uid()) with check (owner_uid = auth.uid());
create policy profiles_fam on profiles for all
  using (family_id = my_family_id()) with check (family_id = my_family_id());
create policy chores_fam on chores for all
  using (family_id = my_family_id()) with check (family_id = my_family_id());
create policy completions_fam on completions for all
  using (family_id = my_family_id()) with check (family_id = my_family_id());
create policy tasks_fam on tasks for all
  using (family_id = my_family_id()) with check (family_id = my_family_id());
create policy push_fam on push_subscriptions for all
  using (family_id = my_family_id()) with check (family_id = my_family_id());

-- realtime
alter publication supabase_realtime add table completions, chores, tasks;
