import { Suspense } from "react";
import { AuthShell } from "@/components/layout/auth-shell";
import { LoginForm } from "./login-form";

export const metadata = { title: "Přihlásit se" };

export default function LoginPage() {
  return (
    <AuthShell title="Vítej zpátky" subtitle="Přihlas se ke svému GameVault účtu.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
