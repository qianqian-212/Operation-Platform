create table public.workbench_widget_assignments (
  id text primary key check (id = 'global'),
  revision bigint not null default 1 check (revision > 0),
  assignment jsonb not null check (jsonb_typeof(assignment) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger workbench_widget_assignments_set_updated_at
before update on public.workbench_widget_assignments
for each row execute function private.set_updated_at();

alter table public.workbench_widget_assignments enable row level security;

create policy workbench_widget_assignments_read on public.workbench_widget_assignments
for select to authenticated
using (true);

create policy workbench_widget_assignments_insert on public.workbench_widget_assignments
for insert to authenticated
with check ((select private.is_platform_admin()));

create policy workbench_widget_assignments_update on public.workbench_widget_assignments
for update to authenticated
using ((select private.is_platform_admin()))
with check ((select private.is_platform_admin()));

create policy workbench_widget_assignments_delete on public.workbench_widget_assignments
for delete to authenticated
using ((select private.is_platform_admin()));

grant select, insert, update, delete on public.workbench_widget_assignments to authenticated;
grant select, insert, update, delete on public.workbench_widget_assignments to service_role;
