import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Navigation, Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import { useSiteSettings } from "@/hooks/useCampusData";

type NavLink = { label: string; href: string };

const defaultLinks: NavLink[] = [
  { label: "Beranda", href: "/" },
  { label: "Tentang Kami", href: "/halaman/tentang" },
  { label: "Fakultas", href: "/fakultas" },
  { label: "Blog", href: "/blog" },
];

export function HeaderForm() {
  const { data: settings } = useSiteSettings();
  const qc = useQueryClient();
  const [links, setLinks] = useState<NavLink[]>(defaultLinks);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = settings?.header as Record<string, unknown> | undefined;
    
    // Check if it's stored in the new array format
    if (stored?.items && Array.isArray(stored.items)) {
      setLinks(stored.items as NavLink[]);
    } else if (stored?.links && typeof stored.links === "string") {
      // Migrate from old string format
      const parsed = stored.links.split("\n").map(line => {
        const [label, href] = line.split("|").map(s => s.trim());
        return { label, href: href || "/" };
      }).filter(n => n.label);
      if (parsed.length > 0) setLinks(parsed);
    }
  }, [settings]);

  const updateLink = useCallback((index: number, key: keyof NavLink, val: string) => {
    setLinks((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: val } : item)));
  }, []);

  const addLink = () => setLinks((prev) => [...prev, { label: "", href: "/" }]);

  const removeLink = (index: number) => {
    if (links.length <= 1) return toast.error("Minimal harus ada 1 menu navigasi");
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setLinks((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const moveDown = (index: number) => {
    if (index === links.length - 1) return;
    setLinks((prev) => {
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  };

  const save = async () => {
    const invalid = links.some((i) => !i.label.trim() || !i.href.trim());
    if (invalid) return toast.error("Semua field label dan link harus diisi");
    
    setSaving(true);
    const { error } = await apiClient.updateSettings({ key: "header", value: { items: links } });
    setSaving(false);
    
    if (error) return toast.error("Gagal menyimpan");
    toast.success("Menu header berhasil diperbarui");
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Menu Header</h1>
          <p className="mt-1 text-muted-foreground">Atur navigasi utama yang tampil di bagian atas website.</p>
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
        {links.map((link, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-soft"
          >
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => moveUp(i)} 
                disabled={i === 0}
                className="p-1 text-muted-foreground hover:bg-muted rounded disabled:opacity-30"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => moveDown(i)} 
                disabled={i === links.length - 1}
                className="p-1 text-muted-foreground hover:bg-muted rounded disabled:opacity-30"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>
            
            <div className="flex flex-1 gap-4">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Label Menu</label>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateLink(i, "label", e.target.value)}
                  placeholder="cth: Tentang Kami"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">URL Tujuan</label>
                <input
                  type="text"
                  value={link.href}
                  onChange={(e) => updateLink(i, "href", e.target.value)}
                  placeholder="cth: /halaman/tentang"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>
            
            <button
              onClick={() => removeLink(i)}
              className="flex-none rounded-lg p-2 text-destructive hover:bg-destructive/10 transition-colors ml-2"
              aria-label="Hapus menu"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          onClick={addLink}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-semibold text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" /> Tambah Menu Baru
        </button>
      </div>
    </div>
  );
}
