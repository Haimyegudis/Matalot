-- chores can repeat several times per day (e.g. trash x2)
alter table chores
  add column per_day int not null default 1
  check (per_day between 1 and 10);

drop trigger if exists trg_shared_single on completions;
drop function if exists enforce_shared_single();
drop index if exists uq_per_child_completion;

create or replace function enforce_completion_limit() returns trigger as $$
declare
  c_assigned uuid;
  c_shower boolean;
  c_per_day int;
  cnt int;
  limit_n int;
begin
  select assigned_to, is_shower, per_day
    into c_assigned, c_shower, c_per_day
    from chores where id = new.chore_id;

  -- serialize same-chore-same-day inserts so the count check is race-safe
  perform pg_advisory_xact_lock(hashtext(new.chore_id::text || new.day::text));

  if c_shower then
    select count(*) into cnt from completions
      where chore_id = new.chore_id and day = new.day
        and profile_id = new.profile_id and revoked_by is null;
    limit_n := 1;
  elsif c_assigned is not null then
    select count(*) into cnt from completions
      where chore_id = new.chore_id and day = new.day
        and profile_id = new.profile_id and revoked_by is null;
    limit_n := c_per_day;
  else
    select count(*) into cnt from completions
      where chore_id = new.chore_id and day = new.day and revoked_by is null;
    limit_n := c_per_day;
  end if;

  if cnt >= limit_n then
    raise exception 'ALREADY_DONE' using errcode = '23505';
  end if;
  return new;
end $$ language plpgsql;

create trigger trg_completion_limit before insert on completions
  for each row execute function enforce_completion_limit();

-- the family's trash chore is twice a day
update chores set per_day = 2 where icon = 'trash';
