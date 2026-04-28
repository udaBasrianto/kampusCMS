import { useState } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTestimonials } from "@/hooks/useCampusData";
import { testimonials as fallbackTestimonials } from "@/data/campus";

export function Testimonials() {
  const { data: rows = [] } = useTestimonials();
  const testimonials =
    rows.length > 0
      ? rows
      : fallbackTestimonials.map((item, index) => ({
          id: String(index),
          name: item.name,
          role: item.role,
          year: item.year,
          quote: item.quote,
          image_url: item.image,
        }));
  const [i, setI] = useState(0);
  if (testimonials.length === 0) return null;
  const t = testimonials[i % testimonials.length];
  const go = (dir: number) => setI((c) => (c + dir + testimonials.length) % testimonials.length);

  return (
    <section className="bg-gradient-navy px-5 py-24 text-primary-foreground lg:px-8 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Suara Alumni
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-white text-balance lg:text-5xl">
            Cerita Mereka yang Telah Berdampak
          </h2>
          <p className="mt-5 max-w-md text-base text-white/70">
            Alumni Universitas Perintis Indonesia tersebar di berbagai bidang dan daerah,
            menjadi pemimpin yang membawa perubahan.
          </p>
          <div className="mt-10 flex items-center gap-3">
            <button
              onClick={() => go(-1)}
              aria-label="Sebelumnya"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Selanjutnya"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="ml-3 font-display text-sm text-white/60">
              {String(i + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="relative min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md lg:p-10"
            >
              <Quote className="h-10 w-10 text-gold" />
              <p className="mt-6 font-display text-xl leading-relaxed text-white text-balance lg:text-2xl">
                "{t.quote}"
              </p>
              <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
                <img
                  src={t.image_url}
                  alt={t.name}
                  loading="lazy"
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-gold/40"
                />
                <div>
                  <div className="font-display font-semibold text-white">{t.name}</div>
                  <div className="text-sm text-white/70">{t.role}</div>
                  <div className="text-xs text-gold">{t.year}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
