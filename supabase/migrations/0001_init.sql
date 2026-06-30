-- 0001_init.sql: Base schema for Mini Money
-- Creates the 5 core tables per spec.

create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    updated_at timestamp with time zone default now(),
    full_name text,
    avatar_url text
);

create table public.categories (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    name text not null,
    slug text not null,
    icon text,
    type text not null check (type in ('income', 'expense', 'savings')),
    bucket text not null default 'needs' check (bucket in ('needs', 'wants', 'savings')),
    constraint categories_user_or_system check (user_id is null or true)
);

create unique index categories_user_slug_unique
    on public.categories (coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid), slug);

create table public.monthly_budgets (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    year integer not null check (year between 2000 and 2100),
    month integer not null check (month between 1 and 12),
    base_salary numeric(12,2) not null default 0.00,
    is_locked boolean not null default false,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    unique(user_id, year, month)
);

create index monthly_budgets_user_period_idx
    on public.monthly_budgets (user_id, year, month desc);

create table public.budget_allocations (
    id uuid default gen_random_uuid() primary key,
    monthly_budget_id uuid references public.monthly_budgets(id) on delete cascade not null,
    category_id uuid references public.categories(id) on delete cascade not null,
    percentage numeric(5,2) not null default 0.00 check (percentage >= 0 and percentage <= 100),
    is_visual_locked boolean not null default false,
    unique(monthly_budget_id, category_id)
);

create index budget_allocations_budget_idx
    on public.budget_allocations (monthly_budget_id);

create table public.transactions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    category_id uuid references public.categories(id) on delete restrict not null,
    amount numeric(12,2) not null check (amount >= 0),
    description text,
    type text not null check (type in ('income', 'expense')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index transactions_user_date_idx
    on public.transactions (user_id, created_at desc);

create index transactions_user_period_idx
    on public.transactions (user_id, type, created_at desc);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.monthly_budgets enable row level security;
alter table public.budget_allocations enable row level security;
alter table public.transactions enable row level security;
