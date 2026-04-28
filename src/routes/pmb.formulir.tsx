import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAllFacultyPrograms } from "@/hooks/useFacultyData";
import { useFaculties } from "@/hooks/useCampusData";
import { 
  Building, User, Save, ArrowLeft, ArrowRight, CheckCircle2,
  GraduationCap, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/integrations/api/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pmb/formulir")({
  component: PMBFormulir,
});

function PMBFormulir() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { data: programs = [], isLoading: loadingPrograms } = useAllFacultyPrograms();
  const { data: faculties = [] } = useFaculties();
  
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nisn: "",
    school_origin: "",
    first_choice_program_id: "",
    second_choice_program_id: "",
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/pmb/login" });
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user || loadingPrograms) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group programs by faculty for the select options
  const programsByFaculty = faculties.map(f => ({
    faculty: f,
    programs: programs.filter(p => p.faculty_id === f.id && p.active !== false)
  })).filter(g => g.programs.length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.first_choice_program_id === formData.second_choice_program_id && formData.first_choice_program_id !== "") {
      toast.error("Pilihan Program Studi tidak boleh sama");
      return;
    }

    setSaving(true);
    try {
      // Endpoint to save candidate form (will be built in backend next)
      const { error } = await apiClient.request("/api/v1/pmb/candidate-form", "POST", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` }
      });

      if (error) {
        toast.error("Gagal menyimpan formulir", { description: error });
        return;
      }

      toast.success("Formulir Berhasil Disimpan", {
        description: "Data Anda telah tersimpan. Silakan lanjutkan ke tahap pembayaran."
      });
      navigate({ to: "/pmb/dashboard" });
    } catch (err: any) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/pmb/dashboard" className="mr-2 p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold text-primary">Formulir Pendaftaran</span>
          </div>
          <div className="text-sm font-semibold">{user.full_name}</div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pt-8 lg:px-8">
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Identitas & Asal Sekolah */}
          <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
            <div className="border-b border-border bg-primary/5 px-6 py-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold">1</div>
              <h2 className="font-display text-lg font-bold">Identitas & Asal Sekolah</h2>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    disabled
                    value={user.full_name}
                    className="block w-full rounded-xl border border-input bg-muted/50 px-4 py-3 text-sm text-muted-foreground"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">Nama diambil dari data pendaftaran akun.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">NISN</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={formData.nisn}
                    onChange={(e) => setFormData({...formData, nisn: e.target.value.replace(/\D/g,'')})}
                    placeholder="Masukkan 10 digit NISN"
                    className="block w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Asal Sekolah (SMA/SMK/MA/Sederajat)</label>
                <input
                  type="text"
                  required
                  value={formData.school_origin}
                  onChange={(e) => setFormData({...formData, school_origin: e.target.value})}
                  placeholder="Contoh: SMA Negeri 1 Padang"
                  className="block w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pilihan Program Studi */}
          <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
            <div className="border-b border-border bg-primary/5 px-6 py-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold">2</div>
              <h2 className="font-display text-lg font-bold">Pilihan Program Studi</h2>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 flex gap-3">
                <GraduationCap className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pilih program studi yang Anda minati. Pilihan 1 adalah prioritas utama. Jika kuota penuh atau nilai seleksi tidak memenuhi, Anda akan dipertimbangkan untuk Pilihan 2.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 pt-2">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-foreground">Program Studi Pilihan 1 <span className="text-destructive">*</span></label>
                  <select
                    required
                    value={formData.first_choice_program_id}
                    onChange={(e) => setFormData({...formData, first_choice_program_id: e.target.value})}
                    className="block w-full rounded-xl border border-primary/30 bg-background px-4 py-3.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                  >
                    <option value="">-- Pilih Program Studi 1 --</option>
                    {programsByFaculty.map(group => (
                      <optgroup key={group.faculty.id} label={`Fakultas ${group.faculty.name}`}>
                        {group.programs.map(p => (
                          <option key={p.id} value={p.id}>{p.level} - {p.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-foreground">Program Studi Pilihan 2 (Opsional)</label>
                  <select
                    value={formData.second_choice_program_id}
                    onChange={(e) => setFormData({...formData, second_choice_program_id: e.target.value})}
                    className="block w-full rounded-xl border border-input bg-background px-4 py-3.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  >
                    <option value="">-- Pilih Program Studi 2 --</option>
                    {programsByFaculty.map(group => (
                      <optgroup key={group.faculty.id} label={`Fakultas ${group.faculty.name}`}>
                        {group.programs.map(p => (
                          <option key={p.id} value={p.id}>{p.level} - {p.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Link to="/pmb/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Batal
            </Link>
            
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-elevated transition-transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
              ) : (
                <><Save className="h-4 w-4" /> Simpan Formulir</>
              )}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
