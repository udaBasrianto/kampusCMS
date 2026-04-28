import { Building2, GraduationCap, MapPin, Award, Users, Globe2, BookOpen, Briefcase } from "lucide-react";
import { useSiteSettings } from "@/hooks/useCampusData";

type StatItem = { label: string; value: string };

const defaultItems: StatItem[] = [
  { label: "Cabang Kampus", value: "3" },
  { label: "Fakultas", value: "4" },
  { label: "Mahasiswa & Alumni", value: "1000+" },
];

const iconPool = [MapPin, Building2, GraduationCap, Award, Users, Globe2, BookOpen, Briefcase];

export function StatsBar() {
  const { data: settings } = useSiteSettings();
  const stored = settings?.stats as Record<string, unknown> | undefined;
  const items: StatItem[] =
    stored?.items && Array.isArray(stored.items) ? (stored.items as StatItem[]) : defaultItems;

  if (items.length === 0) return null;

  const colClass =
    items.length <= 2
      ? "sm:grid-cols-2"
      : items.length === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="relative -mt-16 z-20 px-5 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-2xl border border-border bg-white shadow-elevated">
        <div className={`grid grid-cols-1 divide-y divide-border sm:divide-x sm:divide-y-0 ${colClass}`}>
          {items.map((s, i) => {
            const Icon = iconPool[i % iconPool.length];
            return (
              <div key={`${s.label}-${i}`} className="flex items-center gap-4 px-6 py-7">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/5 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-display text-lg font-bold text-primary">{s.value}</div>
                  <div className="mt-1 text-xs font-semibold leading-relaxed text-primary/70">
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
