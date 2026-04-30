import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Ticket, MapPin, Clock, ExternalLink } from "lucide-react";
import { useEvents } from "@/hooks/useCampusData";
import { LeafletMap } from "@/components/site/LeafletMap";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/events")({
  component: DashboardEvents,
});

function DashboardEvents() {
  const { data: events = [] } = useEvents();
  const [activeMapId, setActiveMapId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Menu Event</h1>
          <p className="mt-1 text-muted-foreground">Jelajahi jadwal dan lokasi event kampus yang akan datang.</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4 text-primary">
            <Ticket className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Belum Ada Event</h2>
          <p className="text-muted-foreground max-w-md">
            Saat ini belum ada event kampus yang tersedia.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <div key={event.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col md:flex-row">
              {event.image_url && (
                <div className="w-full md:w-64 h-48 md:h-auto bg-muted shrink-0">
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl font-bold">{event.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        <span>{new Date(event.event_date).toLocaleDateString("id-ID", { dateStyle: "long" })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)} WIB</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    to="/events/$id"
                    params={{ id: event.id }}
                    className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    title="Detail Event"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border mt-auto flex items-center gap-3">
                  <button
                    onClick={() => setActiveMapId(activeMapId === event.id ? null : event.id)}
                    className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5"
                  >
                    <MapPin className="h-4 w-4" />
                    {activeMapId === event.id ? "Tutup Peta Lokasi" : "Lihat Peta Lokasi"}
                  </button>
                </div>

                {activeMapId === event.id && event.location && (
                  <div className="mt-4 w-full">
                    <LeafletMap locationString={event.location} mapCoordinates={event.map_coordinates} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
