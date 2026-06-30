import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Shell } from "@/components/shell/Shell";
import { TxModalProvider } from "@/components/transactions/AddTransactionModalProvider";
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    return (
        <TxModalProvider>
            <Shell>{children}</Shell>
            <AddTransactionModal />
        </TxModalProvider>
    );
}
