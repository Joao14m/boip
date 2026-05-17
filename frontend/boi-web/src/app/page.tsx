"use client";

import Image from "next/image";
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

      {/* Frame wrapping marketing + content */}
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
          <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-20">
            {/* Top bar: logo + nav */}
            <div className="mb-10 flex items-center justify-between gap-4 sm:mb-14">
              <img
                src="/AgerisLogo.png"
                alt="AgerisMarket — Marketplace de Gado"
                className="h-20 w-auto"
              />
              <nav className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/login"
                  className="group relative flex h-10 items-center overflow-hidden rounded-xl border border-zinc-300 bg-white/80 px-4 text-sm font-bold text-agre-dark transition-all duration-300 hover:-translate-y-0.5 hover:border-agre-brand/40 hover:bg-white hover:shadow-lg hover:shadow-agre-brand/20"
                >
                  <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-agre-brand/15 to-transparent transition-all duration-700 group-hover:left-[120%]" />
                  <span className="relative">Entrar</span>
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

            {/* Hero: marketing */}
            <section>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-agre-brand/30 bg-white/90 px-3 py-1 text-xs font-semibold tracking-wide text-agre-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-agre-brand shadow-[0_0_8px_rgba(82,183,136,0.9)]" />
                Mercado Interno Brasileiro
              </div>

              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-zinc-900 lg:text-6xl">
                O marketplace de gado que conecta o{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-agre-button via-agre-brand to-agre-dark bg-clip-text text-transparent">
                    Brasil pecuarista
                  </span>
                  <span aria-hidden className="absolute inset-x-0 -bottom-1 h-1 rounded-full bg-gradient-to-r from-transparent via-agre-brand/60 to-transparent blur-sm" />
                </span>
              </h1>

              <p className="mt-6 text-base leading-relaxed text-zinc-600 lg:text-lg">
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
                  className="group relative flex h-12 items-center justify-center overflow-hidden rounded-xl border border-zinc-300 bg-white/80 px-6 text-base font-bold text-agre-dark transition-all duration-300 hover:-translate-y-0.5 hover:border-agre-brand/40 hover:bg-white hover:shadow-lg hover:shadow-agre-brand/20"
                >
                  <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-agre-brand/15 to-transparent transition-all duration-700 group-hover:left-[120%]" />
                  <span className="relative">Já tenho conta</span>
                </Link>
              </div>
            </section>

            {/* Features */}
            <section className="mt-16 sm:mt-20">
              <div className="mb-8">
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
                  Tudo o que você precisa para negociar gado
                </h2>
                <p className="mt-3 text-base text-zinc-600">
                  Da publicação do anúncio ao recebimento do pagamento, em um só lugar.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {FEATURES.map(({ icon: Icon, title, desc }) => (
                  <article
                    key={title}
                    className="group relative overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/85 p-6 shadow-sm shadow-black/5 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-agre-brand/40 hover:shadow-lg hover:shadow-agre-brand/20"
                  >
                    <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                    <span aria-hidden className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-agre-brand/10 blur-2xl transition-opacity duration-300 group-hover:bg-agre-brand/25" />
                    <div className="relative mb-3 flex items-center gap-3">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-agre-brand to-agre-button shadow-md shadow-agre-brand/30">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-display text-base font-extrabold leading-tight text-agre-dark">{title}</h3>
                    </div>
                    <p className="relative text-sm leading-relaxed text-zinc-600">{desc}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* CTA strip */}
            <section className="mt-16 sm:mt-20">
              <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/95 via-white/85 to-agre-pale/60 p-8 shadow-xl shadow-agre-brand/10 ring-1 ring-zinc-200/60 sm:p-12">
                <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-extrabold tracking-tight text-agre-dark sm:text-3xl">
                      Pronto para anunciar seu lote?
                    </h2>
                    <p className="mt-2 max-w-xl text-sm text-zinc-600 sm:text-base">
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

            <p className="mt-12 text-center text-xs text-agre-muted">
              © AgerisMarket — Marketplace de Gado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
