"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    const res = await signIn("credentials", { ...data, redirect: false });
    setLoading(false);
    if (res?.error) {
      toast.error("Nesprávný e-mail nebo heslo.");
      return;
    }
    toast.success("Přihlášení proběhlo úspěšně!");
    router.push(searchParams.get("callbackUrl") ?? "/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="ty@email.cz" {...register("email")} />
        {errors.email && <p className="text-xs text-ember">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Heslo</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
        {errors.password && <p className="text-xs text-ember">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Přihlašuji…" : "Přihlásit se"}
      </Button>
      <p className="rounded-lg border border-border-soft bg-white/[0.02] p-3 text-center text-xs text-text-muted">
        Demo účet: <span className="text-text-secondary">martin_k@gamevault.dev</span> / <span className="text-text-secondary">password123</span>
      </p>
      <p className="text-center text-sm text-text-muted">
        Nemáš účet?{" "}
        <Link href="/register" className="font-semibold text-plasma-soft hover:underline">
          Zaregistruj se
        </Link>
      </p>
    </form>
  );
}
