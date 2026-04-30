import { Save, Bot, MessageSquare, KeyRound, Sparkles, Globe, Cpu, RefreshCw, Loader2, ImagePlus, Trash2, FileUp, FileText, X } from "lucide-react";
import { useSettingsState } from "@/hooks/useSettingsState";
import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/integrations/api/client";

const defaults = {
  enabled: false,
  api_key: "",
  api_url: "https://ai.sumopod.com/v1/chat/completions",
  model: "",
  provider: "openai",
  system_prompt: "Anda adalah asisten virtual resmi untuk Universitas Perintis Indonesia. Jawab pertanyaan dengan sopan, ramah, dan ringkas. Jika tidak tahu, arahkan ke halaman kontak atau PMB.",
  greeting: "Halo! Ada yang bisa saya bantu terkait kampus kami?",
  bot_avatar: "",
  bot_avatar_size: 112,
  knowledge_files: [] as { name: string; url: string; content: string }[],
};

const providerOptions = [
  { value: "openai", label: "OpenAI-Compatible (Sumopod / LiteLLM / OpenAI)" },
  { value: "gemini", label: "Google Gemini (Direct)" },
];

interface ModelInfo {
  id: string;
  owned_by?: string;
}

export function ChatbotForm() {
  const { values, update, save, saving } = useSettingsState("chatbot", defaults);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelError, setModelError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingKnowledge, setUploadingKnowledge] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const knowledgeInputRef = useRef<HTMLInputElement>(null);

  const fetchModels = useCallback(async () => {
    const apiKey = String(values.api_key ?? "");
    const apiUrl = String(values.api_url ?? "");
    if (!apiKey) {
      setModelError("Masukkan API Key terlebih dahulu.");
      setModels([]);
      return;
    }

    setLoadingModels(true);
    setModelError("");
    try {
      const token = apiClient.getToken();
      const resp = await fetch(
        `${(import.meta as any).env.VITE_API_URL || "/api/v1"}/admin/chatbot-models`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ api_url: apiUrl, api_key: apiKey }),
        },
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Gagal mengambil model" }));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const list: ModelInfo[] = (data.data ?? data ?? []).map((m: any) => ({
        id: m.id ?? m.model ?? "",
        owned_by: m.owned_by ?? "",
      }));

      list.sort((a, b) => a.id.localeCompare(b.id));
      setModels(list);

      if (list.length > 0 && !values.model) {
        // Auto-select first model if none selected
        update("model", list[0].id);
      }
    } catch (err: any) {
      setModelError(err.message || "Gagal mengambil daftar model");
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  }, [values.api_key, values.api_url]);

  // Auto-fetch models when api_key or api_url changes (with debounce)
  useEffect(() => {
    if (!values.api_key || values.provider !== "openai") return;
    const timer = setTimeout(() => fetchModels(), 800);
    return () => clearTimeout(timer);
  }, [values.api_key, values.api_url, values.provider]);

  // Group models by owned_by
  const groupedModels = models.reduce<Record<string, ModelInfo[]>>((acc, m) => {
    const group = m.owned_by || "other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(m);
    return acc;
  }, {});

  const groupKeys = Object.keys(groupedModels).sort();

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

            {/* Bot Avatar Upload */}
            <div>
              <label className="text-sm font-medium">Icon / Avatar Bot</label>
              <div className="mt-2 flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-border bg-muted">
                  {values.bot_avatar ? (
                    <img src={String(values.bot_avatar)} alt="Bot Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Bot className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingAvatar(true);
                      try {
                        const { data, error } = await apiClient.uploadImage(file, "chatbot");
                        if (error) throw new Error(error);
                        if (data?.url) update("bot_avatar", data.url);
                      } catch (err: any) {
                        console.error("Upload avatar error:", err);
                      } finally {
                        setUploadingAvatar(false);
                        if (avatarInputRef.current) avatarInputRef.current.value = "";
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted/50 transition-colors disabled:opacity-50"
                  >
                    {uploadingAvatar
                      ? <><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</>
                      : <><ImagePlus className="h-3 w-3" /> Upload Gambar</>
                    }
                  </button>
                  {values.bot_avatar && (
                    <button
                      type="button"
                      onClick={() => update("bot_avatar", "")}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" /> Hapus Avatar
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Ukuran ideal: 128×128px. Format: PNG, JPG, WebP. Jika kosong, akan menggunakan icon default.</p>

              {/* Slider Ukuran Widget */}
              {values.bot_avatar && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Ukuran Tampilan Widget</label>
                    <span className="text-xs font-mono text-accent">{Number(values.bot_avatar_size ?? 112)}px</span>
                  </div>
                  <input
                    type="range"
                    min="64"
                    max="256"
                    step="8"
                    value={Number(values.bot_avatar_size ?? 112)}
                    onChange={(e) => update("bot_avatar_size", Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Kecil (64px)</span>
                    <span>Sangat Besar (256px)</span>
                  </div>
                </div>
              )}
            </div>

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

            {/* System Prompt */}
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

            {/* Knowledge Files */}
            <div>
              <label className="text-sm font-medium flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Knowledge Base
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload dokumen sebagai tambahan pengetahuan chatbot. Format: TXT, MD, CSV, PDF, DOCX, XLSX (maks 5MB).
              </p>

              {/* Upload button */}
              <div className="mt-3">
                <input
                  ref={knowledgeInputRef}
                  type="file"
                  accept=".txt,.md,.csv,.pdf,.docx,.xlsx"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingKnowledge(true);
                    try {
                      const token = apiClient.getToken();
                      const formData = new FormData();
                      formData.append("file", file);
                      const resp = await fetch(
                        `${(import.meta as any).env.VITE_API_URL || "/api/v1"}/admin/chatbot-knowledge`,
                        {
                          method: "POST",
                          headers: token ? { Authorization: `Bearer ${token}` } : {},
                          body: formData,
                        },
                      );
                      if (!resp.ok) {
                        const err = await resp.json().catch(() => ({ error: "Upload gagal" }));
                        throw new Error(err.error);
                      }
                      const data = await resp.json();
                      const existing = (values.knowledge_files as any[]) ?? [];
                      update("knowledge_files", [
                        ...existing,
                        { name: data.name, url: data.url, content: data.content },
                      ]);
                    } catch (err: any) {
                      console.error("Knowledge upload error:", err);
                      alert(err.message || "Gagal upload file");
                    } finally {
                      setUploadingKnowledge(false);
                      if (knowledgeInputRef.current) knowledgeInputRef.current.value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={uploadingKnowledge}
                  onClick={() => knowledgeInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-4 py-2 text-xs font-medium hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  {uploadingKnowledge
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Mengekstrak teks...</>
                    : <><FileUp className="h-3.5 w-3.5" /> Upload Dokumen</>
                  }
                </button>
              </div>

              {/* File list */}
              {((values.knowledge_files as any[]) ?? []).length > 0 && (
                <div className="mt-3 space-y-2">
                  {((values.knowledge_files as any[]) ?? []).map((kf: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
                      <FileText className="h-4 w-4 shrink-0 text-accent" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium truncate">{kf.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {kf.content ? `${kf.content.length.toLocaleString()} karakter` : "Kosong"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const existing = (values.knowledge_files as any[]) ?? [];
                          update("knowledge_files", existing.filter((_: any, i: number) => i !== idx));
                        }}
                        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Hapus dokumen"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Mesin AI */}
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
            {/* Provider */}
            <div>
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-muted-foreground" /> Provider
              </label>
              <select
                value={String(values.provider ?? "openai")}
                onChange={(e) => update("provider", e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                {providerOptions.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* API URL (only for OpenAI-compatible) */}
            {values.provider === "openai" && (
              <div>
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" /> API URL
                </label>
                <input
                  type="url"
                  value={String(values.api_url ?? "")}
                  onChange={(e) => update("api_url", e.target.value)}
                  placeholder="https://ai.sumopod.com/v1/chat/completions"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                />
                <p className="mt-1 text-xs text-muted-foreground">Endpoint chat completions dari penyedia AI Anda.</p>
              </div>
            )}

            {/* API Key */}
            <div>
              <label className="text-sm font-medium flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" /> API Key
              </label>
              <input
                type="password"
                value={String(values.api_key ?? "")}
                onChange={(e) => update("api_key", e.target.value)}
                placeholder={values.provider === "gemini" ? "AIza..." : "sk-..."}
                className="mt-1 w-full rounded-lg border border-input bg-background py-2 px-3 text-sm font-mono"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {values.provider === "openai"
                  ? "Setelah diisi, daftar model akan dimuat otomatis dari server."
                  : "Kosongkan jika hanya ingin menggunakan mode simulasi."}
              </p>
            </div>

            {/* Model (dynamic for OpenAI-compatible) */}
            {values.provider === "openai" && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-muted-foreground" /> Model
                  </label>
                  <button
                    type="button"
                    onClick={fetchModels}
                    disabled={loadingModels || !values.api_key}
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/10 disabled:opacity-50 transition-colors"
                  >
                    {loadingModels
                      ? <><Loader2 className="h-3 w-3 animate-spin" /> Memuat...</>
                      : <><RefreshCw className="h-3 w-3" /> Muat Model</>
                    }
                  </button>
                </div>

                {modelError && (
                  <p className="mt-1 text-xs text-red-500">{modelError}</p>
                )}

                {models.length > 0 ? (
                  <select
                    value={String(values.model ?? "")}
                    onChange={(e) => update("model", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">— Pilih Model —</option>
                    {groupKeys.map((group) => (
                      <optgroup key={group} label={group}>
                        {groupedModels[group].map((m) => (
                          <option key={m.id} value={m.id}>{m.id}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={String(values.model ?? "")}
                    onChange={(e) => update("model", e.target.value)}
                    placeholder="Masukkan API Key untuk memuat daftar model..."
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                  />
                )}

                {values.model && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/20 px-3 py-2">
                    <Cpu className="h-4 w-4 text-accent" />
                    <span className="text-sm font-mono font-medium text-accent">{String(values.model)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
