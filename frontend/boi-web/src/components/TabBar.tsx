"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, Store, User } from "lucide-react";

const TABS = [
  { href: "/feed",     label: "Feed",        icon: Store  },
  { href: "/my-lots",  label: "Meus Lotes",  icon: Folder },
  { href: "/profile",  label: "Perfil",      icon: User   },
] as const;

export function TabBar() {
  const pathname = usePathname();

  return (
    <>
      <header className="z-30 hidden border-b border-white/60 bg-white/70 backdrop-blur-md md:block">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/feed" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-agre-brand to-agre-button shadow-lg shadow-agre-brand/40">
              <span aria-hidden className="absolute inset-x-2 top-0 h-px bg-white/50" />
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-display text-base font-extrabold tracking-tight text-zinc-900">AgerisMarket</p>
              <p className="text-[11px] font-medium text-agre-muted">Marketplace de Gado</p>
            </div>
          </Link>

          <nav className="flex items-center rounded-xl border border-zinc-200/70 bg-white/80 p-1 shadow-sm shadow-black/5">
            {TABS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-gradient-to-br from-agre-brand to-agre-button text-white shadow-md shadow-agre-brand/30"
                      : "text-zinc-500 hover:text-agre-dark"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-[62px] items-stretch border-t border-zinc-200 bg-white md:hidden">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 pt-1.5 pb-2 text-[11px] font-semibold transition-colors ${
                active ? "text-agre-button" : "text-zinc-500 hover:text-agre-dark"
              }`}
            >
              <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
