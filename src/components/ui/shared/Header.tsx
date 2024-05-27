"use client";

import { Fragment, useState } from "react";
import Image from "next/image";

import { whatsappBusinessLink } from "../../../data";

import { Popover, Transition } from "@headlessui/react";

import {
  Bars3Icon,
  PresentationChartBarIcon,
  PlayIcon,
  CodeBracketSquareIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
  RectangleStackIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  ComputerDesktopIcon,
  CircleStackIcon,
  DevicePhoneMobileIcon,
  MegaphoneIcon,
  UsersIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { CustomLink, LocaleSwitcher } from ".";

export interface HeaderProps {
  firstColumn: string;
  secondColumn: string;
  thirdColumn: string;
  fourthColumn: string;
  fifthColumn: string;
  sixthColumn: string;
  callToActionServices: string;
  moreTitle1: string;
  moreTitle2: string;
  moreTitle3: string;
  moreCallToAction: string;
  titleResponsive1: string;
  titleResponsive2: string;
  titleResponsive3: string;
  titleResponsive4: string;
  titleResponsive5: string;
  titleResponsive6: string;
  callToActionResponsive: string;
  services: Article[];
  callsToAction: Article[];
  company: Article[];
  articles: Article[];
  blogPosts: BlogPost[];
  lang: string;
}

export interface Article {
  name: string;
  href: string;
  icon: string;
  description?: string;
}

export interface BlogPost {
  id: number;
  name: string;
  href: string;
  preview: string;
  imageUrl: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const iconMappingServices: { [key: string]: React.ElementType } = {
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

const iconMappingCompany: { [key: string]: React.ElementType } = {
  BookOpenIcon,
  RectangleStackIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
};

const iconMappingCallsToAction: { [key: string]: React.ElementType } = {
  PlayIcon,
  RectangleStackIcon,
  ChatBubbleLeftRightIcon,
};

const iconMappingArticles: { [key: string]: React.ElementType } = {
  DocumentDuplicateIcon,
};

export const Header = ({
  firstColumn,
  secondColumn,
  thirdColumn,
  fourthColumn,
  fifthColumn,
  sixthColumn,
  callToActionServices,
  moreTitle1,
  moreTitle2,
  moreTitle3,
  moreCallToAction,
  titleResponsive1,
  titleResponsive2,
  titleResponsive3,
  titleResponsive4,
  titleResponsive5,
  titleResponsive6,
  callToActionResponsive,
  services,
  callsToAction,
  company,
  articles,
  blogPosts,
  lang,
}: HeaderProps) => {
  const [isShowingServices, setIsShowingServices] = useState(false);
  const [isShowingMore, setIsShowingMore] = useState(false);
  const [isShowingResponsiveMenu, setIsShowingResponsiveMenu] = useState(false);

  const handleShowingServices = () => {
    setIsShowingServices(!isShowingServices);
  };

  const handleShowingMore = () => {
    setIsShowingMore(!isShowingMore);
  };

  const handleShowingResponsiveMenu = () => {
    setIsShowingResponsiveMenu(!isShowingResponsiveMenu);
  };

  return (
    <>
      <Popover className="relative bg-white">
        <div
          className="pointer-events-none absolute inset-0 z-30 shadow"
          aria-hidden="true"
        />
        <div className="relative z-20">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 sm:py-4 md:justify-start md:space-x-10 lg:px-8">
            <div>
              <CustomLink href="/" className="flex" lang={lang}>
                <span className="sr-only">imSoft</span>
                <Image
                  className="h-8 w-auto sm:h-10"
                  src="https://res.cloudinary.com/https-imsoft-io/image/upload/v1706594671/imsoft-images/imsoft/logotipo-imsoft-transparente-azul-rectangular.png"
                  alt="imSoft"
                  width={111}
                  height={40}
                />
              </CustomLink>
            </div>
            <div className="flex-1" />
            <div className="-my-2 -mr-2 md:hidden">
              <Popover.Button
                onClick={handleShowingResponsiveMenu}
                className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Abrir Menu imSoft</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </Popover.Button>
            </div>
            <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
              <Popover.Group as="nav" className="flex space-x-10">
                <CustomLink
                  href="/"
                  className="text-base font-medium text-gray-500 hover:text-gray-900"
                  lang={lang}
                >
                  {firstColumn}
                </CustomLink>
                <Popover>
                  {({ open }) => (
                    <>
                      <Popover.Button
                        className={classNames(
                          open ? "text-gray-900" : "text-gray-500",
                          "group inline-flex items-center rounded-md bg-white text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        )}
                        onMouseEnter={handleShowingServices}
                        onMouseLeave={handleShowingServices}
                      >
                        <span>{secondColumn}</span>
                        <ChevronDownIcon
                          className={classNames(
                            open ? "text-gray-600" : "text-gray-400",
                            "ml-2 h-5 w-5 group-hover:text-gray-500"
                          )}
                          aria-hidden="true"
                        />
                      </Popover.Button>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 -translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 -translate-y-1"
                        show={isShowingServices}
                      >
                        <Popover.Panel
                          onMouseEnter={handleShowingServices}
                          onMouseLeave={handleShowingServices}
                          className="absolute inset-x-0 top-full z-10 hidden transform bg-white shadow-lg md:block"
                        >
                          <div className="mx-auto grid max-w-7xl gap-y-6 px-4 py-6 sm:grid-cols-2 sm:gap-8 sm:px-6 sm:py-8 lg:grid-cols-5 lg:px-8 lg:py-12 xl:py-12">
                            {services.map((item) => {
                              const IconComponent =
                                iconMappingServices[item.icon];
                              return (
                                <CustomLink
                                  key={item.name}
                                  href={item.href}
                                  className="-m-3 flex flex-col justify-between rounded-lg p-3 hover:bg-gray-50"
                                  onClick={handleShowingServices}
                                  lang={lang}
                                >
                                  <div className="flex md:h-full lg:flex-col">
                                    <div className="flex-shrink-0">
                                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white sm:h-12 sm:w-12">
                                        <IconComponent
                                          className="h-6 w-6"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    </div>
                                    <div className="ml-4 md:flex md:flex-1 md:flex-col md:justify-between lg:ml-0 lg:mt-4">
                                      <div>
                                        <p className="text-xl font-medium text-gray-900">
                                          {item.name}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                          {item.description}
                                        </p>
                                      </div>
                                      <p className="mt-2 text-sm font-medium text-primary-600 lg:mt-4">
                                        {callToActionServices}
                                        <span aria-hidden="true"> &rarr;</span>
                                      </p>
                                    </div>
                                  </div>
                                </CustomLink>
                              );
                            })}
                          </div>
                          <div className="bg-gray-50">
                            <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:flex sm:space-y-0 sm:space-x-10 sm:px-6 lg:px-8">
                              {callsToAction.map((item) => {
                                const IconComponent =
                                  iconMappingCallsToAction[item.icon];
                                return (
                                  <div key={item.name} className="flow-root">
                                    <CustomLink
                                      href={item.href}
                                      target="_blank"
                                      className="-m-3 flex items-center rounded-md p-3 text-base font-medium text-gray-900 hover:bg-gray-100"
                                      onClick={handleShowingServices}
                                      lang={lang}
                                    >
                                      <IconComponent
                                        className="h-6 w-6 flex-shrink-0 text-gray-400"
                                        aria-hidden="true"
                                      />
                                      <span className="ml-3">{item.name}</span>
                                    </CustomLink>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </Popover.Panel>
                      </Transition>
                    </>
                  )}
                </Popover>
                <CustomLink
                  href="/nosotros"
                  className="text-base whitespace-nowrap font-medium text-gray-500 hover:text-gray-900"
                  lang={lang}
                >
                  {thirdColumn}
                </CustomLink>
                <CustomLink
                  href="/portafolio"
                  className="text-base font-medium text-gray-500 hover:text-gray-900"
                  lang={lang}
                >
                  {fourthColumn}
                </CustomLink>
                <Popover>
                  {({ open }) => (
                    <>
                      <Popover.Button
                        className={classNames(
                          open ? "text-gray-900" : "text-gray-500",
                          "group inline-flex items-center rounded-md bg-white text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        )}
                        onMouseEnter={handleShowingMore}
                        onMouseLeave={handleShowingMore}
                      >
                        <span>{fifthColumn}</span>
                        <ChevronDownIcon
                          className={classNames(
                            open ? "text-gray-600" : "text-gray-400",
                            "ml-2 h-5 w-5 group-hover:text-gray-500"
                          )}
                          aria-hidden="true"
                        />
                      </Popover.Button>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 -translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 -translate-y-1"
                        show={isShowingMore}
                      >
                        <Popover.Panel
                          onMouseEnter={handleShowingMore}
                          onMouseLeave={handleShowingMore}
                          className="absolute inset-x-0 top-full z-10 hidden transform shadow-lg md:block"
                        >
                          <div className="absolute inset-0 flex">
                            <div className="w-1/2 bg-white" />
                            <div className="w-1/2 bg-gray-50" />
                          </div>
                          <div className="relative mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
                            <nav className="grid gap-y-10 bg-white px-4 py-8 sm:grid-cols-2 sm:gap-x-8 sm:py-12 sm:px-6 lg:px-8 xl:pr-12">
                              <div>
                                <h3 className="text-base font-medium text-gray-500">
                                  {moreTitle1}
                                </h3>
                                <ul role="list" className="mt-5 space-y-6">
                                  {company.map((item) => {
                                    const IconComponent =
                                      iconMappingCompany[item.icon];
                                    return (
                                      <li
                                        key={item.name}
                                        className="flow-root"
                                        onClick={handleShowingMore}
                                      >
                                        <CustomLink
                                          href={item.href}
                                          className="-m-3 flex items-center rounded-md p-3 text-base font-medium text-gray-900 hover:bg-gray-50"
                                          lang={lang}
                                        >
                                          <IconComponent
                                            className="h-6 w-6 flex-shrink-0 text-gray-400"
                                            aria-hidden="true"
                                          />
                                          <span className="ml-4">
                                            {item.name}
                                          </span>
                                        </CustomLink>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                              <div>
                                <h3 className="text-base font-medium text-gray-500">
                                  {moreTitle2}
                                </h3>
                                <ul role="list" className="mt-5 space-y-6">
                                  {articles.map((item) => {
                                    const IconComponent =
                                      iconMappingArticles[item.icon];

                                    return (
                                      <li
                                        key={item.name}
                                        className="flow-root"
                                        onClick={handleShowingMore}
                                      >
                                        <CustomLink
                                          href={item.href}
                                          className="-m-3 flex items-center rounded-md p-3 text-base font-medium text-gray-900 hover:bg-gray-50"
                                          lang={lang}
                                        >
                                          <IconComponent
                                            className="h-6 w-6 flex-shrink-0 text-gray-400"
                                            aria-hidden="true"
                                          />
                                          <span className="ml-4">
                                            {item.name}
                                          </span>
                                        </CustomLink>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            </nav>
                            <div className="bg-gray-50 px-4 py-8 sm:py-12 sm:px-6 lg:px-8 xl:pl-12">
                              <div>
                                <h3 className="text-base font-medium text-gray-500">
                                  {moreTitle3}
                                </h3>
                                <ul role="list" className="mt-6 space-y-6">
                                  {blogPosts.map((post) => (
                                    <li key={post.id} className="flow-root">
                                      <CustomLink
                                        href={post.href}
                                        className="-m-3 flex rounded-lg p-3 hover:bg-gray-100"
                                        onClick={handleShowingMore}
                                        lang={lang}
                                      >
                                        <div className="hidden flex-shrink-0 sm:block">
                                          <Image
                                            className="h-20 w-32 rounded-md object-cover"
                                            src={post.imageUrl}
                                            alt={post.name}
                                            width={128}
                                            height={80}
                                          />
                                        </div>
                                        <div className="w-0 flex-1 sm:ml-8">
                                          <h4 className="truncate text-base font-medium text-gray-900">
                                            {post.name}
                                          </h4>
                                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                            {post.preview}
                                          </p>
                                        </div>
                                      </CustomLink>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="mt-6 text-sm font-medium">
                                <CustomLink
                                  href="/articulos"
                                  className="text-primary-600 hover:text-primary-500"
                                  onClick={handleShowingMore}
                                  lang={lang}
                                >
                                  {moreCallToAction}
                                  <span aria-hidden="true"> &rarr;</span>
                                </CustomLink>
                              </div>
                            </div>
                          </div>
                        </Popover.Panel>
                      </Transition>
                    </>
                  )}
                </Popover>
                <CustomLink
                  href="/contacto"
                  className="text-base font-medium text-gray-500 hover:text-gray-900"
                  lang={lang}
                >
                  {sixthColumn}
                </CustomLink>

                <LocaleSwitcher />
              </Popover.Group>
            </div>
          </div>
        </div>

        <Transition
          as={Fragment}
          enter="duration-200 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
          show={isShowingResponsiveMenu}
        >
          <Popover.Panel
            focus
            className="absolute inset-x-0 top-0 z-30 origin-top-right transform p-2 transition md:hidden"
          >
            <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 max-h-[37rem] overflow-y-auto">
              <div className="px-5 pt-5 pb-6 sm:pb-8">
                <div className="bg-white flex items-center justify-between sticky top-0 z-50">
                  <div>
                    <CustomLink href={"/"} lang={lang}>
                      <Image
                        className="h-8 w-auto"
                        src="https://res.cloudinary.com/https-imsoft-io/image/upload/v1706594671/imsoft-images/imsoft/logotipo-imsoft-transparente-azul-rectangular.png"
                        alt="imSoft"
                        width={89}
                        height={32}
                      />
                    </CustomLink>
                  </div>
                  <div className="-mr-2">
                    <Popover.Button
                      onClick={handleShowingResponsiveMenu}
                      className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                    >
                      <span className="sr-only">Cerrar menu</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </Popover.Button>
                  </div>
                </div>
                <div className="mt-6 sm:mt-8">
                  <nav>
                    <div className="grid gap-7 sm:grid-cols-2 sm:gap-y-8 sm:gap-x-4">
                      {services.map((item) => {
                        const IconComponent = iconMappingServices[item.icon];
                        return (
                          <CustomLink
                            key={item.name}
                            href={item.href}
                            className="-m-3 flex items-center rounded-lg p-3 hover:bg-gray-50"
                            onClick={handleShowingResponsiveMenu}
                            lang={lang}
                          >
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary-500 text-white sm:h-12 sm:w-12">
                              <IconComponent
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            </div>
                            <div className="ml-4 text-base font-medium text-gray-900">
                              {item.name}
                            </div>
                          </CustomLink>
                        );
                      })}
                    </div>
                    <div className="mt-8 text-base">
                      <CustomLink
                        href="/servicios"
                        className="font-medium text-primary-600 hover:text-primary-500"
                        onClick={handleShowingResponsiveMenu}
                        lang={lang}
                      >
                        {callToActionResponsive}
                        <span aria-hidden="true"> &rarr;</span>
                      </CustomLink>
                    </div>
                  </nav>
                </div>
              </div>
              <div className="py-6 px-5">
                <div className="grid grid-cols-2 gap-4">
                  <CustomLink
                    href="/nosotros"
                    className="rounded-md text-base font-medium text-gray-900 hover:text-gray-700"
                    onClick={handleShowingResponsiveMenu}
                    lang={lang}
                  >
                    {titleResponsive1}
                  </CustomLink>
                  <CustomLink
                    href="/portafolio"
                    className="rounded-md text-base font-medium text-gray-900 hover:text-gray-700"
                    onClick={handleShowingResponsiveMenu}
                    lang={lang}
                  >
                    {titleResponsive2}
                  </CustomLink>
                  <CustomLink
                    href="/articulos"
                    className="rounded-md text-base font-medium text-gray-900 hover:text-gray-700"
                    onClick={handleShowingResponsiveMenu}
                    lang={lang}
                  >
                    {titleResponsive3}
                  </CustomLink>
                  <CustomLink
                    href="/avisoDePrivacidad"
                    className="rounded-md text-base font-medium text-gray-900 hover:text-gray-700"
                    onClick={handleShowingResponsiveMenu}
                    lang={lang}
                  >
                    {titleResponsive4}
                  </CustomLink>
                  <CustomLink
                    href={`${whatsappBusinessLink}`}
                    className="rounded-md text-base font-medium text-gray-900 hover:text-gray-700"
                    onClick={handleShowingResponsiveMenu}
                    lang={lang}
                  >
                    {titleResponsive5}
                  </CustomLink>
                  <CustomLink
                    href="/contacto"
                    className="rounded-md text-base font-medium text-gray-900 hover:text-gray-700"
                    onClick={handleShowingResponsiveMenu}
                    lang={lang}
                  >
                    {titleResponsive6}
                  </CustomLink>

                  <LocaleSwitcher />
                </div>
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </>
  );
};
