import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";

const HeroContent = () => {
  return (
    <div
      className={cn(
        "absolute top-[10%] right-[10%] w-[40%] max-w-[643px] rounded-lg bg-[#FFF3E3] px-3 pt-5 pb-7",
        "lg:top-[17%] lg:right-[5%] lg:h-auto lg:min-w-[500px] lg:px-9 lg:pt-16",
      )}
    >
      <p className="text-base font-semibold tracking-widest">New Arrival</p>
      <h1 className="text-primary font-bold lg:text-[52px] lg:leading-[65px]">
        Discover Our
        <br />
        New Collection
      </h1>
      <p className="hidden pt-4 text-lg leading-6 font-medium md:block">
        공간의 완성
        <br />
        당신의 공간에 이야기를 더하다
      </p>

      <Button className="mt-11 cursor-pointer rounded-none lg:px-19 lg:py-9">
        BUY NOW
      </Button>
    </div>
  );
};

export default HeroContent;
