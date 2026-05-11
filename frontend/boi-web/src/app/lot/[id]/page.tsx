"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Dumbbell,
  FileText,
  Grid3x3,
  Image as ImageIcon,
  Layers,
  MapPin,
  Tag,
} from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";

type CattleLotProfile = {
  id?: string;
  lotId?: string;
  profileVersion?: number;
  breed?: string | null;
  sex?: string | null;
  purpose?: string | null;
  avgWeightKg?: number | null;
  avgAgeMonths?: number | null;
  birthYear?: number | null;
  description?: string | null;
  createdAt?: string | null;
};

type CattleLot = {
  id: string;
  ownerUserId?: string;
  lotCode?: string;
  headCount?: number;
  locationId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  currentProfile?: CattleLotProfile | null;
};

type Location = {
  municipality?: string;
  uf?: string;
};

type Listing = {
  id: string;
  status: string;
  priceAmount: number;
  currency: string;
  media?: { mediaSlot: number; mediaType?: string; mediaKey: string }[];
  lotSummary?: {
    lotCode?: string;
    breed?: string;
    sex?: string;
    purpose?: string;
    avgWeightKg?: number;
    avgAgeMonths?: number;
    headCount?: number;
    uf?: string;
  };
};

type PageResponse<T> = {
  content?: T[];
};

type LotLoadState = {
  id: string;
  lot: CattleLot | null;
  location: Location | null;
  listings: Listing[];
  error: string;
};

const EMPTY_LISTINGS: Listing[] = [];

const SEX_LABEL: Record<string, string> = {
  M: "Macho",
  F: "Fêmea",
  MIXED: "Misto",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativo",
  DRAFT: "Rascunho",
  PAUSED: "Pausado",
  SOLD: "Vendido",
  CANCELLED: "Cancelado",
};

