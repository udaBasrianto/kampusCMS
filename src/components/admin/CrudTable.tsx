import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X, Upload } from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import { uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";

type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "image"
  | "boolean"
  | "date"
  | "select"
  | "tags"
  | "list-items"
  | "key-value";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  subFields?: { key: string; label: string; placeholder?: string }[];
};

type AnyRow = {
  id: string;
  active?: boolean | null;
  published?: boolean | null;
  [k: string]: unknown;
};

type Props<T extends AnyRow> = {
  title: string;
  description: string;
  table: string;
  queryKey: string;
  uploadFolder: string;
  rows: T[];
  fields: FieldDef[];
  defaults: Partial<T>;
  renderRow: (row: T) => React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformBeforeSave?: (v: any) => any;
  activeField?: "active" | "published";
};

export function CrudTable<T extends AnyRow>({
  title,
  description,
  table,
  queryKey,
  uploadFolder,
  rows,
  fields,
  defaults,
  renderRow,
  transformBeforeSave,
  activeField = "active",
}: Props<T>) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const close = () => setEditing(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let payload: Record<string, unknown> = { ...editing };
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;
      if (transformBeforeSave) payload = transformBeforeSave(payload);

      if ("id" in editing! && editing.id) {
        const { error } = await apiClient.saveRow(table, payload, editing.id as string);
        if (error) throw new Error(error);
        toast.success("Berhasil diperbarui");
      } else {
        const { error } = await apiClient.saveRow(table, payload);
        if (error) throw new Error(error);
        toast.success("Berhasil ditambahkan");
      }
      qc.invalidateQueries({ queryKey: [queryKey] });
      close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus item ini?")) return;
    const { error } = await apiClient.deleteRow(table, id);
    if (error) return toast.error(error);
    toast.success("Berhasil dihapus");
    qc.invalidateQueries({ queryKey: [queryKey] });
  };

  const handleUpload = async (field: string, file: File) => {
    setUploadingField(field);
    try {
      const url = await uploadImage(file, uploadFolder);
      setEditing((prev) => ({ ...prev, [field]: url }) as Partial<T>);
      toast.success("Gambar terunggah");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal upload");
    } finally {
      setUploadingField(null);
    }
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
        <button
          onClick={() => setEditing({ ...defaults, [activeField]: true } as Partial<T>)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Tambah
        </button>
      </div>

      <div className="mt-8 grid gap-3">
        {rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Belum ada data.
          </div>
        )}
        {rows.map((row) => {
          const isInactive = row[activeField] === false;
          return (
            <div
              key={row.id}
              className={cn(
                "flex items-center gap-4 rounded-xl border border-border bg-card p-4",
                isInactive && "opacity-60",
              )}
            >
              <div className="flex-1 min-w-0">{renderRow(row)}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(row)}
                  className="rounded-lg p-2 text-foreground hover:bg-muted"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(row.id)}
                  className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                  aria-label="Hapus"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={close}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={save}
            className="w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl bg-card p-6 shadow-elevated"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">
                {editing && "id" in editing && editing.id ? "Edit" : "Tambah"} {title}
              </h2>
              <button type="button" onClick={close} className="rounded-lg p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              {fields.map((f) => {
                const value = (editing as Record<string, unknown>)[f.name];
                if (f.type === "textarea" || f.type === "richtext") {
                  return (
                    <div key={f.name}>
                      <label className="text-sm font-medium">
                        {f.label}
                        {f.type === "richtext" && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (Markdown didukung: # judul, **tebal**, [link](url), - list)
                          </span>
                        )}
                      </label>
                      <textarea
                        required={f.required}
                        value={(value as string) ?? ""}
                        onChange={(e) =>
                          setEditing({ ...editing, [f.name]: e.target.value } as Partial<T>)
                        }
                        rows={f.type === "richtext" ? 12 : 3}
                        className={cn(
                          "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
                          f.type === "richtext" && "font-mono",
                        )}
                      />
                    </div>
                  );
                }
                if (f.type === "tags") {
                  const arr = Array.isArray(value) ? (value as string[]) : [];
                  return (
                    <div key={f.name}>
                      <label className="text-sm font-medium">{f.label}</label>
                      <input
                        value={arr.join(", ")}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            [f.name]: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          } as Partial<T>)
                        }
                        placeholder="tag1, tag2, tag3"
                        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  );
                }
                if (f.type === "select") {
                  return (
                    <div key={f.name}>
                      <label className="text-sm font-medium">{f.label}</label>
                      <select
                        required={f.required}
                        value={(value as string) ?? ""}
                        onChange={(e) =>
                          setEditing({ ...editing, [f.name]: e.target.value } as Partial<T>)
                        }
                        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">{f.placeholder || "-- Pilih --"}</option>
                        {f.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
                if (f.type === "boolean") {
                  return (
                    <label key={f.name} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) =>
                          setEditing({ ...editing, [f.name]: e.target.checked } as Partial<T>)
                        }
                      />
                      <span className="text-sm font-medium">{f.label}</span>
                    </label>
                  );
                }
                if (f.type === "image") {
                  return (
                    <div key={f.name}>
                      <label className="text-sm font-medium">{f.label}</label>
                      <div className="mt-1 flex items-center gap-3">
                        {value ? (
                          <img
                            src={value as string}
                            alt=""
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-muted" />
                        )}
                        <label className="inline-flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm cursor-pointer hover:bg-muted">
                          <Upload className="h-4 w-4" />
                          {uploadingField === f.name ? "Uploading..." : "Upload Gambar"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              e.target.files?.[0] && handleUpload(f.name, e.target.files[0])
                            }
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={(value as string) ?? ""}
                        onChange={(e) =>
                          setEditing({ ...editing, [f.name]: e.target.value } as Partial<T>)
                        }
                        placeholder="atau paste URL gambar"
                        className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                      />
                    </div>
                  );
                }
                if (f.type === "list-items") {
                  const items = Array.isArray(value) ? (value as Record<string, string>[]) : [];
                  const subs = f.subFields ?? [{ key: "name", label: "Nama" }, { key: "description", label: "Deskripsi" }];
                  const updateListItem = (idx: number, key: string, val: string) => {
                    const next = items.map((item, i) => (i === idx ? { ...item, [key]: val } : item));
                    setEditing({ ...editing, [f.name]: next } as Partial<T>);
                  };
                  const addListItem = () => {
                    const empty: Record<string, string> = {};
                    subs.forEach((s) => { empty[s.key] = ""; });
                    setEditing({ ...editing, [f.name]: [...items, empty] } as Partial<T>);
                  };
                  const removeListItem = (idx: number) => {
                    setEditing({ ...editing, [f.name]: items.filter((_, i) => i !== idx) } as Partial<T>);
                  };
                  return (
                    <div key={f.name}>
                      <label className="text-sm font-medium">{f.label}</label>
                      <div className="mt-2 space-y-2">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex gap-2 items-start rounded-lg border border-input bg-background p-3">
                            <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${subs.length}, 1fr)` }}>
                              {subs.map((s) => (
                                <input
                                  key={s.key}
                                  type="text"
                                  value={item[s.key] ?? ""}
                                  onChange={(e) => updateListItem(idx, s.key, e.target.value)}
                                  placeholder={s.placeholder ?? s.label}
                                  className="w-full rounded border border-input bg-card px-2 py-1.5 text-xs"
                                />
                              ))}
                            </div>
                            <button type="button" onClick={() => removeListItem(idx)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addListItem}
                        className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-input px-3 py-2 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary"
                      >
                        <Plus className="h-3 w-3" /> Tambah Item
                      </button>
                    </div>
                  );
                }
                if (f.type === "key-value") {
                  const obj = (value && typeof value === "object" && !Array.isArray(value))
                    ? (value as Record<string, string>)
                    : {};
                  const subs = f.subFields ?? [];
                  const updateKV = (key: string, val: string) => {
                    setEditing({ ...editing, [f.name]: { ...obj, [key]: val } } as Partial<T>);
                  };
                  return (
                    <div key={f.name}>
                      <label className="text-sm font-medium">{f.label}</label>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2 rounded-lg border border-input bg-background p-3">
                        {subs.map((s) => (
                          <div key={s.key}>
                            <label className="text-xs text-muted-foreground">{s.label}</label>
                            <input
                              type="text"
                              value={obj[s.key] ?? ""}
                              onChange={(e) => updateKV(s.key, e.target.value)}
                              placeholder={s.placeholder ?? s.label}
                              className="mt-1 w-full rounded border border-input bg-card px-2 py-1.5 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                if (f.type === "select") {
                  return (
                    <div key={f.name}>
                      <label className="text-sm font-medium">{f.label}</label>
                      <select
                        required={f.required}
                        value={(value as string) ?? ""}
                        onChange={(e) =>
                          setEditing({ ...editing, [f.name]: e.target.value } as Partial<T>)
                        }
                        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">-- pilih --</option>
                        {f.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
                return (
                  <div key={f.name}>
                    <label className="text-sm font-medium">{f.label}</label>
                    <input
                      required={f.required}
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      value={(value as string | number) ?? ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value,
                        } as Partial<T>)
                      }
                      placeholder={f.placeholder}
                      className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-lg border border-input px-4 py-2 text-sm hover:bg-muted"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
