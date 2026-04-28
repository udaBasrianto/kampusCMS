import { Save, Phone, MapPin, Mail, MessageCircle } from "lucide-react";
import { useSettingsState } from "@/hooks/useSettingsState";

const defaults = {
  address: "",
  phone: "",
  email: "",
  whatsapp: "",
  instagram: "",
  facebook: "",
  youtube: "",
  linkedin: "",
};

export function ContactForm() {
  const { values, update, save, saving } = useSettingsState("contact", defaults);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Kontak & Sosial Media</h1>
          <p className="mt-1 text-muted-foreground">Alamat, telepon, email, dan akun sosial media.</p>
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
        {/* Contact Info */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">Informasi Kontak</div>
              <div className="text-xs text-muted-foreground">Data kontak yang tampil di website</div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Alamat
              </label>
              <textarea
                value={String(values.address ?? "")}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Jl. Adinegoro KM. 17 ..."
                rows={2}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Telepon
              </label>
              <input
                type="text"
                value={String(values.phone ?? "")}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="(0751) 8400433"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
              </label>
              <input
                type="email"
                value={String(values.email ?? "")}
                onChange={(e) => update("email", e.target.value)}
                placeholder="info@kampus.ac.id"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" /> WhatsApp
              </label>
              <input
                type="text"
                value={String(values.whatsapp ?? "")}
                onChange={(e) => update("whatsapp", e.target.value)}
                placeholder="6281234567890"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.93 3.78-3.93 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.53-4.5-10.02-10-10.02z"/></svg>
            </div>
            <div>
              <div className="font-semibold">Sosial Media</div>
              <div className="text-xs text-muted-foreground">Link profil sosial media kampus</div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Instagram</label>
              <input
                type="text"
                value={String(values.instagram ?? "")}
                onChange={(e) => update("instagram", e.target.value)}
                placeholder="https://instagram.com/..."
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Facebook</label>
              <input
                type="text"
                value={String(values.facebook ?? "")}
                onChange={(e) => update("facebook", e.target.value)}
                placeholder="https://facebook.com/..."
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">YouTube</label>
              <input
                type="text"
                value={String(values.youtube ?? "")}
                onChange={(e) => update("youtube", e.target.value)}
                placeholder="https://youtube.com/..."
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">LinkedIn</label>
              <input
                type="text"
                value={String(values.linkedin ?? "")}
                onChange={(e) => update("linkedin", e.target.value)}
                placeholder="https://linkedin.com/..."
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
