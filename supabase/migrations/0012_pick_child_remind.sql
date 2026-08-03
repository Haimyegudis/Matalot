-- per-kid day picks + optional same-day reminder
alter table day_picks add column child_id uuid references profiles(id) on delete cascade;
alter table day_picks add column remind_at timestamptz;
alter table day_picks add column reminded_at timestamptz;

alter table day_picks drop constraint day_picks_chore_id_day_key;
alter table day_picks add constraint day_picks_chore_day_child
  unique nulls not distinct (chore_id, day, child_id);
