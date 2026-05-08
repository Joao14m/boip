"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const router = useRouter();
  const { user, loading, onboarded } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user)            router.replace("/login");
    else if (!onboarded)  router.replace("/signup");
    else                  router.replace("/feed");
  }, [user, loading, onboarded, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-agre-muted">Carregando...</div>
    </div>
  );
}
