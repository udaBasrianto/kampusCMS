import {
  ArrowRight,
  HeartPulse,
  Pill,
  MessageCircle,
  BarChart3,
  Sparkles,
  BookOpen,
  Microscope,
  Scale,
  Laptop,
  ShieldCheck,
} from "lucide-react";
import { useFaculties } from "@/hooks/useCampusData";

const iconPool = [HeartPulse, Pill, MessageCircle, BarChart3, BookOpen, Microscope, Scale, Laptop, Sparkles];

export function Faculties() {
  const { data: faculties = [] } = useFaculties();
  const activePrograms = faculties.filter((f) => f.active !== false);

  if (activePrograms.length === 0) {
    return null;
  }

  // Responsive grid: 1 col mobile, 2 sm, 3 for 3 items, 4 for 4+
  const gridClass =
    activePrograms.length === 1
      ? "sm:grid-cols-1 max-w-sm"
      : activePrograms.length === 2
        ? "sm:grid-cols-2 max-w-2xl"
        : activePrograms.length === 3
          ? "sm:grid-cols-3"
          : "sm:grid-cols-2 xl:grid-cols-4";

  return (
    <section id="program" className="px-5 pb-10 pt-9 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-primary">
              Program Studi Unggulan
            </h2>
            <div className={`mt-6 grid gap-4 grid-cols-1 ${gridClass}`}>
              {activePrograms.map((f, index) => {
                const Icon = iconPool[index % iconPool.length];
                return (
                  <a
                    key={f.id}
                    href={`/fakultas/${f.slug || String(f.name).toLowerCase().replace(/\s+/g, "-")}`}
                    className="group flex min-h-[260px] flex-col items-center rounded-xl border border-border bg-white p-7 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="mt-6 font-display text-lg font-bold text-primary">{f.name}</h3>
                    <p className="mt-3 flex-1 text-xs font-medium leading-relaxed text-primary/65">
                      {f.description}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-primary">
                      Selengkapnya <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          <aside className="rounded-2xl bg-primary p-8 text-white shadow-elevated">
            <div className="text-sm font-semibold text-white/80">Penerimaan Mahasiswa Baru</div>
            <h3 className="mt-5 font-display text-3xl font-bold leading-tight">
              Bergabunglah menjadi bagian dari keluarga besar UNPRI
            </h3>
            <p className="mt-5 text-sm leading-relaxed text-white/75">
              Raih masa depan cemerlang bersama pendidikan berkualitas dan nilai Islami.
            </p>
            <a
              href="/pmb"
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-5 py-4 text-sm font-bold text-primary"
            >
              Daftar Sekarang <ArrowRight className="h-4 w-4" />
            </a>
          </aside>
        </div>

        <div id="kampus" className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="overflow-hidden rounded-xl border border-border bg-white shadow-soft lg:col-span-1">
            <div className="relative min-h-[220px] p-7">
              <img
                src="/kampus-unpri.jpeg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/40" />
              <div className="relative">
                <div className="text-xs font-bold text-primary/70">Fasilitas Kampus</div>
                <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-primary">
                  Fasilitas modern untuk pembelajaran berkualitas
                </h3>
                <a href="/" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary">
                  Lihat Fasilitas <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-7 shadow-soft">
            <div className="text-xs font-bold text-primary/70">Nilai Islami & Karakter</div>
            <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-primary">
              Berakhlak, Berilmu, dan Bermanfaat
            </h3>
            <div className="mt-8 grid grid-cols-4 gap-3 text-center text-[11px] font-bold text-primary/70">
              {["Integritas", "Kolaborasi", "Kepercayaan", "Kepedulian"].map((item) => (
                <div key={item}>
                  <ShieldCheck className="mx-auto h-6 w-6 text-primary" />
                  <div className="mt-2">{item}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-7 shadow-soft">
            <div className="text-xs font-bold text-primary/70">Prestasi & Akreditasi</div>
            <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-primary">
              Komitmen pada mutu dan keunggulan
            </h3>
            <a href="/" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary">
              Lihat Selengkapnya <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
