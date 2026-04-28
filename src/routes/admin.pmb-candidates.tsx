import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/integrations/api/client";

export const Route = createFileRoute("/admin/pmb-candidates")({
  component: AdminPmbCandidates,
});

function AdminPmbCandidates() {
  const { data: candidates = [] } = useQuery({
    queryKey: ["admin_pmb_candidates"],
    queryFn: async () => {
      // @ts-ignore
      const { data, error } = await apiClient.request("/admin/pmb_candidates", {
        method: "GET"
      });
      if (error) throw new Error(error);
      return data || [];
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Data Pendaftar PMB</h1>
        <p className="text-muted-foreground mt-1">
          Verifikasi pembayaran dan dokumen persyaratan peserta PMB.
        </p>
      </div>
      
      <CrudTable
        table="pmb_candidates"
        queryKey="admin_pmb_candidates"
        uploadFolder="pmb"
        rows={candidates}
        defaults={{
          status: "DRAFT",
          full_name: "",
          nisn: "",
          phone_whatsapp: "",
          school_origin: "",
        }}
        renderRow={(r) => (
          <div className="flex justify-between items-center w-full min-w-0 gap-4">
            <div>
              <div className="font-bold text-sm">{r.full_name}</div>
              <div className="text-xs text-muted-foreground">
                {r.registration_number || "Belum ada No."} · NISN: {r.nisn || "-"}
              </div>
            </div>
            <div className="text-xs font-semibold px-2 py-1 rounded border border-border bg-card shadow-sm truncate max-w-[150px] text-center">
              {r.status}
            </div>
          </div>
        )}
        title="Peserta PMB"
        description="Daftar peserta yang melakukan pendaftaran"
        fields={[
          {
            name: "registration_number",
            label: "Nomor Pendaftaran",
            type: "text",
          },
          {
            name: "full_name",
            label: "Nama Lengkap",
            type: "text",
            required: true,
          },
          {
            name: "phone_whatsapp",
            label: "Nomor WhatsApp",
            type: "text",
          },
          {
            name: "nisn",
            label: "NISN",
            type: "text",
          },
          {
            name: "school_origin",
            label: "Asal Sekolah",
            type: "text",
          },
          {
            name: "first_choice_program_id",
            label: "Prodi Pilihan 1 (ID)",
            type: "text",
          },
          {
            name: "second_choice_program_id",
            label: "Prodi Pilihan 2 (ID)",
            type: "text",
          },
          {
            name: "status",
            label: "Status Pendaftar",
            type: "select",
            options: [
              { value: "DRAFT", label: "DRAFT (Baru Buat Akun)" },
              { value: "WAITING_PAYMENT", label: "WAITING PAYMENT (Isi Biodata)" },
              { value: "PAYMENT_VERIFIED", label: "PAYMENT VERIFIED (Telah Bayar)" },
              { value: "DOCUMENT_VERIFIED", label: "DOCUMENT VERIFIED (Berkas Valid)" },
              { value: "PASSED", label: "PASSED (Lulus Seleksi)" },
              { value: "FAILED", label: "FAILED (Tidak Lulus)" },
              { value: "ENROLLED", label: "ENROLLED (Sudah Daftar Ulang)" },
            ]
          },
        ]}
      />
    </div>
  );
}
