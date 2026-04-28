import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ArrowRight, CheckCircle2, Calculator, CalendarDays, BookOpen, GraduationCap, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pmb/")({
  component: PMBLandingPage,
});

const admissionPaths = [
  {
    title: "Jalur Prestasi",
    description: "Bebas tes tulis untuk siswa dengan peringkat 1-10 di sekolah atau prestasi akademik/non-akademik tingkat nasional.",
    icon: GraduationCap,
    status: "Ditutup",
  },
  {
    title: "Gelombang 1 (Reguler)",
    description: "Pendaftaran umum dengan biaya formulir diskon 50%. Terbuka untuk seluruh lulusan SMA/SMK/MA sederajat.",
    icon: CalendarDays,
    status: "Buka Sekarang",
    highlight: true,
  },
  {
    title: "Jalur Karyawan / Ekstensi",
    description: "Perkuliahan fleksibel di sore/malam hari, dirancang khusus untuk Anda yang sudah bekerja atau lulusan D3.",
    icon: Users,
    status: "Segera Dibuka",
  },
];

const steps = [
  {
    title: "Buat Akun",
    description: "Daftarkan email dan nomor WhatsApp Anda untuk membuat portal peserta.",
  },
  {
    title: "Beli Formulir",
    description: "Lakukan pembayaran biaya pendaftaran sebesar Rp 250.000 via transfer bank.",
  },
  {
    title: "Lengkapi Berkas",
    description: "Isi biodata lengkap, pilih program studi, dan unggah dokumen (KTP, Ijazah/Rapor).",
  },
  {
    title: "Ujian Seleksi",
    description: "Unduh kartu ujian dan ikuti ujian masuk berbasis komputer (CBT) secara online/offline.",
  },
  {
    title: "Pengumuman",
    description: "Cek hasil kelulusan di portal dan lakukan pendaftaran ulang jika lulus.",
  },
];

function PMBLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-95" />
            <img src="/kampus-unpri.jpeg" alt="" className="h-full w-full object-cover mix-blend-overlay opacity-40" />
          </div>
          
          <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-3xl text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
                </span>
                Pendaftaran Gelombang 1 Dibuka
              </span>
              
              <h1 className="mt-8 font-display text-4xl font-bold leading-tight tracking-tight lg:text-6xl text-balance">
                Mari Bangun Masa Depan Cemerlang Bersama UNPRI
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-white/90 max-w-2xl">
                Jadilah bagian dari Universitas Perintis Indonesia. Kami mencetak lulusan kompeten, berakhlak mulia, dan siap bersaing di dunia profesional.
              </p>
              
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/pmb/daftar"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-primary shadow-elevated transition-transform hover:-translate-y-1 hover:shadow-xl"
                >
                  Daftar Sekarang <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#jalur"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-4 font-bold text-white transition-colors hover:bg-white/10"
                >
                  Lihat Jalur Pendaftaran
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* JALUR PENDAFTARAN */}
        <section id="jalur" className="py-20 lg:py-28 px-5 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-display text-3xl font-bold text-primary lg:text-4xl">Pilihan Jalur Penerimaan</h2>
              <p className="mt-4 text-muted-foreground">Pilih jalur pendaftaran yang paling sesuai dengan latar belakang dan kualifikasi Anda.</p>
            </div>
            
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {admissionPaths.map((path, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "relative flex flex-col rounded-2xl border p-8 transition-all hover:shadow-elevated",
                    path.highlight ? "border-primary bg-primary/5 shadow-soft" : "border-border bg-card"
                  )}
                >
                  {path.highlight && (
                    <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-sm">
                      Rekomendasi
                    </span>
                  )}
                  <path.icon className={cn("h-10 w-10", path.highlight ? "text-primary" : "text-muted-foreground")} />
                  <h3 className="mt-6 font-display text-xl font-bold">{path.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{path.description}</p>
                  
                  <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                    <span className={cn(
                      "text-xs font-bold px-2.5 py-1 rounded-md",
                      path.status === "Buka Sekarang" ? "bg-green-100 text-green-700" : 
                      path.status === "Ditutup" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {path.status}
                    </span>
                    {path.status === "Buka Sekarang" && (
                      <Link to="/pmb/daftar" className="text-sm font-bold text-primary hover:underline">
                        Pilih Jalur
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ALUR PENDAFTARAN */}
        <section className="bg-muted/30 py-20 lg:py-28 px-5 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-display text-3xl font-bold text-primary lg:text-4xl">Alur Pendaftaran Mahasiswa Baru</h2>
                <p className="mt-4 text-lg text-muted-foreground">Proses pendaftaran dirancang secara online dan mudah agar Anda bisa mendaftar dari mana saja.</p>
                
                <div className="mt-12 space-y-8">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex gap-5">
                      <div className="flex flex-col items-center">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold shadow-sm">
                          {idx + 1}
                        </div>
                        {idx !== steps.length - 1 && <div className="mt-2 w-px flex-1 bg-border/80"></div>}
                      </div>
                      <div className="pb-8">
                        <h3 className="font-display text-lg font-bold text-primary">{step.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square rounded-full bg-primary/5 absolute -inset-8 -z-10 blur-3xl" />
                <div className="rounded-2xl border border-border bg-white p-8 shadow-elevated">
                  <div className="flex items-center gap-4 border-b border-border pb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Calculator className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold">Butuh Bantuan?</h3>
                      <p className="text-sm text-muted-foreground">Hubungi panitia PMB kami</p>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-sm font-semibold">WhatsApp Panitia (Chat Only)</span>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary">0812-3456-7890</a>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-sm font-semibold">Email PMB</span>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary">pmb@unpri.ac.id</a>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-sm font-semibold">Jam Operasional</span>
                        <span className="text-sm text-muted-foreground">Senin - Jumat, 08.00 - 16.00 WIB</span>
                      </div>
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Link to="/pmb/login" className="block w-full rounded-xl border-2 border-primary py-3 text-center font-bold text-primary hover:bg-primary/5 transition-colors">
                      Login Portal Peserta
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
