import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, Newspaper } from "lucide-react";

export const Route = createFileRoute("/dashboard/news")({
  component: DashboardNews,
});

function DashboardNews() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Berita & Artikel</h1>
          <p className="mt-1 text-muted-foreground">Koleksi berita kampus yang Anda simpan/bookmark.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-amber-500/10 p-4 mb-4 text-amber-500">
          <Bookmark className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Belum Ada Bookmark</h2>
        <p className="text-muted-foreground max-w-md">
          Simpan berita atau artikel menarik dari halaman utama untuk membacanya lagi nanti di sini.
        </p>
        <a href="/" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Newspaper className="h-4 w-4" /> Baca Berita Terbaru
        </a>
      </div>
    </div>
  );
}