const STATUS_CLASS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  DRAFT: "bg-yellow-100 text-yellow-700",
  PAUSED: "bg-orange-100 text-orange-700",
  SOLD: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatPrice(amount?: number, currency = "BRL") {
  if (amount == null) return "—";
  if (currency === "BRL") {
    return amount.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  }
  return `${currency} ${amount.toLocaleString("pt-BR")}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value));
}

export default function LotDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = getParam(params.id);

  const [loadState, setLoadState] = useState<LotLoadState | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    api.get<CattleLot>(`/api/lots/${id}`)
      .then((data) => {
        const listingPromise = api
          .get<PageResponse<Listing>>(`/api/listings?lotId=${id}&size=50`)
          .then((res) => res.content ?? [])
          .catch(() => []);

        const locationPromise = data.locationId
          ? api.get<Location>(`/api/locations/${data.locationId}`)
              .catch(() => null)
          : Promise.resolve(null);

        return Promise.all([listingPromise, locationPromise]).then(([listings, location]) => {
          if (!cancelled) setLoadState({ id, lot: data, location, listings, error: "" });
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadState({
          id,
          lot: null,
          location: null,
          listings: [],
          error: (err as Error).message || "Não foi possível carregar o lote.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const loading = Boolean(id && loadState?.id !== id);
  const lot = id && loadState?.id === id ? loadState.lot : null;
  const location = id && loadState?.id === id ? loadState.location : null;
  const listings = id && loadState?.id === id ? loadState.listings : EMPTY_LISTINGS;
  const error = id && loadState?.id === id ? loadState.error : "";

  const activeListing = useMemo(
    () => listings.find((item) => item.status === "ACTIVE") ?? listings[0] ?? null,
    [listings],
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF5EC] px-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-agre-brand border-t-transparent" />
      </main>
    );
  }

  if (error || !lot) {
    return (
      <main className="min-h-screen bg-[#FAF5EC]">
        <PageHeader title="Lote" onBack={() => router.back()} />
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 py-16 text-center">
          <Layers className="h-12 w-12 text-zinc-300" />
          <p className="text-sm text-agre-muted">{error || "Lote não encontrado."}</p>
        </div>
      </main>
    );
  }

  const profile = lot.currentProfile;
  const sortedMedia = activeListing?.media?.slice().sort((a, b) => a.mediaSlot - b.mediaSlot) ?? [];
  const firstImage = sortedMedia[0]?.mediaKey ?? null;
  const locationText = [location?.municipality, location?.uf].filter(Boolean).join(" - ");

  return (
    <main className="min-h-screen bg-[#FAF5EC]">
      <PageHeader title="Detalhes do Lote" onBack={() => router.back()} />

      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[minmax(320px,0.7fr)_minmax(0,1.3fr)]">
        <aside className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="relative h-64 bg-zinc-100">
              {firstImage ? (
                <img src={firstImage} alt={lot.lotCode ? `Foto do lote ${lot.lotCode}` : "Foto do lote"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-14 w-14 text-zinc-300" />
                </div>
              )}
              {profile?.purpose && (
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-agre-dark shadow">
                  {profile.purpose}
                </span>
              )}
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-agre-muted">Lote</p>
              <h1 className="font-display text-2xl font-extrabold text-agre-dark">
                {lot.lotCode ?? `Lote #${lot.id.slice(0, 6)}`}
              </h1>
              <p className="mt-1 text-sm text-agre-muted">
                Criado em {formatDate(lot.createdAt)}
              </p>
              {locationText && (
                <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-agre-dark">
                  <MapPin className="h-4 w-4 text-agre-button" />
                  {locationText}
                </p>
              )}
            </div>
          </section>

          {activeListing && (
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-sm font-extrabold text-agre-dark">Anúncio vinculado</h2>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xl font-extrabold text-agre-dark">
                    {formatPrice(activeListing.priceAmount, activeListing.currency)}
                  </p>
                  <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_CLASS[activeListing.status] ?? "bg-zinc-100 text-zinc-700"}`}>
                    {STATUS_LABEL[activeListing.status] ?? activeListing.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/listing/${activeListing.id}`)}
                  className="rounded-xl bg-agre-button px-4 py-2 text-sm font-bold text-white hover:bg-agre-dark"
                >
                  Ver anúncio
                </button>
              </div>
            </section>
          )}
        </aside>

        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric icon={Grid3x3} label="Cabeças" value={lot.headCount ?? "—"} />
            <Metric icon={Tag} label="Raça" value={profile?.breed ?? "—"} />
            <Metric icon={Dumbbell} label="Peso médio" value={profile?.avgWeightKg != null ? `${profile.avgWeightKg} kg` : "—"} />
            <Metric icon={Calendar} label="Idade média" value={profile?.avgAgeMonths != null ? `${profile.avgAgeMonths} meses` : "—"} />
          </div>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-display text-base font-extrabold text-agre-dark">Perfil atual</h2>
              <p className="text-xs text-agre-muted">
                Versão {profile?.profileVersion ?? "—"} do perfil do lote
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Sexo">{profile?.sex ? SEX_LABEL[profile.sex] ?? profile.sex : "—"}</Field>
              <Field label="Finalidade">{profile?.purpose ?? "—"}</Field>
              <Field label="Ano de nascimento">{profile?.birthYear ?? "—"}</Field>
              <Field label="Atualizado em">{formatDate(profile?.createdAt)}</Field>
            </div>

            <div className="mt-5 rounded-xl bg-agre-pale p-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-agre-muted">
                <FileText className="h-4 w-4" />
                Descrição
              </p>
              <p className="text-sm leading-6 text-agre-dark">
                {profile?.description || "Nenhuma descrição informada para este lote."}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-base font-extrabold text-agre-dark">Anúncios deste lote</h2>
            {listings.length === 0 ? (
              <p className="mt-3 text-sm text-agre-muted">Nenhum anúncio encontrado para este lote.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {listings.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => router.push(`/listing/${item.id}`)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left hover:bg-zinc-50"
                  >
                    <div>
                      <p className="font-bold text-agre-dark">{formatPrice(item.priceAmount, item.currency)}</p>
                      <p className="text-xs text-agre-muted">{item.lotSummary?.lotCode ?? lot.lotCode}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_CLASS[item.status] ?? "bg-zinc-100 text-zinc-700"}`}>
                      {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <Icon className="mb-3 h-5 w-5 text-agre-button" />
      <p className="text-[11px] font-semibold uppercase tracking-wide text-agre-muted">{label}</p>
      <p className="mt-1 truncate text-sm font-extrabold text-agre-dark">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-agre-muted">{label}</p>
      <p className="text-sm font-semibold text-agre-dark">{children}</p>
    </div>
  );
}
