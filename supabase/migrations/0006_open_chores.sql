-- assignment is a designation, not a lock: any kid may complete any chore.
-- daily limit is total per chore (per_day), except shower which stays 1/kid.
create or replace function enforce_completion_limit() returns trigger as $$
declare
  c_shower boolean;
  c_per_day int;
  cnt int;
  limit_n int;
begin
  select is_shower, per_day into c_shower, c_per_day
    from chores where id = new.chore_id;

  perform pg_advisory_xact_lock(hashtext(new.chore_id::text || new.day::text));

  if c_shower then
    select count(*) into cnt from completions
      where chore_id = new.chore_id and day = new.day
        and profile_id = new.profile_id and revoked_by is null;
    limit_n := 1;
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
