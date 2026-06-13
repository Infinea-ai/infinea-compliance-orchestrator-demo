create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  company_password_hash text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'client' check (role in ('manager', 'client')),
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role text not null default 'client' check (role in ('client')),
  created_at timestamptz not null default now(),
  unique (user_id, organization_id)
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id text not null,
  first_name text,
  last_name text,
  department text,
  job_title text,
  role_id text,
  required_course_count integer default 0,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, employee_id)
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  course_id text not null,
  name text,
  category text,
  renewal_months integer default 0,
  risk_profile text,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, course_id)
);

create table if not exists public.role_obligations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  matrix_row_id text,
  role_id text not null,
  department text,
  job_title text,
  course_id text not null,
  course_name text,
  category text,
  renewal_months integer default 0,
  risk_profile text,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.required_obligations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  obligation_id text not null,
  employee_id text not null,
  course_id text not null,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, obligation_id)
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  certificate_id text not null,
  obligation_id text,
  employee_id text not null,
  course_id text not null,
  presence text,
  issue_date date,
  expiry_date date,
  evidence_file text,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.imports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  status text not null default 'completed',
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'role', 'client'))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'manager'
  );
$$;

create or replace function public.current_user_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.memberships where user_id = auth.uid();
$$;

create or replace function public.validate_company_access(input_code text, input_password text)
returns table (organization_id uuid, organization_name text, organization_code text)
language sql
security definer
set search_path = public
as $$
  select id, name, code
  from public.organizations
  where code = upper(trim(input_code))
    and company_password_hash = extensions.crypt(input_password, company_password_hash)
  limit 1;
$$;

create or replace function public.join_organization_with_company_password(input_code text, input_password text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid;
begin
  select id into target_org
  from public.organizations
  where code = upper(trim(input_code))
    and company_password_hash = extensions.crypt(input_password, company_password_hash)
  limit 1;

  if target_org is null then
    raise exception 'Codice azienda o password non corretti.';
  end if;

  insert into public.memberships (user_id, organization_id, role)
  values (auth.uid(), target_org, 'client')
  on conflict (user_id, organization_id) do nothing;

  update public.profiles
  set role = 'client', email = coalesce((select email from auth.users where id = auth.uid()), email)
  where id = auth.uid();

  return target_org;
end;
$$;

create or replace function public.manager_create_organization(input_name text, input_code text, input_password text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org uuid;
begin
  if not public.is_manager() then
    raise exception 'Solo il manager puo creare aziende.';
  end if;

  insert into public.organizations (name, code, company_password_hash, created_by)
  values (input_name, upper(trim(input_code)), extensions.crypt(input_password, extensions.gen_salt('bf')), auth.uid())
  returning id into new_org;

  return new_org;
end;
$$;

create or replace function public.manager_delete_organization(input_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_manager() then
    raise exception 'Solo il manager puo eliminare aziende.';
  end if;

  delete from public.organizations
  where id = input_organization_id;

  if not found then
    raise exception 'Cliente non trovato.';
  end if;
end;
$$;

grant execute on function public.validate_company_access(text, text) to anon, authenticated;
grant execute on function public.join_organization_with_company_password(text, text) to authenticated;
grant execute on function public.manager_create_organization(text, text, text) to authenticated;
grant execute on function public.manager_delete_organization(uuid) to authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.organizations to authenticated;
grant select on public.profiles to authenticated;
grant select on public.memberships to authenticated;
grant all on public.organizations to authenticated;
grant all on public.memberships to authenticated;
grant all on public.employees to authenticated;
grant all on public.courses to authenticated;
grant all on public.role_obligations to authenticated;
grant all on public.required_obligations to authenticated;
grant all on public.certificates to authenticated;
grant all on public.imports to authenticated;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.employees enable row level security;
alter table public.courses enable row level security;
alter table public.role_obligations enable row level security;
alter table public.required_obligations enable row level security;
alter table public.certificates enable row level security;
alter table public.imports enable row level security;

drop policy if exists "manager organizations" on public.organizations;
create policy "manager organizations" on public.organizations
for all using (public.is_manager()) with check (public.is_manager());

drop policy if exists "client own organization" on public.organizations;
create policy "client own organization" on public.organizations
for select using (id in (select public.current_user_org_ids()));

drop policy if exists "profile self or manager" on public.profiles;
create policy "profile self or manager" on public.profiles
for select using (id = auth.uid() or public.is_manager());

drop policy if exists "membership self or manager" on public.memberships;
create policy "membership self or manager" on public.memberships
for select using (user_id = auth.uid() or public.is_manager());

drop policy if exists "membership manager write" on public.memberships;
create policy "membership manager write" on public.memberships
for all using (public.is_manager()) with check (public.is_manager());

drop policy if exists "employees tenant read" on public.employees;
create policy "employees tenant read" on public.employees
for select using (public.is_manager() or organization_id in (select public.current_user_org_ids()));
drop policy if exists "employees tenant write" on public.employees;
create policy "employees tenant write" on public.employees
for all using (public.is_manager() or organization_id in (select public.current_user_org_ids()))
with check (public.is_manager() or organization_id in (select public.current_user_org_ids()));

drop policy if exists "courses tenant all" on public.courses;
create policy "courses tenant all" on public.courses
for all using (public.is_manager() or organization_id in (select public.current_user_org_ids()))
with check (public.is_manager() or organization_id in (select public.current_user_org_ids()));

drop policy if exists "role obligations tenant all" on public.role_obligations;
create policy "role obligations tenant all" on public.role_obligations
for all using (public.is_manager() or organization_id in (select public.current_user_org_ids()))
with check (public.is_manager() or organization_id in (select public.current_user_org_ids()));

drop policy if exists "required obligations tenant all" on public.required_obligations;
create policy "required obligations tenant all" on public.required_obligations
for all using (public.is_manager() or organization_id in (select public.current_user_org_ids()))
with check (public.is_manager() or organization_id in (select public.current_user_org_ids()));

drop policy if exists "certificates tenant all" on public.certificates;
create policy "certificates tenant all" on public.certificates
for all using (public.is_manager() or organization_id in (select public.current_user_org_ids()))
with check (public.is_manager() or organization_id in (select public.current_user_org_ids()));

drop policy if exists "imports tenant all" on public.imports;
create policy "imports tenant all" on public.imports
for all using (public.is_manager() or organization_id in (select public.current_user_org_ids()))
with check (public.is_manager() or organization_id in (select public.current_user_org_ids()));

-- Dopo aver creato il primo utente manager da Supabase Auth, esegui:
-- insert into public.profiles (id, email, role)
-- values ('USER_ID_DA_AUTH_USERS', 'manager@infinea.ai', 'manager')
-- on conflict (id) do update set role = 'manager', email = excluded.email;
