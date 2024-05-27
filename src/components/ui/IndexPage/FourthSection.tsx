import {
  CircleStackIcon,
  CodeBracketSquareIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  PresentationChartBarIcon,
  ShoppingBagIcon,
  Square3Stack3DIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { CustomLink } from "../shared";

interface Props {
  title: string;
  description: string;
  infoServices: Services[];
  lang: string;
}

interface Services {
  nameOfService: string;
  description: string;
  href: string;
  icon: any;
}

const iconMapping: { [key: string]: React.ElementType } = {
  PresentationChartBarIcon,
  CodeBracketSquareIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  ComputerDesktopIcon,
  CircleStackIcon,
  DevicePhoneMobileIcon,
  MegaphoneIcon,
  UsersIcon,
  Square3Stack3DIcon,
};

export const FourthSection = ({
  title,
  description,
  infoServices,
  lang,
}: Props) => {
  return (
    <>
      <div className="bg-primary-500">
        <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:max-w-7xl lg:px-8 lg:py-40">
          <h2 className="text-4xl font-bold tracking-tight text-white">
            {title}
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white">
            {description}
          </p>
          <div className="mt-20 grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-8 lg:gap-y-16">
            {infoServices.map((service) => {
              const IconComponent = iconMapping[service.icon];
              return (
                <div key={service.nameOfService}>
                  <div>
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white bg-opacity-10">
                      <IconComponent
                        className="h-8 w-8 text-white"
                        width={200}
                        height={200}
                        aria-hidden="true"
                        aria-describedby={`${service.nameOfService}`}
                      />
                    </span>
                  </div>
                  <div className="mt-6">
                    <CustomLink href={`/${lang}/${service.href}`} lang={lang}>
                      <h3 className="flex items-center text-lg font-semibold leading-8 text-white">
                        {service.nameOfService}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 192 192"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 text-white ml-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          />
                        </svg>
                      </h3>
                    </CustomLink>
                    <p className="mt-2 text-base leading-7 text-white">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
