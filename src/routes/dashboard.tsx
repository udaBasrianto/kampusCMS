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
      <main className="flex-1 overflow-auto pb-20 lg:pb-0">
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

        {/* Mobile Bottom Navbar */}
        <nav className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border flex items-center px-2 py-2 pb-safe shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.1)] overflow-x-auto overflow-y-hidden hide-scrollbar">
          <div className="flex justify-around w-full min-w-max gap-2">
          {allNav.map((n) => {
            const active = isActive(n.to, n.exact);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex flex-col items-center gap-1 min-w-[64px] px-2 py-2 rounded-xl transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <n.icon className={cn("h-5 w-5", active && "fill-primary/20")} />
                <span className="text-[10px] font-semibold whitespace-nowrap">{n.label}</span>
              </Link>
            );
          })}
          </div>
        </nav>

        {/* Page content — same padding as admin */}
        <div className="p-6 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
