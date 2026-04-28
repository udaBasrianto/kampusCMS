import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";
import { useTestimonials } from "@/hooks/useCampusData";

export const Route = createFileRoute("/admin/testimonials")({ component: Page });

function Page() {
  const { data = [] } = useTestimonials(true);
  return (
    <CrudTable
      title="Testimoni Alumni"
      description="Cerita dari alumni untuk section Suara Alumni."
      table="testimonials"
      queryKey="testimonials"
      uploadFolder="alumni"
      rows={data}
      defaults={{ name: "", role: "", year: "", quote: "", image_url: "", sort_order: 0 }}
      fields={[
        { name: "name", label: "Nama", type: "text", required: true },
        { name: "role", label: "Jabatan / Pekerjaan", type: "text", required: true },
        {
          name: "year",
          label: "Tahun & Jurusan",
          type: "text",
          required: true,
          placeholder: "Alumni 2018, Informatika",
        },
        { name: "quote", label: "Kutipan", type: "textarea", required: true },
        { name: "image_url", label: "Foto", type: "image", required: true },
        { name: "sort_order", label: "Urutan", type: "number" },
        { name: "active", label: "Aktif", type: "boolean" },
      ]}
      renderRow={(r) => (
        <div className="flex items-center gap-3">
          <img src={r.image_url} alt={r.name} className="h-12 w-12 rounded-full object-cover" />
          <div className="min-w-0">
            <div className="font-display font-semibold truncate">{r.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {r.role} · {r.year}
            </div>
          </div>
        </div>
      )}
    />
  );
}
