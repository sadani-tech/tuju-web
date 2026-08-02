"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Target,
  User,
  Route,
  Sparkles,
  Bot,
  Compass,
  Trophy,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { usePointsStore } from "@/store/pointsStore";
import { pointsApi, authApi } from "@/lib/api";
import { ToastContainer } from "@/components/ui/Toast";
import { GamificationLayer } from "@/components/gamification/PointsToast";

interface NavItem {
  href:      string;
  icon:      LucideIcon;
  label:     string;
  disabled?: boolean;
  mobile:    boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard",    mobile: true  },
  { href: "/report",    icon: Target,          label: "Life Path",    mobile: true  },
  { href: "/profile",   icon: User,            label: "Profil",       mobile: true  },
  { href: "/roadmap",   icon: Route,           label: "Roadmap",      mobile: false },
  { href: "/evolution", icon: Sparkles,        label: "Perjalanan",   mobile: false },
  { href: "/chat",      icon: Bot,             label: "AI Expert",    mobile: true  },
  { href: "/explore",   icon: Compass,         label: "Eksplorasi",   mobile: true  },
  { href: "/points",    icon: Trophy,          label: "Poin & Level", mobile: false },
  { href: "/settings",  icon: Settings,        label: "Pengaturan",   mobile: false },
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
  const { meData }                    = useAuthStore();
  const { totalPoints, currentLevel } = usePointsStore();
  if (!meData?.name && totalPoints === 0) return null;
  const stars    = STARS_BY_LEVEL[currentLevel] ?? 1;
  const initials = meData?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="px-4 mb-8 flex items-center gap-3">
      <div className="w-12 h-12 rounded-full border-2 border-secondary bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center text-sm font-bold shrink-0">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-on-surface truncate">
          {meData?.name ? `Welcome, ${meData.name.split(" ")[0]}` : "Welcome, Explorer"}
        </p>
        <p className="font-label text-label-sm text-on-surface-variant">
          {"★".repeat(stars)} {currentLevel} · {totalPoints.toLocaleString("id")} pts
        </p>
      </div>
    </div>
  );
}

function LogoutButton() {
  const { logout } = useAuthStore();
  const handleLogout = () => {
    logout();
    if (typeof window !== "undefined") {
      localStorage.removeItem("tuju_token");
      window.location.href = "/";
    }
  };
  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-2 text-on-surface-variant p-3 hover:bg-error-container hover:text-on-error-container rounded transition-colors font-label text-label-sm"
    >
      <LogOut className="w-4 h-4" />
      Keluar
    </button>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      <LayoutInit />

      {/* Desktop sidebar */}
      <aside className="w-64 bg-surface-container-low border-r border-outline-variant/30 shadow-navy-sm hidden md:flex flex-col fixed h-full z-40 py-8">
        <div className="px-4 mb-8">
          <Link href="/dashboard" className="text-headline-md font-bold text-primary block">
            Tuju
          </Link>
        </div>

        <SidebarUserBadge />

        <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            if (item.disabled) {
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-2 p-3 mx-2 rounded text-outline font-label text-label-sm cursor-not-allowed"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="flex-1">{item.label}</span>
                  <span className="text-xs bg-surface-container-high px-1.5 py-0.5 rounded-full">Soon</span>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 p-3 mx-2 rounded font-label text-label-sm transition-all duration-200 ease-in-out ${
                  isActive
                    ? "bg-secondary-container text-on-secondary-container shadow-navy-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 border-t border-outline-variant/30 pt-4 px-2">
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant/40 flex z-40">
        {navItems
          .filter((i) => !i.disabled && i.mobile)
          .map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-3 font-label text-label-sm transition ${
                  isActive ? "text-secondary" : "text-on-surface-variant"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      <main className="flex-1 overflow-auto md:ml-64 pb-20 md:pb-0">
        {children}
      </main>

      <ToastContainer />
      <GamificationLayer />
    </div>
  );
}
