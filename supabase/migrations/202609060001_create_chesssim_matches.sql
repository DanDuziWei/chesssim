create table if not exists public.chesssim_matches (
  id bigint generated always as identity primary key,
  share_id uuid not null unique,
  variant text not null check (variant in ('standard', 'chess960')),
  chess960_position smallint check (
    chess960_position is null or chess960_position between 0 and 959
  ),
  white_agent_id text not null,
  black_agent_id text not null,
  result text not null check (result in ('1-0', '0-1', '1/2-1/2')),
  move_count smallint not null check (move_count between 1 and 240),
  match_data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists chesssim_matches_created_at_idx
  on public.chesssim_matches (created_at desc);

alter table public.chesssim_matches enable row level security;

revoke all on table public.chesssim_matches from anon, authenticated;
revoke all on sequence public.chesssim_matches_id_seq from anon, authenticated;
grant select, insert on table public.chesssim_matches to service_role;
grant usage, select on sequence public.chesssim_matches_id_seq to service_role;
