import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { HeroSlider } from "@/components/site/HeroSlider";
import { StatsBar } from "@/components/site/StatsBar";
import { Faculties } from "@/components/site/Faculties";
import { News } from "@/components/site/News";
import { CampusEvents } from "@/components/site/CampusEvents";
import { Testimonials } from "@/components/site/Testimonials";
import { CtaBanner } from "@/components/site/CtaBanner";
import { Footer } from "@/components/site/Footer";
import { campusInfo } from "@/data/campus";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${campusInfo.shortName} — ${campusInfo.tagline}` },
      { name: "description", content: campusInfo.description },
      { property: "og:title", content: `${campusInfo.shortName} — ${campusInfo.tagline}` },
      { property: "og:description", content: campusInfo.description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSlider />
        <StatsBar />
        <Faculties />
        <News />
        <CampusEvents />
        <Testimonials />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
