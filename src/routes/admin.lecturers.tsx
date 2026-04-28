import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";
import { useFaculties } from "@/hooks/useCampusData";
import { useAllFacultyLecturers } from "@/hooks/useFacultyData";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/lecturers")({ component: Page });

function Page() {
  const { isAdmin, assignedFacultyIds } = useAuth();
  const { data: facultiesAll = [] } = useFaculties(true);
  const { data: allRows = [] } = useAllFacultyLecturers(true);
  const faculties = isAdmin
    ? facultiesAll
    : facultiesAll.filter((f) => assignedFacultyIds.includes(f.id));
  const data = isAdmin
    ? allRows
    : allRows.filter((r) => assignedFacultyIds.includes(r.faculty_id as string));
  const facultyMap = Object.fromEntries(faculties.map((f) => [f.id, f]));
  const facultyOptions = faculties.map((f) => ({ label: `${f.code} — ${f.name}`, value: f.id }));

  return (
    <CrudTable
      title="Dosen"
      description="Daftar dosen per fakultas. Tampil di halaman mini-site fakultas."
      table="faculty_lecturers"
      queryKey="faculty_lecturers_all"
      uploadFolder="lecturers"
      rows={data}
      defaults={{
        faculty_id: "",
        name: "",
        photo_url: "",
        position: "",
        expertise: "",
        education: "",
        sort_order: 0,
      }}
      fields={[
        {
          name: "faculty_id",
          label: "Fakultas",
          type: "select",
          required: true,
          options: facultyOptions,
        },
        { name: "name", label: "Nama Lengkap (dengan gelar)", type: "text", required: true },
        { name: "photo_url", label: "Foto", type: "image" },
        { name: "position", label: "Jabatan (mis. Kepala Prodi, Dosen Tetap)", type: "text" },
        { name: "expertise", label: "Bidang Keahlian", type: "textarea" },
        { name: "education", label: "Riwayat Pendidikan", type: "textarea" },
        { name: "sort_order", label: "Urutan", type: "number" },
        { name: "active", label: "Aktif", type: "boolean" },
      ]}
      renderRow={(r) => {
        const f = facultyMap[r.faculty_id as string];
        return (
          <div className="flex items-center gap-3">
            {r.photo_url ? (
              <img
                src={r.photo_url as string}
                alt=""
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-muted" />
            )}
            <div className="min-w-0">
              <div className="font-display font-semibold truncate">{r.name}</div>
              <div className="text-xs text-muted-foreground">
                {r.position}
                {f && ` · ${f.code}`}
              </div>
              <div className="text-xs text-muted-foreground truncate">{r.expertise}</div>
            </div>
          </div>
        );
      }}
    />
  );
}
