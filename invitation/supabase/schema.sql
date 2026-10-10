-- Faire-part Ibrahim & Malak : base des invités et des réponses.
-- À coller une seule fois dans Supabase → SQL Editor → Run.
--
-- Principe de sécurité
--   • Les tables ne sont lisibles par personne via la clé publique (anon).
--   • Un invité ne voit que son foyer, via get_invitation(code), et ne peut
--     écrire que sa propre réponse, via repondre(code, …).
--   • Seules les adresses e-mail listées dans public.admins (connectées sur
--     gestion.html) peuvent lire et modifier les foyers et les réponses.

create table if not exists public.foyers (
  code        text primary key check (code ~ '^[a-z0-9-]{4,80}$'),
  foyer       text not null check (length(trim(foyer)) between 1 and 120),
  personnes   int  not null check (personnes between 1 and 30),
  evenements  text[] not null check (
                evenements <@ array['mairie','repas','mosquee']
                and 'mairie' = any(evenements)),
  created_at  timestamptz not null default now()
);

-- Une ligne par foyer ayant répondu. Pour chaque événement : nombre de
-- personnes présentes (0 = ne viendra pas), null = non invité.
create table if not exists public.reponses (
  code        text primary key references public.foyers(code) on delete cascade on update cascade,
  mairie      int check (mairie  >= 0),
  repas       int check (repas   >= 0),
  mosquee     int check (mosquee >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.admins (
  email text primary key
);

alter table public.foyers   enable row level security;
alter table public.reponses enable row level security;
alter table public.admins   enable row level security;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

drop policy if exists "admin foyers"   on public.foyers;
drop policy if exists "admin reponses" on public.reponses;
drop policy if exists "admin admins"   on public.admins;
create policy "admin foyers"   on public.foyers   for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin reponses" on public.reponses for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin admins"   on public.admins   for select to authenticated using (public.is_admin());

-- Invitation d'un foyer (ou null si le code est inconnu).
create or replace function public.get_invitation(p_code text)
returns json
language sql stable security definer set search_path = public
as $$
  select json_build_object(
    'code', f.code, 'foyer', f.foyer, 'personnes', f.personnes, 'evenements', f.evenements,
    'reponse', case when r.code is null then null else json_build_object(
      'mairie', r.mairie, 'repas', r.repas, 'mosquee', r.mosquee, 'updated_at', r.updated_at) end)
  from public.foyers f
  left join public.reponses r on r.code = f.code
  where f.code = lower(trim(p_code));
$$;

-- Enregistre (ou remplace) la réponse d'un foyer.
-- Chaque nombre doit être fourni pour les événements où le foyer est invité,
-- entre 0 et le nombre de personnes prévu ; il est ignoré pour les autres.
create or replace function public.repondre(p_code text, p_mairie int, p_repas int, p_mosquee int)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  f public.foyers;
  v_mairie int; v_repas int; v_mosquee int;
begin
  select * into f from public.foyers where code = lower(trim(p_code));
  if not found then
    raise exception 'Invitation introuvable' using errcode = 'P0002';
  end if;

  v_mairie  := case when 'mairie'  = any(f.evenements) then p_mairie  end;
  v_repas   := case when 'repas'   = any(f.evenements) then p_repas   end;
  v_mosquee := case when 'mosquee' = any(f.evenements) then p_mosquee end;

  if ('mairie'  = any(f.evenements) and (v_mairie  is null or v_mairie  not between 0 and f.personnes))
  or ('repas'   = any(f.evenements) and (v_repas   is null or v_repas   not between 0 and f.personnes))
  or ('mosquee' = any(f.evenements) and (v_mosquee is null or v_mosquee not between 0 and f.personnes)) then
    raise exception 'Réponse invalide' using errcode = '22023';
  end if;

  insert into public.reponses (code, mairie, repas, mosquee)
  values (f.code, v_mairie, v_repas, v_mosquee)
  on conflict (code) do update
    set mairie = excluded.mairie, repas = excluded.repas, mosquee = excluded.mosquee, updated_at = now();

  return public.get_invitation(f.code);
end;
$$;

revoke all on function public.get_invitation(text) from public;
revoke all on function public.repondre(text, int, int, int) from public;
revoke all on function public.is_admin() from public;
grant execute on function public.get_invitation(text) to anon, authenticated;
grant execute on function public.repondre(text, int, int, int) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;

-- ▼ Remplace par ton adresse e-mail (celle du compte créé dans Authentication → Users).
insert into public.admins (email) values ('ton-email@exemple.com') on conflict do nothing;
