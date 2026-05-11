"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  ClipboardList,
  DollarSign,
  Images,
  Loader2,
  Megaphone,
  Tag,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { uploadImage } from "@/lib/upload";
import { PageHeader } from "@/components/PageHeader";

const BREEDS = ["Nelore", "Angus", "Brahman", "Hereford", "Senepol", "Gir", "Guzerá", "Tabapuã"];
const PURPOSES = [
  { label: "Corte",      value: "Corte" },
  { label: "Leite",      value: "Leite" },
  { label: "Reprodução", value: "Reprodução" },
];
const SEXES = [
  { label: "Macho", value: "M" },
  { label: "Fêmea", value: "F" },
  { label: "Misto", value: "MIXED" },
];
const MAX_IMAGES = 3;

type ImageEntry = { file: File; previewUrl: string };

type Lot      = { id: string };
type Listing  = { id: string };
type UserInfo = { locationId: string | null };

export default function CreateListingPage() {
  const router = useRouter();
  const { user, userId } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [userLocationId, setUserLocationId] = useState<string | null>(null);

  // Lot
  const [lotCode, setLotCode]     = useState("");
  const [headCount, setHeadCount] = useState("");

  // Profile
  const [breed, setBreed]                 = useState("");
  const [sex, setSex]                     = useState("");
  const [purpose, setPurpose]             = useState("");
  const [avgWeightKg, setAvgWeightKg]     = useState("");
  const [avgAgeMonths, setAvgAgeMonths]   = useState("");
  const [description, setDescription]     = useState("");

  // Listing
  const [priceType, setPriceType]     = useState<"PER_HEAD" | "TOTAL">("TOTAL");
  const [priceAmount, setPriceAmount] = useState("");

  // Images
  const [images, setImages] = useState<ImageEntry[]>([]);

  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!userId) return;
    api.get<UserInfo>(`/api/users/${userId}`)
      .then((data) => setUserLocationId(data.locationId ?? null))
      .catch(() => setUserLocationId(null));
  }, [userId]);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearError = (field: string) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!lotCode.trim())                            e.lotCode     = "Código do lote é obrigatório.";
    if (!headCount || Number(headCount) < 1)        e.headCount   = "Quantidade deve ser pelo menos 1.";
    if (!priceAmount || Number(priceAmount) <= 0)   e.priceAmount = "Informe um valor válido.";
    if (images.length === 0)                        e.images      = "Adicione pelo menos uma foto.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFilesPicked = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;
    const picked = Array.from(fileList).slice(0, remaining).map<ImageEntry>((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...picked]);
    clearError("images");
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = prev.slice();
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const buildAndSubmit = async (publish: boolean) => {
    setFormError("");
    if (!validate()) return;
    if (!userId || !user) {
      setFormError("Sessão expirada. Faça login novamente.");
      return;
    }

    try {
      setLoading(true);

      const lot = await api.post<Lot>("/api/lots", {
        ownerUserId: userId,
        lotCode,
        headCount: Number(headCount),
        locationId: userLocationId,
      });

      await api.post(`/api/lots/${lot.id}/profile`, {
        breed:        breed || null,
        sex:          sex || null,
        purpose:      purpose || null,
        avgWeightKg:  avgWeightKg  ? Number(avgWeightKg)  : null,
        avgAgeMonths: avgAgeMonths ? Number(avgAgeMonths) : null,
        description:  description || null,
      });

      const media: { mediaSlot: number; mediaType: string; mediaKey: string; contentType: string }[] = [];
      for (let i = 0; i < images.length; i++) {
        const file = images[i].file;
        const path = `listings/${user.uid}/${lot.id}/${i}.jpg`;
        const url = await uploadImage(file, path);
        media.push({
          mediaSlot:   i,
          mediaType:   "IMAGE",
          mediaKey:    url,
          contentType: file.type || "image/jpeg",
        });
      }

      const listing = await api.post<Listing>("/api/listings", {
        lotId:       lot.id,
        priceType,
        priceAmount: Number(priceAmount),
        currency:    "BRL",
        media,
      });

      if (publish) {
        await api.patch(`/api/listings/${listing.id}/status`, { status: "ACTIVE" });
      }

      router.back();
    } catch (e) {
      setFormError((e as Error).message || "Não foi possível criar o anúncio. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF5EC]">
      <PageHeader title="Novo Anúncio" onBack={() => router.back()} />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
        <header className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-agre-brand to-agre-button shadow-lg shadow-agre-brand/40 sm:h-12 sm:w-12">
            <span aria-hidden className="absolute inset-x-2 top-0 h-px bg-white/50" />
            <Megaphone className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
              Criar Anúncio
            </h1>
            <p className="text-xs text-zinc-600 sm:text-sm">
              Preencha os dados do lote, perfil dos animais e preço para publicar.
            </p>
          </div>
        </header>

        {formError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {formError}
          </div>
        )}

        <Section
          icon={ClipboardList}
          title="Dados do Lote"
          subtitle="Identifique o lote e quantos animais ele tem."
        >
          <Field label="Código do Lote" error={errors.lotCode}>
            <input
              type="text"
              value={lotCode}
              onChange={(e) => { setLotCode(e.target.value); clearError("lotCode"); }}
              placeholder="Ex: LOTE-001"
              className={inputClass(Boolean(errors.lotCode))}
            />
          </Field>

          <Field label="Quantidade (cabeças)" error={errors.headCount}>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={headCount}
              onChange={(e) => { setHeadCount(e.target.value); clearError("headCount"); }}
              placeholder="Ex: 50"
              className={inputClass(Boolean(errors.headCount))}
            />
          </Field>
        </Section>

        <Section
          icon={Tag}
          title="Perfil do Lote"
          subtitle="Características que ajudam o comprador a avaliar."
        >
          <Field label="Raça">
            <div className="flex flex-wrap gap-2">
              {BREEDS.map((b) => (
                <Chip key={b} active={breed === b} onClick={() => setBreed(breed === b ? "" : b)}>
                  {b}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Sexo">
            <div className="flex flex-wrap gap-2">
              {SEXES.map((s) => (
                <Chip key={s.value} active={sex === s.value} onClick={() => setSex(sex === s.value ? "" : s.value)}>
                  {s.label}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Finalidade">
            <div className="flex flex-wrap gap-2">
              {PURPOSES.map((p) => (
                <Chip
                  key={p.value}
                  active={purpose === p.value}
                  onClick={() => setPurpose(purpose === p.value ? "" : p.value)}
                >
                  {p.label}
                </Chip>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Peso médio (kg)">
              <input
                type="number"
                inputMode="numeric"
                value={avgWeightKg}
                onChange={(e) => setAvgWeightKg(e.target.value)}
                placeholder="Ex: 450"
                className={inputClass(false)}
              />
            </Field>

            <Field label="Idade média (meses)">
              <input
                type="number"
                inputMode="numeric"
                value={avgAgeMonths}
                onChange={(e) => setAvgAgeMonths(e.target.value)}
                placeholder="Ex: 24"
                className={inputClass(false)}
              />
            </Field>
          </div>

          <Field label="Descrição">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes adicionais sobre o lote..."
              rows={4}
              className={`${inputClass(false)} resize-none`}
            />
          </Field>
        </Section>

        <Section
          icon={Images}
          title="Fotos"
          subtitle={`Até ${MAX_IMAGES} fotos. A primeira será a capa do anúncio.`}
        >
          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div
                key={img.previewUrl}
                className="relative h-28 w-28 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm"
              >
                <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-agre-dark shadow">
                    Capa
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label="Remover imagem"
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed text-xs font-semibold transition-colors ${
                  errors.images
                    ? "border-red-400 bg-red-50 text-red-500"
                    : "border-zinc-300 bg-zinc-50 text-agre-muted hover:border-agre-button hover:text-agre-dark"
                }`}
              >
                <Camera className="h-6 w-6" />
                {images.length}/{MAX_IMAGES}
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFilesPicked(e.target.files);
              e.target.value = "";
            }}
          />
          {errors.images && (
            <p className="mt-3 text-xs font-semibold text-red-500">{errors.images}</p>
          )}
        </Section>

        <Section
          icon={DollarSign}
          title="Preço"
          subtitle="Defina como o valor será apresentado ao comprador."
        >
          <Field label="Tipo de preço">
            <div className="flex flex-wrap gap-2">
              <Chip active={priceType === "TOTAL"} onClick={() => setPriceType("TOTAL")}>
                Total
              </Chip>
              <Chip active={priceType === "PER_HEAD"} onClick={() => setPriceType("PER_HEAD")}>
                Por cabeça
              </Chip>
            </div>
          </Field>

          <Field label="Valor (R$)" error={errors.priceAmount}>
            <input
              type="number"
              inputMode="numeric"
              value={priceAmount}
              onChange={(e) => { setPriceAmount(e.target.value); clearError("priceAmount"); }}
              placeholder="Ex: 150000"
              className={inputClass(Boolean(errors.priceAmount))}
            />
          </Field>
        </Section>

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            onClick={() => buildAndSubmit(true)}
            disabled={loading}
            className="group/btn relative flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-agre-dark via-agre-dark to-[#2A1B0F] text-sm font-bold text-white shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-agre-brand/30 disabled:cursor-not-allowed disabled:from-zinc-400 disabled:to-zinc-400 disabled:shadow-none disabled:hover:translate-y-0"
          >
            <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-700 group-hover/btn:left-[120%]" />
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
            {loading ? "Criando..." : "Publicar Anúncio"}
          </button>
          <button
            type="button"
            onClick={() => buildAndSubmit(false)}
            disabled={loading}
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-white/90 text-sm font-bold text-agre-dark transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Salvar Rascunho
          </button>
        </div>
      </div>
    </main>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors",
    "placeholder:text-zinc-400",
    "focus:border-agre-button focus:ring-2 focus:ring-agre-button/20",
    hasError ? "border-red-400" : "border-zinc-200",
  ].join(" ");
}

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-lg shadow-black/5 ring-1 ring-zinc-200/60 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-agre-pale text-agre-button">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-sm font-extrabold text-agre-dark">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-agre-muted">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-agre-muted">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "bg-gradient-to-br from-agre-brand to-agre-button text-white shadow-md shadow-agre-brand/30"
          : "border border-zinc-200 bg-white text-zinc-600 hover:border-agre-brand/40 hover:text-agre-dark"
      }`}
    >
      {children}
    </button>
  );
}
