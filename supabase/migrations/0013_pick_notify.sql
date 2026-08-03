-- server-side "new chore assigned" notification: cron notifies un-notified picks
alter table day_picks add column notified_at timestamptz;
update day_picks set notified_at = now();
