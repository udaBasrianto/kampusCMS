import { Save, Bot, MessageSquare, KeyRound, Sparkles } from "lucide-react";
import { useSettingsState } from "@/hooks/useSettingsState";

const defaults = {
  enabled: false,
  api_key: "",
  provider: "gemini", // "gemini" or "openai"
  system_prompt: "Anda adalah asisten virtual resmi untuk Universitas Perintis Indonesia. Jawab pertanyaan dengan sopan, ramah, dan ringkas. Jika tidak tahu, arahkan ke halaman kontak atau PMB.",
  greeting: "Halo! Ada yang bisa saya bantu terkait kampus kami?",
};

export function ChatbotForm() {
  const { values, update, save, saving } = useSettingsState("chatbot", defaults);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Pengaturan Chatbot AI</h1>
          <p className="mt-1 text-muted-foreground">Atur asisten virtual pintar untuk melayani pengunjung website.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Kolom Kiri: Tampilan */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">Tampilan & Perilaku</div>
              <div className="text-xs text-muted-foreground">Kustomisasi sapaan awal</div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
              <div className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-input transition-colors duration-200 ease-in-out data-[state=checked]:bg-primary" data-state={values.enabled ? "checked" : "unchecked"} onClick={() => update("enabled", !values.enabled)}>
                <span className="inline-block h-4 w-4 translate-x-0 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4" data-state={values.enabled ? "checked" : "unchecked"} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Aktifkan Chatbot</p>
                <p className="text-xs text-muted-foreground">Tampilkan widget chat di pojok kiri bawah website.</p>
              </div>
            </label>

            <div>
              <label className="text-sm font-medium">Pesan Sapaan (Greeting)</label>
              <textarea
                value={String(values.greeting ?? "")}
                onChange={(e) => update("greeting", e.target.value)}
                placeholder="Halo! Ada yang bisa saya bantu?"
                rows={3}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Kecerdasan */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold text-gold-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">Mesin AI & API</div>
              <div className="text-xs text-muted-foreground">Koneksi ke layanan AI</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">API Key (Gemini / OpenAI)</label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={String(values.api_key ?? "")}
                  onChange={(e) => update("api_key", e.target.value)}
                  placeholder="Masukkan API Key (sk-... / AIza...)"
                  className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm font-mono"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">Kosongkan jika hanya ingin menggunakan mode simulasi (dummy).</p>
            </div>

            <div>
              <label className="text-sm font-medium">System Prompt (Karakteristik AI)</label>
              <textarea
                value={String(values.system_prompt ?? "")}
                onChange={(e) => update("system_prompt", e.target.value)}
                placeholder="Beri instruksi kepada AI bagaimana ia harus menjawab..."
                rows={5}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm leading-relaxed"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">Instruksi rahasia yang akan dibaca AI agar memahami perannya sebagai asisten kampus.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
