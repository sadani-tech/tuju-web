"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: "🏠", label: "Dashboard" },
  { href: "/report", icon: "🎯", label: "Life Path" },
  { href: "/roadmap", icon: "🗺️", label: "Roadmap", disabled: true },
  { href: "/explore", icon: "🔍", label: "Eksplorasi", disabled: true },
  { href: "/chat", icon: "🤖", label: "AI Expert", disabled: true },
  { href: "/points", icon: "🏆", label: "Poin", disabled: true },
  { href: "/profile", icon: "👤", label: "Profil" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-56 bg-white border-r border-slate-200 p-4 hidden md:flex flex-col fixed h-full">
        <Link
          href="/dashboard"
          className="text-xl font-bold text-blue-600 mb-8 block"
        >
          Tuju
        </Link>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            if (item.disabled) {
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 text-sm font-medium cursor-not-allowed"
                >
                  <span>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-40">
        {navItems
          .filter((i) => !("disabled" in i && i.disabled))
          .map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition ${
                  isActive ? "text-blue-600" : "text-slate-500"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      <main className="flex-1 overflow-auto md:ml-56 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
