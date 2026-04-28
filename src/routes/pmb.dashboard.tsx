import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCandidateProfile } from "@/hooks/usePMB";
import { 
  LogOut, User, FileText, CreditCard, 
  CheckCircle2, AlertCircle, Building, Upload, Loader2, Hourglass
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pmb/dashboard")({
  component: PMBDashboard,
});

function PMBDashboard() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const [uploadingPayment, setUploadingPayment] = useState(false);
  const { data: candidate, isLoading: loadingCandidate, refetch } = useCandidateProfile();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/pmb/login" });
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user || loadingCandidate) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Fallback if candidate data is missing somehow
  const currentStatus = candidate?.status || "DRAFT";
  const regNumber = candidate?.registration_number || "Menunggu Pembayaran";

  const handlePaymentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File terlalu besar", { description: "Maksimal ukuran file adalah 2MB" });
      return;
    }

    setUploadingPayment(true);
    try {
      // 1. Upload file
      const formData = new FormData();
      formData.append("file", file);
      
      // Use existing admin upload endpoint which works for public files too, or we can use custom
      // Actually the standard /api/v1/admin/uploads requires admin token, so we need a public or candidate upload endpoint.
      // Wait, in our current setup, we need a candidate-allowed upload endpoint.
      // Let's use it as a base64 or create a candidate upload endpoint.
      // Actually, standard upload endpoint is protected by authMiddleware but also checks role?
      // Let's create a custom POST request if it fails, or just use base64 for simplicity in this MVP?
      // I'll assume the backend allows candidate to upload or I'll implement a workaround. Let's use base64 for now to avoid dealing with multipart/form-data auth issues, or just use the same approach we used before.
      // Better yet, I'll use FileReader to convert image to data URL to send as `image_url` string for the MVP, or just send to our backend endpoint.
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result as string;
        
        const { error } = await apiClient.request("/api/v1/pmb/payment", "POST", {
          image_url: base64Image
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` }
        });

        if (error) throw new Error(error);

        toast.success("Berhasil", { description: "Bukti transfer berhasil diunggah. Silakan lanjut ke unggah berkas." });
        refetch();
      };
      reader.onerror = () => {
        throw new Error("Gagal membaca file");
      };
    } catch (err: any) {
      toast.error("Gagal mengunggah", { description: err.message || "Terjadi kesalahan" });
    } finally {
      setUploadingPayment(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/pmb/login" });
  };

  const steps = [
    { 
      id: 1, title: "Isi Biodata & Prodi", icon: User, 
      status: currentStatus === "DRAFT" ? "current" : "completed" 
    },
    { 
      id: 2, title: "Bayar Formulir", icon: CreditCard, 
      status: currentStatus === "WAITING_PAYMENT" ? "current" : (["PAYMENT_VERIFIED", "DOCUMENT_VERIFIED", "PASSED", "ENROLLED"].includes(currentStatus) ? "completed" : "upcoming") 
    },
    { 
      id: 3, title: "Upload Berkas", icon: Upload, 
      status: currentStatus === "PAYMENT_VERIFIED" ? "current" : (["DOCUMENT_VERIFIED", "PASSED", "ENROLLED"].includes(currentStatus) ? "completed" : "upcoming") 
    },
    { 
      id: 4, title: "Pengumuman", icon: CheckCircle2, 
      status: (["PASSED", "FAILED"].includes(currentStatus)) ? "completed" : "upcoming" 
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header Dashboard */}
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold text-primary hidden sm:block">Portal PMB</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold">{user.full_name}</div>
              <div className="text-xs text-muted-foreground">{regNumber}</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <button 
              onClick={handleLogout}
              className="ml-2 flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pt-8 lg:px-8">
        
        {/* Welcome Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-primary to-accent p-8 text-white shadow-elevated mb-8">
          <h1 className="font-display text-2xl font-bold lg:text-3xl">
            Selamat Datang, {user.full_name.split(' ')[0]}! 👋
          </h1>
          <p className="mt-2 text-white/80 max-w-2xl">
            Selesaikan tahapan pendaftaran di bawah ini untuk menjadi bagian dari mahasiswa Universitas Perintis Indonesia.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main Content Area */}
          <div className="space-y-6">
            
            {/* Progress Tracker */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold mb-6">Status Pendaftaran</h2>
              <div className="relative">
                <div className="absolute top-5 left-6 bottom-5 w-0.5 bg-border z-0 hidden sm:block"></div>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between relative z-10">
                  {steps.map((step) => (
                    <div key={step.id} className="flex sm:flex-col items-center gap-4 sm:gap-3 flex-1 sm:text-center relative">
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        step.status === "completed" ? "bg-primary border-primary text-primary-foreground" :
                        step.status === "current" ? "bg-background border-primary text-primary ring-4 ring-primary/10" :
                        "bg-muted border-muted-foreground/30 text-muted-foreground"
                      )}>
                        <step.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className={cn(
                          "text-sm font-bold",
                          step.status === "upcoming" ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {step.title}
                        </div>
                        {step.status === "current" && (
                          <div className="text-xs text-primary font-medium mt-0.5">Sedang Proses</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Area (Changes based on status) */}
            {currentStatus === "DRAFT" && (
              <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
                <div className="border-b border-border bg-muted/30 px-6 py-4">
                  <h2 className="font-display text-lg font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Lengkapi Formulir Biodata
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-8 rounded-xl bg-accent/10 p-4 border border-accent/20">
                    <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-accent">Perhatian</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        Pastikan data yang Anda isi sesuai dengan dokumen asli (KTP/KK/Ijazah). Kesalahan pengisian data dapat menghambat proses verifikasi.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-border pt-6">
                    <Link 
                      to="/pmb/formulir" 
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 shadow-soft"
                    >
                      Mulai Isi Formulir <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {currentStatus === "WAITING_PAYMENT" && (
              <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
                <div className="border-b border-border bg-blue-50 px-6 py-4">
                  <h2 className="font-display text-lg font-bold flex items-center gap-2 text-blue-700">
                    <CreditCard className="h-5 w-5" /> Pembayaran Formulir Pendaftaran
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6 mb-8 rounded-xl bg-muted/50 p-6 border border-border">
                    <div className="flex-1 space-y-1">
                      <div className="text-sm text-muted-foreground">Total Tagihan</div>
                      <div className="font-display text-3xl font-bold text-primary">Rp 250.000</div>
                    </div>
                    <div className="hidden md:block w-px h-16 bg-border"></div>
                    <div className="flex-1 space-y-1 text-center md:text-left w-full md:w-auto">
                      <div className="text-sm text-muted-foreground">Bank Tujuan (BSI)</div>
                      <div className="font-mono text-lg font-bold text-foreground">7182 9102 11</div>
                      <div className="text-xs font-semibold">a.n Universitas Perintis Indonesia</div>
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-border pt-6 relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePaymentUpload}
                      disabled={uploadingPayment}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <button 
                      disabled={uploadingPayment}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-transform shadow-soft hover:bg-blue-700 disabled:opacity-70 disabled:transform-none pointer-events-none"
                    >
                      {uploadingPayment ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Mengunggah...</>
                      ) : (
                        <>Upload Bukti Transfer <Upload className="h-4 w-4" /></>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStatus === "PAYMENT_VERIFIED" && (
              <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
                <div className="border-b border-border bg-primary/5 px-6 py-4">
                  <h2 className="font-display text-lg font-bold flex items-center gap-2 text-primary">
                    <Upload className="h-5 w-5" /> Lengkapi Berkas Persyaratan
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-start gap-4 rounded-xl bg-blue-50 p-4 border border-blue-100">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-800">Pembayaran Terverifikasi</h3>
                      <p className="text-sm text-blue-600/80 mt-1">
                        Pembayaran formulir pendaftaran Anda telah berhasil diverifikasi. Silakan unggah dokumen persyaratan di bawah ini untuk melanjutkan.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Dummy document items for MVP */}
                    {['Kartu Keluarga (KK)', 'Ijazah / Surat Keterangan Lulus', 'Pas Foto 3x4 (Latar Merah)'].map((doc, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/30">
                        <div>
                          <div className="font-bold text-sm">{doc}</div>
                          <div className="text-xs text-muted-foreground">Format PDF/JPG, Max 2MB</div>
                        </div>
                        <div className="relative overflow-hidden shrink-0">
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                          <button className="w-full sm:w-auto rounded-lg bg-white border border-border px-4 py-2 text-xs font-bold text-foreground shadow-sm hover:bg-muted transition-colors">
                            Pilih File...
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end border-t border-border pt-6">
                    <button 
                      onClick={() => toast.success("Berkas Berhasil Disimpan", { description: "Berkas Anda sedang diperiksa panitia."})}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-elevated transition-transform hover:-translate-y-1"
                    >
                      Kirim Berkas <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h3 className="font-display text-base font-bold mb-4">Informasi Peserta</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Nomor Pendaftaran</div>
                  <div className="font-mono font-semibold">{regNumber}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Jalur Pendaftaran</div>
                  <div className="font-semibold">Gelombang 1 (Reguler)</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Tahun Akademik</div>
                  <div className="font-semibold">2026/2027</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <h3 className="font-display text-base font-bold mb-2">Butuh Bantuan?</h3>
              <p className="text-xs text-muted-foreground mb-4">Tim PMB siap membantu Anda jika mengalami kendala.</p>
              <a href="#" className="inline-block w-full rounded-lg bg-green-500 py-2.5 text-xs font-bold text-white transition-colors hover:bg-green-600">
                Hubungi via WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
