create extension if not exists pg_cron;
create extension if not exists pg_net;

-- every minute: fire the reminder function (idempotent via tasks.reminded_at)
select cron.schedule(
  'matalot-remind-due',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://hlwmwxafdaljvzjghuiw.supabase.co/functions/v1/remind-due',
    body := '{}'::jsonb
  );
  $$
);
