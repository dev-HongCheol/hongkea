import { AUTH_ROUTES, getNavigationMenu } from "@/shared/config/routes";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui";
import { Menu } from "lucide-react";
import Image from "next/image";
import { type MenuItem } from "../model/types";
import SubMenuLink from "./SubMenuLink";
import { LOGO_CONFIG } from "../model/constants";

/**
 * Mobile navigation menu component
 * Displays mobile-optimized menu with sheet overlay and accordion navigation
 */
const MobileMenu = () => {
  const menus = getNavigationMenu();

  return (
    <div className="flex w-full items-center justify-between lg:hidden">
      {/* Logo */}
      <a href={LOGO_CONFIG.url} className="flex items-center gap-2">
        <Image
          src={LOGO_CONFIG.src}
          className="max-h-8 dark:invert"
          alt={LOGO_CONFIG.alt}
          width={87}
          priority
        />
      </a>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle></SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-6 p-4">
            <Accordion
              type="single"
              collapsible
              className="flex w-full flex-col gap-4"
            >
              {menus.map((item) => renderMobileMenuItem(item))}
            </Accordion>

            <div className="flex flex-col gap-3">
              <Button asChild variant="outline">
                <a href={AUTH_ROUTES.LOGIN.url}>{AUTH_ROUTES.LOGIN.label}</a>
              </Button>
              <Button asChild>
                <a href={AUTH_ROUTES.SIGNUP.url}>{AUTH_ROUTES.SIGNUP.label}</a>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.label} value={item.label} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.label}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <a href={subItem.url} key={subItem.label}>
              <SubMenuLink item={subItem} />
            </a>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a key={item.label} href={item.url} className="text-md font-semibold">
      {item.label}
    </a>
  );
};

export default MobileMenu;
