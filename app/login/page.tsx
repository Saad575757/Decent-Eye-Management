import { getSettings } from "@/lib/services/settings";
import { LoginForm } from "@/components/auth/LoginForm";
import { Eye } from "lucide-react";

export default async function LoginPage() {
  const settings = await getSettings().catch(() => null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary to-primary/90 p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Eye className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            {settings?.shopName || "Decent Eye"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Optical Shop Management System
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
