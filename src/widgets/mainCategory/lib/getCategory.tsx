import { ROUTES } from "@/shared/config/routes";
import dining from "@/../public/main/main-dining.png";
import living from "@/../public/main/main-living.png";
import bedroom from "@/../public/main/main-bedroom.png";
import { StaticImageData } from "next/image";

type ProductCategoryLabel =
  (typeof ROUTES)["PRODUCTS"]["children"][number]["label"];

const getCategoryImage = (label: ProductCategoryLabel) => {
  let CategoryImage: StaticImageData;
  switch (label) {
    case "Dining": {
      CategoryImage = dining;
      break;
    }
    case "Living": {
      CategoryImage = living;
      break;
    }
    default: {
      CategoryImage = bedroom;
    }
  }

  return CategoryImage;
};

export const getCategory = () => {
  const categories = ROUTES["PRODUCTS"].children.map((subCategory) => ({
    label: subCategory.label,
    imageSrc: getCategoryImage(subCategory.label),
    href: subCategory.url,
  }));

  return categories;
};
