export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    __InternalSupabase: {
        PostgrestVersion: "14.5";
    };
    public: {
        Tables: {
            budget_allocations: {
                Row: {
                    id: string;
                    monthly_budget_id: string;
                    category_id: string;
                    percentage: number;
                    is_visual_locked: boolean;
                };
                Insert: {
                    id?: string;
                    monthly_budget_id: string;
                    category_id: string;
                    percentage?: number;
                    is_visual_locked?: boolean;
                };
                Update: {
                    id?: string;
                    monthly_budget_id?: string;
                    category_id?: string;
                    percentage?: number;
                    is_visual_locked?: boolean;
                };
                Relationships: [];
            };
            categories: {
                Row: {
                    id: string;
                    user_id: string | null;
                    name: string;
                    slug: string;
                    icon: string | null;
                    type: string;
                    bucket: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    name: string;
                    slug: string;
                    icon?: string | null;
                    type: string;
                    bucket?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    name?: string;
                    slug?: string;
                    icon?: string | null;
                    type?: string;
                    bucket?: string;
                };
                Relationships: [];
            };
            monthly_budgets: {
                Row: {
                    id: string;
                    user_id: string;
                    year: number;
                    month: number;
                    base_salary: number;
                    is_locked: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    year: number;
                    month: number;
                    base_salary?: number;
                    is_locked?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    year?: number;
                    month?: number;
                    base_salary?: number;
                    is_locked?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            monthly_savings: {
                Row: {
                    id: string;
                    user_id: string;
                    year: number;
                    month: number;
                    amount: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    year: number;
                    month: number;
                    amount?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    year?: number;
                    month?: number;
                    amount?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            profiles: {
                Row: {
                    id: string;
                    updated_at: string | null;
                    full_name: string | null;
                    avatar_url: string | null;
                };
                Insert: {
                    id: string;
                    updated_at?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                };
                Update: {
                    id?: string;
                    updated_at?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                };
                Relationships: [];
            };
            transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    category_id: string;
                    amount: number;
                    description: string | null;
                    type: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    category_id: string;
                    amount: number;
                    description?: string | null;
                    type: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    category_id?: string;
                    amount?: number;
                    description?: string | null;
                    type?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
        CompositeTypes: Record<string, never>;
    };
};

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type MonthlyBudgetRow = Database["public"]["Tables"]["monthly_budgets"]["Row"];
export type MonthlySavingsRow = Database["public"]["Tables"]["monthly_savings"]["Row"];
export type BudgetAllocationRow = Database["public"]["Tables"]["budget_allocations"]["Row"];
export type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

export type BucketName = "needs" | "wants" | "savings";
export type CategoryType = "income" | "expense" | "savings";
export type TransactionType = "income" | "expense";
