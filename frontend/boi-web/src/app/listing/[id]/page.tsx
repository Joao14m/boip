"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Calendar,
  CreditCard,
  Dumbbell,
  Grid3x3,
  Image as ImageIcon,
  Layers,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/lib/api";

type ListingMedia = {
  id?: string;
  mediaSlot: number;
  mediaType?: string;
  mediaKey: string;
  contentType?: string;
};

type LotSummary = {
  lotId?: string;
  lotCode?: string;
  headCount?: number;
  breed?: string;
  sex?: string;
  purpose?: string;
  avgWeightKg?: number;
  avgAgeMonths?: number;
  uf?: string;
  city?: string;
};

type Listing = {
  id: string;
  lotId: string;
  sellerUserId?: string;
  status: string;
  priceType?: string;
  priceAmount: number;
  currency: string;
  publishedAt?: string | null;
  expiresAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  media?: ListingMedia[];
  lotSummary?: LotSummary | null;
};

type PaymentCharge = {
  id?: string;
};

type ListingLoadState = {
  id: string;
  listing: Listing | null;
  error: string;
};

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

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = getParam(params.id);

  const [loadState, setLoadState] = useState<ListingLoadState | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [activeMediaSlot, setActiveMediaSlot] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<Listing>(`/api/listings/${id}`)
      .then((data) => {
        setLoadState({ id, listing: data, error: "" });
        const firstSlot = data.media?.slice().sort((a, b) => a.mediaSlot - b.mediaSlot)[0]?.mediaSlot ?? null;
        setActiveMediaSlot(firstSlot);
      })
      .catch((err) => {
        setLoadState({
          id,
          listing: null,
          error: (err as Error).message || "Não foi possível carregar o anúncio.",
        });
      });
  }, [id]);

  const loading = Boolean(id && loadState?.id !== id);
  const listing = id && loadState?.id === id ? loadState.listing : null;
  const error = id && loadState?.id === id ? loadState.error : "";

  const media = useMemo(
    () => (listing?.media ?? []).slice().sort((a, b) => a.mediaSlot - b.mediaSlot),
    [listing],
  );

  const activeMedia = media.find((item) => item.mediaSlot === activeMediaSlot) ?? media[0] ?? null;
  const lot = listing?.lotSummary;
  const canBuy = listing?.status === "ACTIVE";

  const handleBuy = async () => {
    if (!listing) return;
    try {
      setPaying(true);
      setPaymentError("");
      const charge = await api.post<PaymentCharge>(`/api/payments/${listing.id}`, {});
      if (!charge.id) throw new Error("Pagamento criado sem identificador.");
      router.push(`/payment/${charge.id}?listingId=${listing.id}`);
    } catch (err) {
      setPaymentError((err as Error).message || "Não foi possível iniciar o pagamento.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-agre-brand border-t-transparent" />
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="min-h-screen bg-[#F5F5F5]">
        <PageHeader title="Anúncio" onBack={() => router.back()} />
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 py-16 text-center">
          <ImageIcon className="h-12 w-12 text-zinc-300" />
          <p className="text-sm text-agre-muted">{error || "Anúncio não encontrado."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      <PageHeader title="Detalhes do Anúncio" onBack={() => router.back()} />

      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="relative h-[320px] bg-zinc-100 sm:h-[420px]">
            {activeMedia ? (
              activeMedia.mediaType === "VIDEO" ? (
                <video src={activeMedia.mediaKey} controls className="h-full w-full bg-black object-contain" />
              ) : (
                <img
                  src={activeMedia.mediaKey}
                  alt={lot?.lotCode ? `Foto do lote ${lot.lotCode}` : "Foto do anúncio"}
                  className="h-full w-full object-cover"
                />
              )
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-14 w-14 text-zinc-300" />
              </div>
            )}
            {lot?.purpose && (
              <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-agre-dark shadow">
                {lot.purpose}
              </span>
            )}
          </div>

          {media.length > 1 && (
            <div className="grid grid-cols-4 gap-2 border-t border-zinc-100 p-3 sm:grid-cols-5">
              {media.map((item) => (
                <button
                  key={`${item.mediaSlot}-${item.mediaKey}`}
                  type="button"
                  onClick={() => setActiveMediaSlot(item.mediaSlot)}
                  className={`h-20 overflow-hidden rounded-lg border bg-zinc-100 ${
                    activeMedia?.mediaSlot === item.mediaSlot ? "border-agre-button ring-2 ring-agre-button/20" : "border-zinc-200"
                  }`}
                >
                  {item.mediaType === "VIDEO" ? (
                    <div className="flex h-full items-center justify-center text-xs font-bold text-agre-dark">Vídeo</div>
                  ) : (
                    <img src={item.mediaKey} alt="" className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-agre-muted">Anúncio</p>
                <h1 className="truncate font-display text-2xl font-extrabold text-agre-dark">
                  {lot?.lotCode ?? `Anúncio #${listing.id.slice(0, 6)}`}
                </h1>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_CLASS[listing.status] ?? "bg-zinc-100 text-zinc-700"}`}>
                {STATUS_LABEL[listing.status] ?? listing.status}
              </span>
            </div>

            <p className="font-display text-3xl font-extrabold text-agre-dark">
              {formatPrice(listing.priceAmount, listing.currency)}
            </p>
            <p className="mt-1 text-xs text-agre-muted">
              {listing.priceType === "PER_HEAD" ? "Preço por cabeça" : "Preço total"}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric icon={Grid3x3} label="Cabeças" value={lot?.headCount ?? "—"} />
              <Metric icon={Dumbbell} label="Peso médio" value={lot?.avgWeightKg != null ? `${lot.avgWeightKg} kg` : "—"} />
              <Metric icon={Calendar} label="Idade média" value={lot?.avgAgeMonths != null ? `${lot.avgAgeMonths} meses` : "—"} />
              <Metric icon={MapPin} label="Estado" value={lot?.uf ?? "—"} />
            </div>

            <button
              type="button"
              onClick={handleBuy}
              disabled={!canBuy || paying}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-agre-button text-sm font-extrabold text-white transition-colors hover:bg-agre-dark disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              {paying ? "Criando pagamento..." : "Comprar com PIX"}
            </button>

            {!canBuy && (
              <p className="mt-2 text-center text-xs text-agre-muted">
                Compra disponível apenas para anúncios ativos.
              </p>
            )}
            {paymentError && (
              <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                {paymentError}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-sm font-extrabold text-agre-dark">Perfil do Lote</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {lot?.breed && <Chip>{lot.breed}</Chip>}
              {lot?.sex && <Chip>{SEX_LABEL[lot.sex] ?? lot.sex}</Chip>}
              {lot?.purpose && <Chip>{lot.purpose}</Chip>}
            </div>
            <button
              type="button"
              onClick={() => router.push(`/lot/${listing.lotId}`)}
              className="mt-4 flex w-full items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold text-agre-dark hover:bg-zinc-50"
            >
              Ver lote completo
              <Layers className="h-4 w-4 text-agre-muted" />
            </button>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-sm font-extrabold text-agre-dark">Segurança</h2>
            <div className="mt-3 space-y-3 text-sm text-agre-muted">
              <InfoRow icon={ShieldCheck} text="Pagamento via PIX acompanhado pela plataforma." />
              <InfoRow icon={BadgeCheck} text="O vendedor é notificado após confirmação." />
              <InfoRow icon={Banknote} text={`Publicado em ${formatDate(listing.publishedAt ?? listing.createdAt)}`} />
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function PageHeader({ title, onBack }: { title: string; onBack: () => void }) {
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
      <h1 className="font-display text-base font-extrabold text-agre-dark">{title}</h1>
      <div className="h-9 w-9" />
    </header>
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
    <div className="rounded-xl bg-agre-pale px-3 py-3">
      <Icon className="mb-2 h-4 w-4 text-agre-button" />
      <p className="text-[11px] font-semibold uppercase tracking-wide text-agre-muted">{label}</p>
      <p className="mt-0.5 text-sm font-extrabold text-agre-dark">{value}</p>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-agre-pale px-3 py-1 text-xs font-bold text-agre-dark">
      {children}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <p className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-agre-button" />
      <span>{text}</span>
    </p>
  );
}
