-- tracking-only chores: marked done but worth no points (like shower)
alter table chores
  add column track_only boolean not null default false;

update chores set track_only = true where is_shower;
