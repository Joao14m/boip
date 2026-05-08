"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon, Tag, Settings, Lock, Edit3, CreditCard,
  ChevronRight, LogOut, Trash2, Megaphone, Image as ImageIcon,
  Dumbbell, Calendar, Grid3x3,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { auth } from "@/lib/firebase";

type Tab = "anuncios" | "conta";

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

type Profile = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  personDoc?: string;
  docType?: string;
  locationId?: string;
};

type Location = {
  municipality?: string;
  uf?: string;
};

type ProfileState = {
  userId: string | null;
  profile: Profile | null;
  location: Location | null;
};

type ListingsState = {
  userId: string | null;
  items: Listing[];
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativo", DRAFT: "Rascunho", PAUSED: "Pausado",
  SOLD: "Vendido", CANCELLED: "Cancelado",
};
const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  ACTIVE:    { bg: "bg-green-100",  text: "text-green-700"  },
  DRAFT:     { bg: "bg-yellow-100", text: "text-yellow-700" },
  PAUSED:    { bg: "bg-orange-100", text: "text-orange-700" },
  SOLD:      { bg: "bg-blue-100",   text: "text-blue-700"   },
  CANCELLED: { bg: "bg-red-100",    text: "text-red-700"    },
};

function formatPrice(amount: number, currency: string) {
  if (currency === "BRL") return `R$ ${amount.toLocaleString("pt-BR")}`;
  return `${currency} ${amount}`;
}

function formatDoc(doc: string, type?: string) {
  if (type === "CPF" && doc.length === 11) {
    return `${doc.slice(0, 3)}.${doc.slice(3, 6)}.${doc.slice(6, 9)}-${doc.slice(9)}`;
  }
  if (type === "CNPJ" && doc.length === 14) {
    return `${doc.slice(0, 2)}.${doc.slice(2, 5)}.${doc.slice(5, 8)}/${doc.slice(8, 12)}-${doc.slice(12)}`;
  }
  return doc;
}

