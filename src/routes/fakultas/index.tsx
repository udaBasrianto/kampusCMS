import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useFaculties } from "@/hooks/useCampusData";
import { ArrowRight, Sparkles, Building2, BookOpen, Microscope, Scale, Laptop, HeartPulse, Pill, MessageCircle, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/fakultas/")({
  head: () => ({
    meta: [
      { title: "Daftar Fakultas — Universitas Perintis Indonesia" },
      {
        name: "description",
        content: "Jelajahi program studi dan fakultas terbaik di Universitas Perintis Indonesia.",
      },
    ],
  }),
  component: FakultasIndex,
});

const iconPool = [HeartPulse, Pill, MessageCircle, BarChart3, BookOpen, Microscope, Scale, Laptop, Sparkles, Building2];

function FakultasIndex() {
  const { data: faculties = [], isLoading } = useFaculties();
  const activePrograms = faculties.filter((f) => f.active !== false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-5 pb-24 pt-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Akademik
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Fakultas & Program Studi
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Pilih program studi yang sesuai dengan passion Anda dan jadilah bagian dari Universitas Perintis Indonesia.
            </p>
          </div>

          {isLoading && <div className="mt-12 text-muted-foreground">Memuat...</div>}
          {!isLoading && activePrograms.length === 0 && (
            <div className="mt-12 rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
              Belum ada data fakultas.
            </div>
          )}

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activePrograms.map((f, index) => {
              const Icon = iconPool[index % iconPool.length];
              return (
                <Link
                  key={f.id}
                  to="/fakultas/$slug"
                  params={{ slug: f.slug || String(f.name).toLowerCase().replace(/\s+/g, "-") }}
                  className="group flex min-h-[260px] flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated hover:border-accent/40"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mt-6 font-display text-lg font-bold text-foreground">{f.name}</h3>
                  <p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-accent">
                    Selengkapnya <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
