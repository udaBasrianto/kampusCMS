import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth, logout } from "@/hooks/useAuth";
import {
  GraduationCap,
  LayoutDashboard,
  User,
  CalendarDays,
  Newspaper,
  MessageSquare,
  BookOpen,
  LogOut,
  ExternalLink,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Universitas Perintis Indonesia" }] }),
  component: DashboardLayout,
});

const allNav = [
  { to: "/dashboard", label: "Beranda", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/profile", label: "Profil Saya", icon: User },
  { to: "/dashboard/events", label: "Event Kampus", icon: CalendarDays },
  { to: "/dashboard/news", label: "Berita & Artikel", icon: Newspaper },
  { to: "/dashboard/chat", label: "Riwayat Chat AI", icon: MessageSquare },
  { to: "/dashboard/academic", label: "Info Akademik", icon: BookOpen },
  { to: "/dashboard/settings", label: "Pengaturan", icon: Settings },
];

function DashboardLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Memuat...
      </div>
    );
  }

  if (!user) return null;

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const displayName = user.full_name || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Desktop Sidebar — same w-64 as admin */}
      <aside className="hidden lg:flex w-64 flex-col bg-primary text-primary-foreground">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold text-gold-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display font-bold">KampusPro</div>
              <div className="text-xs text-white/60">Dashboard</div>
            </div>
          </Link>
        </div>

        {/* User card */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{displayName}</div>
              <div className="text-[10px] text-white/50 truncate">{user.email}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {allNav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(n.to, n.exact)
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" /> Lihat Website
          </a>
          <button
            onClick={async () => {
              await logout();
              navigate({ to: "/auth" });
            }}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between bg-primary text-primary-foreground p-4">
          <span className="font-display font-bold">KampusPro</span>
          <button
            onClick={async () => {
              await logout();
              navigate({ to: "/auth" });
            }}
            className="text-sm"
          >
            Keluar
          </button>
        </div>

        {/* Mobile nav tabs — horizontal scroll */}
        <div className="lg:hidden flex overflow-x-auto gap-2 p-3 bg-card border-b border-border">
          {allNav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium",
                isActive(n.to, n.exact)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground",
              )}
            >
              <n.icon className="h-3.5 w-3.5" /> {n.label}
            </Link>
          ))}
        </div>

        {/* Page content — same padding as admin */}
        <div className="p-6 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
