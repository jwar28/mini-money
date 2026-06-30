-- 0004_seed_categories.sql: System-default categories.
-- user_id NULL means global. icon is an emoji shortcode (will be mapped to react-icons in the UI).

insert into public.categories (user_id, name, slug, icon, type, bucket) values
    (null, 'Rent & Utilities',   'rent-utilities',  'FiHome',     'expense', 'needs'),
    (null, 'Groceries',          'groceries',       'FiShoppingCart', 'expense', 'needs'),
    (null, 'Utilities',          'utilities',       'FiZap',      'expense', 'needs'),
    (null, 'Transport',          'transport',       'FiTruck',    'expense', 'needs'),
    (null, 'Health',             'health',          'FiHeart',    'expense', 'needs'),

    (null, 'Food & Dining',      'food-dining',     'FiCoffee',   'expense', 'wants'),
    (null, 'Entertainment',      'entertainment',   'FiTv',       'expense', 'wants'),
    (null, 'Shopping',           'shopping',        'FiShoppingBag', 'expense', 'wants'),
    (null, 'Hobbies',            'hobbies',         'FiMusic',    'expense', 'wants'),

    (null, 'Savings',            'savings',         'FiSave','savings', 'savings'),
    (null, 'Investments',        'investments',     'FiTrendingUp','savings', 'savings'),
    (null, 'Emergency Fund',     'emergency-fund',  'FiShield',   'savings', 'savings'),

    (null, 'Salary',             'salary',          'FiDollarSign','income', 'needs'),
    (null, 'Freelance',          'freelance',       'FiBriefcase', 'income', 'needs'),
    (null, 'Other Income',       'other-income',    'FiPlusCircle','income', 'needs')
on conflict do nothing;
