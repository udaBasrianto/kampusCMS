import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/integrations/api/client";
import { useSiteSettings } from "@/hooks/useCampusData";

export function useSettingsState<T extends Record<string, unknown>>(
  settingKey: string,
  defaults: T,
) {
  const { data: allSettings } = useSiteSettings();
  const qc = useQueryClient();
  const [values, setValues] = useState<T>(defaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = allSettings?.[settingKey] as T | undefined;
    if (stored) {
      setValues({ ...defaults, ...stored });
    }
  }, [allSettings, settingKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback(
    (key: string, val: unknown) =>
      setValues((prev) => ({ ...prev, [key]: val })),
    [],
  );

  const save = useCallback(async () => {
    setSaving(true);
    const { error } = await apiClient.updateSettings({
      key: settingKey,
      value: values,
    });
    setSaving(false);
    if (error) return toast.error("Gagal menyimpan");
    toast.success("Berhasil disimpan");
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  }, [settingKey, values, qc]);

  return { values, setValues, update, save, saving };
}
