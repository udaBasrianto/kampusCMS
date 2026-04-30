import { Save, Sparkles, Circle, Square, Triangle, Star, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Shuffle, MousePointer, Magnet, Expand, Link2 } from "lucide-react";
import { useSettingsState } from "@/hooks/useSettingsState";

const defaults = {
  enabled: false,
  count: 50,
  color: "#1e3a5f",
  opacity: 0.4,
  size_min: 1,
  size_max: 4,
  speed: 0.8,
  line_linked: true,
  line_color: "#1e3a5f",
  line_opacity: 0.15,
  line_distance: 150,
  direction: "none",
  shape: "circle",
  interact_hover: true,
  interact_mode: "grab",
  interact_distance: 180,
  interact_strength: 5,
};

const interactModes = [
  { value: "grab", label: "Grab", desc: "Garis ke kursor", icon: Link2 },
  { value: "repulse", label: "Tolak", desc: "Partikel menjauh", icon: Expand },
  { value: "attract", label: "Tarik", desc: "Partikel mendekat", icon: Magnet },
  { value: "bubble", label: "Bubble", desc: "Membesar", icon: Circle },
];

const shapeOptions = [
  { value: "circle", label: "Lingkaran", icon: Circle },
  { value: "square", label: "Kotak", icon: Square },
  { value: "triangle", label: "Segitiga", icon: Triangle },
  { value: "star", label: "Bintang", icon: Star },
];

const directionOptions = [
  { value: "none", label: "Acak", icon: Shuffle },
  { value: "top", label: "Atas", icon: ArrowUp },
  { value: "bottom", label: "Bawah", icon: ArrowDown },
  { value: "left", label: "Kiri", icon: ArrowLeft },
  { value: "right", label: "Kanan", icon: ArrowRight },
];

