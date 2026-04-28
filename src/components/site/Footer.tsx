import { GraduationCap, MapPin, Mail, Phone } from "lucide-react";
import { campusInfo as defaultInfo, navigation as defaultNav } from "@/data/campus";
import { useSiteSettings } from "@/hooks/useCampusData";

const socialIcons: Record<string, string> = {
  facebook:
    "M22 12a10 10 0 1 0-11.6 9.9v-7H8v-2.9h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5v1.8h2.6l-.4 2.9h-2.2v7A10 10 0 0 0 22 12Z",
  instagram:
    "M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 5.6a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4Zm5.4-.4a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z",
  youtube:
    "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z",
  linkedin:
    "M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2ZM8 19H5v-9h3v9ZM6.5 8.7a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4ZM19 19h-3v-4.7c0-1.1 0-2.6-1.6-2.6S12.6 13 12.6 14.2V19h-3v-9h2.9v1.2h.1a3.2 3.2 0 0 1 2.9-1.6c3.1 0 3.7 2 3.7 4.7V19Z",
};

export function Footer() {
  const year = new Date().getFullYear();
  const { data: settings } = useSiteSettings();

  const info = (settings?.campus_info ?? {}) as Record<string, string | number>;
  const contact = (settings?.contact ?? {}) as {
    address?: string;
    phone?: string;
    email?: string;
    social?: Record<string, string>;
  };
  const footer = (settings?.footer ?? {}) as {
    description?: string;
    copyright?: string;
    col1_title?: string;
    col1_links?: string;
    col2_title?: string;
    col2_links?: string;
    col3_title?: string;
    col3_links?: string;
  };

  const shortName = (info.name as string) || defaultInfo.shortName;
  const established = (info.established_year as number) || defaultInfo.established;
  const description = footer.description || defaultInfo.description;
  const address = contact.address || defaultInfo.address;
  const email = contact.email || defaultInfo.email;
  const phone = contact.phone || defaultInfo.phone;
  
  // Parse links
  const parseLinks = (links?: string) => {
    if (!links) return [];
    return links.split("\n").map(line => {
      const [label, href] = line.split("|").map(s => s.trim());
      return { label, href: href || "/" };
    }).filter(n => n.label);
  };
  
  const columns = [
    { title: footer.col1_title || "Akademik", links: parseLinks(footer.col1_links) },
    { title: footer.col2_title || "Kampus", links: parseLinks(footer.col2_links) },
    { title: footer.col3_title || "Lainnya", links: parseLinks(footer.col3_links) }
  ].filter(c => c.links.length > 0);
  
  if (columns.length === 0) {
    columns.push({ title: "Navigasi", links: defaultNav });
  }
  const social = contact.social || {};
  const socialEntries = Object.entries(social).filter(([k, v]) => v && socialIcons[k]);
  const copyright = footer.copyright || `© ${year} ${shortName}. Hak cipta dilindungi.`;

  return (
    <footer className="bg-primary text-primary-foreground pb-20 lg:pb-0">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold text-gold-foreground">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <div className="font-display text-lg font-bold">{shortName}</div>
                <div className="text-xs text-white/60">Est. {established}</div>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70">{description}</p>
            {socialEntries.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                {socialEntries.map(([key, href]) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d={socialIcons[key]} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          {columns.map((col, idx) => (
            <div key={idx} className="lg:col-span-2">
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-gold">
                {col.title}
              </h4>
              <ul className="mt-5 space-y-3 text-sm">
                {col.links.map((n) => (
                  <li key={n.label}>
                    <a href={n.href} className="text-white/75 hover:text-white">
                      {n.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-3">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-gold">
              Hubungi Kami
            </h4>
            <ul className="mt-5 space-y-4 text-sm text-white/75">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-none text-gold" />
                {address}
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gold" />
                <a href={`mailto:${email}`} className="hover:text-white">
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gold" />
                <a href={`tel:${phone}`} className="hover:text-white">
                  {phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center">
          <span>{copyright}</span>
          <div className="flex gap-5">
            <a href="/halaman/privasi" className="hover:text-white">
              Kebijakan Privasi
            </a>
            <a href="/halaman/syarat" className="hover:text-white">
              Syarat & Ketentuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
