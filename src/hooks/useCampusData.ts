import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/integrations/api/client";

export const useHeroSlides = (includeInactive = false) =>
  useQuery({
    queryKey: ["hero_slides", includeInactive],
    queryFn: async () => {
      const { data, error } = await apiClient.getHeroSlides();
      if (error) throw new Error(error);
      return data;
    },
  });

export const useFaculties = (includeInactive = false) =>
  useQuery({
    queryKey: ["faculties", includeInactive],
    queryFn: async () => {
      const { data, error } = await apiClient.getFaculties();
      if (error) throw new Error(error);
      return data;
    },
  });

export const useNews = (includeInactive = false) =>
  useQuery({
    queryKey: ["news", includeInactive],
    queryFn: async () => {
      const { data, error } = await apiClient.getNews();
      if (error) throw new Error(error);
      return data;
    },
  });

export const useTestimonials = (includeInactive = false) =>
  useQuery({
    queryKey: ["testimonials", includeInactive],
    queryFn: async () => {
      const { data, error } = await apiClient.getTestimonials();
      if (error) throw new Error(error);
      return data;
    },
  });

export const useBlogPosts = (includeDrafts = false) =>
  useQuery({
    queryKey: ["blog_posts", includeDrafts],
    queryFn: async () => {
      const { data, error } = await apiClient.getBlogPosts();
      if (error) throw new Error(error);
      return data;
    },
  });

export const useBlogPost = (slug: string) =>
  useQuery({
    queryKey: ["blog_post", slug],
    queryFn: async () => {
      const { data, error } = await apiClient.getBlogPostBySlug(slug);
      if (error) throw new Error(error);
      return data;
    },
  });

export const usePages = (includeUnpublished = false) =>
  useQuery({
    queryKey: ["pages", includeUnpublished],
    queryFn: async () => {
      const { data, error } = await apiClient.getPages();
      if (error) throw new Error(error);
      return data;
    },
  });

export const usePage = (slug: string) =>
  useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await apiClient.getPageBySlug(slug);
      if (error) throw new Error(error);
      return data;
    },
  });

export type SettingsMap = Record<string, Record<string, unknown>>;

export const useSiteSettings = () =>
  useQuery({
    queryKey: ["site_settings"],
    queryFn: async (): Promise<SettingsMap> => {
      const { data, error } = await apiClient.getSettings();
      if (error) throw new Error(error);
      const map: SettingsMap = {};
      for (const row of data ?? []) {
        map[row.key] = (row.value as Record<string, unknown>) ?? {};
      }
      return map;
    },
  });

export const useContactMessages = () =>
  useQuery({
    queryKey: ["contact_messages"],
    queryFn: async () => {
      const { data, error } = await apiClient.getMessages();
      if (error) throw new Error(error);
    },
  });

export const useAnalytics = () =>
  useQuery({
    queryKey: ["analytics_stats"],
    queryFn: async () => {
      const { data, error } = await apiClient.getAnalytics();
      if (error) throw new Error(error);
      return data || [];
    },
  });
