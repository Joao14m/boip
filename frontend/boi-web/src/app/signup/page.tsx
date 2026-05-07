"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  CreditCard,
  Car,
  MapPin,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const REGIONS = [
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "SP", name: "São Paulo" },
  { uf: "MG", name: "Minas Gerais" },
];

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "Este e-mail já está cadastrado.",
  "auth/invalid-email":        "E-mail inválido.",
  "auth/weak-password":        "A senha é muito fraca.",
};

const isValidCpf = (doc: string): boolean => {
  if (!/^\d{11}$/.test(doc)) return false;
  if (/^(\d)\1{10}$/.test(doc)) return false;
  const d = doc.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += d[i] * (10 - i);
  let r = sum % 11;
  if ((r < 2 ? 0 : 11 - r) !== d[9]) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += d[i] * (11 - i);
  r = sum % 11;
  return (r < 2 ? 0 : 11 - r) === d[10];
};

const isValidCnpj = (doc: string): boolean => {
  if (!/^\d{14}$/.test(doc)) return false;
  if (/^(\d)\1{13}$/.test(doc)) return false;
  const d = doc.split("").map(Number);
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += d[i] * w1[i];
  let r = sum % 11;
  if ((r < 2 ? 0 : 11 - r) !== d[12]) return false;
  sum = 0;
  for (let i = 0; i < 13; i++) sum += d[i] * w2[i];
  r = sum % 11;
  return (r < 2 ? 0 : 11 - r) === d[13];
};

