import { type RouteConfig } from "@/shared/config/routes";
import { getIconByUrl } from "../lib/getIconByUrl";

interface SubMenuLinkProps {
  item: RouteConfig;
}

/**
 * Sub menu link component for navigation dropdowns
 * Displays menu item with icon, title, and description
 */
const SubMenuLink = ({ item }: SubMenuLinkProps) => {
  return (
    <div className="hover:bg-muted hover:text-accent-foreground flex min-w-80 flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none">
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

export default SubMenuLink;
