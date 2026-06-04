import Link from "next/link";

const navItems = [
  { href: "/dashboard", icon: "🏠", label: "Dashboard" },
  { href: "/report", icon: "🎯", label: "Life Path" },
  { href: "/roadmap", icon: "🗺️", label: "Roadmap" },
  { href: "/explore", icon: "🔍", label: "Eksplorasi" },
  { href: "/chat", icon: "🤖", label: "AI Expert" },
  { href: "/points", icon: "🏆", label: "Poin" },
  { href: "/profile", icon: "👤", label: "Profil" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-200 p-4 hidden md:flex flex-col">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600 mb-8 block">
          Tuju
        </Link>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition text-sm font-medium"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
