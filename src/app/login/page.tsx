import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { loginAction } from "@/app/actions/auth";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-xs font-black text-white">
          F
        </span>
        <span className="text-sm font-semibold">Forge Protocol</span>
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1 mb-8 text-sm text-zinc-500">Sign in to your log.</p>
      <AuthForm mode="login" action={loginAction} />
    </div>
  );
}
