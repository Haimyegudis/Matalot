alter table profiles
  add column gender text not null default 'male'
  check (gender in ('male', 'female'));
