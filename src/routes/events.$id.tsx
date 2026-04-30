import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, MapPin, Share2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { LeafletMap } from "@/components/site/LeafletMap";
import { useEvent, useEvents } from "@/hooks/useCampusData";

const MONTH_NAMES_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const MONTH_SHORT = [
  "JAN", "FEB", "MAR", "APR", "MEI", "JUN",
  "JUL", "AGU", "SEP", "OKT", "NOV", "DES",
];

function fmtFullDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTH_NAMES_ID[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtTime(t: string) {
  if (!t) return "";
  return t.slice(0, 5);
}

function parseDateParts(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: MONTH_SHORT[d.getMonth()],
  };
}

export const Route = createFileRoute("/events/$id")({
  component: EventDetailPage,
});

function EventDetailPage() {
  const { id } = Route.useParams();
  const { data: event, isLoading } = useEvent(id);
  const { data: allEvents = [] } = useEvents();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Memuat...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="px-5 pb-24 pt-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-3xl font-bold">Event tidak ditemukan</h1>
            <p className="mt-3 text-muted-foreground">
              Event yang Anda cari mungkin telah berakhir atau dihapus.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 text-accent hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const otherEvents = allEvents.filter((e) => e.id !== event.id).slice(0, 3);
  const timeRange = `${fmtTime(event.start_time)} - ${fmtTime(event.end_time)} WIB`;

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: event.title, url });
      else await navigator.clipboard.writeText(url);
    } catch { /* dismissed */ }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-24 pt-28 lg:pt-32">
        {/* Back link */}
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        </div>

        {/* Hero poster */}
        {event.image_url && (
          <div className="mx-auto mt-6 max-w-5xl px-5 lg:px-8">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full rounded-2xl object-cover shadow-soft"
              style={{ maxHeight: 480 }}
            />
          </div>
        )}

        {/* Content */}
        <div className="mx-auto mt-10 max-w-3xl px-5 lg:px-8">
          {/* Title */}
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
            {event.title}
          </h1>

          {/* Meta info cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {/* Date */}
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tanggal
                </div>
                <div className="font-display font-bold">
                  {fmtFullDate(event.event_date)}
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold/15 text-gold-foreground">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Waktu
                </div>
                <div className="font-display font-bold">{timeRange}</div>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Lokasi
                  </div>
                  <div className="font-display font-bold">{event.location}</div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-bold">Tentang Event</h2>
              <div className="mt-4 leading-relaxed text-muted-foreground whitespace-pre-line">
                {event.description}
              </div>
            </div>
          )}

          {/* Location Map */}
          {event.location && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-bold mb-4">Peta Lokasi</h2>
              <LeafletMap locationString={event.location} mapCoordinates={event.map_coordinates} />
            </div>
          )}

          {/* Share */}
          <div className="mt-10 flex items-center gap-3 border-t border-border pt-6">
            <button
              onClick={onShare}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:border-accent/40 hover:text-accent"
            >
              <Share2 className="h-4 w-4" /> Bagikan Event
            </button>
          </div>
        </div>

        {/* Other events */}
        {otherEvents.length > 0 && (
          <section className="mx-auto mt-20 max-w-7xl px-5 lg:px-8">
            <div className="border-t border-border pt-12">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                Lainnya
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold lg:text-3xl">
                Event Lainnya
              </h2>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otherEvents.map((ev) => {
                const { day, month } = parseDateParts(ev.event_date);
                return (
                  <Link
                    key={ev.id}
                    to="/events/$id"
                    params={{ id: ev.id }}
                    className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-elevated"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      {ev.image_url && (
                        <img
                          src={ev.image_url}
                          alt={ev.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="flex gap-4 p-5">
                      <div className="flex flex-col items-center leading-none">
                        <span className="font-display text-2xl font-extrabold text-foreground">
                          {day}
                        </span>
                        <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                          {month}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 border-l-2 border-gold pl-3">
                        <h3 className="font-display text-sm font-bold leading-snug">
                          {ev.title}
                        </h3>
                        {ev.location && (
                          <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {ev.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
