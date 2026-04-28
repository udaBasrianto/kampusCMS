import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";
import { useHeroSlides } from "@/hooks/useCampusData";

export const Route = createFileRoute("/admin/hero")({ component: Page });

function Page() {
  const { data = [] } = useHeroSlides(true);
  return (
    <CrudTable
      title="Hero Slider"
      description="Slide besar di bagian atas landing page."
      table="hero_slides"
      queryKey="hero_slides"
      uploadFolder="hero"
      rows={data}
      defaults={{
        eyebrow: "",
        title: "",
        description: "",
        image_url: "",
        cta_primary_label: "Pelajari",
        cta_primary_href: "/",
        cta_secondary_label: "Hubungi",
        cta_secondary_href: "/",
        sort_order: 0,
      }}
      fields={[
        { name: "eyebrow", label: "Label kecil (eyebrow)", type: "text", required: true },
        { name: "title", label: "Judul", type: "text", required: true },
        { name: "description", label: "Deskripsi", type: "textarea", required: true },
        { name: "image_url", label: "Gambar background", type: "image", required: true },
        { name: "cta_primary_label", label: "Tombol Utama (label)", type: "text", required: true },
        { name: "cta_primary_href", label: "Tombol Utama (link)", type: "text", required: true },
        {
          name: "cta_secondary_label",
          label: "Tombol Kedua (label)",
          type: "text",
          required: true,
        },
        { name: "cta_secondary_href", label: "Tombol Kedua (link)", type: "text", required: true },
        { name: "sort_order", label: "Urutan", type: "number" },
        { name: "active", label: "Aktif (tampilkan)", type: "boolean" },
      ]}
      renderRow={(r) => (
        <div className="flex items-center gap-3">
          <img src={r.image_url} alt="" className="h-14 w-20 rounded-md object-cover" />
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase text-accent">{r.eyebrow}</div>
            <div className="font-display font-semibold truncate">{r.title}</div>
          </div>
        </div>
      )}
    />
  );
}
