import { Save, Megaphone } from "lucide-react";
import { useSettingsState } from "@/hooks/useSettingsState";

const defaults = {
  eyebrow: "",
  title: "",
  description: "",
  cta_label: "",
  cta_href: "/",
  cta_secondary_label: "",
  cta_secondary_href: "/",
};

export function CtaBannerForm() {
  const { values, update, save, saving } = useSettingsState("cta_banner", defaults);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">CTA Banner</h1>
          <p className="mt-1 text-muted-foreground">Banner ajakan pendaftaran di bawah landing page.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">Konten Banner</div>
            <div className="text-xs text-muted-foreground">Teks dan tombol yang tampil di banner CTA</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Label Kecil (Eyebrow)</label>
            <input
              type="text"
              value={String(values.eyebrow ?? "")}
              onChange={(e) => update("eyebrow", e.target.value)}
              placeholder="cth: Pendaftaran Dibuka"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Judul Utama</label>
            <input
              type="text"
              value={String(values.title ?? "")}
              onChange={(e) => update("title", e.target.value)}
              placeholder="cth: Mulai Perjalanan Akademikmu"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Deskripsi</label>
            <textarea
              value={String(values.description ?? "")}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Deskripsi singkat banner..."
              rows={3}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
            />
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-3">TOMBOL AKSI</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Label Tombol Utama</label>
                <input
                  type="text"
                  value={String(values.cta_label ?? "")}
                  onChange={(e) => update("cta_label", e.target.value)}
                  placeholder="Daftar Sekarang"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Link Tombol Utama</label>
                <input
                  type="text"
                  value={String(values.cta_href ?? "")}
                  onChange={(e) => update("cta_href", e.target.value)}
                  placeholder="/pendaftaran"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Label Tombol Kedua</label>
                <input
                  type="text"
                  value={String(values.cta_secondary_label ?? "")}
                  onChange={(e) => update("cta_secondary_label", e.target.value)}
                  placeholder="Hubungi Kami"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Link Tombol Kedua</label>
                <input
                  type="text"
                  value={String(values.cta_secondary_href ?? "")}
                  onChange={(e) => update("cta_secondary_href", e.target.value)}
                  placeholder="/kontak"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
