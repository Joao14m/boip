"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Store, Mail, Lock, Eye, EyeOff, Check } from "lucide-react";
import { auth } from "@/lib/firebase";

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/invalid-email":      "E-mail inválido.",
  "auth/user-not-found":     "Nenhuma conta encontrada com este e-mail.",
  "auth/wrong-password":     "Senha incorreta.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/too-many-requests":  "Muitas tentativas. Tente novamente mais tarde.",
};

const STATS = [
  { value: "500+",  label: "Anúncios Ativos" },
  { value: "1000+", label: "Usuários Cadastrados" },
  { value: "8",     label: "Raças Disponíveis" },
  { value: "15",    label: "Estados Atendidos" },
];

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [formError, setFormError]       = useState("");

  const clearError = (field: string) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim())             e.email    = "E-mail é obrigatório.";
    else if (!email.includes("@")) e.email    = "E-mail inválido.";
    if (!password)                 e.password = "Senha é obrigatória.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    setFormError("");
    if (!validate()) return;
    try {
      setSubmitting(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/feed");
    } catch (e) {
      const code = (e as { code?: string })?.code ?? "";
      setFormError(FIREBASE_ERRORS[code] ?? "Não foi possível entrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-1 overflow-hidden p-3 sm:p-6 lg:p-8">
      {/* Background photo */}
      <Image
        src="/login-bg.jpeg"
        alt=""
        aria-hidden
        fill
        priority
        quality={95}
        sizes="100vw"
        className="object-cover"
      />

      {/* Photo overlays — darken + green wash for legibility */}
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
                backgroundImage: "radial-gradient(circle, #0F1C15 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative flex flex-col gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:gap-16 lg:px-16 lg:py-20">
            {/* Left: marketing */}
            <section className="flex-1">
              <div className="mb-10 flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-agre-brand to-agre-button shadow-lg shadow-agre-brand/50">
                  <span aria-hidden className="absolute inset-0 -z-10 rounded-2xl bg-agre-brand/60 blur-xl" />
                  <span aria-hidden className="absolute inset-x-2 top-0 h-px bg-white/50" />
                  <Store className="h-7 w-7 text-white drop-shadow-sm" strokeWidth={2.25} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900">AgerisMarket</h2>
                  <p className="text-sm font-medium text-agre-muted">Marketplace de Gado</p>
                </div>
              </div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-agre-brand/30 bg-white/90 px-3 py-1 text-xs font-semibold tracking-wide text-agre-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-agre-brand shadow-[0_0_8px_rgba(82,183,136,0.9)]" />
                Marketplace · Brasil
              </div>

              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-zinc-900 lg:text-6xl">
                Compre e venda gado de forma{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-agre-button via-agre-brand to-agre-dark bg-clip-text text-transparent">
                    fácil e segura
                  </span>
                  <span aria-hidden className="absolute inset-x-0 -bottom-1 h-1 rounded-full bg-gradient-to-r from-transparent via-agre-brand/60 to-transparent blur-sm" />
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-600 lg:text-lg">
                Conectamos produtores e compradores de todo o Brasil. Encontre as melhores ofertas
                de gado para corte e reprodução.
              </p>

              <div className="mt-10 grid max-w-xl grid-cols-2 gap-4">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="group relative overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/85 p-5 shadow-sm shadow-black/5 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-agre-brand/40 hover:shadow-lg hover:shadow-agre-brand/20"
                  >
                    <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                    <span aria-hidden className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-agre-brand/10 blur-2xl transition-opacity duration-300 group-hover:bg-agre-brand/25" />
                    <div className="relative font-display text-3xl font-extrabold leading-none tracking-tight text-agre-dark lg:text-4xl">
                      {s.value}
                    </div>
                    <div className="relative mt-2 text-sm font-medium text-zinc-600">{s.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Right: login card */}
            <section className="w-full max-w-md self-center lg:flex-shrink-0">
              <div className="relative">
                <div aria-hidden className="absolute -inset-4 -z-10 rounded-[32px] bg-gradient-to-br from-agre-brand/30 via-transparent to-agre-button/20 blur-2xl" />

                <form
                  onSubmit={(ev) => { ev.preventDefault(); handleLogin(); }}
                  className="relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-2xl shadow-agre-brand/15 ring-1 ring-zinc-200/60"
                  noValidate
                >
                  <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

                  <h3 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900">
                    Bem-vindo de volta
                  </h3>
                  <p className="mt-1.5 text-sm text-agre-muted">
                    Entre com suas credenciais para acessar sua conta
                  </p>

                  {formError && (
                    <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                      <p className="text-sm text-red-700">{formError}</p>
                    </div>
                  )}

                  {/* Email */}
                  <div className="mt-6">
                    <label htmlFor="email" className="block text-sm font-semibold tracking-tight text-zinc-800">
                      Email
                    </label>
                    <div
                      className={`mt-2 flex h-12 items-center gap-2.5 rounded-xl border bg-white/80 px-3.5 transition-all duration-200 focus-within:border-agre-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-agre-brand/15 ${
                        errors.email ? "border-red-400" : "border-zinc-200"
                      }`}
                    >
                      <Mail
                        className={`h-[18px] w-[18px] transition-colors ${errors.email ? "text-red-400" : "text-zinc-400"}`}
                        strokeWidth={2}
                      />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(ev) => {
                          setEmail(ev.target.value);
                          clearError("email");
                          setFormError("");
                        }}
                        className="flex-1 bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                      />
                    </div>
                    {errors.email && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p>}
                  </div>

                  {/* Senha */}
                  <div className="mt-4">
                    <label htmlFor="password" className="block text-sm font-semibold tracking-tight text-zinc-800">
                      Senha
                    </label>
                    <div className="mt-2 flex gap-2">
                      <div
                        className={`flex h-12 flex-1 items-center gap-2.5 rounded-xl border bg-white/80 px-3.5 transition-all duration-200 focus-within:border-agre-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-agre-brand/15 ${
                          errors.password ? "border-red-400" : "border-zinc-200"
                        }`}
                      >
                        <Lock
                          className={`h-[18px] w-[18px] transition-colors ${errors.password ? "text-red-400" : "text-zinc-400"}`}
                          strokeWidth={2}
                        />
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(ev) => {
                            setPassword(ev.target.value);
                            clearError("password");
                            setFormError("");
                          }}
                          className="min-w-0 flex-1 bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white/80 text-zinc-400 transition-colors hover:border-agre-brand/40 hover:bg-white hover:text-zinc-700"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <Eye className="h-[18px] w-[18px]" /> : <EyeOff className="h-[18px] w-[18px]" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password}</p>}
                  </div>

                  {/* Lembrar / Esqueceu */}
                  <div className="mt-5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setRememberMe((v) => !v)}
                      className="group flex items-center gap-2"
                    >
                      <span
                        className={`flex h-[18px] w-[18px] items-center justify-center rounded-md border-[1.5px] transition-all duration-200 ${
                          rememberMe
                            ? "border-agre-button bg-agre-button shadow-sm shadow-agre-brand/40"
                            : "border-zinc-300 bg-white group-hover:border-agre-brand/60"
                        }`}
                      >
                        {rememberMe && <Check className="h-3 w-3 text-white" strokeWidth={3.5} />}
                      </span>
                      <span className="text-sm text-zinc-600 transition-colors group-hover:text-zinc-800">
                        Lembrar-me
                      </span>
                    </button>
                    <button
                      type="button"
                      className="text-sm font-semibold text-agre-button underline-offset-4 transition-colors hover:text-agre-dark hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>

                  {/* Entrar */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative mt-6 flex h-13 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 py-3.5 text-base font-bold tracking-wide text-white shadow-lg shadow-black/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-agre-brand/35 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                  >
                    <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-700 group-hover:left-[120%]" />
                    <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <span className="relative">{submitting ? "Entrando..." : "Entrar"}</span>
                  </button>

                  <div className="mt-5 text-center text-sm">
                    <span className="text-zinc-500">Não tem uma conta? </span>
                    <button
                      type="button"
                      onClick={() => router.replace("/signup")}
                      className="font-bold text-agre-button underline-offset-4 transition-colors hover:text-agre-dark hover:underline"
                    >
                      Criar conta
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
