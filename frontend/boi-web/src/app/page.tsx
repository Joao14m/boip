"use client";

import Link from "next/link";
import { Megaphone, CreditCard, ShieldCheck, Banknote } from "lucide-react";

const FEATURES = [
  {
    icon: Megaphone,
    title: "Anuncie seu gado",
    desc: "Crie anúncios completos com fotos, perfil do lote e preço. Atinja compradores em todo o Brasil.",
  },
  {
    icon: CreditCard,
    title: "Pague com PIX",
    desc: "Compre lotes diretamente pelo app. Pagamento instantâneo via PIX, com confirmação automática.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança da plataforma",
    desc: "Vendedores verificados, dados protegidos e acompanhamento de cada transação do início ao fim.",
  },
  {
    icon: Banknote,
    title: "Receba direto na conta",
    desc: "Configure PIX ou TED e receba o valor da venda automaticamente após a confirmação do pagamento.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F0EBDD]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-agre-brand/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full bg-agre-button/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #3D2817 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <header className="relative z-20 border-b border-white/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <img
              src="/AgerisLogo.png"
              alt="AgerisMarket — Marketplace de Gado"
              className="h-16 w-auto"
            />
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-bold text-agre-dark transition-colors hover:bg-white/70"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="group relative flex h-10 items-center overflow-hidden rounded-xl bg-gradient-to-br from-agre-dark via-agre-dark to-[#2A1B0F] px-4 text-sm font-bold text-white shadow-md shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-agre-brand/30"
            >
              <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-700 group-hover:left-[120%]" />
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
        <section className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-agre-brand/30 bg-white/90 px-3 py-1 text-xs font-semibold tracking-wide text-agre-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-agre-brand shadow-[0_0_8px_rgba(200,154,62,0.9)]" />
              Mercado Interno Brasileiro
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
              O marketplace de gado que conecta o{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-agre-button via-agre-brand to-agre-dark bg-clip-text text-transparent">
                  Brasil pecuarista
                </span>
                <span aria-hidden className="absolute inset-x-0 -bottom-1 h-1 rounded-full bg-gradient-to-r from-transparent via-agre-brand/60 to-transparent blur-sm" />
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-700 sm:text-lg">
              No AgerisMarket você anuncia, compra e vende lotes de gado com pagamento via PIX,
              segurança da plataforma e acompanhamento completo de cada transação.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="group relative flex h-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-agre-dark via-agre-dark to-[#2A1B0F] px-6 text-base font-bold tracking-wide text-white shadow-lg shadow-black/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-agre-brand/30"
              >
                <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-700 group-hover:left-[120%]" />
                Comece agora
              </Link>
              <Link
                href="/login"
                className="flex h-12 items-center justify-center rounded-xl border border-zinc-300 bg-white/80 px-6 text-base font-bold text-agre-dark transition-colors hover:bg-white"
              >
                Já tenho conta
              </Link>
            </div>
          </div>

          <div className="relative">
            <div aria-hidden className="absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-br from-agre-brand/30 via-transparent to-agre-button/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-8 shadow-2xl shadow-agre-brand/15 ring-1 ring-zinc-200/60">
              <img
                src="/AgerisLogo.png"
                alt=""
                aria-hidden
                className="mx-auto h-40 w-auto"
              />
              <p className="mt-6 text-center font-display text-lg font-extrabold text-agre-dark">
                Conectando produtores e compradores
              </p>
              <p className="mt-2 text-center text-sm text-zinc-600">
                Anuncie em minutos. Compre com confiança. Receba com agilidade.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-20 sm:mt-24">
          <div className="mb-10 max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Tudo o que você precisa para negociar gado
            </h2>
            <p className="mt-3 text-base text-zinc-700">
              Da publicação do anúncio ao recebimento do pagamento, em um só lugar.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <article
                key={title}
                className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-6 shadow-lg shadow-black/5 ring-1 ring-zinc-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-agre-brand/15"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-agre-brand to-agre-button shadow-md shadow-agre-brand/30">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-display text-base font-extrabold text-agre-dark">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-700">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 sm:mt-24">
          <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/95 via-white/85 to-agre-pale/60 p-8 shadow-xl shadow-agre-brand/10 ring-1 ring-zinc-200/60 sm:p-12">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-agre-dark sm:text-3xl">
                  Pronto para anunciar seu lote?
                </h2>
                <p className="mt-2 max-w-xl text-sm text-zinc-700 sm:text-base">
                  Crie sua conta gratuitamente e publique seu primeiro anúncio em poucos minutos.
                </p>
              </div>
              <Link
                href="/signup"
                className="group relative flex h-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-agre-dark via-agre-dark to-[#2A1B0F] px-6 text-base font-bold tracking-wide text-white shadow-lg shadow-black/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-agre-brand/30"
              >
                <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-700 group-hover:left-[120%]" />
                Criar conta grátis
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/60 bg-white/40">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-xs text-agre-muted lg:px-8">
          © AgerisMarket — Marketplace de Gado
        </div>
      </footer>
    </div>
  );
}
