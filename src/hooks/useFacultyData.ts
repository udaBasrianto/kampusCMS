import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/integrations/api/client";

export const useFacultyBySlug = (slug: string) =>
  useQuery({
    queryKey: ["faculty_slug", slug],
    queryFn: async () => {
      const { data, error } = await apiClient.getFacultyBySlug(slug);
      if (error) throw new Error(error);
      return data;
    },
  });

export const useFacultyPrograms = (facultyId?: string, includeInactive = false) =>
  useQuery({
    queryKey: ["faculty_programs", facultyId, includeInactive],
    enabled: !!facultyId,
    queryFn: async () => {
      const { data, error } = await apiClient.getPrograms();
      if (error) throw new Error(error);
      return data?.filter((p) => p.faculty_id === facultyId) ?? [];
    },
  });

export const useAllFacultyPrograms = (includeInactive = false) =>
  useQuery({
    queryKey: ["faculty_programs_all", includeInactive],
    queryFn: async () => {
      const { data, error } = await apiClient.getPrograms();
      if (error) throw new Error(error);
      return data ?? [];
    },
  });

export const useFacultyLecturers = (facultyId?: string, includeInactive = false) =>
  useQuery({
    queryKey: ["faculty_lecturers", facultyId, includeInactive],
    enabled: !!facultyId,
    queryFn: async () => {
      const { data, error } = await apiClient.getLecturers();
      if (error) throw new Error(error);
      return data?.filter((l) => l.faculty_id === facultyId) ?? [];
    },
  });

export const useAllFacultyLecturers = (includeInactive = false) =>
  useQuery({
    queryKey: ["faculty_lecturers_all", includeInactive],
    queryFn: async () => {
      const { data, error } = await apiClient.getLecturers();
      if (error) throw new Error(error);
      return data ?? [];
    },
  });

export const useFacultyBlogPosts = (facultyId?: string, limit = 6) =>
  useQuery({
    queryKey: ["faculty_blog_posts", facultyId, limit],
    enabled: !!facultyId,
    queryFn: async () => {
      const { data, error } = await apiClient.getBlogPosts();
      if (error) throw new Error(error);
      const posts = data?.filter((p) => p.faculty_id === facultyId) ?? [];
      return posts.slice(0, limit);
    },
  });

export const useFacultyNews = (facultyCode?: string, limit = 4) =>
  useQuery({
    queryKey: ["faculty_news", facultyCode, limit],
    enabled: !!facultyCode,
    queryFn: async () => {
      const { data, error } = await apiClient.getNews();
      if (error) throw new Error(error);
      return data?.slice(0, limit) ?? [];
    },
  });
