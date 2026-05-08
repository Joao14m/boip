import Image from "next/image";
import { TabBar } from "@/components/TabBar";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-1 overflow-hidden p-3 sm:p-6 lg:p-8">
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
      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-zinc-950/55 via-zinc-900/35 to-agre-dark/45" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(82,183,136,0.22),transparent_55%)]" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,rgba(45,106,79,0.30),transparent_55%)]" />

      <div className="relative z-10 flex flex-1 justify-center">
        <div className="relative flex min-h-[calc(100vh-1.5rem)] w-full max-w-7xl flex-col overflow-hidden rounded-[32px] border border-white/40 bg-white/90 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/30 backdrop-blur-sm lg:min-h-[calc(100vh-4rem)] lg:rounded-[44px]">
          <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
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

          <div className="relative flex min-h-0 flex-1 flex-col">
            <TabBar />
            <div className="flex min-h-0 flex-1 flex-col pb-[62px] md:pb-0">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