export default function SignupPage() {
  const router = useRouter();
  const { refreshMe } = useAuth();

  const [firstName, setFirstName]                     = useState("");
  const [lastName, setLastName]                       = useState("");
  const [email, setEmail]                             = useState("");
  const [password, setPassword]                       = useState("");
  const [confirmPassword, setConfirmPassword]         = useState("");
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone]                             = useState("");
  const [personDoc, setPersonDoc]                     = useState("");
  const [docType, setDocType]                         = useState<"CPF" | "CNPJ">("CPF");
  const [hasCar, setHasCar]                           = useState(false);
  const [carNumber, setCarNumber]                     = useState("");
  const [selectedUf, setSelectedUf]                   = useState("");
  const [regionOpen, setRegionOpen]                   = useState(false);
  const [submitting, setSubmitting]                   = useState(false);

  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const clearError = (field: string) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  const validate = () => {
    const e: Record<string, string> = {};

    if (!firstName.trim()) e.firstName = "Nome é obrigatório.";
    if (!lastName.trim())  e.lastName  = "Sobrenome é obrigatório.";

    if (!email.trim())             e.email = "E-mail é obrigatório.";
    else if (!email.includes("@")) e.email = "E-mail inválido.";

    if (!password)                e.password = "Senha é obrigatória.";
    else if (password.length < 6) e.password = "Senha deve ter pelo menos 6 caracteres.";

    if (!confirmPassword)                  e.confirmPassword = "Confirme a senha.";
    else if (password !== confirmPassword) e.confirmPassword = "As senhas não coincidem.";

    if (!phone.trim()) e.phone = "Telefone é obrigatório.";

    if (!personDoc.trim()) {
      e.personDoc = `${docType} é obrigatório.`;
    } else {
      const digits = personDoc.replace(/\D/g, "");
      if (docType === "CPF" && digits.length !== 11)       e.personDoc = "CPF deve ter 11 dígitos.";
      else if (docType === "CNPJ" && digits.length !== 14) e.personDoc = "CNPJ deve ter 14 dígitos.";
      else if (docType === "CPF" && !isValidCpf(digits))   e.personDoc = "CPF inválido.";
      else if (docType === "CNPJ" && !isValidCnpj(digits)) e.personDoc = "CNPJ inválido.";
    }

    if (hasCar && !carNumber.trim()) e.carNumber = "Placa é obrigatória quando possui veículo.";

    if (!selectedUf) e.selectedUf = "Selecione uma região.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    setFormError("");
    if (!validate()) return;

    try {
      setSubmitting(true);
      const locations = await api.get<Array<{ id: string; uf: string }>>("/api/locations");
      const match = locations.find((l) => l.uf === selectedUf);
      if (!match) {
        setFormError("Região indisponível. Tente outra.");
        setSubmitting(false);
        return;
      }
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      await api.post("/auth/onboard", {
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        phone:     phone.trim(),
        personDoc: personDoc.replace(/\D/g, ""),
        docType,
        hasCar,
        carNumber: hasCar ? carNumber.trim() : null,
        locationId: match.id,
      });
      await refreshMe();
      router.replace("/feed");
    } catch (e) {
      const code = (e as { code?: string })?.code ?? "";
      const msg  = (e as { message?: string })?.message;
      setFormError(FIREBASE_ERRORS[code] ?? msg ?? "Não foi possível criar a conta. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRegion = REGIONS.find((r) => r.uf === selectedUf);

  const fieldBox = (hasError: boolean) =>
    `mt-2 flex h-12 items-center gap-2.5 rounded-xl border bg-white px-3.5 transition-colors focus-within:border-agre-brand ${
      hasError ? "border-red-400" : "border-zinc-200"
    }`;

  return (
    <div className="relative flex flex-1 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(82,183,136,0.30) 0%, rgba(82,183,136,0.08) 50%, transparent 80%), " +
            "linear-gradient(45deg, rgba(82,183,136,0.25) 0%, rgba(82,183,136,0.10) 35%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col px-6 py-12 lg:py-16">
        <form
          onSubmit={(ev) => { ev.preventDefault(); handleSignup(); }}
          className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl shadow-black/5"
          noValidate
        >
          {/* Brand */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-agre-button shadow-lg shadow-agre-brand/40">
              <Store className="h-6 w-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-900">BoiMarket</h2>
              <p className="text-sm text-agre-muted">Marketplace de Gado</p>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-zinc-900">Criar conta</h1>
          <p className="mt-1.5 text-sm text-agre-muted">Preencha os dados para se cadastrar</p>

          {formError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          )}

          {/* Nome + Sobrenome */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-zinc-800">Nome</label>
              <div className={fieldBox(!!errors.firstName)}>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="João"
                  value={firstName}
                  onChange={(ev) => { setFirstName(ev.target.value); clearError("firstName"); }}
                  className="flex-1 bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                />
              </div>
              {errors.firstName && <p className="mt-1.5 text-xs text-red-600">{errors.firstName}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-zinc-800">Sobrenome</label>
              <div className={fieldBox(!!errors.lastName)}>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Silva"
                  value={lastName}
                  onChange={(ev) => { setLastName(ev.target.value); clearError("lastName"); }}
                  className="flex-1 bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                />
              </div>
              {errors.lastName && <p className="mt-1.5 text-xs text-red-600">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="mt-4">
            <label htmlFor="email" className="block text-sm font-semibold text-zinc-800">E-mail</label>
            <div className={fieldBox(!!errors.email)}>
              <Mail className={`h-[18px] w-[18px] ${errors.email ? "text-red-400" : "text-zinc-400"}`} strokeWidth={2} />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(ev) => { setEmail(ev.target.value); clearError("email"); }}
                className="flex-1 bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />
            </div>
            {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
          </div>

          {/* Senha */}
          <div className="mt-4">
            <label htmlFor="password" className="block text-sm font-semibold text-zinc-800">Senha</label>
            <div className={fieldBox(!!errors.password)}>
              <Lock className={`h-[18px] w-[18px] ${errors.password ? "text-red-400" : "text-zinc-400"}`} strokeWidth={2} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(ev) => { setPassword(ev.target.value); clearError("password"); }}
                className="flex-1 bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="rounded p-1 text-zinc-400 hover:text-zinc-600"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <Eye className="h-[18px] w-[18px]" /> : <EyeOff className="h-[18px] w-[18px]" />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
          </div>

          {/* Confirmar senha */}
          <div className="mt-4">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-zinc-800">Confirmar senha</label>
            <div className={fieldBox(!!errors.confirmPassword)}>
              <Lock className={`h-[18px] w-[18px] ${errors.confirmPassword ? "text-red-400" : "text-zinc-400"}`} strokeWidth={2} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(ev) => { setConfirmPassword(ev.target.value); clearError("confirmPassword"); }}
                className="flex-1 bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="rounded p-1 text-zinc-400 hover:text-zinc-600"
                aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showConfirmPassword ? <Eye className="h-[18px] w-[18px]" /> : <EyeOff className="h-[18px] w-[18px]" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword}</p>}
          </div>

          {/* Telefone */}
          <div className="mt-4">
            <label htmlFor="phone" className="block text-sm font-semibold text-zinc-800">Telefone</label>
            <div className={fieldBox(!!errors.phone)}>
              <Phone className={`h-[18px] w-[18px] ${errors.phone ? "text-red-400" : "text-zinc-400"}`} strokeWidth={2} />
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="(99) 99999-9999"
                value={phone}
                onChange={(ev) => { setPhone(ev.target.value); clearError("phone"); }}
                className="flex-1 bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />
            </div>
            {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>}
          </div>

          {/* Tipo de documento */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-zinc-800">Tipo de documento</label>
            <div className="mt-2 inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
              {(["CPF", "CNPJ"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setDocType(t); clearError("personDoc"); }}
                  className={`min-w-[80px] rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                    docType === t
                      ? "bg-agre-button text-white shadow-sm"
                      : "text-zinc-600 hover:text-zinc-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Documento */}
          <div className="mt-4">
            <label htmlFor="personDoc" className="block text-sm font-semibold text-zinc-800">
              {docType} (somente números)
            </label>
            <div className={fieldBox(!!errors.personDoc)}>
              <CreditCard className={`h-[18px] w-[18px] ${errors.personDoc ? "text-red-400" : "text-zinc-400"}`} strokeWidth={2} />
              <input
                id="personDoc"
                type="text"
                inputMode="numeric"
                placeholder={docType === "CPF" ? "00000000000" : "00000000000000"}
                value={personDoc}
                onChange={(ev) => { setPersonDoc(ev.target.value); clearError("personDoc"); }}
                className="flex-1 bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />
            </div>
            {errors.personDoc && <p className="mt-1.5 text-xs text-red-600">{errors.personDoc}</p>}
          </div>

          {/* Possui veículo */}
          <div className="mt-5 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-zinc-800">Possui veículo?</p>
              <p className="text-xs text-agre-muted">Necessário para transporte de gado</p>
            </div>
            <button
              type="button"
              onClick={() => { setHasCar((v) => !v); if (hasCar) clearError("carNumber"); }}
              role="switch"
              aria-checked={hasCar}
              className={`relative h-6 w-11 rounded-full transition-colors ${hasCar ? "bg-agre-button" : "bg-zinc-300"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  hasCar ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {hasCar && (
            <div className="mt-4">
              <label htmlFor="carNumber" className="block text-sm font-semibold text-zinc-800">Placa do veículo</label>
              <div className={fieldBox(!!errors.carNumber)}>
                <Car className={`h-[18px] w-[18px] ${errors.carNumber ? "text-red-400" : "text-zinc-400"}`} strokeWidth={2} />
                <input
                  id="carNumber"
                  type="text"
                  placeholder="ABC-1234"
                  value={carNumber}
                  onChange={(ev) => { setCarNumber(ev.target.value.toUpperCase()); clearError("carNumber"); }}
                  className="flex-1 bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                />
              </div>
              {errors.carNumber && <p className="mt-1.5 text-xs text-red-600">{errors.carNumber}</p>}
            </div>
          )}

          {/* Região */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-zinc-800">Região</label>
            <button
              type="button"
              onClick={() => setRegionOpen((v) => !v)}
              className={`mt-2 flex h-12 w-full items-center gap-2.5 rounded-xl border bg-white px-3.5 text-left transition-colors focus-within:border-agre-brand ${
                errors.selectedUf ? "border-red-400" : "border-zinc-200"
              }`}
            >
              <MapPin className={`h-[18px] w-[18px] ${errors.selectedUf ? "text-red-400" : "text-zinc-400"}`} strokeWidth={2} />
              <span className={`flex-1 text-[15px] ${selectedRegion ? "text-zinc-900" : "text-zinc-400"}`}>
                {selectedRegion ? `${selectedRegion.name} - ${selectedRegion.uf}` : "Selecione uma região"}
              </span>
              {regionOpen
                ? <ChevronUp className="h-[18px] w-[18px] text-zinc-400" />
                : <ChevronDown className="h-[18px] w-[18px] text-zinc-400" />}
            </button>

            {regionOpen && (
              <div className="mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                {REGIONS.map((region) => {
                  const active = selectedUf === region.uf;
                  return (
                    <button
                      key={region.uf}
                      type="button"
                      onClick={() => {
                        setSelectedUf(region.uf);
                        setRegionOpen(false);
                        clearError("selectedUf");
                      }}
                      className={`flex w-full items-center gap-2 px-3.5 py-3 text-left text-sm transition-colors ${
                        active ? "bg-agre-pale text-agre-dark" : "text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      <MapPin className={`h-[15px] w-[15px] ${active ? "text-agre-button" : "text-agre-muted"}`} strokeWidth={2} />
                      <span className={`flex-1 ${active ? "font-semibold" : ""}`}>
                        {region.name} - {region.uf}
                      </span>
                      {active && <Check className="h-4 w-4 text-agre-button" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            )}
            {errors.selectedUf && <p className="mt-1.5 text-xs text-red-600">{errors.selectedUf}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-7 h-13 w-full rounded-xl bg-zinc-900 py-3.5 text-base font-bold tracking-wide text-white shadow-md shadow-black/20 transition-opacity hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Criando conta..." : "Criar Conta"}
          </button>

          <div className="mt-5 text-center text-sm">
            <span className="text-zinc-500">Já tem uma conta? </span>
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="font-bold text-agre-button hover:underline"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
