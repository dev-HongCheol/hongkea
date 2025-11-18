import { Book, Sunset, Trees } from "lucide-react";

/**
 * Icon mapping based on URL
 * UI layer responsibility - determines which icon to show for each route
 */
export const getIconByUrl = (url: string): React.ReactNode => {
  const iconMapping: Record<string, React.ReactNode> = {
    "/products/dining": <Book className="size-5 shrink-0" />,
    "/products/living": <Trees className="size-5 shrink-0" />,
    "/products/bedroom": <Sunset className="size-5 shrink-0" />,
  };
  return iconMapping[url];
};
