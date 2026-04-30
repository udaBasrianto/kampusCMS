import { Clock, MapPin, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEvents } from "@/hooks/useCampusData";

const MONTH_NAMES_ID = [
  "JAN", "FEB", "MAR", "APR", "MEI", "JUN",
  "JUL", "AGU", "SEP", "OKT", "NOV", "DES",
];

function parseEventDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: MONTH_NAMES_ID[d.getMonth()],
    year: d.getFullYear(),
  };
}

function formatTime(t: string) {
  if (!t) return "";
  // handle "HH:MM:SS" or "HH:MM"
  return t.slice(0, 5);
}

export function CampusEvents() {
  const { data: events = [] } = useEvents();

  if (events.length === 0) return null;

  const displayed = events.slice(0, 3);

  return (
    <section id="events" className="bg-white px-5 py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            Campus Events
          </h2>
          <div className="mt-2 h-1 w-full rounded-full bg-gradient-to-r from-gold via-gold to-transparent" />
        </div>

        {/* Cards Grid */}
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((event) => {
            const { day, month } = parseEventDate(event.event_date);
            const timeRange = `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`;
            return (
              <Link
                key={event.id}
                to="/events/$id"
                params={{ id: event.id }}
                className="group flex flex-col overflow-hidden rounded-xl transition-all hover:-translate-y-1"
              >
                {/* Poster Image */}
                <div className="aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <span className="text-sm">No Image</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex gap-4 pt-5">
                  {/* Date Block */}
                  <div className="flex flex-col items-center leading-none">
                    <span className="font-display text-3xl font-extrabold text-foreground">
                      {day}
                    </span>
                    <span className="mt-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                      {month}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1 border-l-2 border-gold pl-4">
                    <h3 className="font-display text-base font-bold leading-snug text-foreground">
                      {event.title}
                    </h3>
                    <div className="mt-2 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span>{timeRange}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer link */}
        <div className="mt-10">
          <a
            href="#events"
            className="inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors"
          >
            Lihat Semua Event <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
