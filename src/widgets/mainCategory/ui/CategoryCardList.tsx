import React from "react";
import { getCategory } from "../lib/getCategory";
import Image from "next/image";
import Link from "next/link";

const CategoryCardList = () => {
  const categories = getCategory();
  return (
    <div className="mt-16 flex justify-center gap-5">
      {categories.map((category) => (
        <Link
          href={category.href}
          key={category.label}
          className="relative text-center"
        >
          <Image
            src={category.imageSrc}
            alt={`${category.label} image`}
            className="transition-transform duration-300 hover:scale-105"
          />
          <p className="mt-8 text-2xl font-semibold">{category.label}</p>
        </Link>
      ))}
    </div>
  );
};

export default CategoryCardList;
