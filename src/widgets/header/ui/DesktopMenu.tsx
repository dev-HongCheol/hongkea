import { getNavigationMenu } from "@/shared/config/routes";
import Image from "next/image";
import HeaderActions from "./HeaderActions";
import MenuList from "./MenuList";
import { LOGO_CONFIG } from "../model/constants";

/**
 * Desktop navigation menu component
 * Displays logo, navigation menu, and action buttons for desktop screens
 */
const DesktopMenu = () => {
  const menus = getNavigationMenu();

  return (
    <nav className="hidden w-full items-center justify-between px-14 lg:flex">
      <div className="flex items-center gap-10">
        {/* Logo */}
        <a href={LOGO_CONFIG.url}>
          <Image
            src={LOGO_CONFIG.src}
            className="max-h-8 dark:invert"
            alt={LOGO_CONFIG.alt}
            width={87}
            priority
          />
        </a>
        <div className="flex items-center">
          <MenuList menus={menus} />
        </div>
      </div>

      {/* right */}
      <HeaderActions />
    </nav>
  );
};

export default DesktopMenu;
