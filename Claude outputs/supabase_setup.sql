-- =====================================================================
--  HAULIST — Supabase setup (run once: Supabase → SQL Editor → New query
--  → paste ALL of this → Run). Safe to re-run.
-- =====================================================================

-- ---------- Tables ----------
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Our Family',
  invite_code text unique not null,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz default now()
);

create table if not exists members (
  family_id uuid references families on delete cascade,
  user_id uuid references auth.users on delete cascade,
  name text not null default 'Someone',
  color text default '#FF6B3D',
  role text default 'Member',
  shopping text default '',
  since bigint default 0,
  primary key (family_id, user_id)
);

create table if not exists categories (
  id text primary key,
  family_id uuid references families on delete cascade not null,
  name text not null, emoji text, bg int default 0, ord int default 99,
  again jsonb default '[]'
);

create table if not exists items (
  id text primary key,
  family_id uuid references families on delete cascade not null,
  cat text not null,
  name text not null, aisle text, store text, price numeric, old_price numeric, url text,
  by uuid, done boolean default false, at bigint
);

create table if not exists settings (
  family_id uuid primary key references families on delete cascade,
  month text, budgets jsonb default '[]', map jsonb default '{}', store_cat jsonb default '{}',
  sheet_url text default '', sheet_key text default ''
);

create table if not exists trips (
  id text primary key,
  family_id uuid references families on delete cascade not null,
  by uuid, lines jsonb, total numeric, created_at timestamptz default now()
);

-- ---------- Security: only family members can see/change family data ----------
create or replace function is_member(fid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from members where family_id = fid and user_id = auth.uid());
$$;

alter table families   enable row level security;
alter table members    enable row level security;
alter table categories enable row level security;
alter table items      enable row level security;
alter table settings   enable row level security;
alter table trips      enable row level security;

drop policy if exists fam_read on families;
create policy fam_read on families for select using (is_member(id));
drop policy if exists fam_admin on families;
create policy fam_admin on families for update using (
  exists (select 1 from members where family_id = id and user_id = auth.uid() and role = 'Admin'));

drop policy if exists mem_read on members;
create policy mem_read on members for select using (is_member(family_id));
drop policy if exists mem_self on members;
create policy mem_self on members for update using (user_id = auth.uid());   -- you edit only your own row
drop policy if exists mem_leave on members;
create policy mem_leave on members for delete using (user_id = auth.uid());

do $$ declare t text; begin
  foreach t in array array['categories','items','settings','trips'] loop
    execute format('drop policy if exists fam_all on %I', t);
    execute format('create policy fam_all on %I for all using (is_member(family_id)) with check (is_member(family_id))', t);
  end loop;
end $$;

-- ---------- Create a family (makes you Admin + starter categories) ----------
create or replace function create_family(fname text, my_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare fid uuid; code text;
  g text := substr(md5(random()::text),1,8); h text := substr(md5(random()::text),1,8); w text := substr(md5(random()::text),1,8);
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  code := 'HAUL-' || upper(substr(md5(random()::text), 1, 4));
  insert into families (name, invite_code, created_by) values (coalesce(nullif(fname,''),'Our Family'), code, auth.uid()) returning id into fid;
  insert into members (family_id, user_id, name, role) values (fid, auth.uid(), coalesce(nullif(my_name,''),'Me'), 'Admin');
  insert into categories (id, family_id, name, emoji, bg, ord, again) values
    (g, fid, 'Groceries', '🥕', 0, 1, '["Milk","Eggs","Bread","Bananas","Rice","Coffee"]'),
    (h, fid, 'Home Stuff', '🏠', 1, 2, '["Dish soap","Trash bags","Toilet paper"]'),
    (w, fid, 'Wants', '🛍️', 2, 3, '[]');
  insert into settings (family_id, month, map, budgets) values (fid, to_char(now(), 'FMMonth YYYY'),
    jsonb_build_object(g, 'Groceries', h, 'Shopping', w, 'Other wants'),
    '[{"name":"Groceries","group":"Needs","goal":400,"spent":0},{"name":"Personal care","group":"Needs","goal":60,"spent":0},
      {"name":"Shopping","group":"Wants","goal":150,"spent":0},{"name":"Other wants","group":"Wants","goal":100,"spent":0}]');
  return fid;
end $$;

-- ---------- Join with an invite code ----------
create or replace function join_family(code text, my_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare fid uuid;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  select id into fid from families where invite_code = upper(trim(code));
  if fid is null then raise exception 'That code doesn''t match a family'; end if;
  insert into members (family_id, user_id, name, color)
  values (fid, auth.uid(), coalesce(nullif(my_name,''),'Someone'),
          (array['#8B5CF6','#22B8CF','#2ECC8F','#F43F5E','#EAB308'])[1 + floor(random()*5)::int])
  on conflict do nothing;
  return fid;
end $$;

-- ---------- New invite code (Admin only; old code stops working) ----------
create or replace function new_invite_code(fid uuid) returns text
language plpgsql security definer set search_path = public as $$
declare code text;
begin
  if not exists (select 1 from members where family_id = fid and user_id = auth.uid() and role = 'Admin')
    then raise exception 'Only the Admin can do that'; end if;
  code := 'HAUL-' || upper(substr(md5(random()::text), 1, 4));
  update families set invite_code = code where id = fid;
  return code;
end $$;

-- ---------- Live updates ----------
do $$ declare t text; begin
  foreach t in array array['members','categories','items','settings'] loop
    begin execute format('alter publication supabase_realtime add table %I', t);
    exception when duplicate_object then null; end;
  end loop;
end $$;
