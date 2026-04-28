import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { apiClient } from "@/integrations/api/client";

const schema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().trim().email("Email tidak valid").max(255),
  phone: z.string().trim().max(30, "Telepon maksimal 30 karakter").optional().or(z.literal("")),
  subject: z.string().trim().max(200, "Subjek maksimal 200 karakter").optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Pesan minimal 10 karakter")
    .max(2000, "Pesan maksimal 2000 karakter"),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const onChange =
    (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
    };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Partial<Record<keyof FormData, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof FormData;
        if (!errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      return toast.error("Periksa kembali isian form Anda.");
    }
    setSubmitting(true);
    const { error } = await apiClient.submitContact({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? "",
      subject: parsed.data.subject ?? "",
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (error) return toast.error("Gagal mengirim: " + error);
    toast.success("Pesan Anda terkirim. Terima kasih!");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const inputCls =
    "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:p-8"
    >
      <h2 className="font-display text-2xl font-bold">Kirim Pesan</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tim kami akan merespons dalam 1x24 jam kerja.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold">Nama Lengkap *</label>
          <input
            value={form.name}
            onChange={onChange("name")}
            className={inputCls}
            placeholder="Nama Anda"
          />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold">Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={onChange("email")}
            className={inputCls}
            placeholder="email@contoh.com"
          />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold">No. Telepon</label>
          <input
            value={form.phone}
            onChange={onChange("phone")}
            className={inputCls}
            placeholder="+62 ..."
          />
          {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold">Subjek</label>
          <input
            value={form.subject}
            onChange={onChange("subject")}
            className={inputCls}
            placeholder="Pertanyaan tentang..."
          />
          {errors.subject && <p className="mt-1 text-xs text-destructive">{errors.subject}</p>}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-semibold">Pesan *</label>
        <textarea
          value={form.message}
          onChange={onChange("message")}
          rows={6}
          className={inputCls}
          placeholder="Tulis pesan Anda..."
        />
        {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {submitting ? "Mengirim..." : "Kirim Pesan"}
      </button>
    </form>
  );
}
