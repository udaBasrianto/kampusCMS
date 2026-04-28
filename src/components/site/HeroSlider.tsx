import { useState, useEffect, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useHeroSlides } from "@/hooks/useCampusData";

export function HeroSlider() {
  const { data: slides = [] } = useHeroSlides();
  const [current, setCurrent] = useState(0);

  const count = slides.length;

  const next = useCallback(() => {
    if (count > 1) setCurrent((c) => (c + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    if (count > 1) setCurrent((c) => (c - 1 + count) % count);
  }, [count]);

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [count, next]);

  // Nothing to show
  if (count === 0) {
    return (
      <section className="relative min-h-[760px] overflow-hidden bg-primary/5 pt-20 lg:min-h-[820px] flex items-center justify-center">
        <p className="text-muted-foreground">Belum ada slide.</p>
      </section>
    );
  }

  const slide = slides[current];

  return (
    <section className="relative min-h-[760px] overflow-hidden bg-white pt-20 lg:min-h-[820px]">
      {/* Background image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <img
            src={slide.image_url}
            alt={slide.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/5" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-white" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Sebelumnya"
            className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-soft md:flex hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Selanjutnya"
            className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-soft md:flex hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[680px] max-w-7xl items-center px-5 py-16 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            {slide.eyebrow && (
              <div className="text-sm font-bold uppercase tracking-wider text-primary">
                {slide.eyebrow}
              </div>
            )}
            <h1 className="mt-5 font-display text-5xl font-bold leading-[0.98] tracking-tight text-primary text-balance sm:text-6xl lg:text-7xl">
              {slide.title}
            </h1>
            {slide.description && (
              <p className="mt-6 max-w-xl text-sm font-medium leading-relaxed text-primary/80 sm:text-base">
                {slide.description}
              </p>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-4">
              {slide.cta_primary_label && slide.cta_primary_href && (
                <a
                  href={slide.cta_primary_href}
                  className="inline-flex items-center gap-3 rounded-xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:scale-105"
                >
                  {slide.cta_primary_label} <ArrowRight className="h-4 w-4" />
                </a>
              )}
              {slide.cta_secondary_label && slide.cta_secondary_href && (
                <a
                  href={slide.cta_secondary_href}
                  className="inline-flex items-center gap-3 rounded-xl border border-border bg-white px-6 py-4 text-sm font-bold text-primary shadow-soft transition-colors hover:bg-muted"
                >
                  {slide.cta_secondary_label} <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots indicator */}
      {count > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-primary" : "w-2.5 bg-primary/25 hover:bg-primary/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
