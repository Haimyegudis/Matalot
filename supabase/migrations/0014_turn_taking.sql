-- turn-taking chores: kids alternate; next in turn = sibling of last doer
alter table chores add column turn_taking boolean not null default false;
update chores set turn_taking = true where title in ('לזרוק זבל', 'להוציא את שלג לטיול');
