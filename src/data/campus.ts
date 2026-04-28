// Central data source — semua data dinamis di sini.
// Untuk mengubah landing page menjadi kampus lain, cukup edit objek-objek di file ini.

import heroCampus from "@/assets/hero-campus.jpg";
import studentsLibrary from "@/assets/students-library.jpg";
import graduation from "@/assets/graduation.jpg";
import researchLab from "@/assets/research-lab.jpg";
import alumni1 from "@/assets/alumni-1.jpg";
import alumni2 from "@/assets/alumni-2.jpg";
import alumni3 from "@/assets/alumni-3.jpg";

export const campusInfo = {
  shortName: "Universitas Perintis Indonesia",
  acronym: "UNPRI",
  tagline: "Berilmu, Berakhlak, Bermanfaat",
  description:
    "Universitas Perintis Indonesia menghadirkan pendidikan tinggi yang membentuk insan berilmu, berakhlak, dan bermanfaat bagi masyarakat.",
  established: 1980,
  address: "Jl. Adinegoro KM. 17 Simpang Kalumpang, Padang Pariaman, Sumatera Barat",
  email: "info@uperitis.ac.id",
  phone: "(0751) 8400433",
};

export const navigation = [
  { label: "Beranda", href: "/" },
  { label: "Tentang UNPRI", href: "/halaman/tentang" },
  { label: "Akademik", href: "#program" },
  { label: "Kehidupan Kampus", href: "#kampus" },
  { label: "Penelitian & Inovasi", href: "#berita" },
  { label: "Blog", href: "/blog" },
  { label: "Pendaftaran", href: "/halaman/penerimaan" },
];

export type HeroSlide = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
};

export const heroSlides: HeroSlide[] = [
  {
    eyebrow: "Penerimaan 2025/2026 Dibuka",
    title: "Wujudkan Masa Depanmu di Universitas Perintis Indonesia",
    description:
      "Bergabunglah dengan komunitas akademik terkemuka yang telah meluluskan lebih dari 80.000 alumni inspiratif di berbagai bidang.",
    image: heroCampus,
    ctaPrimary: { label: "Daftar Sekarang", href: "/" },
    ctaSecondary: { label: "Pelajari Program", href: "/" },
  },
  {
    eyebrow: "Riset & Inovasi",
    title: "Laboratorium Kelas Dunia untuk Riset Berdampak",
    description:
      "Fasilitas riset modern dengan kolaborasi internasional di bidang sains, teknologi, dan kemanusiaan.",
    image: researchLab,
    ctaPrimary: { label: "Jelajahi Riset", href: "/" },
    ctaSecondary: { label: "Pusat Studi", href: "/" },
  },
  {
    eyebrow: "Kehidupan Kampus",
    title: "Belajar Tanpa Batas di Lingkungan Inspiratif",
    description:
      "Perpustakaan digital, ruang kolaborasi, dan komunitas mahasiswa aktif yang membentuk pengalaman tak terlupakan.",
    image: studentsLibrary,
    ctaPrimary: { label: "Tur Virtual", href: "/" },
    ctaSecondary: { label: "Fasilitas", href: "/" },
  },
];

export const stats = [
  { value: "1980-an", label: "Berakar, Bertumbuh, Berdampak" },
  { value: "4", label: "Fakultas Program Unggulan" },
  { value: "1000+", label: "Mahasiswa Aktif Berkarya" },
  { value: "Luas", label: "Kerjasama Nasional & Internasional" },
];

export type Faculty = {
  code: string;
  name: string;
  description: string;
  programs: number;
  accent: "navy" | "cobalt" | "gold";
};

export const faculties: Faculty[] = [
  {
    code: "FT",
    name: "Fakultas Teknik",
    description: "Teknik Sipil, Mesin, Elektro, Informatika, Industri.",
    programs: 8,
    accent: "navy",
  },
  {
    code: "FEB",
    name: "Ekonomi & Bisnis",
    description: "Manajemen, Akuntansi, Ekonomi Pembangunan, Bisnis Digital.",
    programs: 6,
    accent: "cobalt",
  },
  {
    code: "FK",
    name: "Kedokteran",
    description: "Pendidikan Dokter, Kedokteran Gigi, Keperawatan, Farmasi.",
    programs: 5,
    accent: "gold",
  },
  {
    code: "FH",
    name: "Hukum",
    description: "Ilmu Hukum dengan konsentrasi bisnis, pidana, dan internasional.",
    programs: 3,
    accent: "navy",
  },
  {
    code: "FISIP",
    name: "Ilmu Sosial & Politik",
    description: "Hubungan Internasional, Komunikasi, Ilmu Politik, Sosiologi.",
    programs: 7,
    accent: "cobalt",
  },
  {
    code: "FMIPA",
    name: "MIPA",
    description: "Matematika, Fisika, Kimia, Biologi, Statistika.",
    programs: 5,
    accent: "gold",
  },
];

export type NewsItem = {
  category: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  featured?: boolean;
};

export const news: NewsItem[] = [
  {
    category: "Prestasi",
    title: "Tim Riset UNPRI Raih Penghargaan Inovasi Asia Pacific 2025",
    excerpt:
      "Penelitian energi terbarukan mahasiswa Fakultas Teknik mengalahkan 240 universitas dari 18 negara.",
    date: "12 April 2025",
    image: researchLab,
    featured: true,
  },
  {
    category: "Wisuda",
    title: "Wisuda Periode I Luluskan 2.847 Sarjana Baru",
    excerpt: "Rektor menekankan pentingnya kontribusi alumni bagi pembangunan nasional.",
    date: "28 Maret 2025",
    image: graduation,
  },
  {
    category: "Akademik",
    title: "Kerjasama Riset dengan Universitas Tokyo Resmi Ditandatangani",
    excerpt: "Program pertukaran dosen dan mahasiswa dimulai semester depan.",
    date: "20 Maret 2025",
    image: studentsLibrary,
  },
  {
    category: "Beasiswa",
    title: "Beasiswa Penuh untuk 500 Mahasiswa Berprestasi",
    excerpt: "Pendaftaran dibuka hingga 30 Mei 2025 untuk seluruh program studi.",
    date: "15 Maret 2025",
    image: heroCampus,
  },
];

export type Testimonial = {
  name: string;
  role: string;
  year: string;
  quote: string;
  image: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Dr. Anindya Sari",
    role: "Peneliti Senior, BRIN",
    year: "Alumni 2014, Teknik Kimia",
    quote:
      "UNPRI memberi saya fondasi riset yang kuat dan jaringan global. Setiap dosen mendorong kami untuk berpikir kritis dan berdampak.",
    image: alumni1,
  },
  {
    name: "Reza Pratama",
    role: "Co-Founder, TechVentura",
    year: "Alumni 2018, Informatika",
    quote:
      "Ekosistem inkubator startup di kampus ini benar-benar membentuk pola pikir saya sebagai entrepreneur. Pengalaman tak ternilai.",
    image: alumni2,
  },
  {
    name: "Salsabila Hakim",
    role: "Diplomat, Kemenlu RI",
    year: "Alumni 2016, Hubungan Internasional",
    quote:
      "Pembelajaran berbasis kasus dan simulasi diplomasi membuat saya siap terjun langsung ke karier internasional.",
    image: alumni3,
  },
];
