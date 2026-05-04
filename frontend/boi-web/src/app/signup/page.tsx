"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Store } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading, onboarded } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user && onboarded) router.replace("/feed");
  }, [user, loading, onboarded, router]);

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-agre-button">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-xl text-agre-dark">BoiMarket</span>
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-900">Criar conta</h1>
        <p className="mt-2 text-sm text-agre-muted">
          O cadastro completo será migrado do app mobile em breve.
        </p>
      </div>
    </div>
  );
}
