"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, CreditCard, Landmark, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";

type TransferType = "PIX" | "TED";
type PixKeyType = "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "EVP";
type BankAccountType = "CONTA_CORRENTE" | "CONTA_POUPANCA";

type PayoutInfo = {
  id?: string;
  userId?: string;
  transferType?: TransferType;
  pixKey?: string | null;
  pixKeyType?: PixKeyType | null;
  bankCode?: string | null;
  agency?: string | null;
  account?: string | null;
  accountDigit?: string | null;
  bankAccountType?: BankAccountType | null;
  ispb?: string | null;
};

const PIX_KEY_TYPES: PixKeyType[] = ["CPF", "CNPJ", "EMAIL", "PHONE", "EVP"];
const ACCOUNT_TYPES: { value: BankAccountType; label: string }[] = [
  { value: "CONTA_CORRENTE", label: "Corrente" },
  { value: "CONTA_POUPANCA", label: "Poupança" },
];

export default function PayoutInfoPage() {
  const router = useRouter();
  const { userId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [transferType, setTransferType] = useState<TransferType>("PIX");

  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>("EVP");

  const [bankCode, setBankCode] = useState("");
  const [agency, setAgency] = useState("");
  const [account, setAccount] = useState("");
  const [accountDigit, setAccountDigit] = useState("");
  const [bankAccountType, setBankAccountType] = useState<BankAccountType>("CONTA_CORRENTE");
  const [ispb, setIspb] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const clearError = (field: string) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  useEffect(() => {
    if (!userId) return;
    api.get<PayoutInfo>(`/api/users/${userId}/payout-info`)
      .then((data) => {
        setTransferType(data.transferType ?? "PIX");
        setPixKey(data.pixKey ?? "");
        setPixKeyType((data.pixKeyType as PixKeyType) ?? "EVP");
        setBankCode(data.bankCode ?? "");
        setAgency(data.agency ?? "");
        setAccount(data.account ?? "");
        setAccountDigit(data.accountDigit ?? "");
        setBankAccountType((data.bankAccountType as BankAccountType) ?? "CONTA_CORRENTE");
        setIspb(data.ispb ?? "");
      })
      .catch(() => {
        // 404 = not yet configured, that's fine — keep defaults.
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (transferType === "PIX") {
      if (!pixKey.trim()) e.pixKey = "Chave PIX é obrigatória.";
    } else {
      if (!bankCode.trim())     e.bankCode     = "Código do banco é obrigatório.";
      if (!agency.trim())       e.agency       = "Agência é obrigatória.";
      if (!account.trim())      e.account      = "Conta é obrigatória.";
      if (!accountDigit.trim()) e.accountDigit = "Dígito é obrigatório.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!userId) return;
    setFormError("");
    setSuccessMsg("");
    if (!validate()) return;
    setSaving(true);
    try {
      await api.put(`/api/users/${userId}/payout-info`, {
        transferType,
        pixKey:          transferType === "PIX" ? pixKey.trim()          : null,
        pixKeyType:      transferType === "PIX" ? pixKeyType              : null,
        bankCode:        transferType === "TED" ? bankCode.trim()         : null,
        agency:          transferType === "TED" ? agency.trim()           : null,
        account:         transferType === "TED" ? account.trim()          : null,
        accountDigit:    transferType === "TED" ? accountDigit.trim()     : null,
        bankAccountType: transferType === "TED" ? bankAccountType          : null,
        ispb:            transferType === "TED" ? (ispb.trim() || null)   : null,
      });
      setSuccessMsg("Dados bancários atualizados com sucesso.");
      setTimeout(() => router.back(), 1200);
    } catch (e) {
      setFormError((e as Error).message || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0EBDD] px-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-agre-brand border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F0EBDD]">
      <PageHeader title="Dados para Recebimento" onBack={() => router.back()} />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
        <header className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-agre-brand to-agre-button shadow-lg shadow-agre-brand/40 sm:h-12 sm:w-12">
            <span aria-hidden className="absolute inset-x-2 top-0 h-px bg-white/50" />
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
              Dados para Recebimento
            </h1>
            <p className="text-xs text-zinc-600 sm:text-sm">
              Configure como você receberá o valor das suas vendas.
            </p>
          </div>
        </header>

        {formError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {formError}
          </div>
        )}

        {successMsg && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {successMsg}
          </div>
        )}

        <div className="flex rounded-2xl bg-white/80 p-1.5 shadow-sm ring-1 ring-zinc-200/60">
          {(["PIX", "TED"] as TransferType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTransferType(t)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                transferType === t
                  ? "bg-gradient-to-br from-agre-brand to-agre-button text-white shadow-md shadow-agre-brand/30"
                  : "text-zinc-500 hover:text-agre-dark"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {transferType === "PIX" ? (
          <Section icon={CreditCard} title="Chave PIX" subtitle="Tipo da chave e identificador para receber.">
            <Field label="Tipo da chave">
              <div className="flex flex-wrap gap-2">
                {PIX_KEY_TYPES.map((t) => (
                  <Chip key={t} active={pixKeyType === t} onClick={() => setPixKeyType(t)}>
                    {t}
                  </Chip>
                ))}
              </div>
            </Field>
            <Field label="Chave" error={errors.pixKey}>
              <input
                type="text"
                value={pixKey}
                onChange={(ev) => { setPixKey(ev.target.value); clearError("pixKey"); }}
                placeholder="Ex: email@exemplo.com"
                autoCapitalize="off"
                maxLength={77}
                className={inputClass(Boolean(errors.pixKey))}
              />
            </Field>
          </Section>
        ) : (
          <Section icon={Banknote} title="Dados Bancários (TED)" subtitle="Banco, agência e conta para depósito.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Código do banco" error={errors.bankCode}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={bankCode}
                  onChange={(ev) => { setBankCode(ev.target.value); clearError("bankCode"); }}
                  placeholder="Ex: 237"
                  maxLength={4}
                  className={inputClass(Boolean(errors.bankCode))}
                />
              </Field>
              <Field label="Agência (sem dígito)" error={errors.agency}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={agency}
                  onChange={(ev) => { setAgency(ev.target.value); clearError("agency"); }}
                  placeholder="Ex: 1263"
                  maxLength={10}
                  className={inputClass(Boolean(errors.agency))}
                />
              </Field>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <Field label="Conta (sem dígito)" error={errors.account}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={account}
                  onChange={(ev) => { setAccount(ev.target.value); clearError("account"); }}
                  placeholder="Ex: 9999991"
                  maxLength={20}
                  className={inputClass(Boolean(errors.account))}
                />
              </Field>
              <div className="w-24">
                <Field label="Dígito" error={errors.accountDigit}>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={accountDigit}
                    onChange={(ev) => { setAccountDigit(ev.target.value); clearError("accountDigit"); }}
                    placeholder="1"
                    maxLength={2}
                    className={inputClass(Boolean(errors.accountDigit))}
                  />
                </Field>
              </div>
            </div>

            <Field label="Tipo de conta">
              <div className="flex flex-wrap gap-2">
                {ACCOUNT_TYPES.map(({ value, label }) => (
                  <Chip key={value} active={bankAccountType === value} onClick={() => setBankAccountType(value)}>
                    {label}
                  </Chip>
                ))}
              </div>
            </Field>

            <Field label="ISPB (opcional)">
              <input
                type="text"
                inputMode="numeric"
                value={ispb}
                onChange={(ev) => setIspb(ev.target.value)}
                placeholder="Ex: 60746948"
                maxLength={8}
                className={inputClass(false)}
              />
            </Field>
          </Section>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="group/btn relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-agre-dark via-agre-dark to-[#2A1B0F] text-sm font-bold text-white shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-agre-brand/30 disabled:cursor-not-allowed disabled:from-zinc-400 disabled:to-zinc-400 disabled:shadow-none disabled:hover:translate-y-0"
        >
          <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-700 group-hover/btn:left-[120%]" />
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Salvando..." : "Salvar dados bancários"}
        </button>
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
