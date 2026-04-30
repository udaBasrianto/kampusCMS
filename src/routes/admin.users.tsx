import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Shield, ShieldOff, UserPlus, Building2, Pencil, Loader2 } from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import { useAuth } from "@/hooks/useAuth";
import { useFaculties } from "@/hooks/useCampusData";

export const Route = createFileRoute("/admin/users")({ component: Page });

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: faculties = [] } = useFaculties(true);

  // Super Admins
  const { data: superAdmins = [] } = useQuery({
    queryKey: ["super_admins"],
    queryFn: async () => {
      const { data, error } = await apiClient.getUsers();
      if (error) throw new Error(error);
      return (data as any[])?.filter((u: any) => u.role === "admin") ?? [];
    },
  });

  // Faculty Admins
  const facultyAdminsQuery = useQuery({
    queryKey: ["faculty_admins_list"],
    queryFn: async () => {
      const { data, error } = await apiClient.getUsers();
      if (error) throw new Error(error);
      return (data as any[])?.filter((u: any) => u.role === "faculty_admin" && u.status !== "pending" && u.status !== "rejected") ?? [];
    },
  });

  // Pending Users (Pendaftar)
  const pendingUsersQuery = useQuery({
    queryKey: ["pending_users"],
    queryFn: async () => {
      const { data, error } = await apiClient.getUsers();
      if (error) throw new Error(error);
      return (data as any[])?.filter((u: any) => u.status === "pending") ?? [];
    },
  });

  // Regular Active Users
  const activeUsersQuery = useQuery({
    queryKey: ["active_users"],
    queryFn: async () => {
      const { data, error } = await apiClient.getUsers();
      if (error) throw new Error(error);
      return (data as any[])?.filter((u: any) => u.role === "user" && u.status === "active") ?? [];
    },
  });

  const [tab, setTab] = useState<"super" | "faculty" | "pending" | "user">("pending");

  // Form: add super admin
  const [superId, setSuperId] = useState("");
  const grantSuper = async () => {
    const uid = superId.trim();
    if (!uid) return;
    const { error } = await apiClient.createUser({
      email: uid, // Assuming uid is email for now
      role: "admin",
    });
    if (error) return toast.error(error);
    toast.success("Super Admin ditambahkan");
    setSuperId("");
    qc.invalidateQueries({ queryKey: ["super_admins"] });
  };

  const revokeSuper = async (uid: string) => {
    if (uid === user?.id) return toast.error("Tidak bisa mencabut role diri sendiri");
    if (!confirm("Cabut akses Super Admin?")) return;
    const { error } = await apiClient.deleteUser(uid);
    if (error) return toast.error(error);
    toast.success("Akses Super Admin dicabut");
    qc.invalidateQueries({ queryKey: ["super_admins"] });
  };

  // Form: create Faculty Admin
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    faculty_ids: [] as string[],
  });

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.faculty_ids.length === 0) return toast.error("Pilih minimal satu fakultas");
    if (form.password.length < 8) return toast.error("Password minimal 8 karakter");
    setCreating(true);
    try {
      const { error } = await apiClient.createUser({
        ...form,
        role: "faculty_admin",
      });
      if (error) {
        toast.error(error);
      } else {
        toast.success(`Faculty Admin dibuat`);
        setForm({ email: "", password: "", full_name: "", faculty_ids: [] });
        qc.invalidateQueries({ queryKey: ["faculty_admins_list"] });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat akun");
    } finally {
      setCreating(false);
    }
  };

  // CRUD for Regular Users
  const [creatingUser, setCreatingUser] = useState(false);
  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
    full_name: "",
  });

  const submitCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userForm.password.length < 6) return toast.error("Password minimal 6 karakter");
    setCreatingUser(true);
    try {
      const { error } = await apiClient.createUser({
        ...userForm,
        role: "user",
      });
      if (error) {
        toast.error(error);
      } else {
        toast.success(`User biasa dibuat`);
        setUserForm({ email: "", password: "", full_name: "" });
        qc.invalidateQueries({ queryKey: ["active_users"] });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat akun");
    } finally {
      setCreatingUser(false);
    }
  };

  const [editingUserUid, setEditingUserUid] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  
  const startEditUser = (u: any) => {
    setEditingUserUid(u.id);
    setEditUserForm({ full_name: u.full_name, email: u.email, password: "" });
  };

  const saveEditUser = async () => {
    if (!editingUserUid) return;
    const payload: any = {
      full_name: editUserForm.full_name,
      email: editUserForm.email,
    };
    if (editUserForm.password) {
      if (editUserForm.password.length < 6) return toast.error("Password minimal 6 karakter");
      payload.password = editUserForm.password;
    }
    const { error } = await apiClient.updateUser(editingUserUid, payload);
    if (error) return toast.error(error);
    toast.success("Data user diperbarui");
    setEditingUserUid(null);
    qc.invalidateQueries({ queryKey: ["active_users"] });
  };

  // Edit faculty admin assignments
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [editFids, setEditFids] = useState<string[]>([]);
  const startEdit = (uid: string, fids: string[]) => {
    setEditingUid(uid);
    setEditFids(fids);
  };

  const saveEdit = async () => {
    if (!editingUid) return;
    const { error } = await apiClient.updateUser(editingUid, { faculty_ids: editFids });
    if (error) return toast.error(error);
    toast.success("Penugasan diperbarui");
    setEditingUid(null);
    qc.invalidateQueries({ queryKey: ["faculty_admins_list"] });
  };

  const revokeFaculty = async (uid: string) => {
    if (uid === user?.id) return toast.error("Tidak bisa menghapus diri sendiri");
    if (
      !confirm(
        "Cabut akses Faculty Admin & hapus semua penugasannya? Akun login tetap ada, hanya role yang dicabut.",
      )
    )
      return;
    const { error } = await apiClient.deleteUser(uid);
    if (error) return toast.error("Gagal mencabut akses");
    toast.success("Akses Faculty Admin dicabut");
    qc.invalidateQueries({ queryKey: ["faculty_admins_list"] });
  };

  const facultyMap = Object.fromEntries(faculties.map((f: any) => [f.id, f]));
  const toggleFid = (list: string[], setList: (v: string[]) => void, fid: string) => {
    setList(list.includes(fid) ? list.filter((x) => x !== fid) : [...list, fid]);
  };

  const approveUser = async (uid: string) => {
    if (!confirm("Setujui pendaftaran user ini? Mereka akan bisa login sebagai user biasa.")) return;
    const { error } = await apiClient.updateUser(uid, { status: "active", faculty_ids: [] });
    if (error) return toast.error("Gagal menyetujui: " + error);
    toast.success("User disetujui");
    qc.invalidateQueries({ queryKey: ["pending_users"] });
  };

  const rejectUser = async (uid: string) => {
    if (!confirm("Tolak pendaftaran user ini?")) return;
    const { error } = await apiClient.updateUser(uid, { status: "rejected", faculty_ids: [] });
    if (error) return toast.error("Gagal menolak: " + error);
    toast.success("User ditolak");
    qc.invalidateQueries({ queryKey: ["pending_users"] });
  };

      const fAdmins = facultyAdminsQuery.data ?? [];
  const pendingUsers = pendingUsersQuery.data ?? [];
  const activeUsers = activeUsersQuery.data ?? [];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Admin & Users</h1>
      <p className="mt-1 text-muted-foreground">
        Kelola Pendaftar, User Biasa, Faculty Admin, dan Super Admin.
      </p>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 rounded-lg border border-border bg-card p-1">
        <button
          onClick={() => setTab("pending")}
          className={`rounded-md px-4 py-1.5 text-sm font-semibold ${tab === "pending" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          Pendaftar Baru ({pendingUsers.length})
        </button>
        <button
          onClick={() => setTab("user")}
          className={`rounded-md px-4 py-1.5 text-sm font-semibold ${tab === "user" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          User Aktif ({activeUsers.length})
        </button>
        <button
          onClick={() => setTab("faculty")}
          className={`rounded-md px-4 py-1.5 text-sm font-semibold ${tab === "faculty" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          Faculty Admin ({fAdmins.length})
        </button>
        <button
          onClick={() => setTab("super")}
          className={`rounded-md px-4 py-1.5 text-sm font-semibold ${tab === "super" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          Super Admin ({superAdmins.length})
        </button>
      </div>

      {tab === "pending" && (
        <div className="mt-6 grid gap-3">
          <h2 className="font-display text-lg font-semibold">Menunggu Persetujuan</h2>
          {pendingUsersQuery.isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}
          {pendingUsers.length === 0 && !pendingUsersQuery.isLoading && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              Tidak ada pendaftar baru yang menunggu persetujuan.
            </div>
          )}
          {pendingUsers.map((u: any) => (
            <div key={u.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-semibold truncate">{u.full_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Mendaftar pada: {new Date(u.created_at).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => approveUser(u.id)}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Setujui
                </button>
                <button
                  onClick={() => rejectUser(u.id)}
                  className="rounded-lg border border-input px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                >
                  Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "user" && (
        <div className="mt-6 grid gap-6">
          {/* Form Create User Biasa */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Tambah User Baru
            </h2>
            <form onSubmit={submitCreateUser} className="mt-4 grid gap-4 sm:grid-cols-3 items-end">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input px-3 py-2 text-sm bg-background"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input px-3 py-2 text-sm bg-background"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Password</label>
                  <input
                    type="text"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-input px-3 py-2 text-sm bg-background"
                    placeholder="Min. 6 karakter"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {creatingUser ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buat"}
                </button>
              </div>
            </form>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold mb-3">Daftar User Biasa (Aktif)</h2>
            {activeUsersQuery.isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}
            {activeUsers.length === 0 && !activeUsersQuery.isLoading && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                Belum ada user biasa yang aktif.
              </div>
            )}
            <div className="grid gap-3">
              {activeUsers.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                  {editingUserUid === u.id ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div>
                        <label className="text-xs text-muted-foreground">Nama Lengkap</label>
                        <input
                          type="text"
                          value={editUserForm.full_name}
                          onChange={(e) => setEditUserForm({ ...editUserForm, full_name: e.target.value })}
                          className="mt-1 w-full rounded-md border border-input px-3 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Email</label>
                        <input
                          type="email"
                          value={editUserForm.email}
                          onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                          className="mt-1 w-full rounded-md border border-input px-3 py-1.5 text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground">Password (opsional)</label>
                          <input
                            type="text"
                            placeholder="Biarkan kosong jika tidak diubah"
                            value={editUserForm.password}
                            onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                            className="mt-1 w-full rounded-md border border-input px-3 py-1.5 text-sm"
                          />
                        </div>
                        <div className="mt-5 flex gap-1">
                          <button onClick={saveEditUser} className="rounded-md bg-primary px-3 py-1.5 text-xs text-white">Simpan</button>
                          <button onClick={() => setEditingUserUid(null)} className="rounded-md bg-muted px-3 py-1.5 text-xs">Batal</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Shield className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-display font-semibold truncate">{u.full_name}</div>
                          <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Bergabung pada: {new Date(u.created_at).toLocaleString("id-ID")}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => startEditUser(u)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                          title="Edit User"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm("Hapus user ini?")) return;
                            const { error } = await apiClient.deleteUser(u.id);
                            if (error) return toast.error("Gagal menghapus user");
                            toast.success("User dihapus");
                            qc.invalidateQueries({ queryKey: ["active_users"] });
                          }}
                          className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                          title="Hapus User"
                        >
                          <ShieldOff className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "faculty" && (
        <>
          {/* Form buat Faculty Admin baru */}
          <form
            onSubmit={submitCreate}
            className="mt-6 rounded-2xl border border-border bg-card p-6 space-y-4"
          >
            <div>
              <h2 className="font-display text-lg font-semibold">Buat Akun Faculty Admin Baru</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Akun langsung aktif. Berikan email & password ke admin fakultas, sarankan ganti
                password setelah login pertama.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Nama Lengkap</label>
                <input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Dr. Andi"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="admin.ft@kampus.ac.id"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Password Sementara (min. 8 karakter)
                </label>
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                  placeholder="Contoh: Kampus2026!"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Tugaskan ke Fakultas (boleh lebih dari satu)
              </label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {faculties.map((f: any) => (
                  <label
                    key={f.id}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ${form.faculty_ids.includes(f.id) ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <input
                      type="checkbox"
                      checked={form.faculty_ids.includes(f.id)}
                      onChange={() =>
                        toggleFid(
                          form.faculty_ids,
                          (v) => setForm({ ...form, faculty_ids: v }),
                          f.id,
                        )
                      }
                    />
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">
                      {f.code}
                    </span>
                    <span className="truncate">{f.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Buat Akun Faculty Admin
            </button>
          </form>

          {/* List faculty admins */}
          <div className="mt-6 grid gap-3">
            <h2 className="font-display text-lg font-semibold">Daftar Faculty Admin</h2>
            {facultyAdminsQuery.isLoading && (
              <p className="text-sm text-muted-foreground">Memuat...</p>
            )}
            {fAdmins.length === 0 && !facultyAdminsQuery.isLoading && (
              <p className="text-sm text-muted-foreground">
                Belum ada faculty admin. Buat yang pertama di atas.
              </p>
            )}
            {fAdmins.map((a: any) => (
              <div key={a.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-semibold truncate">
                        {a.full_name || a.email}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{a.email}</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {a.faculty_ids?.length === 0 && (
                          <span className="text-xs text-destructive">Belum ditugaskan</span>
                        )}
                        {a.faculty_ids?.map((fid: string) => (
                          <span
                            key={fid}
                            className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
                          >
                            {facultyMap[fid]?.code ?? "?"}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => startEdit(a.id, a.faculty_ids || [])}
                      className="inline-flex items-center gap-1 rounded-lg border border-input px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit Penugasan
                    </button>
                    <button
                      onClick={() => revokeFaculty(a.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-input px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                    >
                      <ShieldOff className="h-3.5 w-3.5" /> Cabut
                    </button>
                  </div>
                </div>

                {editingUid === a.id && (
                  <div className="mt-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
                    <div className="text-xs font-semibold text-muted-foreground">
                      Pilih fakultas yang ditugaskan:
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {faculties.map((f: any) => (
                        <label
                          key={f.id}
                          className={`flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-sm cursor-pointer ${editFids.includes(f.id) ? "border-primary" : "border-border"}`}
                        >
                          <input
                            type="checkbox"
                            checked={editFids.includes(f.id)}
                            onChange={() => toggleFid(editFids, setEditFids, f.id)}
                          />
                          <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">
                            {f.code}
                          </span>
                          <span className="truncate">{f.name}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingUid(null)}
                        className="rounded-lg border border-input px-3 py-1.5 text-xs font-semibold"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "super" && (
        <>
          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Tambah Super Admin</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              User harus mendaftar dulu di <code className="rounded bg-muted px-1">/auth</code>,
              lalu tempel User ID-nya.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                value={superId}
                onChange={(e) => setSuperId(e.target.value)}
                placeholder="UUID user"
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
              />
              <button
                onClick={grantSuper}
                disabled={!superId}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" /> Jadikan Super Admin
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <h2 className="font-display text-lg font-semibold">
              Super Admin Saat Ini ({superAdmins.length})
            </h2>
            {superAdmins.map((a: any) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-gold-foreground">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-sm truncate">{a.user_id}</div>
                    <div className="text-xs text-muted-foreground">
                      Sejak {new Date(a.created_at).toLocaleDateString("id-ID")}
                      {a.user_id === user?.id && " · Anda"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => revokeSuper(a.user_id)}
                  disabled={a.user_id === user?.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShieldOff className="h-3.5 w-3.5" /> Cabut
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
