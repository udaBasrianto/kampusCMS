import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import { useSiteSettings } from "@/hooks/useCampusData";

type StatItem = { label: string; value: string };

const defaultItems: StatItem[] = [
  { label: "Cabang Kampus", value: "3" },
  { label: "Fakultas", value: "4" },
  { label: "Mahasiswa & Alumni", value: "1000+" },
];

export function StatsSettingsForm() {
  const { data: settings } = useSiteSettings();
  const qc = useQueryClient();
  const [items, setItems] = useState<StatItem[]>(defaultItems);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = settings?.stats as Record<string, unknown> | undefined;
    if (stored?.items && Array.isArray(stored.items)) {
      setItems(stored.items as StatItem[]);
    }
  }, [settings]);

  const updateItem = useCallback((index: number, key: keyof StatItem, val: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: val } : item)));
  }, []);

  const addItem = () => setItems((prev) => [...prev, { label: "", value: "" }]);

  const removeItem = (index: number) => {
    if (items.length <= 1) return toast.error("Minimal harus ada 1 statistik");
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    const invalid = items.some((i) => !i.label.trim() || !i.value.trim());
    if (invalid) return toast.error("Semua field harus diisi");
    setSaving(true);
    const { error } = await apiClient.updateSettings({ key: "stats", value: { items } });
    setSaving(false);
    if (error) return toast.error("Gagal menyimpan");
    toast.success("Statistik berhasil diperbarui");
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Statistik Kampus</h1>
          <p className="mt-1 text-muted-foreground">
            Data statistik yang tampil di bar bawah hero slider.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-soft"
          >
            <GripVertical className="h-4 w-4 flex-none text-muted-foreground/40" />
            <div className="flex flex-1 gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Nilai / Angka</label>
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => updateItem(i, "value", e.target.value)}
                  placeholder="cth: 15.000+"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 font-display text-lg font-bold text-primary placeholder:text-sm placeholder:font-normal"
                />
              </div>
              <div className="flex-[2]">
                <label className="text-xs font-medium text-muted-foreground">Label / Keterangan</label>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateItem(i, "label", e.target.value)}
                  placeholder="cth: Mahasiswa & Alumni"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <button
              onClick={() => removeItem(i)}
              className="flex-none rounded-lg p-2 text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Hapus"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
      >
        <Plus className="h-4 w-4" /> Tambah Statistik Baru
      </button>
    </div>
  );
}
