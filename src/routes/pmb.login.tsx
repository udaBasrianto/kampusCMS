import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Mail, Lock, Building, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/pmb/login")({
  component: PMBLogin,
});

function PMBLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      // Wait for the auth context to update, then redirect to dashboard
      // The actual auth context handles role-based redirection, or we can force it here
      setTimeout(() => {
        navigate({ to: "/pmb/dashboard" });
      }, 500);
    } catch (err: any) {
      toast.error("Login Gagal", { description: err.message || "Email atau password salah." });
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
            <h1 className="font-display text-3xl font-bold tracking-tight">Selamat Datang Kembali</h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Masuk ke Portal Penerimaan Mahasiswa Baru untuk melanjutkan pendaftaran Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground">Alamat Email</label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi@example.com"
                  className="block w-full rounded-xl border border-input bg-background py-3 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-foreground">Kata Sandi</label>
                <a href="#" className="text-xs font-semibold text-primary hover:underline">
                  Lupa password?
                </a>
              </div>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-input bg-background py-3 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Masuk...
                </>
              ) : (
                <>
                  Masuk ke Portal <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Belum punya akun PMB?{" "}
            <Link to="/pmb/daftar" className="font-bold text-primary hover:underline">
              Daftar sekarang
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
            <h2 className="font-display text-3xl font-bold tracking-tight">Portal Calon Mahasiswa</h2>
            <ul className="mt-6 space-y-4 text-left text-sm text-white/90 font-medium">
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">1</div>
                Lengkapi Biodata & Upload Dokumen
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">2</div>
                Pilih Program Studi Unggulan
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">3</div>
                Pantau Status Kelulusan Secara Real-time
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
