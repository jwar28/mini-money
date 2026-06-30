import { Shell } from "@/components/shell/Shell";
import {
    TxModalProvider,
    type TxModalCategories,
} from "@/components/transactions/AddTransactionModalProvider";
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal";
import { ProfileProvider } from "@/components/providers/ProfileProvider";
import { getCategories, getProfile } from "@/lib/queries";

// ponytail: proxy.ts already redirects unauthenticated users, so the
// layout doesn't re-run getUser. getCategories and getProfile are
// fetched here once per request (React.cache dedupes) and threaded
// through their respective providers so the page tree can read them
// without re-querying Supabase.
export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [categories, profile] = await Promise.all([
        getCategories(),
        getProfile(),
    ]);

    return (
        <ProfileProvider initialProfile={profile}>
            <TxModalProvider categories={categories as TxModalCategories}>
                <Shell>{children}</Shell>
                <AddTransactionModal />
            </TxModalProvider>
        </ProfileProvider>
    );
}