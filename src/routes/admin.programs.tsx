import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/admin/CrudTable";
import { useFaculties } from "@/hooks/useCampusData";
import { useAllFacultyPrograms } from "@/hooks/useFacultyData";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/programs")({ component: Page });

function Page() {
  const { isAdmin, assignedFacultyIds } = useAuth();
  const { data: facultiesAll = [] } = useFaculties(true);
  const { data: allRows = [] } = useAllFacultyPrograms(true);
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
      title="Program Studi"
      description="Daftar program studi per fakultas. Tampil di halaman mini-site fakultas."
      table="faculty_programs"
      queryKey="faculty_programs_all"
      uploadFolder="programs"
      rows={data}
      defaults={{
        faculty_id: "",
        name: "",
        level: "S1",
        accreditation: "A",
        description: "",
        duration_years: 4,
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
        { name: "name", label: "Nama Program Studi", type: "text", required: true },
        {
          name: "level",
          label: "Jenjang",
          type: "select",
          required: true,
          options: [
            { label: "D3", value: "D3" },
            { label: "D4", value: "D4" },
            { label: "S1", value: "S1" },
            { label: "S2", value: "S2" },
            { label: "S3", value: "S3" },
            { label: "Profesi", value: "Profesi" },
          ],
        },
        { name: "accreditation", label: "Akreditasi (mis. Unggul, A, B)", type: "text" },
        { name: "duration_years", label: "Durasi (tahun)", type: "number" },
        { name: "description", label: "Deskripsi Program", type: "textarea" },
        { name: "sort_order", label: "Urutan", type: "number" },
        { name: "active", label: "Aktif", type: "boolean" },
      ]}
      renderRow={(r) => {
        const f = facultyMap[r.faculty_id as string];
        return (
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                {r.level}
              </span>
              {r.accreditation && (
                <span className="rounded-full bg-accent/10 px-2 py-0.5 font-semibold text-accent">
                  {r.accreditation}
                </span>
              )}
              {f && (
                <span className="text-muted-foreground">
                  {f.code} — {f.name}
                </span>
              )}
            </div>
            <div className="mt-1 font-display font-semibold truncate">{r.name}</div>
            <div className="text-xs text-muted-foreground truncate">{r.description}</div>
          </div>
        );
      }}
    />
  );
}