export function ParticlesForm() {
  const { values, update, save, saving } = useSettingsState("hero_particles", defaults);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Efek Partikel Hero</h1>
          <p className="mt-1 text-muted-foreground">Kustomisasi efek partikel animasi di hero slider.</p>
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
        {/* Kolom Kiri: Partikel */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">Pengaturan Partikel</div>
              <div className="text-xs text-muted-foreground">Jumlah, ukuran, kecepatan, dan bentuk</div>
            </div>
          </div>

          <div className="space-y-5">
            {/* Enable toggle */}
            <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
              <div
                className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-input transition-colors duration-200 ease-in-out data-[state=checked]:bg-primary"
                data-state={values.enabled ? "checked" : "unchecked"}
                onClick={() => update("enabled", !values.enabled)}
              >
                <span
                  className="inline-block h-4 w-4 translate-x-0 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4"
                  data-state={values.enabled ? "checked" : "unchecked"}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Aktifkan Partikel</p>
                <p className="text-xs text-muted-foreground">Tampilkan animasi partikel di hero slider.</p>
              </div>
            </label>

            {/* Count */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Jumlah Partikel</label>
                <span className="text-xs font-mono text-accent">{Number(values.count)}</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={Number(values.count)}
                onChange={(e) => update("count", Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Sedikit (10)</span>
                <span>Banyak (200)</span>
              </div>
            </div>

            {/* Speed */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Kecepatan</label>
                <span className="text-xs font-mono text-accent">{Number(values.speed).toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={Number(values.speed)}
                onChange={(e) => update("speed", Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Lambat</span>
                <span>Cepat</span>
              </div>
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Ukuran Min</label>
                <input
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={Number(values.size_min)}
                  onChange={(e) => update("size_min", Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ukuran Max</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  step="0.5"
                  value={Number(values.size_max)}
                  onChange={(e) => update("size_max", Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Opacity */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Opacity</label>
                <span className="text-xs font-mono text-accent">{Number(values.opacity).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={Number(values.opacity)}
                onChange={(e) => update("opacity", Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
            </div>

            {/* Color */}
            <div>
              <label className="text-sm font-medium">Warna Partikel</label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="color"
                  value={String(values.color ?? "#1e3a5f")}
                  onChange={(e) => update("color", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-input"
                />
                <input
                  type="text"
                  value={String(values.color ?? "#1e3a5f")}
                  onChange={(e) => update("color", e.target.value)}
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>

            {/* Shape */}
            <div>
              <label className="text-sm font-medium">Bentuk Partikel</label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {shapeOptions.map((s) => {
                  const Icon = s.icon;
                  const active = values.shape === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => update("shape", s.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs transition-colors ${
                        active
                          ? "border-primary bg-primary/5 text-primary font-semibold"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direction */}
            <div>
              <label className="text-sm font-medium">Arah Gerakan</label>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {directionOptions.map((d) => {
                  const Icon = d.icon;
                  const active = values.direction === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => update("direction", d.value)}
                      className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[10px] transition-colors ${
                        active
                          ? "border-primary bg-primary/5 text-primary font-semibold"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Garis Penghubung */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16M4 20L20 4M12 2v20M2 12h20" />
              </svg>
            </div>
            <div>
              <div className="font-semibold">Garis Penghubung</div>
              <div className="text-xs text-muted-foreground">Garis antar partikel yang berdekatan</div>
            </div>
          </div>

          <div className="space-y-5">
            {/* Line enabled */}
            <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
              <div
                className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-input transition-colors duration-200 ease-in-out data-[state=checked]:bg-primary"
                data-state={values.line_linked ? "checked" : "unchecked"}
                onClick={() => update("line_linked", !values.line_linked)}
              >
                <span
                  className="inline-block h-4 w-4 translate-x-0 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4"
                  data-state={values.line_linked ? "checked" : "unchecked"}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Tampilkan Garis Penghubung</p>
                <p className="text-xs text-muted-foreground">Garis transparan antar partikel yang berdekatan.</p>
              </div>
            </label>

            {/* Line color */}
            <div>
              <label className="text-sm font-medium">Warna Garis</label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="color"
                  value={String(values.line_color ?? "#1e3a5f")}
                  onChange={(e) => update("line_color", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-input"
                />
                <input
                  type="text"
                  value={String(values.line_color ?? "#1e3a5f")}
                  onChange={(e) => update("line_color", e.target.value)}
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>

            {/* Line opacity */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Opacity Garis</label>
                <span className="text-xs font-mono text-accent">{Number(values.line_opacity).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.5"
                step="0.02"
                value={Number(values.line_opacity)}
                onChange={(e) => update("line_opacity", Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
            </div>

            {/* Line distance */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Jarak Maks Garis</label>
                <span className="text-xs font-mono text-accent">{Number(values.line_distance)}px</span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                step="10"
                value={Number(values.line_distance)}
                onChange={(e) => update("line_distance", Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Pendek (50px)</span>
                <span>Panjang (300px)</span>
              </div>
            </div>

            {/* Preview hint */}
            <div className="rounded-lg bg-accent/5 border border-accent/20 p-4">
              <p className="text-xs text-accent font-medium">💡 Tips</p>
              <ul className="mt-2 text-xs text-muted-foreground space-y-1">
                <li>• Gunakan <strong>50-80 partikel</strong> untuk tampilan elegan</li>
                <li>• Opacity <strong>0.2-0.4</strong> agar tidak mengganggu teks</li>
                <li>• Kecepatan <strong>0.5-1.0</strong> untuk gerakan halus</li>
                <li>• <strong>Simpan</strong> lalu refresh beranda untuk melihat</li>
              </ul>
            </div>

            {/* Mouse Interaction Section */}
            <div className="border-t border-border pt-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MousePointer className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Interaksi Mouse</div>
                  <div className="text-[10px] text-muted-foreground">Partikel bereaksi saat cursor hover</div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Interact toggle */}
                <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                  <div
                    className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-input transition-colors duration-200 ease-in-out data-[state=checked]:bg-primary"
                    data-state={values.interact_hover ? "checked" : "unchecked"}
                    onClick={() => update("interact_hover", !values.interact_hover)}
                  >
                    <span
                      className="inline-block h-4 w-4 translate-x-0 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4"
                      data-state={values.interact_hover ? "checked" : "unchecked"}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">Aktifkan Interaksi Hover</p>
                  </div>
                </label>

                {/* Mode selector */}
                <div>
                  <label className="text-sm font-medium">Mode Interaksi</label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {interactModes.map((m) => {
                      const Icon = m.icon;
                      const active = values.interact_mode === m.value;
                      return (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => update("interact_mode", m.value)}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                            active
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <div>
                            <div className={`text-xs ${active ? "font-semibold" : "font-medium"}`}>{m.label}</div>
                            <div className="text-[10px] text-muted-foreground">{m.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Distance */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Jarak Interaksi</label>
                    <span className="text-xs font-mono text-accent">{Number(values.interact_distance)}px</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="400"
                    step="10"
                    value={Number(values.interact_distance)}
                    onChange={(e) => update("interact_distance", Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                </div>

                {/* Strength */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Kekuatan</label>
                    <span className="text-xs font-mono text-accent">{Number(values.interact_strength)}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={Number(values.interact_strength)}
                    onChange={(e) => update("interact_strength", Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Halus</span>
                    <span>Kuat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
