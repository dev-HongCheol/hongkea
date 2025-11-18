import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";

/**
 * Header widget component
 * Main header containing navigation for both desktop and mobile layouts
 */

const Header = () => {
  // TODO: GSAP으로 좀더 이쁘게 해보자.
  return (
    <header className="sticky top-0 mx-auto flex h-auto max-w-[1440px] items-center bg-(--background) lg:h-[100px]">
      <DesktopMenu />
      <MobileMenu />
    </header>
  );
};

export default Header;
