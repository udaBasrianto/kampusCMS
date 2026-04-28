import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";
import { useNews } from "@/hooks/useCampusData";

export const Route = createFileRoute("/admin/news")({ component: Page });

function Page() {
  const { data = [] } = useNews(true);
  return (
    <CrudTable
      title="Berita & Event"
      description="Kabar terbaru kampus. Centang 'Featured' untuk tampil sebagai berita utama."
      table="news"
      queryKey="news"
      uploadFolder="news"
      rows={data}
      defaults={{
        category: "",
        title: "",
        excerpt: "",
        date: new Date().toISOString().slice(0, 10),
        image_url: "",
        featured: false,
      }}
      fields={[
        {
          name: "category",
          label: "Kategori",
          type: "text",
          required: true,
          placeholder: "Prestasi / Wisuda / Akademik",
        },
        { name: "title", label: "Judul", type: "text", required: true },
        { name: "excerpt", label: "Ringkasan", type: "textarea", required: true },
        { name: "date", label: "Tanggal", type: "date", required: true },
        { name: "image_url", label: "Gambar", type: "image", required: true },
        { name: "featured", label: "Featured (berita utama)", type: "boolean" },
        { name: "active", label: "Aktif", type: "boolean" },
      ]}
      renderRow={(r) => (
        <div className="flex items-center gap-3">
          <img src={r.image_url} alt="" className="h-14 w-20 rounded-md object-cover" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-accent font-semibold uppercase">
                {r.category}
              </span>
              {r.featured && (
                <span className="rounded-full bg-gold/20 px-2 py-0.5 text-gold-foreground font-semibold">
                  Featured
                </span>
              )}
            </div>
            <div className="mt-1 font-display font-semibold truncate">{r.title}</div>
          </div>
        </div>
      )}
    />
  );
}
