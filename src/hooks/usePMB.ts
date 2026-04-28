import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/integrations/api/client";

export interface CandidateProfile {
  id: string;
  registration_number: string | null;
  full_name: string;
  nisn: string | null;
  phone_whatsapp: string | null;
  school_origin: string | null;
  first_choice_program_id: string | null;
  second_choice_program_id: string | null;
  status: "DRAFT" | "WAITING_PAYMENT" | "PAYMENT_VERIFIED" | "DOCUMENT_VERIFIED" | "PASSED" | "FAILED" | "ENROLLED";
}

export const useCandidateProfile = () => {
  return useQuery({
    queryKey: ["pmb_candidate_profile"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No token found");

      const { data, error } = await apiClient.request<CandidateProfile>("/api/v1/pmb/candidate-profile", "GET", null, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (error) throw new Error(error);
      return data;
    },
    retry: false,
  });
};
