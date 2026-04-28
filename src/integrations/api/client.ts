const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// ─── Shared Types ───────────────────────────────────────────────
export interface HeroSlide {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  image_url: string;
  cta_primary_label: string;
  cta_primary_href: string;
  cta_secondary_label: string;
  cta_secondary_href: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Faculty {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string;
  vision: string;
  mission: string;
  about_content: string;
  hero_title: string;
  hero_eyebrow: string;
  hero_description: string;
  cover_image_url: string;
  accent: string;
  active: boolean;
  programs: number;
  sort_order: number;
  facilities: unknown;
  contact_info: unknown;
  created_at: string;
  updated_at: string;
}

export interface FacultyProgram {
  id: string;
  faculty_id: string;
  name: string;
  level: string;
  description: string;
  accreditation: string;
  duration_years: number;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Lecturer {
  id: string;
  faculty_id: string;
  name: string;
  position: string;
  education: string;
  expertise: string;
  photo_url: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  date: string;
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  image_url: string;
  year: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  author_name: string;
  category: string;
  tags: string[];
  faculty_id: string;
  status: string;
  published_at: string;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
}

export interface PageItem {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  content: string;
  cover_image_url: string;
  published: boolean;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  faculty_ids?: string[];
  created_at?: string;
}

export interface DashboardStats {
  faculties: number;
  news: number;
  blog_posts: number;
  unread_messages: number;
}

export interface AnalyticsStat {
  date: string;
  label: string;
  pesan: number;
  konten: number;
  kunjungan: number;
}

export class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token);
      } else {
        localStorage.removeItem("auth_token");
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "An error occurred" }));
        return { error: error.error || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Network error" };
    }
  }

  private async uploadRequest<T>(endpoint: string, body: FormData): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {};

    if (this.token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers,
        body,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "An error occurred" }));
        return { error: error.error || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Network error" };
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ token: string; user: AppUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request("/auth/logout", { method: "POST" });
  }

  async getMe() {
    return this.request<AppUser>("/auth/me");
  }

  async saveRow(table: string, data: Record<string, unknown>, id?: string) {
    const endpoint = id ? `/admin/${table}/${id}` : `/admin/${table}`;
    return this.request(endpoint, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteRow(table: string, id: string) {
    return this.request(`/admin/${table}/${id}`, { method: "DELETE" });
  }

  async uploadImage(file: File, folder: string) {
    const body = new FormData();
    body.append("file", file);
    body.append("folder", folder);
    return this.uploadRequest<{ url: string }>("/admin/uploads", body);
  }

  // Hero Slides
  async getHeroSlides() {
    return this.request<HeroSlide[]>("/hero-slides");
  }

  // Faculties
  async getFaculties() {
    return this.request<Faculty[]>("/faculties");
  }

  async getFacultyBySlug(slug: string) {
    return this.request<Faculty>(`/faculties/${slug}`);
  }

  async getPrograms() {
    return this.request<FacultyProgram[]>("/programs");
  }

  async getLecturers() {
    return this.request<Lecturer[]>("/lecturers");
  }

  // News
  async getNews() {
    return this.request<NewsItem[]>("/news");
  }

  async getNewsByID(id: string) {
    return this.request<NewsItem>(`/news/${id}`);
  }

  // Testimonials
  async getTestimonials() {
    return this.request<Testimonial[]>("/testimonials");
  }

  // Blog
  async getBlogPosts() {
    return this.request<BlogPost[]>("/blog");
  }

  async getBlogPostBySlug(slug: string) {
    return this.request<BlogPost>(`/blog/${slug}`);
  }

  // Pages
  async getPageBySlug(slug: string) {
    return this.request<PageItem>(`/pages/${slug}`);
  }

  async getPages() {
    return this.request<PageItem[]>("/pages");
  }

  // Contact
  async submitContact(data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) {
    return this.request("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Admin - Hero Slides
  async createHeroSlide(data: Partial<HeroSlide>) {
    return this.request("/admin/hero-slides", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateHeroSlide(id: string, data: Partial<HeroSlide>) {
    return this.request(`/admin/hero-slides/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteHeroSlide(id: string) {
    return this.request(`/admin/hero-slides/${id}`, { method: "DELETE" });
  }

  // Admin - Faculties
  async createFaculty(data: Partial<Faculty>) {
    return this.request("/admin/faculties", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateFaculty(id: string, data: Partial<Faculty>) {
    return this.request(`/admin/faculties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteFaculty(id: string) {
    return this.request(`/admin/faculties/${id}`, { method: "DELETE" });
  }

  // Admin - News
  async createNews(data: Partial<NewsItem>) {
    return this.request("/admin/news", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateNews(id: string, data: Partial<NewsItem>) {
    return this.request(`/admin/news/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteNews(id: string) {
    return this.request(`/admin/news/${id}`, { method: "DELETE" });
  }

  // Admin - Testimonials
  async createTestimonial(data: Partial<Testimonial>) {
    return this.request("/admin/testimonials", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTestimonial(id: string, data: Partial<Testimonial>) {
    return this.request(`/admin/testimonials/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTestimonial(id: string) {
    return this.request(`/admin/testimonials/${id}`, { method: "DELETE" });
  }

  // Admin - Blog
  async createBlogPost(data: Partial<BlogPost>) {
    return this.request("/admin/blog", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateBlogPost(id: string, data: Partial<BlogPost>) {
    return this.request(`/admin/blog/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteBlogPost(id: string) {
    return this.request(`/admin/blog/${id}`, { method: "DELETE" });
  }

  // Admin - Pages
  async createPage(data: Partial<PageItem>) {
    return this.request("/admin/pages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePage(id: string, data: Partial<PageItem>) {
    return this.request(`/admin/pages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePage(id: string) {
    return this.request(`/admin/pages/${id}`, { method: "DELETE" });
  }

  // Admin - Messages
  async getMessages() {
    return this.request<ContactMessage[]>("/admin/messages");
  }

  async markMessageRead(id: string) {
    return this.request(`/admin/messages/${id}/read`, { method: "PUT" });
  }

  async updateMessageStatus(id: string, isRead: boolean) {
    return this.request(`/admin/messages/${id}/read`, {
      method: "PUT",
      body: JSON.stringify({ is_read: isRead }),
    });
  }

  async deleteMessage(id: string) {
    return this.request(`/admin/messages/${id}`, { method: "DELETE" });
  }

  // Admin - Users
  async getUsers() {
    return this.request<AppUser[]>("/admin/users");
  }

  async createUser(data: Partial<AppUser> & { password?: string }) {
    return this.request("/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: Partial<AppUser>) {
    return this.request(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, { method: "DELETE" });
  }

  // Admin - Settings
  async getSettings() {
    return this.request<SiteSetting[]>("/admin/settings");
  }

  async updateSettings(data: Partial<SiteSetting>) {
    return this.request("/admin/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<DashboardStats>("/admin/dashboard");
  }

  // Analytics
  async getAnalytics() {
    return this.request<AnalyticsStat[]>("/admin/analytics");
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
