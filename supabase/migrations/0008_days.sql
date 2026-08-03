-- optional weekday schedule per chore: 0=Sunday..6=Saturday, null = every day
alter table chores
  add column days smallint[] null;
