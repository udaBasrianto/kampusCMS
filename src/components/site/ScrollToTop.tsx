import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibilityAndProgress = () => {
      const scrolled = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      // Calculate progress (0 to 100)
      if (height > 0) {
        const progress = (scrolled / height) * 100;
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }

      // Show button when scrolled past 300px
      if (scrolled > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibilityAndProgress, { passive: true });
    
    // Initial call
    toggleVisibilityAndProgress();

    return () => {
      window.removeEventListener("scroll", toggleVisibilityAndProgress);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // SVG Circle calculations
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      className={cn(
        "group fixed bottom-24 lg:bottom-8 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-elevated transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      )}
    >
      {/* Background track circle */}
      <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted/40"
        />
        {/* Progress circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-primary transition-all duration-150 ease-out"
        />
      </svg>
      
      <ArrowUp className="h-5 w-5 text-primary transition-transform group-hover:-translate-y-0.5" />
    </button>
  );
}
