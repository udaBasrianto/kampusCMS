import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, BarChart3, Megaphone, LayoutTemplate, Phone } from "lucide-react";
import { CampusInfoForm } from "@/components/admin/CampusInfoForm";
import { HeaderForm } from "@/components/admin/HeaderForm";
import { StatsSettingsForm } from "@/components/admin/StatsSettingsForm";
import { CtaBannerForm } from "@/components/admin/CtaBannerForm";
import { FooterForm } from "@/components/admin/FooterForm";
import { ContactForm } from "@/components/admin/ContactForm";
import { ThemeSettingsForm } from "@/components/admin/ThemeSettingsForm";
import { ChatbotForm } from "@/components/admin/ChatbotForm";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/settings")({ component: Page });

const tabs = [
  { key: "campus_info", label: "Info Kampus", icon: Building2 },
  { key: "header", label: "Header", icon: LayoutTemplate },
  { key: "stats", label: "Statistik", icon: BarChart3 },
  { key: "cta_banner", label: "CTA Banner", icon: Megaphone },
  { key: "footer", label: "Footer", icon: LayoutTemplate },
  { key: "contact", label: "Kontak", icon: Phone },
  { key: "theme", label: "Tampilan & Tema", icon: LayoutTemplate },
  { key: "chatbot", label: "AI Chatbot", icon: Bot },
] as const;

function Page() {
  const [active, setActive] = useState<string>(tabs[0].key);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                active === t.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/70",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {active === "campus_info" && <CampusInfoForm />}
      {active === "header" && <HeaderForm />}
      {active === "stats" && <StatsSettingsForm />}
      {active === "cta_banner" && <CtaBannerForm />}
      {active === "footer" && <FooterForm />}
      {active === "contact" && <ContactForm />}
      {active === "theme" && <ThemeSettingsForm />}
      {active === "chatbot" && <ChatbotForm />}
    </div>
  );
}
