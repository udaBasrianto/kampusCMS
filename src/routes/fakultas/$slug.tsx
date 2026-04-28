import { createFileRoute, Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowRight,
  GraduationCap,
  Award,
  Users,
  MapPin,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  useFacultyBySlug,
  useFacultyPrograms,
  useFacultyLecturers,
  useFacultyBlogPosts,
} from "@/hooks/useFacultyData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/fakultas/$slug")({
  component: FacultyMicrosite,
});

const accentMap: Record<string, string> = {
  navy: "bg-primary text-primary-foreground",
  cobalt: "bg-accent text-accent-foreground",
  gold: "bg-gradient-gold text-gold-foreground",
};

function FacultyMicrosite() {
  const { slug } = Route.useParams();
  const { data: faculty, isLoading } = useFacultyBySlug(slug);
  const { data: programs = [] } = useFacultyPrograms(faculty?.id);
  const { data: lecturers = [] } = useFacultyLecturers(faculty?.id);
  const { data: posts = [] } = useFacultyBlogPosts(faculty?.id, 3);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Memuat...
      </div>
    );

  if (!faculty)
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="px-5 pb-24 pt-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-3xl font-bold">Fakultas tidak ditemukan</h1>
            <Link to="/" className="mt-6 inline-block text-accent hover:underline">
              Kembali ke Beranda
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );

  const rawFacilities = faculty.facilities;
  const facilities: Array<{ name: string; description?: string }> = Array.isArray(rawFacilities)
    ? rawFacilities
    : typeof rawFacilities === "string"
      ? (() => { try { const p = JSON.parse(rawFacilities); return Array.isArray(p) ? p : []; } catch { return []; } })()
      : [];
  const rawContact = faculty.contact_info;
  const contact: { address?: string; email?: string; phone?: string } =
    rawContact && typeof rawContact === "object" && !Array.isArray(rawContact)
      ? (rawContact as { address?: string; email?: string; phone?: string })
      : typeof rawContact === "string"
        ? (() => { try { return JSON.parse(rawContact); } catch { return {}; } })()
        : {};
  const heroEyebrow = faculty.hero_eyebrow || "Fakultas";
  const heroTitle = faculty.hero_title || faculty.name;
  const heroDesc = faculty.hero_description || faculty.description;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          {faculty.cover_image_url ? (
            <div className="absolute inset-0">
              <img
                src={faculty.cover_image_url}
                alt={faculty.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/40" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
          )}
          <div className="relative px-5 pb-24 pt-36 lg:px-8 lg:pb-32 lg:pt-44">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-2xl font-display text-xl font-bold shadow-elevated",
                    accentMap[faculty.accent] ?? accentMap.navy,
                  )}
                >
                  {faculty.code}
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                  {heroEyebrow}
                </span>
              </div>
              <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold tracking-tight text-white text-balance lg:text-6xl">
                {heroTitle}
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-white/85 leading-relaxed">{heroDesc}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#programs"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-white/90"
                >
                  Lihat Program Studi <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#kontak"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Hubungi Fakultas
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK STATS */}
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border sm:grid-cols-4">
            <Stat
              icon={GraduationCap}
              label="Program Studi"
              value={programs.length || faculty.programs}
            />
            <Stat icon={Users} label="Dosen" value={lecturers.length} />
            <Stat icon={Award} label="Akreditasi" value={programs[0]?.accreditation || "Unggul"} />
            <Stat
              icon={Calendar}
              label="Berdiri"
              value={new Date(faculty.created_at).getFullYear()}
            />
          </div>
        </section>

        {/* TENTANG */}
        {(faculty.about_content || faculty.vision || faculty.mission) && (
          <section className="px-5 py-20 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-12 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    Tentang Fakultas
                  </span>
                  <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance lg:text-4xl">
                    Mengenal {faculty.name}
                  </h2>
                  {faculty.about_content && (
                    <div className="prose prose-neutral mt-6 max-w-none prose-headings:font-display prose-a:text-accent">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {faculty.about_content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                <div className="space-y-6">
                  {faculty.vision && (
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <h3 className="font-display text-lg font-bold text-accent">Visi</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {faculty.vision}
                      </p>
                    </div>
                  )}
                  {faculty.mission && (
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <h3 className="font-display text-lg font-bold text-accent">Misi</h3>
                      <div className="prose prose-sm prose-neutral mt-3 max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{faculty.mission}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PROGRAM STUDI */}
        {programs.length > 0 && (
          <section id="programs" className="bg-muted/30 px-5 py-20 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-7xl">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Akademik
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance lg:text-4xl">
                Program Studi
              </h2>
              <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {programs.map((p) => (
                  <div
                    key={p.id}
                    className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-accent/40 hover:shadow-elevated"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {p.level}
                      </span>
                      {p.accreditation && (
                        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                          Akreditasi {p.accreditation}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold">{p.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {p.description}
                    </p>
                    <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                      Durasi: {p.duration_years} tahun
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* DOSEN */}
        {lecturers.length > 0 && (
          <section className="px-5 py-20 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-7xl">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Tenaga Pengajar
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance lg:text-4xl">
                Dosen Fakultas
              </h2>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {lecturers.map((l) => (
                  <div
                    key={l.id}
                    className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-elevated"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-muted">
                      {l.photo_url ? (
                        <img
                          src={l.photo_url}
                          alt={l.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Users className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-base font-bold">{l.name}</h3>
                      {l.position && (
                        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-accent">
                          {l.position}
                        </p>
                      )}
                      {l.expertise && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                          {l.expertise}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FASILITAS */}
        {facilities.length > 0 && (
          <section className="bg-muted/30 px-5 py-20 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-7xl">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Fasilitas
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance lg:text-4xl">
                Sarana & Prasarana
              </h2>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {facilities.map((f, idx) => (
                  <div key={idx} className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="font-display text-base font-bold">{f.name}</h3>
                    {f.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ARTIKEL */}
        {posts.length > 0 && (
          <section className="px-5 py-20 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    Artikel
                  </span>
                  <h2 className="mt-3 font-display text-3xl font-bold tracking-tight lg:text-4xl">
                    Dari Fakultas Ini
                  </h2>
                </div>
                <Link to="/blog" className="text-sm font-semibold text-accent hover:underline">
                  Semua Artikel →
                </Link>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {posts.map((p) => (
                  <Link
                    key={p.id}
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="group block"
                  >
                    {p.cover_image_url && (
                      <div className="aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                        <img
                          src={p.cover_image_url}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="mt-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                        {p.category}
                      </span>
                      <h3 className="mt-2 font-display text-lg font-bold leading-snug group-hover:text-accent">
                        {p.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* KONTAK */}
        {(contact.address || contact.email || contact.phone) && (
          <section
            id="kontak"
            className="bg-primary px-5 py-20 text-primary-foreground lg:px-8 lg:py-28"
          >
            <div className="mx-auto max-w-4xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Hubungi Kami
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight lg:text-4xl">
                Kontak Dekanat
              </h2>
              <div className="mt-10 grid gap-6 sm:grid-cols-3">
                {contact.address && (
                  <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                    <MapPin className="mx-auto h-6 w-6" />
                    <p className="mt-3 text-sm">{contact.address}</p>
                  </div>
                )}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    <Mail className="mx-auto h-6 w-6" />
                    <p className="mt-3 text-sm">{contact.email}</p>
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    <Phone className="mx-auto h-6 w-6" />
                    <p className="mt-3 text-sm">{contact.phone}</p>
                  </a>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GraduationCap;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-background p-6 text-center">
      <Icon className="mx-auto h-5 w-5 text-accent" />
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
