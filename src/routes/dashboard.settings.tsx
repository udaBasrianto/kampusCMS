import { createFileRoute } from "@tanstack/react-router";
import { Settings, Shield, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/dashboard/settings")({
  component: DashboardSettings,
});

function DashboardSettings() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Pengaturan</h1>
        <p className="mt-1 text-muted-foreground">Sesuaikan preferensi akun dan aplikasi Anda.</p>
      </div>

      <div className="space-y-6">
        {/* Keamanan */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b border-border p-5 bg-muted/30">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield className="h-4 w-4" />
            </div>
            <h2 className="font-bold">Keamanan Akun</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-sm font-medium">Password Baru</label>
              <input 
                type="password" 
                placeholder="Masukkan password baru" 
                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm max-w-md"
                disabled
              />
              <p className="mt-1.5 text-xs text-muted-foreground">Hubungi IT Support kampus jika Anda lupa password SIAKAD.</p>
            </div>
            <button disabled className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground opacity-50 cursor-not-allowed">
              Ubah Password
            </button>
          </div>
        </div>

        {/* Notifikasi */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b border-border p-5 bg-muted/30">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <h2 className="font-bold">Notifikasi Email</h2>
          </div>
          <div className="p-5 space-y-4">
            <label className="flex items-center gap-3 cursor-not-allowed opacity-70">
              <input type="checkbox" checked disabled className="rounded border-input text-primary focus:ring-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Info Akademik</p>
                <p className="text-xs text-muted-foreground">Pengumuman penting terkait KRS dan nilai.</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-not-allowed opacity-70">
              <input type="checkbox" checked disabled className="rounded border-input text-primary focus:ring-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Event Kampus</p>
                <p className="text-xs text-muted-foreground">Notifikasi saat ada event baru di fakultas Anda.</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-not-allowed opacity-70">
              <input type="checkbox" disabled className="rounded border-input text-primary focus:ring-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Berita Mingguan</p>
                <p className="text-xs text-muted-foreground">Rangkuman berita kampus setiap akhir pekan.</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
