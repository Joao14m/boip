"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Store, Mail, Lock, Eye, EyeOff, Check } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

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

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, onboarded } = useAuth();

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [formError, setFormError]       = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (user && onboarded)  router.replace("/feed");
    else if (user && !onboarded) router.replace("/signup");
  }, [user, authLoading, onboarded, router]);

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
    } catch (e) {
      const code = (e as { code?: string })?.code ?? "";
      setFormError(FIREBASE_ERRORS[code] ?? "Não foi possível entrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-1 overflow-hidden">
      {/* Glow gradients (matching mobile login) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(82,183,136,0.30) 0%, rgba(82,183,136,0.08) 50%, transparent 80%), " +
            "linear-gradient(45deg, rgba(82,183,136,0.25) 0%, rgba(82,183,136,0.10) 35%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-12 lg:flex-row lg:items-center lg:gap-16 lg:px-12 lg:py-20">
        {/* ── Left: marketing ── */}
        <section className="flex-1">
          {/* Brand */}
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-agre-button shadow-lg shadow-agre-brand/40">
              <Store className="h-7 w-7 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">BoiMarket</h2>
              <p className="text-sm text-agre-muted">Marketplace de Gado</p>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 lg:text-5xl">
            Compre e venda gado de forma fácil e segura
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 lg:text-lg">
            Conectamos produtores e compradores de todo o Brasil. Encontre as melhores ofertas
            de gado para corte, reprodução e leite.
          </p>

          {/* Stat grid */}
          <div className="mt-10 grid max-w-xl grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="text-2xl font-extrabold text-agre-dark lg:text-3xl">{s.value}</div>
                <div className="mt-1 text-sm text-zinc-600">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Cattle image placeholder */}
          <div
            className="mt-8 aspect-[16/9] max-w-xl overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-agre-header via-agre-pale to-agre-input-bg"
            aria-label="Imagem de gado"
          />
        </section>

        {/* ── Right: login card ── */}
        <section className="w-full max-w-md self-center lg:flex-shrink-0">
          <form
            onSubmit={(ev) => { ev.preventDefault(); handleLogin(); }}
            className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl shadow-black/5"
            noValidate
          >
            <h3 className="text-2xl font-extrabold text-zinc-900">Bem-vindo de volta</h3>
            <p className="mt-1.5 text-sm text-agre-muted">
              Entre com suas credenciais para acessar sua conta
            </p>

            {formError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            )}

            {/* Email */}
            <div className="mt-6">
              <label htmlFor="email" className="block text-sm font-semibold text-zinc-800">
                Email
              </label>
              <div
                className={`mt-2 flex h-12 items-center gap-2.5 rounded-xl border bg-white px-3.5 transition-colors focus-within:border-agre-brand ${
                  errors.email ? "border-red-400" : "border-zinc-200"
                }`}
              >
                <Mail
                  className={`h-[18px] w-[18px] ${
                    errors.email ? "text-red-400" : "text-zinc-400"
                  }`}
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
              {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Senha */}
            <div className="mt-4">
              <label htmlFor="password" className="block text-sm font-semibold text-zinc-800">
                Senha
              </label>
              <div
                className={`mt-2 flex h-12 items-center gap-2.5 rounded-xl border bg-white px-3.5 transition-colors focus-within:border-agre-brand ${
                  errors.password ? "border-red-400" : "border-zinc-200"
                }`}
              >
                <Lock
                  className={`h-[18px] w-[18px] ${
                    errors.password ? "text-red-400" : "text-zinc-400"
                  }`}
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

            {/* Lembrar / Esqueceu */}
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRememberMe((v) => !v)}
                className="flex items-center gap-2"
              >
                <span
                  className={`flex h-[18px] w-[18px] items-center justify-center rounded border-[1.5px] transition-colors ${
                    rememberMe
                      ? "border-agre-button bg-agre-button"
                      : "border-zinc-300 bg-white"
                  }`}
                >
                  {rememberMe && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </span>
                <span className="text-sm text-zinc-600">Lembrar-me</span>
              </button>
              <button
                type="button"
                className="text-sm font-semibold text-agre-button hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Entrar */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 h-13 w-full rounded-xl bg-zinc-900 py-3.5 text-base font-bold tracking-wide text-white shadow-md shadow-black/20 transition-opacity hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Entrando..." : "Entrar"}
            </button>

            {/* Cadastro */}
            <div className="mt-5 text-center text-sm">
              <span className="text-zinc-500">Não tem uma conta? </span>
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="font-bold text-agre-button hover:underline"
              >
                Criar conta
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
