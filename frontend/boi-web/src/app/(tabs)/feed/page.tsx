"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Store, Plus, Filter, Search, X, ChevronDown, ChevronUp,
  Heart, Image as ImageIcon, Images, Dumbbell, Calendar, MapPin,
} from "lucide-react";
import { api } from "@/lib/api";

const BREEDS   = ["Nelore", "Angus", "Brahman", "Hereford", "Senepol", "Gir", "Guzerá", "Tabapuã"];
const PURPOSES = ["Corte", "Leite", "Reprodução", "Misto"];
const SEX_LABEL: Record<string, string> = { M: "Macho", F: "Fêmea", MIXED: "Misto" };
const UFS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

type Listing = {
  id: string;
  priceAmount: number;
  currency: string;
  lotSummary?: {
    lotCode?: string;
    breed?: string;
    purpose?: string;
    sex?: string;
    uf?: string;
    city?: string;
    avgWeightKg?: number;
    avgAgeMonths?: number;
  };
  media?: { mediaSlot: number; mediaKey: string }[];
};

function formatPrice(amount: number, currency: string) {
  if (currency === "BRL") return `R$ ${amount.toLocaleString("pt-BR")}`;
  return `${currency} ${amount}`;
}

export default function FeedPage() {
  const router = useRouter();

  const [listings, setListings] = useState<Listing[] | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");

  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch]       = useState("");
  const [breed, setBreed]         = useState("");
  const [purpose, setPurpose]     = useState("");
  const [uf, setUf]               = useState("");
  const [priceMin, setPriceMin]   = useState("");
  const [priceMax, setPriceMax]   = useState("");
  const [weightMin, setWeightMin] = useState("");
  const [weightMax, setWeightMax] = useState("");

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ content: Listing[] }>("/api/listings?status=ACTIVE&size=50")
      .then((data) => setListings(data.content ?? []))
      .catch(() => setListings([]));
  }, []);

  const activeFilterCount = useMemo(() => {
    return [search, breed, purpose, uf, priceMin, priceMax, weightMin, weightMax]
      .filter(Boolean).length;
  }, [search, breed, purpose, uf, priceMin, priceMax, weightMin, weightMax]);

  const filtered = useMemo(() => {
    return (listings ?? []).filter((item) => {
      const lot = item.lotSummary;
      if (search) {
        const q = search.toLowerCase();
        const code  = (lot?.lotCode ?? "").toLowerCase();
        const brd   = (lot?.breed ?? "").toLowerCase();
        if (!code.includes(q) && !brd.includes(q)) return false;
      }
      if (breed && lot?.breed !== breed) return false;
      if (purpose && lot?.purpose !== purpose) return false;
      if (uf && lot?.uf !== uf) return false;
      const price = item.priceAmount ?? 0;
      if (priceMin && price < Number(priceMin)) return false;
      if (priceMax && price > Number(priceMax)) return false;
      const weight = lot?.avgWeightKg ?? 0;
      if (weightMin && weight < Number(weightMin)) return false;
      if (weightMax && weight > Number(weightMax)) return false;
      return true;
    });
  }, [listings, search, breed, purpose, uf, priceMin, priceMax, weightMin, weightMax]);

  const clearFilters = useCallback(() => {
    setSearch(""); setBreed(""); setPurpose(""); setUf("");
    setPriceMin(""); setPriceMax(""); setWeightMin(""); setWeightMax("");
    setOpenDropdown(null);
  }, []);

  const renderDropdown = (
    label: string, key: string, options: string[],
    value: string, onChange: (v: string) => void, allLabel: string,
  ) => (
    <div className="mt-3">
      <label className="mb-1.5 block text-xs font-semibold text-agre-muted">{label}</label>
      <button
        type="button"
        onClick={() => setOpenDropdown(openDropdown === key ? null : key)}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 text-sm"
      >
        <span className={value ? "text-zinc-900" : "text-zinc-400"}>{value || allLabel}</span>
        {openDropdown === key
          ? <ChevronUp className="h-4 w-4 text-zinc-400" />
          : <ChevronDown className="h-4 w-4 text-zinc-400" />}
      </button>
      {openDropdown === key && (
        <div className="mt-1 max-h-56 overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-md">
          <button
            type="button"
            onClick={() => { onChange(""); setOpenDropdown(null); }}
            className={`block w-full px-3 py-2 text-left text-sm ${!value ? "bg-agre-pale font-semibold text-agre-dark" : "hover:bg-zinc-50"}`}
          >
            {allLabel}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpenDropdown(null); }}
              className={`block w-full px-3 py-2 text-left text-sm ${value === opt ? "bg-agre-pale font-semibold text-agre-dark" : "hover:bg-zinc-50"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderCard = (item: Listing) => {
    const lot = item.lotSummary;
    const media = item.media ?? [];
    const firstImage = media.find((m) => m.mediaSlot === 0)?.mediaKey ?? null;
    const photoCount = media.length;
    const location = [lot?.city, lot?.uf].filter(Boolean).join(" - ");

    return (
      <div key={item.id} className="group overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-lg shadow-black/5 ring-1 ring-zinc-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-agre-brand/15">
        <div className="relative h-48 w-full overflow-hidden bg-zinc-100">
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

          <button
            type="button"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow hover:bg-white"
          >
            <Heart className="h-[18px] w-[18px] text-zinc-500" />
          </button>

          {photoCount > 1 && (
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {Array.from({ length: Math.min(photoCount, 5) }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full ${i === 0 ? "w-4 bg-white" : "w-1.5 bg-white/60"}`}
                />
              ))}
            </div>
          )}

          {photoCount > 0 && (
            <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
              <Images className="h-3 w-3" />
              {photoCount}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="truncate text-base font-extrabold text-zinc-900">
              {lot?.lotCode ?? `Anúncio #${item.id?.slice(0, 6)}`}
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
                  {SEX_LABEL[lot.sex] ?? lot.sex}
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
          </div>

          {location && (
            <div className="mt-2 flex items-center gap-1 text-xs text-agre-muted">
              <MapPin className="h-3.5 w-3.5" />
              {location}
            </div>
          )}

          <button
            type="button"
            onClick={() => router.push(`/listing/${item.id}`)}
            className="group/btn relative mt-4 flex h-10 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 text-sm font-bold text-white shadow-md shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-agre-brand/25"
          >
            <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-700 group-hover/btn:left-[120%]" />
            Ver Detalhes
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative hidden h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-agre-brand to-agre-button shadow-lg shadow-agre-brand/40 sm:flex">
            <span aria-hidden className="absolute inset-x-2 top-0 h-px bg-white/50" />
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-zinc-900">Marketplace</h1>
            <p className="text-sm text-zinc-600">Compra e venda de gado com filtros por lote, preço e perfil.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push("/listing/create")}
          className="group relative flex h-11 items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 px-4 text-sm font-bold text-white shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-agre-brand/30"
        >
          <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-700 group-hover:left-[120%]" />
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Criar Anúncio</span>
        </button>
      </header>

      <section className="rounded-3xl border border-white/60 bg-white/85 px-4 py-3 shadow-xl shadow-agre-brand/10 ring-1 ring-zinc-200/60 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => { setShowFilters((v) => !v); setOpenDropdown(null); }}
          className="flex items-center gap-2 text-sm font-semibold text-agre-dark"
        >
          <Filter className="h-[18px] w-[18px]" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-agre-button px-1.5 text-[11px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-agre-muted hover:text-agre-dark"
            >
              <X className="h-3.5 w-3.5" /> Limpar
            </button>
          )}
          <button
            type="button"
            onClick={() => { setShowFilters((v) => !v); setOpenDropdown(null); }}
            className="flex items-center gap-1 text-xs text-agre-muted hover:text-agre-dark"
          >
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showFilters ? "Recolher" : "Expandir"}
          </button>
        </div>
        </div>

      {showFilters && (
        <div className="mt-4 grid gap-3 border-t border-zinc-100 pt-4 md:grid-cols-3 xl:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-agre-muted">Buscar</label>
            <div className="flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3">
              <Search className="h-[18px] w-[18px] text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Digite para buscar..."
                className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}>
                  <X className="h-4 w-4 text-zinc-400" />
                </button>
              )}
            </div>
          </div>

          {renderDropdown("Raça",      "breed",   BREEDS,   breed,   setBreed,   "Todas as raças")}
          {renderDropdown("Finalidade","purpose", PURPOSES, purpose, setPurpose, "Todas")}
          {renderDropdown("Estado",    "uf",      UFS,      uf,      setUf,      "Todos os estados")}

          <div className="mt-3">
            <label className="mb-1.5 block text-xs font-semibold text-agre-muted">
              Preço: R$ {priceMin || "0"} - R$ {priceMax || "∞"}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="h-10 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:outline-none"
              />
              <span className="text-zinc-400">—</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="h-10 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="mb-1.5 block text-xs font-semibold text-agre-muted">
              Peso: {weightMin || "0"}kg - {weightMax || "∞"}kg
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min (kg)"
                value={weightMin}
                onChange={(e) => setWeightMin(e.target.value)}
                className="h-10 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:outline-none"
              />
              <span className="text-zinc-400">—</span>
              <input
                type="number"
                placeholder="Max (kg)"
                value={weightMax}
                onChange={(e) => setWeightMax(e.target.value)}
                className="h-10 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:outline-none"
              />
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-10 self-end rounded-xl border border-zinc-200 bg-white/90 px-4 text-sm font-semibold text-agre-dark hover:bg-white"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
      </section>

      <div className="mt-4 flex w-full rounded-xl border border-zinc-200/70 bg-white/80 p-1 shadow-sm shadow-black/5 sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold sm:flex-none ${
            activeTab === "all" ? "bg-gradient-to-br from-agre-brand to-agre-button text-white shadow-md shadow-agre-brand/30" : "text-zinc-500 hover:text-agre-dark"
          }`}
        >
          Todos os Anúncios ({filtered.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("favorites")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold sm:flex-none ${
            activeTab === "favorites" ? "bg-gradient-to-br from-agre-brand to-agre-button text-white shadow-md shadow-agre-brand/30" : "text-zinc-500 hover:text-agre-dark"
          }`}
        >
          <Heart className="h-3.5 w-3.5" />
          Favoritos (0)
        </button>
      </div>

      <div className="mt-4 flex-1">
        {listings === null ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-agre-brand border-t-transparent" />
          </div>
        ) : activeTab === "favorites" ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 px-6 text-center">
            <Heart className="h-12 w-12 text-zinc-300" />
            <p className="text-sm text-agre-muted">Nenhum favorito ainda.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 px-6 text-center">
            <Search className="h-12 w-12 text-zinc-300" />
            <p className="text-sm text-agre-muted">
              Nenhum anúncio encontrado.<br />Tente ajustar os filtros.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(renderCard)}
          </div>
        )}
      </div>
    </main>
  );
}
