'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/animations/animated-group'
import { cn } from '@/lib/utils'
import { Variants } from 'motion/react'
import type { Locale } from '@/app/[lang]/dictionaries'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ModeToggle } from '@/components/mode-toggle'
import Magnet from '@/components/ui/magnet'
import type { HeroSectionProps, HeroHeaderProps } from '@/types/components'

const transitionVariants: { item: Variants } = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection({ dict, lang, companies = [], portfolioProjects = [], blogTitles = [] }: HeroSectionProps) {
    // Filtrar títulos válidos (no vacíos) usando useMemo para evitar recálculos innecesarios
    const validTitles = React.useMemo(() => {
        return blogTitles.filter(t => t.title && t.title.trim() !== '');
    }, [blogTitles]);
    
    // Inicializar con un título aleatorio si hay títulos disponibles
    const [randomBlogTitle, setRandomBlogTitle] = useState<{ title: string; slug: string } | null>(() => {
        const valid = blogTitles.filter(t => t.title && t.title.trim() !== '');
        if (valid.length > 0) {
            const randomIndex = Math.floor(Math.random() * valid.length);
            return {
                title: valid[randomIndex].title,
                slug: valid[randomIndex].slug,
            };
        }
        return null;
    });

    useEffect(() => {
        if (validTitles.length > 0) {
            // Seleccionar un título inicial siempre (para asegurar que se muestre)
            const randomIndex = Math.floor(Math.random() * validTitles.length);
            setRandomBlogTitle({
                title: validTitles[randomIndex].title,
                slug: validTitles[randomIndex].slug,
            });

            // Cambiar el título cada 5 segundos
            const interval = setInterval(() => {
                const newRandomIndex = Math.floor(Math.random() * validTitles.length);
                setRandomBlogTitle({
                    title: validTitles[newRandomIndex].title,
                    slug: validTitles[newRandomIndex].slug,
                });
            }, 5000);

            return () => clearInterval(interval);
        } else {
            // Si no hay títulos válidos, limpiar el estado
            setRandomBlogTitle(null);
        }
    }, [validTitles]);

    // Solo mostrar el anuncio si hay títulos del blog disponibles y válidos
    // Si hay títulos válidos pero el estado aún no está listo, usar el primer título válido
    const hasValidTitles = validTitles.length > 0;
    const announcementText = randomBlogTitle?.title || (hasValidTitles ? validTitles[0]?.title : '');
    const announcementLink = randomBlogTitle 
        ? `/${lang}/blog/${randomBlogTitle.slug}` 
        : (hasValidTitles ? `/${lang}/blog/${validTitles[0]?.slug}` : `/${lang}/blog`);


    return (
        <>
            <HeroHeader dict={dict} lang={lang} />
            <main className="overflow-x-hidden">
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block overflow-hidden">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                        <div className="mx-auto max-w-7xl px-4 sm:px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                {hasValidTitles && announcementText && announcementText.trim() !== '' && (
                                    <div className="mb-4 px-2">
                                        <Link
                                            href={announcementLink}
                                            className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex max-w-full w-fit items-center gap-2 sm:gap-4 rounded-full border p-1.5 sm:p-1 pl-3 sm:pl-4 pr-2 sm:pr-1 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                            <span className="text-foreground text-xs sm:text-sm transition-opacity duration-500 max-w-[180px] sm:max-w-none truncate sm:truncate-none">{announcementText}</span>
                                            <span className="dark:border-background hidden sm:block h-4 w-0.5 border-l bg-white dark:bg-zinc-700 flex-shrink-0"></span>
                                            <span className="text-foreground text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0">{dict.hero.announcementLink}</span>

                                            <div className="bg-background group-hover:bg-muted size-5 sm:size-6 overflow-hidden rounded-full duration-500 flex-shrink-0">
                                                <div className="flex w-10 sm:w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                    <span className="flex size-5 sm:size-6">
                                                        <ArrowRight className="m-auto size-2.5 sm:size-3" />
                                                    </span>
                                                    <span className="flex size-5 sm:size-6">
                                                        <ArrowRight className="m-auto size-2.5 sm:size-3" />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                )}
                                <AnimatedGroup variants={transitionVariants}>
                                    <h1
                                        className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                                        {dict.hero.title}
                                    </h1>
                                    <p
                                        className="mx-auto mt-8 max-w-2xl text-balance text-lg">
                                        {dict.hero.description}
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <Magnet padding={50} disabled={false} magnetStrength={10}>
                                        <Button
                                            key={1}
                                            asChild
                                            size="lg"
                                            className="rounded-xl px-5 text-base">
                                            <Link href={`/${lang}/contact`}>
                                                <span className="text-nowrap">{dict.hero.startBuilding}</span>
                                            </Link>
                                        </Button>
                                    </Magnet>
                                    <Magnet padding={50} disabled={false} magnetStrength={10}>
                                        <Button
                                            key={2}
                                            asChild
                                            size="lg"
                                            variant="ghost"
                                            className="h-10.5 rounded-xl px-5">
                                            <Link href={`/${lang}/portfolio`}>
                                                <span className="text-nowrap">{dict.hero.requestDemo}</span>
                                            </Link>
                                        </Button>
                                    </Magnet>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative mt-8 overflow-hidden px-2 sm:mt-12 md:mt-20">
                                <div
                                    aria-hidden
                                    className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                                />
                                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-7xl overflow-hidden rounded-2xl border p-2 shadow-lg shadow-zinc-950/15 ring-1">
                                    <PortfolioCarousel portfolioProjects={portfolioProjects} />
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
            </main>
        </>
    )
}

