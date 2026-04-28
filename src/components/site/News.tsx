import { ArrowUpRight, Calendar } from "lucide-react";
import { useNews } from "@/hooks/useCampusData";
import { news as fallbackNews } from "@/data/campus";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

export function News() {
  const { data: rows = [] } = useNews();
  const news =
    rows.length > 0
      ? rows
      : fallbackNews.map((item, index) => ({
          id: String(index),
          title: item.title,
          excerpt: item.excerpt,
          image_url: item.image,
          category: item.category,
          date: new Date().toISOString(),
          featured: item.featured,
        }));

  const featured = news.find((n) => n.featured) ?? news[0];
  const rest = news.filter((n) => n.id !== featured.id).slice(0, 3);

  return (
    <section id="berita" className="bg-white px-5 py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-primary/70">Berita & Update</span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary">
              Informasi Terbaru UNPRI
            </h2>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-muted"
          >
            Lihat Semua Berita <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {news.slice(0, 4).map((n) => (
            <a
              key={n.id}
              href="/blog"
              className="group overflow-hidden rounded-xl border border-border bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={n.image_url}
                  alt={n.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary/60">
                  <Calendar className="h-3 w-3" /> {fmtDate(n.date)}
                </div>
                <h3 className="mt-3 font-display text-base font-bold leading-snug text-primary">
                  {n.title}
                </h3>
              </div>
            </a>
          ))}
        </div>

        <div className="hidden">
          <a
            href="/"
            className="group relative col-span-1 overflow-hidden rounded-3xl bg-primary lg:col-span-3 lg:row-span-2"
          >
            <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-full">
              <img
                src={featured.image_url}
                alt={featured.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-7 lg:p-10">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-gold">
                <span className="rounded-full bg-gold/20 px-3 py-1 backdrop-blur">
                  {featured.category}
                </span>
                <span className="flex items-center gap-1.5 text-white/70">
                  <Calendar className="h-3 w-3" /> {fmtDate(featured.date)}
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-white text-balance lg:text-3xl">
                {featured.title}
              </h3>
              <p className="mt-3 max-w-xl text-sm text-white/80">{featured.excerpt}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold">
                Baca selengkapnya{" "}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </div>
          </a>

          {rest.map((n) => (
            <a
              key={n.id}
              href="/"
              className="group flex flex-col overflow-hidden rounded-2xl bg-card border border-border transition-all hover:shadow-elevated lg:col-span-2 lg:flex-row"
            >
              <div className="aspect-[16/10] overflow-hidden lg:aspect-auto lg:w-2/5">
                <img
                  src={n.image_url}
                  alt={n.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
                    <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-accent">
                      {n.category}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold leading-snug text-foreground group-hover:text-accent">
                    {n.title}
                  </h3>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" /> {fmtDate(n.date)}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
