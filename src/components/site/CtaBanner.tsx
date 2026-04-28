import { ArrowRight } from "lucide-react";
import { useSiteSettings } from "@/hooks/useCampusData";

export function CtaBanner() {
  const { data: settings } = useSiteSettings();
  const cta = (settings?.cta_banner ?? {}) as {
    eyebrow?: string;
    title?: string;
    description?: string;
    cta_label?: string;
    cta_href?: string;
    cta_secondary_label?: string;
    cta_secondary_href?: string;
  };

  const eyebrow = cta.eyebrow || "Penerimaan Mahasiswa Baru 2025";
  const title = cta.title || "Saatnya menulis bab baru perjalananmu di Universitas Perintis Indonesia.";
  const description =
    cta.description ||
    "Dapatkan informasi lengkap tentang program studi, jalur masuk, beasiswa, dan fasilitas. Tim kami siap membantu setiap langkah pendaftaranmu.";
  const ctaLabel = cta.cta_label || "Mulai Pendaftaran Online";
  const ctaHref = cta.cta_href || "/halaman/penerimaan";
  const secondaryLabel = cta.cta_secondary_label || "Unduh Brosur PDF";
  const secondaryHref = cta.cta_secondary_href || "/";

  return (
    <section className="px-5 py-12 lg:px-8 lg:py-16">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-primary p-10 shadow-elevated lg:p-14">
        <div className="relative grid items-center gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {eyebrow}
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white text-balance lg:text-5xl">
              {title}
            </h2>
            <p className="mt-5 max-w-xl text-base text-white/75">{description}</p>
          </div>
          <div className="flex flex-col gap-3 lg:col-span-2 lg:items-end">
            <a
              href={ctaHref}
              className="group inline-flex w-full items-center justify-between gap-3 rounded-xl bg-white px-6 py-4 text-sm font-bold text-primary shadow-soft lg:w-auto"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            {secondaryLabel && (
              <a
                href={secondaryHref}
                className="inline-flex w-full items-center justify-between gap-3 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/15 lg:w-auto"
              >
                {secondaryLabel}
                <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
