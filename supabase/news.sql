create table public.tdl_news (
  id uuid primary key default gen_random_uuid(),
  author text not null check (char_length(btrim(author)) between 1 and 80),
  message text not null check (char_length(btrim(message)) between 1 and 3000),
  created_at timestamptz not null default now()
);

alter table public.tdl_news enable row level security;

revoke all on table public.tdl_news from public, anon, authenticated;
grant select on table public.tdl_news to anon, authenticated;
grant insert (author, message) on table public.tdl_news to anon, authenticated;

create policy "Anyone can read TDL news"
  on public.tdl_news for select to anon, authenticated using (true);

create policy "Anyone can post TDL news"
  on public.tdl_news for insert to anon, authenticated with check (true);
