import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useLocation,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useCampusData";
import { useEffect, useState } from "react";
import { ScrollToTop } from "@/components/site/ScrollToTop";
import { ChatbotWidget } from "@/components/site/ChatbotWidget";

interface RouterContext {
  queryClient: QueryClient;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Halaman tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const isAdminOrDashboard = location.pathname.startsWith("/admin") || location.pathname.startsWith("/pmb/dashboard");

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-right" richColors />
      <GlobalThemeProvider />
      {!isAdminOrDashboard && (
        <>
          <ScrollToTop />
          <ChatbotWidget />
        </>
      )}
    </QueryClientProvider>
  );
}

function GlobalThemeProvider() {
  const { data: siteSettings } = useSiteSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply global theme from settings
    const globalTheme = (siteSettings?.site_theme?.color as string) || "navy";
    
    // Clear any stuck local storage from old floating widget to prevent overrides
    localStorage.removeItem("kampus-theme");
    
    if (globalTheme === "navy") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", globalTheme);
    }

  }, [siteSettings, mounted]);

  return null;
}
