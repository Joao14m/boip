import { TabBar } from "@/components/TabBar";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#F0EBDD]">
      <TabBar />
      <div className="flex min-h-0 flex-1 flex-col pb-[62px] md:pb-0">{children}</div>
    </div>
  );
}
