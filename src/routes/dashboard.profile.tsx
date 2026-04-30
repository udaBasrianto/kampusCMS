import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { User, Mail, GraduationCap, Building } from "lucide-react";

export const Route = createFileRoute("/dashboard/profile")({
  component: DashboardProfile,
});

function DashboardProfile() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Profil Saya</h1>
        <p className="mt-1 text-muted-foreground">Kelola informasi pribadi dan data akun Anda.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-6 border-b border-border p-6 bg-muted/30">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-inner">
            {(user.full_name || user.email?.split("@")[0] || "U")[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.full_name || user.email?.split("@")[0]}</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {user.role === "admin" ? "Administrator" : "Mahasiswa / User"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <dl className="divide-y divide-border">
            <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" /> Nama Lengkap
              </dt>
              <dd className="text-sm font-medium sm:col-span-2">{user.full_name || "-"}</dd>
            </div>
            <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email Address
              </dt>
              <dd className="text-sm font-medium sm:col-span-2">{user.email}</dd>
            </div>
            <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Peran Akun
              </dt>
              <dd className="text-sm font-medium sm:col-span-2 capitalize">{user.role || "User"}</dd>
            </div>
            <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building className="h-4 w-4" /> Fakultas / Unit
              </dt>
              <dd className="text-sm font-medium sm:col-span-2">
                {user.faculty_ids && user.faculty_ids.length > 0 
                  ? user.faculty_ids.join(", ") 
                  : "Belum terasosiasi dengan fakultas"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
