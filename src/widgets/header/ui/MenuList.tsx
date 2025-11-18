import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/shared/ui";
import { type MenuItem } from "../model/types";
import SubMenuLink from "./SubMenuLink";

interface MenuListProps {
  menus: readonly MenuItem[];
}

/**
 * Navigation menu list component
 * Renders desktop navigation menu with dropdowns
 */
const MenuList = ({ menus }: MenuListProps) => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {menus.map((item) => renderMenuItem(item))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.label}>
        <NavigationMenuTrigger className="text-base font-medium">
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
        className="bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-base font-medium transition-colors"
      >
        {item.label}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

export default MenuList;
