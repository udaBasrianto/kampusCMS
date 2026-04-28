import { useState, useEffect } from "react";
import { useSiteSettings } from "@/hooks/useCampusData";
import { Palette, Moon, Sun, X, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: "navy", label: "Navy (Default)", color: "bg-[#1E293B]" },
  { id: "emerald", label: "Emerald", color: "bg-[#059669]" },
  { id: "rose", label: "Rose", color: "bg-[#E11D48]" },
  { id: "amber", label: "Amber", color: "bg-[#D97706]" },
  { id: "violet", label: "Violet", color: "bg-[#7C3AED]" },
  { id: "ocean", label: "Ocean", color: "bg-[#0284C7]" },
];

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState("navy");
  const [darkMode, setDarkMode] = useState<"light" | "dark" | "system">("system");

  const [mounted, setMounted] = useState(false);
  const { data: siteSettings } = useSiteSettings();

  // Load saved preferences and global site theme
  useEffect(() => {
    // Prefer global theme from site settings if present
    const globalTheme = siteSettings?.site_theme?.color as string | undefined;
    const storedTheme = localStorage.getItem("kampus-theme") || globalTheme || "navy";
    const storedDark = (localStorage.getItem("kampus-dark") as any) || "system";
    setTheme(storedTheme);
    setDarkMode(storedDark);
    setMounted(true);
  }, [siteSettings]);

  // Apply theme and dark mode
  useEffect(() => {
    if (!mounted) return;
    
    // Apply color theme
    if (theme === "navy") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
    localStorage.setItem("kampus-theme", theme);

    // Apply dark mode
    const isDark =
      darkMode === "dark" ||
      (darkMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("kampus-dark", darkMode);
  }, [theme, darkMode, mounted]);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-24 right-5 lg:right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-72 rounded-2xl border border-border bg-card p-5 shadow-elevated animate-in slide-in-from-bottom-4 fade-in">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display font-semibold">Tampilan & Tema</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Color Palettes */}
            <div>
              <p className="mb-3 text-xs font-medium text-muted-foreground">Warna Tema (6 Pilihan)</p>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "group flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background p-2 transition-all hover:border-primary",
                      theme === t.id && "border-primary bg-primary/5 ring-1 ring-primary"
                    )}
                  >
                    <div className={cn("h-6 w-6 rounded-full shadow-sm", t.color)} />
                    <span className="text-[10px] font-medium">{t.label.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Mode */}
            <div>
              <p className="mb-3 text-xs font-medium text-muted-foreground">Mode Gelap</p>
              <div className="flex rounded-lg border border-border bg-background p-1">
                {[
                  { id: "light", icon: Sun, label: "Terang" },
                  { id: "system", icon: Monitor, label: "Sistem" },
                  { id: "dark", icon: Moon, label: "Gelap" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setDarkMode(mode.id as any)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-medium transition-colors",
                      darkMode === mode.id
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <mode.icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated transition-transform hover:scale-105 active:scale-95"
      >
        <Palette className="h-5 w-5" />
      </button>
    </div>
  );
}
