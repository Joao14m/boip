"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Store, LogOut } from "lucide-react";

export default function FeedPage() {
  const router = useRouter();
  const { user, loading, onboarded, signOut } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || !onboarded) router.replace("/");
  }, [user, loading, onboarded, router]);

  if (loading || !user || !onboarded) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-agre-muted">Carregando...</div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-agre-button">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-lg text-agre-dark">BoiMarket</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </header>
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-zinc-900">Bem-vindo, {user.email}</h1>
          <p className="mt-2 text-agre-muted">Feed em construção.</p>
        </div>
      </main>
    </div>
  );
}
