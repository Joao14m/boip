import { TabBar } from "@/components/TabBar";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#F0EBDD]">
      <TabBar />
      <div className="flex min-h-0 flex-1 flex-col pb-[62px] md:pb-0">{children}</div>
      <footer className="hidden border-t border-white/60 bg-white/40 md:block">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-xs text-agre-muted lg:px-8">
          © Ageris — Marketplace de Gado
        </div>
      </footer>
    </div>
  );
}
