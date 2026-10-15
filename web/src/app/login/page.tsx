import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, safeNext } from "@/lib/session";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = safeNext(next);

  // Pehle se login hai to seedha aage bhejo
  const session = await getSession();
  if (session.status === "user") redirect(target);

  return (
    <main className="mx-auto max-w-md p-6">
      <Link href="/" className="text-orange-600">
        &larr; Wapas
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Login</h1>
      <p className="mt-1 text-gray-600">Apne mobile number se login karo, OTP aayega.</p>
      <LoginForm next={target} />
    </main>
  );
}