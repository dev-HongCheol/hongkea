import { getFooterMenu } from "@/shared/config/routes";
import Link from "next/link";

const Footer = () => {
  const footerMenus = getFooterMenu();
  const labels = Object.keys(footerMenus) as (keyof typeof footerMenus)[];

  return (
    <div className="mx-auto my-12 border-t-1 px-5 pt-12 md:px-24">
      <div className="flex flex-col gap-9 md:flex-row md:gap-16">
        {/* left section */}
        <div className="max-w-[auto] md:max-w-64">
          <div className="text-2xl font-bold">HONGKEA</div>
          <p className="mt-3 text-base text-gray-400 lg:mt-12">
            216, Neungdong-ro, Gwangjin-gu, Seoul, Republic of Korea
            <br />
            ZIP. 04991
          </p>
        </div>

        <div className="flex gap-10 md:gap-36">
          {labels.map((label) => (
            <div className="flex flex-col gap-1 md:gap-11" key={label}>
              <p className="mb-3.5 text-base text-gray-400">{label}</p>
              {footerMenus[label].map((link) => (
                <Link href={link.url} key={link.label} className="font-medium">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <hr className="mt-11 mb-9" />
      <p className="text-base font-medium">2025 HONGKEA. All rights reverved</p>
    </div>
  );
};

export default Footer;
