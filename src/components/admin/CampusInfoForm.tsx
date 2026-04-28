import { Save, Building2 } from "lucide-react";
import { useSettingsState } from "@/hooks/useSettingsState";

const defaults = {
  name: "Universitas Perintis Indonesia",
  short_name: "UNPRI",
  tagline: "Berilmu, Berakhlak, Bermanfaat",
  motto: "Ilmu, Iman, Amal",
  established_year: "1985",
};

const fields = [
  { key: "name", label: "Nama Lengkap Kampus", placeholder: "Universitas ..." },
  { key: "short_name", label: "Nama Singkat / Akronim", placeholder: "UNPRI" },
  { key: "tagline", label: "Tagline", placeholder: "Berilmu, Berakhlak, Bermanfaat" },
  { key: "motto", label: "Motto", placeholder: "Ilmu, Iman, Amal" },
  { key: "established_year", label: "Tahun Berdiri", placeholder: "1985" },
];

export function CampusInfoForm() {
  const { values, update, save, saving } = useSettingsState("campus_info", defaults);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Informasi Kampus</h1>
          <p className="mt-1 text-muted-foreground">Nama, tagline, motto, dan tahun berdiri.</p>
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
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">Profil Kampus</div>
            <div className="text-xs text-muted-foreground">Informasi dasar yang tampil di seluruh website</div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className={f.key === "name" ? "sm:col-span-2" : ""}>
              <label className="text-sm font-medium">{f.label}</label>
              <input
                type="text"
                value={String(values[f.key] ?? "")}
                onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
