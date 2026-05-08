"use client";

import { ArrowLeft } from "lucide-react";

export function PageHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
      <button
        type="button"
        onClick={onBack}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-agre-dark hover:bg-agre-pale"
        aria-label="Voltar"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="font-display text-base font-extrabold tracking-tight text-agre-dark">{title}</h1>
      <div className="h-9 w-9" />
    </header>
  );
}
