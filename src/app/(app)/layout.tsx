import { Shell } from "@/components/shell/Shell";
import {
    TxModalProvider,
    type TxModalCategories,
} from "@/components/transactions/AddTransactionModalProvider";
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal";
import { getCategories } from "@/lib/queries";

// ponytail: proxy.ts already redirects unauthenticated users, so the
// layout doesn't re-run getUser. getCategories is fetched here once per
// request (React.cache dedupes) and threaded through the modal provider so
// AddTransactionModal can open instantly without hitting Supabase again.
export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const categories: TxModalCategories = await getCategories();

    return (
        <TxModalProvider categories={categories}>
            <Shell>{children}</Shell>
            <AddTransactionModal />
        </TxModalProvider>
    );
}