export const HeroHeader = ({ dict, lang }: HeroHeaderProps) => {
    const menuItems = [
        { name: dict.nav.services, href: `/${lang}/services` },
        { name: dict.nav.portfolio, href: `/${lang}/portfolio` },
        { name: dict.nav.blog, href: `/${lang}/blog` },
        { name: dict.nav.quote, href: lang === 'es' ? `/${lang}/cotizador` : `/${lang}/quote` },
        { name: dict.nav.contact, href: `/${lang}/contact` },
    ]
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header className="overflow-x-hidden">
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2 group max-w-full">
                <div className={cn('mx-auto mt-2 max-w-6xl px-4 sm:px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between items-center lg:w-auto">
                            <Link
                                href={`/${lang}`}
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <Logo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm items-center">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                    <li className="pt-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground text-sm">Idioma:</span>
                                                <LanguageSwitcher currentLang={lang} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground text-sm">Tema:</span>
                                                <ModeToggle dict={dict} />
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit items-center">
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}>
                                    <Link href={`/${lang}/login`}>
                                        <span>{dict.nav.login}</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}>
                                    <Link href={`/${lang}/signup`}>
                                        <span>{dict.nav.signUp}</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}>
                                    <Link href={`/${lang}/signup`}>
                                        <span>{dict.nav.getStarted}</span>
                                    </Link>
                                </Button>
                                <div className="flex items-center gap-2 ml-2">
                                    <LanguageSwitcher currentLang={lang} />
                                    <ModeToggle dict={dict} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

const PortfolioCarousel = ({ portfolioProjects }: { portfolioProjects: Array<{ id: string; title: string; description: string; image: string }> }) => {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Si no hay proyectos, usar imágenes por defecto
    const displayProjects = portfolioProjects.length > 0
        ? portfolioProjects
        : [
            { id: '1', title: 'Default Image', description: '', image: 'https://tailark.com//_next/image?url=%2Fmail2.png&w=3840&q=75' },
            { id: '2', title: 'Default Image Light', description: '', image: 'https://tailark.com/_next/image?url=%2Fmail2-light.png&w=3840&q=75' },
        ]
    
    const images = displayProjects.map(p => p.image)

    useEffect(() => {
        if (images.length <= 1) return

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
        }, 2000) // Cambiar cada 2 segundos

        return () => clearInterval(interval)
    }, [images.length])

    if (images.length === 0) {
        return (
            <>
                <Image
                    className="bg-background aspect-[16/9] relative hidden rounded-2xl dark:block"
                    src="https://tailark.com//_next/image?url=%2Fmail2.png&w=3840&q=75"
                    alt="app screen"
                    width={3840}
                    height={2160}
                />
                <Image
                    className="z-2 border-border/25 aspect-[16/9] relative rounded-2xl border dark:hidden"
                    src="https://tailark.com/_next/image?url=%2Fmail2-light.png&w=3840&q=75"
                    alt="app screen"
                    width={3840}
                    height={2160}
                />
            </>
        )
    }

    return (
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
            {images.map((image, index) => {
                const isActive = index === currentIndex

                return (
                    <div
                        key={index}
                        className={cn(
                            "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out",
                            isActive ? "opacity-100 z-10" : "opacity-0 z-0"
                        )}
                    >
                        <Image
                            className="w-full h-full object-cover rounded-2xl"
                            src={image}
                            alt={displayProjects[index]?.title || `Portfolio image ${index + 1}`}
                            width={3840}
                            height={2160}
                            priority={index === 0}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            unoptimized={image.startsWith('http')}
                        />
                    </div>
                )
            })}
            {/* Indicadores */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                index === currentIndex
                                    ? "w-8 bg-white dark:bg-white"
                                    : "w-2 bg-white/50 dark:bg-white/50 hover:bg-white/75 dark:hover:bg-white/75"
                            )}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn('relative flex items-center justify-center h-8 w-8', className)}>
            <Image
                src="/logos/isotype-imsoft-blue.png"
                alt="imSoft"
                width={32}
                height={32}
                className="dark:hidden object-contain"
            />
            <Image
                src="/logos/isotype-imsoft-white.png"
                alt="imSoft"
                width={32}
                height={32}
                className="hidden dark:block object-contain"
            />
        </div>
    )
}