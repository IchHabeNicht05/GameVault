import { AuthShell } from "@/components/layout/auth-shell";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Vytvořit účet" };

export default function RegisterPage() {
  return (
    <AuthShell title="Vytvoř si účet" subtitle="Přidej se ke komunitě hráčů GameVault.">
      <RegisterForm />
    </AuthShell>
  );
}
