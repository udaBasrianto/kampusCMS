import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Palette } from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import { useSiteSettings } from "@/hooks/useCampusData";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: "navy", label: "Navy (Default)", color: "bg-[#1E293B]" },
  { id: "emerald", label: "Emerald", color: "bg-[#059669]" },
  { id: "rose", label: "Rose", color: "bg-[#E11D48]" },
  { id: "amber", label: "Amber", color: "bg-[#D97706]" },
  { id: "violet", label: "Violet", color: "bg-[#7C3AED]" },
  { id: "ocean", label: "Ocean", color: "bg-[#0284C7]" },
];

export function ThemeSettingsForm() {
  const { data: settings } = useSiteSettings();
  const qc = useQueryClient();
  const [theme, setTheme] = useState("navy");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = settings?.site_theme as Record<string, unknown> | undefined;
    if (stored?.color && typeof stored.color === "string") {
      setTheme(stored.color);
    }
  }, [settings]);

  const save = async () => {
    setSaving(true);
    const { error } = await apiClient.updateSettings({ key: "site_theme", value: { color: theme } });
    setSaving(false);
    if (error) return toast.error("Gagal menyimpan tema");
    toast.success("Tema website berhasil diperbarui secara global!");
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Warna & Tema Website</h1>
          <p className="mt-1 text-muted-foreground">
            Ubah warna utama yang akan diterapkan ke seluruh halaman publik dan dashboard admin.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan Tema"}
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="mb-5 text-sm font-medium text-foreground flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          Pilih Palet Warna Global
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "group flex flex-col items-center justify-center gap-3 rounded-xl border-2 bg-background p-4 transition-all hover:border-primary/50",
                theme === t.id ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <div className={cn("h-10 w-10 rounded-full shadow-sm ring-2 ring-transparent ring-offset-2 transition-all", theme === t.id && "ring-primary", t.color)} />
              <span className={cn("text-xs font-semibold", theme === t.id ? "text-primary" : "text-muted-foreground")}>
                {t.label.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
