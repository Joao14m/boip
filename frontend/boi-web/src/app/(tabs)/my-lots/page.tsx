"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Folder, Heart, FolderOpen, Image as ImageIcon, Dumbbell, Calendar, Grid3x3, Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

type SubTab = "favoritos" | "meus";

const STATUS_FILTERS = ["Todos", "ACTIVE", "DRAFT", "PAUSED", "SOLD", "CANCELLED"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

type Listing = {
  id: string;
  status: string;
  priceAmount: number;
  currency: string;
  lotSummary?: {
    lotCode?: string;
    breed?: string;
    purpose?: string;
    sex?: string;
    avgWeightKg?: number;
    avgAgeMonths?: number;
    headCount?: number;
  };
  media?: { mediaSlot: number; mediaKey: string }[];
};

function statusColor(status: string) {
  switch (status) {
    case "ACTIVE":    return { bg: "bg-green-100",  text: "text-green-700"  };
    case "DRAFT":     return { bg: "bg-yellow-100", text: "text-yellow-700" };
    case "PAUSED":    return { bg: "bg-orange-100", text: "text-orange-700" };
    case "SOLD":      return { bg: "bg-blue-100",   text: "text-blue-700"   };
    case "CANCELLED": return { bg: "bg-red-100",    text: "text-red-700"    };
    default:          return { bg: "bg-zinc-100",   text: "text-zinc-700"   };
  }
}

function translateStatus(status: string) {
  switch (status) {
    case "ACTIVE":    return "Ativo";
    case "DRAFT":     return "Rascunho";
    case "PAUSED":    return "Pausado";
    case "SOLD":      return "Vendido";
    case "CANCELLED": return "Cancelado";
    default:          return status;
  }
}

function formatPrice(amount: number, currency: string) {
  if (currency === "BRL") return `R$ ${amount.toLocaleString("pt-BR")}`;
  return `${currency} ${amount}`;
}

export default function MyLotsPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [activeTab, setActiveTab]       = useState<SubTab>("favoritos");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Todos");
  const [myListingsState, setMyListingsState] = useState<{
    userId: string | null;
    items: Listing[];
  }>({ userId: null, items: [] });
  const [favorites]                     = useState<Listing[]>([]);
  const loadingFav = false;

  useEffect(() => {
    if (!userId) return;
    api.get<{ content: Listing[] }>(`/api/listings?sellerUserId=${userId}&size=50`)
      .then((data) => setMyListingsState({ userId, items: data.content ?? [] }))
      .catch(() => setMyListingsState({ userId, items: [] }));
  }, [userId]);

  const myListings = userId && myListingsState.userId === userId ? myListingsState.items : [];
  const loadingMy = Boolean(userId && myListingsState.userId !== userId);

  const filteredListings =
    statusFilter === "Todos"
      ? myListings
      : myListings.filter((l) => l.status === statusFilter);

  const renderCard = (item: Listing, opts?: { favorite?: boolean }) => {
    const lot = item.lotSummary;
    const sc = statusColor(item.status);
    const firstImage = item.media?.slice().sort((a, b) => a.mediaSlot - b.mediaSlot)[0]?.mediaKey ?? null;

    return (
      <div
        key={item.id}
        role="button"
        tabIndex={0}
        onClick={() => router.push(`/listing/${item.id}`)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") router.push(`/listing/${item.id}`);
        }}
        className="group overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-lg shadow-black/5 ring-1 ring-zinc-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-agre-brand/15"
      >
        <div className="relative h-44 w-full overflow-hidden bg-zinc-100">
          {firstImage ? (
            <img src={firstImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-10 w-10 text-zinc-300" />
            </div>
          )}
          {lot?.purpose && (
              <span className="absolute left-3 top-3 rounded-full border border-agre-brand/20 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-agre-dark shadow">
              {lot.purpose}
            </span>
          )}
          {opts?.favorite && (
            <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow">
              <Heart className="h-[18px] w-[18px] fill-red-500 text-red-500" />
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="truncate text-base font-extrabold text-zinc-900">
              {lot?.lotCode ?? `Anuncio #${item.id?.slice(0, 6)}`}
            </h3>
            <span className="flex-shrink-0 text-base font-extrabold text-agre-dark">
              {formatPrice(item.priceAmount, item.currency)}
            </span>
          </div>

          {lot && (lot.breed || lot.sex) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {lot.breed && (
                <span className="rounded-full border border-agre-brand/20 bg-agre-pale px-2 py-0.5 text-[11px] font-semibold text-agre-dark">
                  {lot.breed}
                </span>
              )}
              {lot.sex && (
                <span className="rounded-full border border-agre-brand/20 bg-agre-pale px-2 py-0.5 text-[11px] font-semibold text-agre-dark">
                  {lot.sex}
                </span>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-agre-muted">
            {lot?.avgWeightKg != null && (
              <span className="inline-flex items-center gap-1">
                <Dumbbell className="h-3.5 w-3.5" />
                {lot.avgWeightKg}kg
              </span>
            )}
            {lot?.avgAgeMonths != null && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {lot.avgAgeMonths} meses
              </span>
            )}
            {lot?.headCount != null && (
              <span className="inline-flex items-center gap-1">
                <Grid3x3 className="h-3.5 w-3.5" />
                {lot.headCount} cab.
              </span>
            )}
          </div>

          {!opts?.favorite && (
            <span className={`mt-3 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${sc.bg} ${sc.text}`}>
              {translateStatus(item.status)}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-agre-brand to-agre-button shadow-lg shadow-agre-brand/40 sm:h-12 sm:w-12">
            <span aria-hidden className="absolute inset-x-2 top-0 h-px bg-white/50" />
            <Folder className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">Meus Lotes</h1>
            <p className="text-xs text-zinc-600 sm:text-sm">Acompanhe seus anúncios, favoritos e status comerciais.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push("/listing/create")}
          className="group relative flex h-11 flex-shrink-0 items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 px-4 text-sm font-bold text-white shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-agre-brand/30"
        >
          <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-700 group-hover:left-[120%]" />
          <Plus className="h-4 w-4" />
          <span>Criar Anúncio</span>
        </button>
      </header>

      <div className="flex w-full rounded-xl border border-zinc-200/70 bg-white/80 p-1 shadow-sm shadow-black/5 sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("favoritos")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold sm:flex-none ${
            activeTab === "favoritos" ? "bg-gradient-to-br from-agre-brand to-agre-button text-white shadow-md shadow-agre-brand/30" : "text-zinc-500 hover:text-agre-dark"
          }`}
        >
          <Heart className="h-4 w-4" />
          Favoritos ({favorites.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("meus")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold sm:flex-none ${
            activeTab === "meus" ? "bg-gradient-to-br from-agre-brand to-agre-button text-white shadow-md shadow-agre-brand/30" : "text-zinc-500 hover:text-agre-dark"
          }`}
        >
          <Folder className="h-4 w-4" />
          Meus Lotes ({myListings.length})
        </button>
      </div>

      <div className="mt-4 flex-1">
        {activeTab === "favoritos" ? (
          loadingFav ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-agre-brand border-t-transparent" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 px-6 text-center">
              <Heart className="h-12 w-12 text-zinc-300" />
              <p className="text-sm text-agre-muted">
                Nenhum favorito ainda.<br />Explore o Feed e marque anúncios que gostar!
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favorites.map((item) => renderCard(item, { favorite: true }))}
            </div>
          )
        ) : (
          <>
            <div className="mb-4 rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-agre-brand/10 ring-1 ring-zinc-200/60 backdrop-blur-sm">
              <div className="flex flex-wrap gap-2 p-3">
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      statusFilter === s
                        ? "bg-gradient-to-br from-agre-brand to-agre-button text-white shadow-md shadow-agre-brand/30"
                        : "border border-zinc-200 bg-white text-zinc-600 hover:border-agre-brand/40"
                    }`}
                  >
                    {s === "Todos" ? "Todos" : translateStatus(s)}
                  </button>
                ))}
              </div>
            </div>

            {loadingMy ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-agre-brand border-t-transparent" />
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 px-6 text-center">
                <FolderOpen className="h-12 w-12 text-zinc-300" />
                <p className="text-sm text-agre-muted">
                  {statusFilter === "Todos"
                    ? "Nenhum lote criado ainda."
                    : `Nenhum lote com status "${translateStatus(statusFilter)}".`}
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredListings.map((item) => renderCard(item))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
