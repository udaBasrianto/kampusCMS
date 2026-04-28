import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Mail, Phone, User, Building, Loader2, ArrowLeft } from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pmb/daftar")({
  component: PMBRegister,
});

function PMBRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user endpoint (needs to be adapted for candidate role in backend later)
      // For now, we will simulate the registration process until backend endpoint is fully ready
      const { data, error } = await apiClient.request("/api/v1/auth/register-candidate", "POST", {
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone_whatsapp: formData.phone,
      });

      if (error) {
        toast.error("Pendaftaran Gagal", { description: error });
        return;
      }

      toast.success("Akun berhasil dibuat!", {
        description: "Silakan login menggunakan email dan password Anda.",
      });
      
      navigate({ to: "/pmb/login" });
    } catch (err: any) {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center px-5 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <Link to="/pmb" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Kembali ke PMB
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building className="h-6 w-6" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-primary">KampusPro PMB</span>
          </div>

          <div className="mt-8">
            <h1 className="font-display text-3xl font-bold tracking-tight">Buat Akun PMB</h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Daftarkan diri Anda untuk mendapatkan akses ke Portal Penerimaan Mahasiswa Baru.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground">Nama Lengkap Sesuai Ijazah</label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Budi Santoso"
                  className="block w-full rounded-xl border border-input bg-background py-3 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground">Alamat Email Aktif</label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="budi@example.com"
                  className="block w-full rounded-xl border border-input bg-background py-3 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground">Nomor WhatsApp</label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="081234567890"
                  className="block w-full rounded-xl border border-input bg-background py-3 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground">Kata Sandi (Password)</label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimal 6 karakter"
                className="mt-2 block w-full rounded-xl border border-input bg-background px-3 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Mendaftarkan...
                </>
              ) : (
                <>
                  Daftar Sekarang <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Sudah punya akun PMB?{" "}
            <Link to="/pmb/login" className="font-bold text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:block lg:w-1/2 relative bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
        <img src="/kampus-unpri.jpeg" alt="" className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white">
          <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-md max-w-lg border border-white/20 shadow-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight">Pendaftaran Terintegrasi</h2>
            <p className="mt-4 text-lg text-white/80 leading-relaxed">
              Proses pendaftaran yang mudah, transparan, dan cepat. Pantau status kelulusan Anda langsung dari dalam portal.
            </p>
            <div className="mt-8 flex justify-center gap-4 text-sm font-semibold text-white/90">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div> Online 24/7
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-400"></div> Verifikasi Cepat
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
