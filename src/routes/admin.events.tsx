import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";
import { useEvents } from "@/hooks/useCampusData";

export const Route = createFileRoute("/admin/events")({ component: Page });

function Page() {
  const { data = [] } = useEvents();
  return (
    <CrudTable
      title="Campus Events"
      description="Kelola event kampus yang tampil di halaman beranda."
      table="campus_events"
      queryKey="campus_events"
      uploadFolder="events"
      rows={data}
      defaults={{
        title: "",
        description: "",
        image_url: "",
        event_date: new Date().toISOString().slice(0, 10),
        start_time: "08:00",
        end_time: "17:00",
        location: "",
        map_coordinates: "",
        active: true,
        sort_order: 0,
      }}
      fields={[
        { name: "title", label: "Judul Event", type: "text", required: true },
        { name: "description", label: "Deskripsi", type: "textarea" },
        { name: "event_date", label: "Tanggal Event", type: "date", required: true },
        { name: "start_time", label: "Jam Mulai", type: "text", placeholder: "08:00" },
        { name: "end_time", label: "Jam Selesai", type: "text", placeholder: "17:00" },
        { name: "location", label: "Lokasi", type: "text", placeholder: "Aula Kampus" },
        { name: "map_coordinates", label: "Koordinat Peta (Opsional)", type: "text", placeholder: "-0.8971, 100.3507" },
        { name: "image_url", label: "Poster / Gambar", type: "image", required: true },
        { name: "active", label: "Aktif", type: "boolean" },
        { name: "sort_order", label: "Urutan", type: "number" },
      ]}
      renderRow={(r) => (
        <div className="flex items-center gap-3">
          <img src={r.image_url} alt="" className="h-14 w-20 rounded-md object-cover" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-accent font-semibold">
                {r.event_date?.slice(0, 10)}
              </span>
              {r.location && (
                <span className="text-muted-foreground truncate">{r.location}</span>
              )}
            </div>
            <div className="mt-1 font-display font-semibold truncate">{r.title}</div>
          </div>
        </div>
      )}
    />
  );
}
