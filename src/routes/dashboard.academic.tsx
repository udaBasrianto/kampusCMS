import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/academic")({
  component: DashboardAcademic,
});

function DashboardAcademic() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Info Akademik</h1>
          <p className="mt-1 text-muted-foreground">KRS, KHS, Nilai, dan Riwayat Akademik.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-purple-500/10 p-4 mb-4 text-purple-500">
          <BookOpen className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Sistem Akademik Eksternal</h2>
        <p className="text-muted-foreground max-w-md">
          Portal akademik terpisah dari CMS web utama. Klik tombol di bawah untuk menuju Sistem Informasi Akademik (SIAKAD) yang sesungguhnya.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
          <a href="#" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Login ke SIAKAD
          </a>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Memerlukan kredensial mahasiswa aktif
          </span>
        </div>
      </div>
    </div>
  );
}
