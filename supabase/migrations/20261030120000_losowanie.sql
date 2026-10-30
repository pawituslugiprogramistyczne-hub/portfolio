-- Holiday gift draw (/losowanie). Schema only: names and results never go in this public repo.
create table public.losowanie_osoby (
  id bigint generated always as identity primary key,
  imie text not null unique,
  partner_id bigint references public.losowanie_osoby (id) on delete set null,
  pin_hash text,
  nieudane_proby integer not null default 0,
  blokada_do timestamptz
);

create table public.losowanie_wyniki (
  rok integer not null,
  dajacy_id bigint not null references public.losowanie_osoby (id),
  obdarowany_id bigint not null references public.losowanie_osoby (id),
  odkryto_at timestamptz,
  primary key (rok, dajacy_id),
  unique (rok, obdarowany_id),
  check (dajacy_id <> obdarowany_id)
);

-- RLS with no policies: only the server's secret key can read or write these tables
alter table public.losowanie_osoby enable row level security;
alter table public.losowanie_wyniki enable row level security;
