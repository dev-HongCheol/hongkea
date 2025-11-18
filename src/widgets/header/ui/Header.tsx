import {
  AUTH_ROUTES,
  getNavigationMenu,
  type RouteConfig,
} from "@/shared/config/routes";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui";
import { Book, Menu, Sunset, Trees } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import logoImg from "../../../../public/hongkea-logo.svg";

/**
 * Icon mapping based on URL
 * UI layer responsibility - determines which icon to show for each route
 */
const getIconByUrl = (url: string): React.ReactNode => {
  const iconMapping: Record<string, React.ReactNode> = {
    "/products/dining": <Book className="size-5 shrink-0" />,
    "/products/living": <Trees className="size-5 shrink-0" />,
    "/products/bedroom": <Sunset className="size-5 shrink-0" />,
  };
  return iconMapping[url];
};

/**
 * Extended MenuItem interface for internal use
 * Combines RouteConfig with items property for navigation
 */
interface MenuItem extends RouteConfig {
  items?: readonly RouteConfig[];
}

const Header = () => {
  const logo = useMemo(
    () => ({
      url: "/",
      src: logoImg,
      alt: "홍케아 로고",
      title: "홍케아",
    }),
    []
  );
  const menus = useMemo(() => getNavigationMenu(), []);

  return (
    <header className="flex items-center h-[100px] mx-auto max-w-[1440px]">
      {/* Desktop Menu */}
      <nav className="hidden items-center justify-between lg:flex w-full px-14">
        <div className="flex items-center gap-10">
          {/* Logo */}
          <a href={logo.url}>
            <Image
              src={logoImg}
              className="max-h-8 dark:invert"
              alt={logo.alt}
              width={87}
            />
          </a>
          <div className="flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                {menus.map((item) => renderMenuItem(item))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={AUTH_ROUTES.LOGIN.url}>{AUTH_ROUTES.LOGIN.label}</a>
          </Button>
          <Button asChild size="sm">
            <a href={AUTH_ROUTES.SIGNUP.url}>{AUTH_ROUTES.SIGNUP.label}</a>
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="block lg:hidden">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href={logo.url} className="flex items-center gap-2">
            <Image
              src={logoImg}
              className="max-h-8 dark:invert"
              alt={logo.alt}
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
                    <a href={AUTH_ROUTES.LOGIN.url}>
                      {AUTH_ROUTES.LOGIN.label}
                    </a>
                  </Button>
                  <Button asChild>
                    <a href={AUTH_ROUTES.SIGNUP.url}>
                      {AUTH_ROUTES.SIGNUP.label}
                    </a>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.label}>
        <NavigationMenuTrigger className="font-medium text-base">
          {item.label}
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink
              key={subItem.label}
              className="w-80"
              href={subItem.url}
            >
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.label}>
      <NavigationMenuLink
        href={item.url}
        className="bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 font-medium text-base transition-colors"
      >
        {item.label}
      </NavigationMenuLink>
    </NavigationMenuItem>
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

const SubMenuLink = ({ item }: { item: RouteConfig }) => {
  return (
    <div className="hover:bg-muted hover:text-accent-foreground flex min-w-80 select-none flex-row gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors">
      <div className="text-foreground my-auto">{getIconByUrl(item.url)}</div>
      <div>
        <div className="text-sm font-semibold">{item.label}</div>
        {item.description && (
          <p className="text-muted-foreground text-sm leading-snug">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default Header;
