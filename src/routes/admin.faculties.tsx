import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";
import { useFaculties } from "@/hooks/useCampusData";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/faculties")({ component: Page });

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function Page() {
  const { isAdmin, assignedFacultyIds } = useAuth();
  const { data: all = [] } = useFaculties(true);
  const data = isAdmin ? all : all.filter((f) => assignedFacultyIds.includes(f.id));
  return (
    <CrudTable
      title="Fakultas (Mini-site)"
      description="Setiap fakultas memiliki halaman publik di /fakultas/[slug]. Semua data di sini tampil langsung di halaman detail fakultas."
      table="faculties"
      queryKey="faculties"
      uploadFolder="faculties"
      rows={data}
      defaults={{
        code: "",
        name: "",
        slug: "",
        description: "",
        programs: 0,
        accent: "navy",
        sort_order: 0,
        cover_image_url: "",
        about_content: "",
        vision: "",
        mission: "",
        hero_eyebrow: "",
        hero_title: "",
        hero_description: "",
        facilities: [],
        contact_info: { address: "", email: "", phone: "" },
      }}
      transformBeforeSave={(v) => ({
        ...v,
        slug: v.slug || slugify(String(v.code ?? v.name ?? "")),
      })}
      fields={[
        // ── Identitas ──
        { name: "code", label: "Kode (mis. FT, FK)", type: "text", required: true },
        { name: "name", label: "Nama Fakultas", type: "text", required: true },
        {
          name: "slug",
          label: "Slug URL (kosongkan untuk otomatis)",
          type: "text",
          placeholder: "ft, feb, fk...",
        },
        {
          name: "description",
          label: "Deskripsi Singkat (tampil di kartu beranda)",
          type: "textarea",
          required: true,
        },
        { name: "programs", label: "Jumlah Program Studi", type: "number" },
        {
          name: "accent",
          label: "Warna Aksen",
          type: "select",
          required: true,
          options: [
            { label: "Navy (biru tua)", value: "navy" },
            { label: "Cobalt (biru)", value: "cobalt" },
            { label: "Gold (emas)", value: "gold" },
          ],
        },

        // ── Hero Section ──
        { name: "cover_image_url", label: "🖼️ Gambar Cover Hero", type: "image" },
        { name: "hero_eyebrow", label: "Hero — Label kecil (mis. 'Fakultas Teknik')", type: "text" },
        { name: "hero_title", label: "Hero — Judul (default: nama fakultas)", type: "text" },
        {
          name: "hero_description",
          label: "Hero — Deskripsi (default: deskripsi singkat)",
          type: "textarea",
        },

        // ── Tentang ──
        { name: "about_content", label: "📖 Konten 'Tentang Fakultas' (Markdown)", type: "richtext" },
        { name: "vision", label: "Visi", type: "textarea" },
        { name: "mission", label: "Misi (Markdown, gunakan - untuk poin)", type: "richtext" },

        // ── Fasilitas (dynamic list) ──
        {
          name: "facilities",
          label: "🏛️ Fasilitas (tambah/hapus item)",
          type: "list-items",
          subFields: [
            { key: "name", label: "Nama Fasilitas", placeholder: "Laboratorium Komputer" },
            { key: "description", label: "Deskripsi", placeholder: "Dilengkapi 40 unit PC terbaru" },
          ],
        },

        // ── Kontak Dekanat (structured) ──
        {
          name: "contact_info",
          label: "📞 Kontak Dekanat",
          type: "key-value",
          subFields: [
            { key: "address", label: "Alamat", placeholder: "Gedung A, Lt. 2" },
            { key: "email", label: "Email", placeholder: "dekan-ft@kampus.ac.id" },
            { key: "phone", label: "Telepon", placeholder: "(0751) 12345" },
          ],
        },

        // ── Pengaturan ──
        { name: "sort_order", label: "Urutan tampil", type: "number" },
        { name: "active", label: "Aktif (tampilkan di website)", type: "boolean" },
      ]}
      renderRow={(r) => (
        <div className="flex items-center gap-3">
          {r.cover_image_url ? (
            <img src={r.cover_image_url as string} alt="" className="h-12 w-12 rounded-lg object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm">
              {r.code}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-display font-semibold truncate">{r.name}</div>
            <div className="text-xs text-muted-foreground">
              /fakultas/{r.slug} · {r.programs} prodi
            </div>
          </div>
        </div>
      )}
    />
  );
}
