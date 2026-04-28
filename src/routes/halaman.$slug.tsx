import { createFileRoute, Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ContactForm } from "@/components/site/ContactForm";
import { usePage } from "@/hooks/useCampusData";

export const Route = createFileRoute("/halaman/$slug")({
  component: PageView,
});

function PageView() {
  const { slug } = Route.useParams();
  const { data: page, isLoading } = usePage(slug);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Memuat...
      </div>
    );
  if (!page)
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="px-5 pb-24 pt-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-3xl font-bold">Halaman tidak ditemukan</h1>
            <Link to="/" className="mt-6 inline-block text-accent hover:underline">
              Kembali ke Beranda
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-24">
        {page.cover_image_url && (
          <div className="relative h-[420px] w-full overflow-hidden">
            <img
              src={page.cover_image_url}
              alt={page.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
            <div className="absolute inset-x-0 bottom-0 px-5 pb-12 lg:px-8">
              <div className="mx-auto max-w-4xl">
                <h1 className="font-display text-4xl font-bold tracking-tight text-white drop-shadow-lg lg:text-6xl">
                  {page.title}
                </h1>
                {page.subtitle && (
                  <p className="mt-3 text-lg text-white/90 drop-shadow">{page.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <article className="mx-auto max-w-3xl px-5 pt-12 lg:px-8">
          {!page.cover_image_url && (
            <header className="pt-20">
              <h1 className="font-display text-4xl font-bold tracking-tight lg:text-5xl">
                {page.title}
              </h1>
              {page.subtitle && (
                <p className="mt-3 text-lg text-muted-foreground">{page.subtitle}</p>
              )}
            </header>
          )}
          <div className="prose prose-neutral mt-8 max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-xl prose-a:text-accent">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.content}</ReactMarkdown>
          </div>
          {slug === "kontak" && (
            <div className="mt-12">
              <ContactForm />
            </div>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
}
