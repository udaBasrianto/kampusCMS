import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";
import { usePages } from "@/hooks/useCampusData";

export const Route = createFileRoute("/admin/pages")({ component: Page });

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function Page() {
  const { data = [] } = usePages(true);
  return (
    <CrudTable
      title="Halaman Dinamis"
      description="Kelola halaman seperti Tentang, Penerimaan, Kontak, dll. Tampil di /halaman/[slug]."
      table="pages"
      queryKey="pages"
      uploadFolder="pages"
      rows={data}
      defaults={{
        slug: "",
        title: "",
        subtitle: "",
        cover_image_url: "",
        content: "",
        seo_title: "",
        seo_description: "",
        published: true,
        sort_order: 0,
      }}
      transformBeforeSave={(v) => ({ ...v, slug: v.slug || slugify(String(v.title ?? "")) })}
      fields={[
        { name: "title", label: "Judul Halaman", type: "text", required: true },
        {
          name: "slug",
          label: "Slug (URL)",
          type: "text",
          placeholder: "tentang, penerimaan, kontak...",
        },
        { name: "subtitle", label: "Subjudul", type: "text" },
        { name: "cover_image_url", label: "Gambar Sampul", type: "image" },
        { name: "content", label: "Konten (Markdown)", type: "richtext", required: true },
        { name: "seo_title", label: "SEO Title", type: "text" },
        { name: "seo_description", label: "SEO Description", type: "textarea" },
        { name: "sort_order", label: "Urutan di menu", type: "number" },
        { name: "published", label: "Dipublikasikan", type: "boolean" },
      ]}
      renderRow={(r) => (
        <div className="flex items-center gap-3">
          {r.cover_image_url ? (
            <img src={r.cover_image_url} alt="" className="h-14 w-20 rounded-md object-cover" />
          ) : (
            <div className="h-14 w-20 rounded-md bg-muted" />
          )}
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">/halaman/{r.slug}</div>
            <div className="mt-0.5 font-display font-semibold truncate">{r.title}</div>
            <div className="text-xs text-muted-foreground truncate">{r.subtitle}</div>
          </div>
        </div>
      )}
      activeField="published"
    />
  );
}
