import { useEffect, useState } from "react";
import { Search, ArrowRight, Landmark } from "lucide-react";
import { campusInfo as defaultInfo, navigation as defaultNav } from "@/data/campus";
import { useSiteSettings } from "@/hooks/useCampusData";
import { cn } from "@/lib/utils";
import { MobileNavbar } from "./MobileNavbar";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { data: settings } = useSiteSettings();

  const info = (settings?.campus_info ?? {}) as Record<string, string>;
  const acronym = info.short_name || defaultInfo.acronym;
  const shortName = info.name || defaultInfo.shortName;
  const headerSettings = (settings?.header ?? {}) as { items?: Array<{label: string, href: string}>, links?: string };
  
  let navFromSettings = headerSettings.items;
  
  // Fallback for old string format if items doesn't exist
  if (!navFromSettings && headerSettings.links) {
    navFromSettings = headerSettings.links.split("\n").map(line => {
      const [label, href] = line.split("|").map(s => s.trim());
      return { label, href: href || "/" };
    }).filter(n => n.label);
  }
  
  const navigation = navFromSettings && navFromSettings.length > 0 ? navFromSettings : defaultNav;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled ? "bg-white/92 backdrop-blur-xl border-b border-border shadow-soft" : "bg-white/0",
        )}
      >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 py-3 lg:px-8">
        <a href="/" className="flex items-center gap-3 group">
          {/* Logo Icon dengan animasi */}
          <div className="relative">
            {/* Sparkle bintang 1 */}
            <span className="absolute -top-1 -right-1 text-yellow-400 text-xs animate-[sparkle_2.5s_ease-in-out_infinite] pointer-events-none select-none">✦</span>
            {/* Sparkle bintang 2 */}
            <span className="absolute -bottom-1 -left-0.5 text-yellow-300 text-[8px] animate-[sparkle_2.5s_ease-in-out_0.8s_infinite] pointer-events-none select-none">✦</span>
            {/* Sparkle bintang 3 */}
            <span className="absolute top-0 left-0 text-primary/40 text-[7px] animate-[sparkle_2.5s_ease-in-out_1.6s_infinite] pointer-events-none select-none">✦</span>
            <div
              className={cn(
                "relative flex h-11 w-11 items-center justify-center rounded-lg border-2 transition-all duration-300 overflow-hidden",
                "group-hover:scale-110 group-hover:shadow-[0_0_16px_4px_rgba(var(--primary-rgb,59,130,246),0.35)]",
                scrolled ? "border-primary text-primary" : "border-primary bg-white/90 text-primary",
              )}
            >
              {/* Shimmer sweep */}
              <span
                className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite] pointer-events-none"
                style={{
                  background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.7) 50%, transparent 65%)",
                }}
              />
              <Landmark className="h-6 w-6 relative z-10" />
            </div>
          </div>

          {/* Teks nama kampus */}
          <div className="leading-tight overflow-hidden">
            <div
              className={cn(
                "font-display text-xl font-bold tracking-tight relative",
                scrolled ? "text-primary" : "text-primary",
              )}
            >
              {/* Shimmer sweep pada teks */}
              <span className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_ease-in-out_0.3s_infinite] pointer-events-none"
                style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)" }}
              />
              {acronym}
            </div>
            <div
              className={cn(
                "max-w-[160px] text-[11px] font-bold uppercase leading-tight",
                scrolled ? "text-primary/80" : "text-primary/80",
              )}
            >
              {shortName}
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={cn(
                "relative rounded-full px-4 py-2 text-xs font-bold transition-colors",
                scrolled
                  ? "text-primary/80 hover:bg-primary/5 hover:text-primary"
                  : "text-primary/80 hover:bg-white/70 hover:text-primary",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Cari"
            className={cn(
              "hidden h-10 w-10 items-center justify-center rounded-full transition-colors md:flex",
              scrolled
                ? "bg-white text-primary shadow-soft hover:bg-muted"
                : "bg-white text-primary shadow-soft hover:bg-white/80",
            )}
          >
            <Search className="h-4.5 w-4.5" />
          </button>
          <a
            href="/pmb"
            className="hidden items-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-soft transition-transform hover:scale-105 md:inline-flex"
          >
            Pendaftaran <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="/auth"
            className="hidden rounded-full border border-primary px-4 py-3 text-xs font-bold text-primary transition-colors hover:bg-primary/5 md:inline-flex"
          >
            Masuk Admin
          </a>

        </div>
      </div>
      </header>
      <MobileNavbar navigation={navigation} />
    </>
  );
}
