"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      setLoading(false);
      toast.error(body?.error ?? "Něco se nepovedlo.");
      return;
    }

    const signInRes = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);

    if (signInRes?.error) {
      toast.success("Účet vytvořen! Přihlas se prosím.");
      router.push("/login");
      return;
    }

    toast.success(`Vítej v GameVault, ${data.username}!`);
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="username">Uživatelské jméno</Label>
        <Input id="username" placeholder="tvoje_jmeno" {...register("username")} />
        {errors.username && <p className="text-xs text-ember">{errors.username.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="ty@email.cz" {...register("email")} />
        {errors.email && <p className="text-xs text-ember">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Heslo</Label>
        <Input id="password" type="password" placeholder="Alespoň 8 znaků" {...register("password")} />
        {errors.password && <p className="text-xs text-ember">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Vytvářím účet…" : "Vytvořit účet"}
      </Button>
      <p className="text-center text-sm text-text-muted">
        Už máš účet?{" "}
        <Link href="/login" className="font-semibold text-plasma-soft hover:underline">
          Přihlas se
        </Link>
      </p>
    </form>
  );
}
