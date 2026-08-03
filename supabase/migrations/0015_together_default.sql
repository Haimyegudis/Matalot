-- shared chores default to "everyone can do it and earn points";
-- single_daily restores first-come-wins (total per_day cap). Turn chores are single by nature.
alter table chores add column single_daily boolean not null default false;
update chores set single_daily = true where turn_taking;

create or replace function enforce_completion_limit() returns trigger as $$
declare
  c_shower boolean;
  c_per_day int;
  c_single boolean;
  cnt int;
  limit_n int;
begin
  select is_shower, per_day, single_daily into c_shower, c_per_day, c_single
    from chores where id = new.chore_id;

  perform pg_advisory_xact_lock(hashtext(new.chore_id::text || new.day::text));

  if c_shower then
    select count(*) into cnt from completions
      where chore_id = new.chore_id and day = new.day
        and profile_id = new.profile_id and revoked_by is null;
    limit_n := 1;
  elsif c_single then
    -- one doer per round: total cap across kids
    select count(*) into cnt from completions
      where chore_id = new.chore_id and day = new.day and revoked_by is null;
    limit_n := c_per_day;
  else
    -- together by default: each kid can do it per_day times
    select count(*) into cnt from completions
      where chore_id = new.chore_id and day = new.day
        and profile_id = new.profile_id and revoked_by is null;
    limit_n := c_per_day;
  end if;

  if cnt >= limit_n then
    raise exception 'ALREADY_DONE' using errcode = '23505';
  end if;
  return new;
end $$ language plpgsql;
