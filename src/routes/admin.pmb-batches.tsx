import { createFileRoute } from "@tanstack/react-router";
import { CrudTable, FieldDef } from "@/components/admin/CrudTable";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/integrations/api/client";

export const Route = createFileRoute("/admin/pmb-batches")({
  component: AdminPmbBatches,
});

function AdminPmbBatches() {
  const { data: batches = [] } = useQuery({
    queryKey: ["admin_pmb_batches"],
    queryFn: async () => {
      // @ts-ignore
      const { data, error } = await apiClient.request("/admin/pmb_batches", {
        method: "GET"
      });
      if (error) throw new Error(error);
      return data || [];
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Manajemen Gelombang PMB</h1>
        <p className="text-muted-foreground mt-1">
          Atur periode pendaftaran, jalur penerimaan, dan biaya formulir pendaftaran.
        </p>
      </div>
      
      <CrudTable
        table="pmb_batches"
        queryKey="admin_pmb_batches"
        uploadFolder="pmb"
        rows={batches}
        defaults={{
          name: "",
          academic_year: "",
          start_date: "",
          end_date: "",
          registration_fee: 250000,
          is_active: true
        }}
        renderRow={(r) => (
          <div className="flex justify-between items-center w-full min-w-0">
            <div>
              <div className="font-bold text-sm">{r.name} ({r.academic_year})</div>
              <div className="text-xs text-muted-foreground">Rp {Number(r.registration_fee).toLocaleString('id-ID')}</div>
            </div>
            <div className="text-xs font-semibold px-2 py-1 rounded bg-muted">
              {r.is_active ? 'Buka' : 'Tutup'}
            </div>
          </div>
        )}
        title="Gelombang Pendaftaran"
        description="Kelola batch/gelombang penerimaan mahasiswa baru"
        fields={[
          {
            name: "name",
            label: "Nama Gelombang / Jalur",
            type: "text",
            required: true,
            placeholder: "Contoh: Gelombang 1 Reguler",
          },
          {
            name: "academic_year",
            label: "Tahun Akademik",
            type: "text",
            required: true,
            placeholder: "Contoh: 2026/2027",
          },
          {
            name: "start_date",
            label: "Tanggal Buka (YYYY-MM-DD)",
            type: "text",
          },
          {
            name: "end_date",
            label: "Tanggal Tutup (YYYY-MM-DD)",
            type: "text",
          },
          {
            name: "registration_fee",
            label: "Biaya Formulir (Rp)",
            type: "number",
            required: true,
          },
          {
            name: "is_active",
            label: "Buka Pendaftaran (Aktif)",
            type: "boolean",
          },
        ]}
      />
    </div>
  );
}