export default function ProfilePage() {
  const router = useRouter();
  const { userId, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("anuncios");
  const [profileState, setProfileState] = useState<ProfileState>({
    userId: null,
    profile: null,
    location: null,
  });
  const [listingsState, setListingsState] = useState<ListingsState>({
    userId: null,
    items: [],
  });
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "", lastName: "", phone: "", personDoc: "", docType: "CPF",
  });

  useEffect(() => {
    if (!userId) return;
    api.get<Profile>(`/api/users/${userId}`)
      .then(async (data) => {
        const location = data.locationId
          ? await api.get<Location>(`/api/locations/${data.locationId}`).catch(() => null)
          : null;
        setProfileState({ userId, profile: data, location });
      })
      .catch(() => setProfileState({ userId, profile: null, location: null }));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    api.get<{ content: Listing[] }>(`/api/listings?sellerUserId=${userId}&size=50`)
      .then((data) => setListingsState({ userId, items: data.content ?? [] }))
      .catch(() => setListingsState({ userId, items: [] }));
  }, [userId]);

  const profile = userId && profileState.userId === userId ? profileState.profile : null;
  const location = userId && profileState.userId === userId ? profileState.location : null;
  const listings = userId && listingsState.userId === userId ? listingsState.items : [];
  const loadingUser = Boolean(userId && profileState.userId !== userId);
  const loadingListings = Boolean(userId && listingsState.userId !== userId);

  const handleSignOut = async () => {
    if (!confirm("Deseja realmente sair?")) return;
    await signOut();
    router.replace("/login");
  };

  const handleDelete = async () => {
    if (!confirm("Essa ação é irreversível. Deseja realmente deletar sua conta?")) return;
    try {
      await api.delete(`/api/users/${userId}`);
      if (auth?.currentUser) await auth.currentUser.delete();
      await signOut();
      router.replace("/login");
    } catch (e) {
      alert(`Erro: ${(e as Error).message}`);
    }
  };

  const handleSave = async () => {
    try {
      const updated = await api.patch<Profile>(`/api/users/${userId}`, editForm);
      setProfileState((state) => ({ ...state, profile: updated }));
      setEditing(false);
    } catch (e) {
      alert(`Erro: ${(e as Error).message}`);
    }
  };

  const renderListingCard = (item: Listing) => {
    const lot = item.lotSummary;
    const firstImage = item.media?.slice().sort((a, b) => a.mediaSlot - b.mediaSlot)[0]?.mediaKey ?? null;
    const sc = STATUS_COLOR[item.status] ?? { bg: "bg-zinc-100", text: "text-zinc-700" };

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

          <span className={`mt-3 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${sc.bg} ${sc.text}`}>
            {STATUS_LABEL[item.status] ?? item.status}
          </span>
        </div>
      </div>
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-agre-brand to-agre-button shadow-lg shadow-agre-brand/40 sm:h-12 sm:w-12">
          <span aria-hidden className="absolute inset-x-2 top-0 h-px bg-white/50" />
          <UserIcon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
              {profile ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() : "Perfil"}
            </h1>
            <span className="inline-flex items-center gap-2 rounded-full border border-agre-brand/30 bg-white/90 px-3 py-1 text-xs font-semibold tracking-wide text-agre-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-agre-brand shadow-[0_0_8px_rgba(82,183,136,0.9)]" />
              Conta verificada
            </span>
          </div>
          <p className="break-all text-xs text-zinc-600 sm:text-sm">{profile?.email ?? "Perfil e conta"}</p>
        </div>
      </header>

      <div className="flex w-full rounded-xl border border-zinc-200/70 bg-white/80 p-1 shadow-sm shadow-black/5 sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("anuncios")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold sm:flex-none ${
            activeTab === "anuncios" ? "bg-gradient-to-br from-agre-brand to-agre-button text-white shadow-md shadow-agre-brand/30" : "text-zinc-500 hover:text-agre-dark"
          }`}
        >
          <Tag className="h-4 w-4" />
          Meus Anúncios
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("conta")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold sm:flex-none ${
            activeTab === "conta" ? "bg-gradient-to-br from-agre-brand to-agre-button text-white shadow-md shadow-agre-brand/30" : "text-zinc-500 hover:text-agre-dark"
          }`}
        >
          <Settings className="h-4 w-4" />
          Conta
        </button>
      </div>

      <div className="mt-4 flex-1">
        {activeTab === "anuncios" ? (
          <div>
            <div className="mb-4">
              <h2 className="font-display text-base font-extrabold text-agre-dark">Meus Anúncios</h2>
              <p className="text-xs text-agre-muted">
                {listings.length} anúncio{listings.length !== 1 ? "s" : ""} criado{listings.length !== 1 ? "s" : ""}
              </p>
            </div>

            {loadingListings ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-agre-brand border-t-transparent" />
              </div>
            ) : listings.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
                <Megaphone className="h-12 w-12 text-zinc-300" />
                <p className="text-sm text-agre-muted">
                  Você ainda não tem anúncios.<br />Crie seu primeiro anúncio!
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map(renderListingCard)}
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            {loadingUser ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-agre-brand border-t-transparent" />
              </div>
            ) : profile ? (
              <>
                <section className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-lg shadow-black/5 ring-1 ring-zinc-200/60">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-sm font-extrabold text-agre-dark">Informações da Conta</h3>
                      <p className="text-xs text-agre-muted">Gerencie suas informações pessoais</p>
                    </div>
                    {!editing && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditForm({
                            firstName: profile.firstName ?? "",
                            lastName:  profile.lastName ?? "",
                            phone:     profile.phone ?? "",
                            personDoc: profile.personDoc ?? "",
                            docType:   profile.docType ?? "CPF",
                          });
                          setEditing(true);
                        }}
                        className="flex items-center gap-1 rounded-xl bg-gradient-to-br from-agre-brand to-agre-button px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-agre-brand/30"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Editar
                      </button>
                    )}
                  </div>

                  {editing ? (
                    <div className="space-y-3">
                      <Field label={<span className="inline-flex items-center gap-1">Email <Lock className="h-3 w-3 text-agre-muted" /></span>}>
                        <p className="py-1 text-sm text-agre-muted">{profile.email}</p>
                        <p className="text-[11px] text-agre-muted">Email não pode ser alterado aqui.</p>
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Nome">
                          <input
                            value={editForm.firstName}
                            onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                            className="w-full border-b border-agre-input-border py-1 text-sm focus:border-agre-button focus:outline-none"
                          />
                        </Field>
                        <Field label="Sobrenome">
                          <input
                            value={editForm.lastName}
                            onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                            className="w-full border-b border-agre-input-border py-1 text-sm focus:border-agre-button focus:outline-none"
                          />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Telefone">
                          <input
                            value={editForm.phone}
                            onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                            className="w-full border-b border-agre-input-border py-1 text-sm focus:border-agre-button focus:outline-none"
                          />
                        </Field>
                        <Field label={editForm.docType}>
                          <input
                            value={editForm.personDoc}
                            onChange={(e) => setEditForm((f) => ({ ...f, personDoc: e.target.value }))}
                            className="w-full border-b border-agre-input-border py-1 text-sm focus:border-agre-button focus:outline-none"
                          />
                        </Field>
                      </div>
                      <div className="flex gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => setEditing(false)}
                          className="flex-1 rounded-lg bg-zinc-200 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-300"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          className="flex-1 rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 py-2 text-sm font-bold text-white shadow-md shadow-black/20"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Nome Completo">
                          <p className="text-sm text-zinc-900">{profile.firstName} {profile.lastName}</p>
                        </Field>
                        <Field label="Email">
                          <p className="truncate text-sm text-zinc-900">{profile.email}</p>
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Telefone">
                          <p className="text-sm text-zinc-900">{profile.phone || "—"}</p>
                        </Field>
                        <Field label={profile.docType ?? "Documento"}>
                          <p className="text-sm text-zinc-900">
                            {profile.personDoc ? formatDoc(profile.personDoc, profile.docType) : "—"}
                          </p>
                        </Field>
                      </div>
                    </div>
                  )}
                </section>

                <section className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-lg shadow-black/5 ring-1 ring-zinc-200/60">
                  <div className="mb-4">
                    <h3 className="font-display text-sm font-extrabold text-agre-dark">Localização</h3>
                    <p className="text-xs text-agre-muted">Sua localização cadastrada</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Cidade">
                      <p className="text-sm text-zinc-900">{location?.municipality ?? "—"}</p>
                    </Field>
                    <Field label="Estado">
                      <p className="text-sm text-zinc-900">{location?.uf ?? "—"}</p>
                    </Field>
                  </div>
                </section>

                <section className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-lg shadow-black/5 ring-1 ring-zinc-200/60">
                  <div className="mb-3">
                    <h3 className="font-display text-sm font-extrabold text-agre-dark">Dados para Recebimento</h3>
                    <p className="text-xs text-agre-muted">PIX ou TED para receber pagamentos</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/payout-info")}
                    className="flex w-full items-center justify-between py-1"
                  >
                    <span className="flex items-center gap-2 text-sm text-zinc-900">
                      <CreditCard className="h-[18px] w-[18px] text-agre-brand" />
                      Gerenciar dados bancários
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                  </button>
                </section>

                <section className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-lg shadow-black/5 ring-1 ring-zinc-200/60">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100"
                  >
                    <LogOut className="h-[18px] w-[18px]" />
                    Sair da Conta
                  </button>
                </section>

                <section className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-lg shadow-black/5 ring-1 ring-zinc-200/60">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-[18px] w-[18px]" />
                    Deletar Conta
                  </button>
                </section>
              </>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-agre-muted">{label}</p>
      {children}
    </div>
  );
}
