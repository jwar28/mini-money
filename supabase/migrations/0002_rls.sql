-- 0002_rls.sql: Row Level Security policies for all 5 tables.
-- Pattern: TO authenticated USING (auth.uid() = user_id) WITH CHECK (same)

-- profiles: users can read and update only their own profile
create policy "profiles_select_own"
    on public.profiles for select
    to authenticated
    using ((select auth.uid()) = id);

create policy "profiles_insert_self"
    on public.profiles for insert
    to authenticated
    with check ((select auth.uid()) = id);

create policy "profiles_update_own"
    on public.profiles for update
    to authenticated
    using ((select auth.uid()) = id)
    with check ((select auth.uid()) = id);

create policy "profiles_delete_own"
    on public.profiles for delete
    to authenticated
    using ((select auth.uid()) = id);

-- categories: visible to all authenticated if system default, or owner if custom
create policy "categories_select_visible"
    on public.categories for select
    to authenticated
    using (user_id is null or (select auth.uid()) = user_id);

create policy "categories_insert_own"
    on public.categories for insert
    to authenticated
    with check ((select auth.uid()) = user_id and user_id is not null);

create policy "categories_update_own"
    on public.categories for update
    to authenticated
    using ((select auth.uid()) = user_id and user_id is not null)
    with check ((select auth.uid()) = user_id and user_id is not null);

create policy "categories_delete_own"
    on public.categories for delete
    to authenticated
    using ((select auth.uid()) = user_id and user_id is not null);

-- monthly_budgets: owner-only CRUD
create policy "monthly_budgets_select_own"
    on public.monthly_budgets for select
    to authenticated
    using ((select auth.uid()) = user_id);

create policy "monthly_budgets_insert_own"
    on public.monthly_budgets for insert
    to authenticated
    with check ((select auth.uid()) = user_id);

create policy "monthly_budgets_update_own"
    on public.monthly_budgets for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "monthly_budgets_delete_own"
    on public.monthly_budgets for delete
    to authenticated
    using ((select auth.uid()) = user_id);

-- budget_allocations: owner checks via monthly_budgets join
create policy "budget_allocations_select_own"
    on public.budget_allocations for select
    to authenticated
    using (
        exists (
            select 1 from public.monthly_budgets mb
            where mb.id = monthly_budget_id
              and mb.user_id = (select auth.uid())
        )
    );

create policy "budget_allocations_insert_own"
    on public.budget_allocations for insert
    to authenticated
    with check (
        exists (
            select 1 from public.monthly_budgets mb
            where mb.id = monthly_budget_id
              and mb.user_id = (select auth.uid())
        )
    );

create policy "budget_allocations_update_own"
    on public.budget_allocations for update
    to authenticated
    using (
        exists (
            select 1 from public.monthly_budgets mb
            where mb.id = monthly_budget_id
              and mb.user_id = (select auth.uid())
        )
    )
    with check (
        exists (
            select 1 from public.monthly_budgets mb
            where mb.id = monthly_budget_id
              and mb.user_id = (select auth.uid())
        )
    );

create policy "budget_allocations_delete_own"
    on public.budget_allocations for delete
    to authenticated
    using (
        exists (
            select 1 from public.monthly_budgets mb
            where mb.id = monthly_budget_id
              and mb.user_id = (select auth.uid())
        )
    );

-- transactions: owner-only CRUD
create policy "transactions_select_own"
    on public.transactions for select
    to authenticated
    using ((select auth.uid()) = user_id);

create policy "transactions_insert_own"
    on public.transactions for insert
    to authenticated
    with check ((select auth.uid()) = user_id);

create policy "transactions_update_own"
    on public.transactions for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "transactions_delete_own"
    on public.transactions for delete
    to authenticated
    using ((select auth.uid()) = user_id);
