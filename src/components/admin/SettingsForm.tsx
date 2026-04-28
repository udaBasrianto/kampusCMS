import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import { useSiteSettings } from "@/hooks/useCampusData";

type Props = {
  settingKey: string;
  title: string;
  description: string;
  defaultValue: Record<string, unknown>;
  helpText?: string;
};

export function SettingsForm({ settingKey, title, description, defaultValue, helpText }: Props) {
  const { data } = useSiteSettings();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const value = data?.[settingKey] ?? defaultValue;
    setText(JSON.stringify(value, null, 2));
  }, [data, settingKey, defaultValue]);

  const save = async () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return toast.error("JSON tidak valid. Periksa format Anda.");
    }
    setSaving(true);
    const { error } = await apiClient.updateSettings({
      key: settingKey,
      value: parsed,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Tersimpan");
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
      {helpText && (
        <p className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          {helpText}
        </p>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={24}
        spellCheck={false}
        className="mt-4 w-full rounded-xl border border-input bg-card p-4 font-mono text-xs leading-relaxed"
      />
    </div>
  );
}
