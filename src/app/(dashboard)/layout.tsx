"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { usePointsStore } from "@/store/pointsStore";
import { pointsApi, authApi } from "@/lib/api";
import { ToastContainer } from "@/components/ui/Toast";
import { GamificationLayer } from "@/components/gamification/PointsToast";

interface NavItem {
  href:      string;
  icon:      string;
  label:     string;
  disabled?: boolean;
  mobile:    boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", icon: "🏠", label: "Dashboard",    mobile: true  },
  { href: "/report",    icon: "🎯", label: "Life Path",    mobile: true  },
  { href: "/profile",   icon: "👤", label: "Profil",       mobile: true  },
  { href: "/roadmap",   icon: "🗺️", label: "Roadmap",      mobile: false },
  { href: "/evolution", icon: "✨", label: "Perjalanan",   mobile: false },
  { href: "/chat",      icon: "🤖", label: "AI Expert",    mobile: true  },
  { href: "/explore",   icon: "🔍", label: "Eksplorasi",   mobile: true  },
  { href: "/points",    icon: "🏆", label: "Poin & Level", mobile: false },
  { href: "/settings",  icon: "⚙️", label: "Pengaturan",   mobile: false },
];

const STARS_BY_LEVEL: Record<string, number> = {
  "Pemula":            1,
  "Penjelajah":        2,
  "Pencari Jati Diri": 3,
  "Pejuang Impian":    4,
  "Arsitek Hidupku":   5,
};

function LayoutInit() {
  const { setPoints } = usePointsStore();
  const { setMeData }  = useAuthStore();
  useEffect(() => {
    authApi.me().then((r) => setMeData(r.data)).catch(() => {});
    pointsApi.get().then((r) => setPoints(r.data)).catch(() => {});
  }, []);
  return null;
}

function SidebarUserBadge() {
  const { meData, logout }             = useAuthStore();
  const { totalPoints, currentLevel }  = usePointsStore();
  if (!meData?.name && totalPoints === 0) return null;
  const stars    = STARS_BY_LEVEL[currentLevel] ?? 1;
  const initials = meData?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "??";

  const handleLogout = () => {
    logout();
    if (typeof window !== "undefined") {
      localStorage.removeItem("tuju_token");
      window.location.href = "/";
    }
  };

  return (
    <div className="px-4 py-3 border-t border-slate-100">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          {meData?.name && (
            <p className="text-xs font-semibold text-slate-700 truncate">{meData.name}</p>
          )}
          <div className="flex items-center gap-1">
            <span className="text-amber-400 text-xs tracking-tight">{"★".repeat(stars)}</span>
            <span className="text-xs text-slate-500">{totalPoints.toLocaleString("id")} pts</span>
          </div>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="w-full text-xs text-slate-500 hover:text-red-600 transition py-1.5 rounded-lg hover:bg-red-50 text-center font-medium"
      >
        Keluar
      </button>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <LayoutInit />

      {/* Desktop sidebar */}
      <aside className="w-56 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full">
        <div className="p-4 flex-1 flex flex-col overflow-y-auto">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600 mb-6 block">
            Tuju
          </Link>
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              if (item.disabled) {
                return (
                  <div
                    key={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 text-sm font-medium cursor-not-allowed"
                  >
                    <span>{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded-full">Soon</span>
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
        </div>
        <SidebarUserBadge />
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-40">
        {navItems
          .filter((i) => !i.disabled && i.mobile)
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

      <ToastContainer />
      <GamificationLayer />
    </div>
  );
}
