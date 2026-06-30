import { LoginForm } from "@/components/auth/LoginForm";

interface PageProps {
    searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
    const { next } = await searchParams;
    return <LoginForm next={next} />;
}
