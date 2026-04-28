import { Save, LayoutTemplate } from "lucide-react";
import { useSettingsState } from "@/hooks/useSettingsState";

const defaults = {
  description: "",
  copyright: "",
  col1_title: "",
  col1_links: "",
  col2_title: "",
  col2_links: "",
  col3_title: "",
  col3_links: "",
};

export function FooterForm() {
  const { values, update, save, saving } = useSettingsState("footer", defaults);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Footer Website</h1>
          <p className="mt-1 text-muted-foreground">Deskripsi, navigasi footer, dan copyright.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {/* Main */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutTemplate className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">Konten Utama</div>
              <div className="text-xs text-muted-foreground">Deskripsi dan copyright di footer</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Deskripsi Footer</label>
              <textarea
                value={String(values.description ?? "")}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Deskripsi singkat kampus yang tampil di footer..."
                rows={3}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Copyright</label>
              <input
                type="text"
                value={String(values.copyright ?? "")}
                onChange={(e) => update("copyright", e.target.value)}
                placeholder="© 2025 Universitas Perintis Indonesia. All rights reserved."
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Columns */}
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-xs font-semibold text-muted-foreground mb-4">KOLOM NAVIGASI FOOTER</p>
          <p className="text-xs text-muted-foreground mb-4">
            Masukkan link per baris dengan format: <code className="bg-muted px-1 rounded">Label | /url</code>
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((col) => (
              <div key={col} className="space-y-2">
                <label className="text-sm font-medium">Judul Kolom {col}</label>
                <input
                  type="text"
                  value={String(values[`col${col}_title`] ?? "")}
                  onChange={(e) => update(`col${col}_title`, e.target.value)}
                  placeholder={col === 1 ? "Akademik" : col === 2 ? "Kampus" : "Lainnya"}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <textarea
                  value={String(values[`col${col}_links`] ?? "")}
                  onChange={(e) => update(`col${col}_links`, e.target.value)}
                  placeholder={"Program Studi | /akademik\nBeasiswa | /beasiswa"}
                  rows={4}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
