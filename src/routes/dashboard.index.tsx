import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, CalendarDays, MessageSquare, Newspaper } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const { user } = useAuth();
  
  if (!user) return null;

  const displayName = user.full_name || user.email?.split("@")[0] || "User";

  const stats = [
    { label: "Event Diikuti", value: "0", icon: CalendarDays, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Berita Tersimpan", value: "0", icon: Newspaper, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Riwayat Chat AI", value: "0", icon: MessageSquare, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "SKS Diambil", value: "-", icon: BookOpen, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground shadow-elevated">
        <h1 className="font-display text-3xl font-bold">Selamat Datang, {displayName}! 👋</h1>
        <p className="mt-2 max-w-2xl text-primary-foreground/80">
          Ini adalah panel dashboard personal Anda. Kelola profil, pantau aktivitas akademik, dan akses berbagai layanan kampus dalam satu tempat.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                <p className="font-display text-2xl font-bold">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity (Placeholder) */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold mb-4">Aktivitas Terbaru</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <CalendarDays className="h-12 w-12 mb-4 opacity-20" />
          <p>Belum ada aktivitas yang tercatat.</p>
          <p className="text-sm mt-1">Daftar event atau mulai chat dengan AI untuk melihat riwayat.</p>
        </div>
      </div>
    </div>
  );
}
