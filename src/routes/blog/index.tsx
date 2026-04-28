import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useBlogPosts } from "@/hooks/useCampusData";
import { Eye } from "lucide-react";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Universitas Perintis Indonesia" },
      {
        name: "description",
        content: "Artikel, tips, dan pengumuman terbaru dari Universitas Perintis Indonesia.",
      },
      { property: "og:title", content: "Blog — Universitas Perintis Indonesia" },
      {
        property: "og:description",
        content: "Artikel, tips, dan pengumuman terbaru dari Universitas Perintis Indonesia.",
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { data: posts = [], isLoading } = useBlogPosts();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-5 pb-24 pt-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Blog
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Wawasan & Cerita
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Artikel, tips, dan pengumuman terbaru dari komunitas Universitas Perintis Indonesia.
            </p>
          </div>

          {isLoading && <div className="mt-12 text-muted-foreground">Memuat...</div>}
          {!isLoading && posts.length === 0 && (
            <div className="mt-12 rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
              Belum ada artikel.
            </div>
          )}

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-accent/40 hover:shadow-elevated"
              >
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  {p.cover_image_url && (
                    <img
                      src={p.cover_image_url}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 font-semibold uppercase text-accent">
                      {p.category}
                    </span>
                    {p.published_at && (
                      <span className="text-muted-foreground">
                        {new Date(p.published_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-muted-foreground ml-auto">
                      <Eye className="h-3 w-3" /> {p.views || 0}
                    </span>
                  </div>
                  <h2 className="mt-3 font-display text-xl font-semibold leading-snug">
                    {p.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
