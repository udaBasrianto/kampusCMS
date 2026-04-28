import { Home, Info, GraduationCap, LayoutGrid, Users, Phone, Newspaper, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouterState } from "@tanstack/react-router";

// Helper to assign icons based on href or label
function getIconForMenu(href: string, label: string) {
  const text = (href + " " + label).toLowerCase();
  if (href === "/" || text.includes("beranda")) return Home;
  if (text.includes("tentang") || text.includes("info")) return Info;
  if (text.includes("fakultas") || text.includes("program")) return GraduationCap;
  if (text.includes("blog") || text.includes("berita")) return Newspaper;
  if (text.includes("kontak") || text.includes("hubungi")) return Phone;
  if (text.includes("dosen") || text.includes("staf")) return Users;
  return LayoutGrid;
}

export function MobileNavbar({ navigation }: { navigation: Array<{ label: string; href: string }> }) {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  // Only take up to 4 items from navigation, the 5th will be a PMB/action button
  const navItems = navigation.slice(0, 4);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden pb-safe">
      <div className="bg-white/90 backdrop-blur-xl border-t border-border shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
        <nav className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = getIconForMenu(item.href, item.label);
            const isActive = item.href === "/" ? currentPath === "/" : currentPath.startsWith(item.href);
            
            return (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full py-1 gap-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
                  isActive ? "bg-primary/10" : "bg-transparent"
                )}>
                  <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium leading-none",
                  isActive && "font-bold"
                )}>
                  {item.label}
                </span>
              </a>
            );
          })}
          
          {/* PMB Action Button */}
          <a
            href="/pmb"
            className="flex flex-col items-center justify-center w-full py-1 gap-1 transition-colors text-accent hover:text-accent/80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
              <ArrowRight className="h-5 w-5 stroke-[2.5px]" />
            </div>
            <span className="text-[10px] font-bold leading-none">Daftar</span>
          </a>
        </nav>
      </div>
    </div>
  );
}
