import HeroImg from "@/../public/main/main-hero.png";
import Image from "next/image";
import HeroContent from "./HeroContent";

const HeroSection = () => {
  return (
    <section className="relative">
      <Image src={HeroImg} alt="hero image" priority className="relative z-0" />
      <HeroContent />
    </section>
  );
};

export default HeroSection;
