import { CategorySection } from "@/widgets/mainCategory";
import { HeroSection } from "@/widgets/mainHero";

/**
 * Main page component - displays a simple HELLO message
 * This is the FSD page layer component that contains the main page logic
 */
export function MainPage() {
  return (
    <>
      <HeroSection />
      <CategorySection />
    </>
  );
}
