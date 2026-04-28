import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";
import { useBlogPosts, useFaculties } from "@/hooks/useCampusData";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/blog")({ component: Page });

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function Page() {
  const { isAdmin, assignedFacultyIds } = useAuth();
  const { data: allPosts = [] } = useBlogPosts(true);
  const { data: facultiesAll = [] } = useFaculties(true);
  const faculties = isAdmin
    ? facultiesAll
    : facultiesAll.filter((f) => assignedFacultyIds.includes(f.id));
  // Faculty admin hanya lihat post yang faculty_id-nya di assignment-nya
  const data = isAdmin
    ? allPosts
    : allPosts.filter((p) => p.faculty_id && assignedFacultyIds.includes(p.faculty_id as string));
  const facultyOptions = isAdmin
    ? [
        { label: "— Umum (tanpa fakultas) —", value: "" },
        ...faculties.map((f) => ({ label: `${f.code} — ${f.name}`, value: f.id })),
      ]
    : faculties.map((f) => ({ label: `${f.code} — ${f.name}`, value: f.id }));
  return (
    <CrudTable
      title="Blog Posts"
      description="Tulis & kelola artikel blog. Status 'published' otomatis tampil di /blog."
      table="blog_posts"
      queryKey="blog_posts"
      uploadFolder="blog"
      rows={data}
      defaults={{
        slug: "",
        title: "",
        excerpt: "",
        content: "",
        cover_image_url: "",
        category: "Umum",
        tags: [],
        author_name: "Admin",
        status: "draft",
        seo_title: "",
        seo_description: "",
      }}
      transformBeforeSave={(v) => ({
        ...v,
        slug: v.slug || slugify(String(v.title ?? "")),
        published_at:
          v.status === "published" && !v.published_at ? new Date().toISOString() : v.published_at,
        faculty_id: v.faculty_id || null,
      })}
      fields={[
        { name: "title", label: "Judul", type: "text", required: true },
        {
          name: "slug",
          label: "Slug (URL)",
          type: "text",
          placeholder: "kosongkan untuk otomatis",
        },
        { name: "category", label: "Kategori", type: "text", required: true },
        { name: "tags", label: "Tag (pisah koma)", type: "tags" },
        { name: "author_name", label: "Penulis", type: "text", required: true },
        { name: "cover_image_url", label: "Gambar Sampul", type: "image", required: true },
        { name: "excerpt", label: "Ringkasan", type: "textarea", required: true },
        { name: "content", label: "Isi Konten (Markdown)", type: "richtext", required: true },
        {
          name: "faculty_id",
          label: "Fakultas (opsional, untuk filter di mini-site)",
          type: "select",
          options: facultyOptions,
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
          ],
        },
        { name: "seo_title", label: "SEO Title", type: "text" },
        { name: "seo_description", label: "SEO Description", type: "textarea" },
      ]}
      renderRow={(r) => (
        <div className="flex items-center gap-3">
          {r.cover_image_url ? (
            <img src={r.cover_image_url} alt="" className="h-14 w-20 rounded-md object-cover" />
          ) : (
            <div className="h-14 w-20 rounded-md bg-muted" />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`rounded-full px-2 py-0.5 font-semibold uppercase ${r.status === "published" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}
              >
                {r.status}
              </span>
              <span className="text-muted-foreground">{r.category}</span>
            </div>
            <div className="mt-1 font-display font-semibold truncate">{r.title}</div>
            <div className="text-xs text-muted-foreground">
              /{r.slug} · oleh {r.author_name}
            </div>
            <div className="mt-2">
              <a 
                href={`/blog/${r.slug}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                Lihat Detail Artikel ↗
              </a>
            </div>
          </div>
        </div>
      )}
    />
  );
}
