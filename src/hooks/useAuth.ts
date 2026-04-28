import { useEffect, useState } from "react";
import { apiClient } from "@/integrations/api/client";

export type AppUser = {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  faculty_ids?: string[];
};

export type AppSession = {
  user: AppUser;
  access_token: string;
};

export type AuthState = {
  session: AppSession | null;
  user: AppUser | null;
  isAdmin: boolean;
  isFacultyAdmin: boolean;
  assignedFacultyIds: string[];
  loading: boolean;
};

export async function login(email: string, password: string) {
  const { data, error } = await apiClient.login(email, password);
  if (error) throw new Error(error);
  if (!data?.token || !data.user) throw new Error("Login gagal");
  apiClient.setToken(data.token);
  window.dispatchEvent(new Event("auth-changed"));
  return data.user;
}

export async function logout() {
  await apiClient.logout();
  apiClient.setToken(null);
  window.dispatchEvent(new Event("auth-changed"));
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      const token = apiClient.getToken();
      if (!token) {
        if (!cancelled) {
          setSession(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const { data, error } = await apiClient.getMe();
      if (cancelled) return;
      if (error || !data) {
        apiClient.setToken(null);
        setSession(null);
      } else {
        setSession({ user: data, access_token: token });
      }
      setLoading(false);
    };

    void loadUser();
    window.addEventListener("auth-changed", loadUser);
    return () => {
      cancelled = true;
      window.removeEventListener("auth-changed", loadUser);
    };
  }, []);

  const user = session?.user ?? null;
  const isAdmin = user?.role === "admin";
  const isFacultyAdmin = user?.role === "faculty_admin";

  return {
    session,
    user,
    isAdmin,
    isFacultyAdmin,
    assignedFacultyIds: user?.faculty_ids ?? [],
    loading,
  };
}
