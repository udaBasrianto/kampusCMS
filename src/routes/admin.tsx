import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/hooks/useAuth";
import {
  GraduationCap,
  LayoutDashboard,
  Image,
  Building2,
  Newspaper,
  Quote,
  FileText,
  Layout,
  Settings,
  Mail,
  Users,
  LogOut,
  ExternalLink,
  BookOpen,
  UserSquare2,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard" }] }),
  component: AdminLayout,
});

const allNav = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
    roles: ["admin", "faculty_admin"],
  },
  { to: "/admin/hero", label: "Hero Slider", icon: Image, roles: ["admin"] },
  { to: "/admin/faculties", label: "Fakultas", icon: Building2, roles: ["admin", "faculty_admin"] },
  {
    to: "/admin/programs",
    label: "Program Studi",
    icon: BookOpen,
    roles: ["admin", "faculty_admin"],
  },
  { to: "/admin/lecturers", label: "Dosen", icon: UserSquare2, roles: ["admin", "faculty_admin"] },
  { to: "/admin/news", label: "Berita", icon: Newspaper, roles: ["admin", "faculty_admin"] },
  { to: "/admin/events", label: "Events", icon: CalendarDays, roles: ["admin", "faculty_admin"] },
  { to: "/admin/testimonials", label: "Testimoni", icon: Quote, roles: ["admin"] },
  { to: "/admin/blog", label: "Blog", icon: FileText, roles: ["admin", "faculty_admin"] },
  { to: "/admin/pages", label: "Halaman", icon: Layout, roles: ["admin"] },
  { to: "/admin/messages", label: "Pesan", icon: Mail, roles: ["admin"] },
  { to: "/admin/settings", label: "Settings", icon: Settings, roles: ["admin"] },
  { to: "/admin/pmb-batches", label: "Gelombang PMB", icon: GraduationCap, roles: ["admin"] },
  { to: "/admin/pmb-candidates", label: "Data Pendaftar", icon: Users, roles: ["admin", "faculty_admin"] },
  { to: "/admin/users", label: "Admins", icon: Users, roles: ["admin"] },
];

function AdminLayout() {
  const { user, isAdmin, isFacultyAdmin, loading } = useAuth();
  const role = isAdmin ? "admin" : isFacultyAdmin ? "faculty_admin" : null;
  const nav = allNav.filter((n) => role && n.roles.includes(role));
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

  if (!isAdmin && !isFacultyAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="max-w-md text-center rounded-2xl bg-card p-8 shadow-elevated">
          <h1 className="font-display text-2xl font-bold">Akses Ditolak</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Akun <strong>{user?.email}</strong> belum memiliki role admin.
            <br />
            Hubungi Super Admin untuk mendapatkan akses.
          </p>
          <pre className="mt-4 rounded-lg bg-muted p-3 text-left text-xs overflow-auto">
            User ID: {user?.id}
          </pre>
          <button
            onClick={async () => {
              await logout();
              navigate({ to: "/auth" });
            }}
            className="mt-6 rounded-lg border border-input px-4 py-2 text-sm hover:bg-muted"
          >
            Keluar
          </button>
        </div>
      </div>
    );
  }

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="hidden lg:flex w-64 flex-col bg-primary text-primary-foreground">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold text-gold-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display font-bold">Admin UNPRI</div>
              <div className="text-xs text-white/60">CMS</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => (
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

      <main className="flex-1 overflow-auto">
        <div className="lg:hidden flex items-center justify-between bg-primary text-primary-foreground p-4">
          <span className="font-display font-bold">Admin UNPRI</span>
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
        <div className="lg:hidden flex overflow-x-auto gap-2 p-3 bg-card border-b border-border">
          {nav.map((n) => (
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
        <div className="p-6 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
