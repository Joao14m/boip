"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
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

  const fieldBoxBase = (hasError: boolean) =>
    `flex h-12 items-center gap-2.5 rounded-xl border bg-white/90 px-3.5 transition-all duration-200 focus-within:border-agre-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-agre-brand/15 ${
      hasError ? "border-red-400" : "border-zinc-200"
    }`;

  const fieldBox = (hasError: boolean) => `mt-2 ${fieldBoxBase(hasError)}`;

  return (
    <div className="relative flex min-h-screen flex-1 overflow-hidden p-3 sm:p-6 lg:p-8">
      {/* Background photo */}
      <Image
        src="/signup_bg.jpeg"
        alt=""
        aria-hidden
        fill
        priority
        quality={95}
        sizes="100vw"
        className="object-cover"
      />

      {/* Photo overlays */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-zinc-950/55 via-zinc-900/35 to-agre-dark/45" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(82,183,136,0.22),transparent_55%)]" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,rgba(45,106,79,0.30),transparent_55%)]" />

      {/* Frame wrapping marketing + form */}
      <div className="relative z-10 flex flex-1 items-center justify-center">
        <div className="relative w-full max-w-7xl overflow-hidden rounded-[32px] border border-white/40 bg-white/90 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/30 backdrop-blur-sm lg:rounded-[44px]">
          {/* Top edge highlight */}
          <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

          {/* Inner ambient glows + dot grid */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-agre-brand/25 blur-3xl" />
            <div className="absolute -bottom-40 -right-32 h-[460px] w-[460px] rounded-full bg-agre-button/20 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage: "radial-gradient(circle, #3D2817 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative flex flex-col gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:flex-row lg:items-start lg:gap-16 lg:px-16 lg:py-20">
            {/* Left: marketing */}
            <section className="flex-1">
              <div className="mb-10 flex items-center">
                <img
                  src="/AgerisLogo.png"
                  alt="AgerisMarket — Marketplace de Gado"
                  className="h-20 w-auto"
                />
              </div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-agre-brand/30 bg-white/90 px-3 py-1 text-xs font-semibold tracking-wide text-agre-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-agre-brand shadow-[0_0_8px_rgba(82,183,136,0.9)]" />
                Cadastro gratuito · Brasil
              </div>

              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-zinc-900 lg:text-6xl">
                Junte-se a milhares de pecuaristas que{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-agre-button via-agre-brand to-agre-dark bg-clip-text text-transparent">
                    confiam no AgerisMarket
                  </span>
                  <span aria-hidden className="absolute inset-x-0 -bottom-1 h-1 rounded-full bg-gradient-to-r from-transparent via-agre-brand/60 to-transparent blur-sm" />
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-600 lg:text-lg">
                Cadastre-se gratuitamente e comece a anunciar ou comprar gado em poucos minutos.
                Conectamos produtores e compradores de todo o Brasil.
              </p>
            </section>

            {/* Right: signup card */}
            <section className="w-full max-w-xl self-center lg:flex-shrink-0">
              <div className="relative">
                <div aria-hidden className="absolute -inset-4 -z-10 rounded-[32px] bg-gradient-to-br from-agre-brand/30 via-transparent to-agre-button/20 blur-2xl" />

                <form
                  onSubmit={(ev) => { ev.preventDefault(); handleSignup(); }}
                  className="relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-2xl shadow-agre-brand/15 ring-1 ring-zinc-200/60"
                  noValidate
                >
                  <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

                  <h3 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900">
                    Criar conta
                  </h3>
                  <p className="mt-1.5 text-sm text-agre-muted">
                    Preencha os dados para se cadastrar
                  </p>

                  {formError && (
                    <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                      <p className="text-sm text-red-700">{formError}</p>
                    </div>
                  )}

                  {/* Nome + Sobrenome */}
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-semibold tracking-tight text-zinc-800">Nome</label>
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
                      {errors.firstName && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.firstName}</p>}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-semibold tracking-tight text-zinc-800">Sobrenome</label>
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
                      {errors.lastName && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.lastName}</p>}
                    </div>
                  </div>

                  {/* Email + Telefone */}
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold tracking-tight text-zinc-800">E-mail</label>
                      <div className={fieldBox(!!errors.email)}>
                        <Mail className={`h-[18px] w-[18px] transition-colors ${errors.email ? "text-red-400" : "text-zinc-400"}`} strokeWidth={2} />
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
                      {errors.email && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold tracking-tight text-zinc-800">Telefone</label>
                      <div className={fieldBox(!!errors.phone)}>
                        <Phone className={`h-[18px] w-[18px] transition-colors ${errors.phone ? "text-red-400" : "text-zinc-400"}`} strokeWidth={2} />
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
                      {errors.phone && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Senha + Confirmar Senha */}
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <label htmlFor="password" className="block text-sm font-semibold tracking-tight text-zinc-800">Senha</label>
                      <div className={fieldBox(!!errors.password)}>
                        <Lock className={`h-[18px] w-[18px] flex-shrink-0 transition-colors ${errors.password ? "text-red-400" : "text-zinc-400"}`} strokeWidth={2} />
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={(ev) => { setPassword(ev.target.value); clearError("password"); }}
                          className="min-w-0 flex-1 bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                          {showPassword ? <Eye className="h-[18px] w-[18px]" /> : <EyeOff className="h-[18px] w-[18px]" />}
                        </button>
                      </div>
                      {errors.password && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password}</p>}
                    </div>

                    <div className="min-w-0">
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold tracking-tight text-zinc-800">Confirmar senha</label>
                      <div className={fieldBox(!!errors.confirmPassword)}>
                        <Lock className={`h-[18px] w-[18px] flex-shrink-0 transition-colors ${errors.confirmPassword ? "text-red-400" : "text-zinc-400"}`} strokeWidth={2} />
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Repita a senha"
                          value={confirmPassword}
                          onChange={(ev) => { setConfirmPassword(ev.target.value); clearError("confirmPassword"); }}
                          className="min-w-0 flex-1 bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                          aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                          {showConfirmPassword ? <Eye className="h-[18px] w-[18px]" /> : <EyeOff className="h-[18px] w-[18px]" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  {/* Tipo de documento */}
                  <div className="mt-4">
                    <label className="block text-sm font-semibold tracking-tight text-zinc-800">Tipo de documento</label>
                    <div className="mt-2 inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
                      {(["CPF", "CNPJ"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => { setDocType(t); clearError("personDoc"); }}
                          className={`min-w-[80px] rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
                            docType === t
                              ? "bg-gradient-to-br from-agre-brand to-agre-button text-white shadow-md shadow-agre-brand/40"
                              : "text-zinc-600 hover:text-zinc-800"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Documento + Região */}
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="personDoc" className="block text-sm font-semibold tracking-tight text-zinc-800">
                        {docType} (somente números)
                      </label>
                      <div className={fieldBox(!!errors.personDoc)}>
                        <CreditCard className={`h-[18px] w-[18px] transition-colors ${errors.personDoc ? "text-red-400" : "text-zinc-400"}`} strokeWidth={2} />
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
                      {errors.personDoc && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.personDoc}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold tracking-tight text-zinc-800">Região</label>
                      <button
                        type="button"
                        onClick={() => setRegionOpen((v) => !v)}
                        className={`mt-2 flex h-12 w-full items-center gap-2.5 rounded-xl border bg-white/90 px-3.5 text-left transition-all duration-200 hover:border-agre-brand/50 focus:border-agre-brand focus:bg-white focus:outline-none focus:ring-4 focus:ring-agre-brand/15 ${
                          errors.selectedUf ? "border-red-400" : "border-zinc-200"
                        }`}
                      >
                        <MapPin className={`h-[18px] w-[18px] transition-colors ${errors.selectedUf ? "text-red-400" : "text-zinc-400"}`} strokeWidth={2} />
                        <span className={`flex-1 truncate text-[15px] ${selectedRegion ? "text-zinc-900" : "text-zinc-400"}`}>
                          {selectedRegion ? `${selectedRegion.name} - ${selectedRegion.uf}` : "Selecione uma região"}
                        </span>
                        {regionOpen
                          ? <ChevronUp className="h-[18px] w-[18px] flex-shrink-0 text-zinc-400" />
                          : <ChevronDown className="h-[18px] w-[18px] flex-shrink-0 text-zinc-400" />}
                      </button>

                      {regionOpen && (
                        <div className="mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg shadow-black/5">
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
                      {errors.selectedUf && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.selectedUf}</p>}
                    </div>
                  </div>

                  {/* Possui veículo */}
                  <div className="mt-5 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold tracking-tight text-zinc-800">Possui veículo?</p>
                      <p className="text-xs text-agre-muted">Necessário para transporte de gado</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setHasCar((v) => !v); if (hasCar) clearError("carNumber"); }}
                      role="switch"
                      aria-checked={hasCar}
                      className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${
                        hasCar ? "bg-agre-button" : "bg-zinc-300"
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                          hasCar ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {hasCar && (
                    <div className="mt-4">
                      <label htmlFor="carNumber" className="block text-sm font-semibold tracking-tight text-zinc-800">Placa do veículo</label>
                      <div className={fieldBox(!!errors.carNumber)}>
                        <Car className={`h-[18px] w-[18px] transition-colors ${errors.carNumber ? "text-red-400" : "text-zinc-400"}`} strokeWidth={2} />
                        <input
                          id="carNumber"
                          type="text"
                          placeholder="ABC-1234"
                          value={carNumber}
                          onChange={(ev) => { setCarNumber(ev.target.value.toUpperCase()); clearError("carNumber"); }}
                          className="flex-1 bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                        />
                      </div>
                      {errors.carNumber && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.carNumber}</p>}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative mt-7 flex h-13 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-agre-dark via-agre-dark to-[#2A1B0F] py-3.5 text-base font-bold tracking-wide text-white shadow-lg shadow-black/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-agre-brand/35 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                  >
                    <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-700 group-hover:left-[120%]" />
                    <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <span className="relative">{submitting ? "Criando conta..." : "Criar Conta"}</span>
                  </button>

                  <div className="mt-5 text-center text-sm">
                    <span className="text-zinc-500">Já tem uma conta? </span>
                    <button
                      type="button"
                      onClick={() => router.replace("/login")}
                      className="font-bold text-agre-button underline-offset-4 transition-colors hover:text-agre-dark hover:underline"
                    >
                      Entrar
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
