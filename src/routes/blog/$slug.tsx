import { createFileRoute, Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Share2, Eye } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useBlogPost, useBlogPosts } from "@/hooks/useCampusData";
import { apiClient } from "@/integrations/api/client";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { data: post } = await apiClient.getBlogPostBySlug(params.slug);
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) {
      return {
        meta: [
          { title: "Artikel tidak ditemukan — Universitas Perintis Indonesia" },
          { name: "description", content: "Artikel yang Anda cari tidak tersedia." },
        ],
      };
    }
    const title = post.seo_title || `${post.title} — Universitas Perintis Indonesia`;
    const description = post.seo_description || post.excerpt || "";
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ];
    if (post.cover_image_url) {
      meta.push(
        { property: "og:image", content: post.cover_image_url },
        { name: "twitter:image", content: post.cover_image_url },
      );
    }
    if (post.author_name) meta.push({ name: "author", content: post.author_name });
    if (post.published_at)
      meta.push({ property: "article:published_time", content: post.published_at });
    if (post.category) meta.push({ property: "article:section", content: post.category });
    if (post.tags?.length) {
      for (const t of post.tags) meta.push({ property: "article:tag", content: t });
    }
    return { meta };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useBlogPost(slug);
  const { data: allPosts = [] } = useBlogPosts();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Memuat...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="px-5 pb-24 pt-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-3xl font-bold">Artikel tidak ditemukan</h1>
            <p className="mt-3 text-muted-foreground">
              Artikel yang Anda cari mungkin telah dipindahkan atau dihapus.
            </p>
            <Link
              to="/blog"
              className="mt-6 inline-flex items-center gap-2 text-accent hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke Blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const related = allPosts.filter((p: any) => p.id !== post.id).slice(0, 3);
  const readingMinutes = Math.max(1, Math.round((post.content?.split(/\s+/).length ?? 0) / 200));

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: post.title, text: post.excerpt, url });
      else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* dismissed */
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-24 pt-28 lg:pt-32">
        <article className="mx-auto max-w-3xl px-5 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Semua Artikel
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-accent/10 px-2.5 py-1 font-semibold uppercase tracking-wide text-accent">
              {post.category}
            </span>
            {post.published_at && (
              <span className="text-muted-foreground">
                {new Date(post.published_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            <span className="text-muted-foreground">· oleh {post.author_name}</span>
            <span className="text-muted-foreground">· {readingMinutes} menit baca</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              · <Eye className="h-3.5 w-3.5 ml-1" /> {post.views || 0} x dilihat
            </span>
          </div>

          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>}

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={onShare}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold transition-colors hover:border-accent/40 hover:text-accent"
            >
              <Share2 className="h-3.5 w-3.5" /> Bagikan
            </button>
          </div>
        </article>

        {post.cover_image_url && (
          <div className="mx-auto mt-10 max-w-5xl px-5 lg:px-8">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="aspect-[16/9] w-full rounded-2xl object-cover shadow-soft"
            />
          </div>
        )}

        <article className="mx-auto mt-12 max-w-3xl px-5 lg:px-8">
          <div className="prose prose-neutral max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-xl prose-a:text-accent prose-img:rounded-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-6">
              {post.tags.map((t: string) => (
                <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs text-foreground">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-12 rounded-2xl border border-border bg-card p-6 lg:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 font-display text-lg font-bold text-accent">
                {post.author_name?.charAt(0).toUpperCase() ?? "A"}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Ditulis oleh
                </div>
                <div className="font-display text-base font-semibold">{post.author_name}</div>
              </div>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="mx-auto mt-20 max-w-7xl px-5 lg:px-8">
            <div className="flex items-end justify-between gap-4 border-t border-border pt-12">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                  Lainnya
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold lg:text-3xl">
                  Artikel Terkait
                </h2>
              </div>
              <Link to="/blog" className="text-sm font-semibold text-accent hover:underline">
                Semua artikel →
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p: any) => (
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
                  <div className="p-5">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                      {p.category}
                    </span>
                    <h3 className="mt-2 font-display text-lg font-semibold leading-snug">
                      {p.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
