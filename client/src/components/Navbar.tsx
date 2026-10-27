

import * as React from "react"
import { useState } from "react"
import { Building2 } from "lucide-react"

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

function Link({ href, className, children, ...props }: React.ComponentProps<"a">) {
    return (
        <a href={href} className={className} {...props}>
            {children}
        </a>
    )
}

const components: { title: string; href: string; description: string }[] = [
    {
        title: "AC",
        href: "#ac-cool",
        description: "Cool only",
    },
    {
        title: "AC",
        href: "#ac-all-weather",
        description: "Hot & Cool",
    },
    {
        title: "Non-AC",
        href: "#non-ac",
        description: "Cooler",
    },
]

export function NavigationMenuDemo() {
    const [hostels] = useState<string[]>(["1", "2", "3"])
    const [seaters] = useState<string[]>(["1", "2", "3", "4", "5"])
    const [blocks] = useState<string[]>(["A", "B", "C", "D"])

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 w-full items-center justify-between px-4 sm:px-8">
                {/* Brand / Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span>LPU Room Shift</span>
                </Link>

                {/* Navigation Menu */}
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Hostel</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[120px] gap-1 p-2">
                                    {hostels.map((hostel) => (
                                        <li key={hostel}>
                                            <NavigationMenuLink
                                                render={
                                                    <Link
                                                        href={`#hostel-${hostel.trim()}`}
                                                        className="block select-none rounded-md px-3 py-1.5 text-sm font-medium no-underline outline-none transition-colors hover:bg-muted hover:text-foreground"
                                                    >
                                                        Hostel {hostel.trim()}
                                                    </Link>
                                                }
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        <NavigationMenuItem className="hidden md:flex">
                            <NavigationMenuTrigger>Type (AC/Non-AC)</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[300px] gap-2 p-3 md:w-[400px] md:grid-cols-2">
                                    {components.map((component) => (
                                        <ListItem
                                            key={component.title + component.description}
                                            title={component.title}
                                            href={component.href}
                                        >
                                            {component.description}
                                        </ListItem>
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Seater</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[120px] gap-1 p-2">
                                    {seaters.map((seater) => (
                                        <li key={seater}>
                                            <NavigationMenuLink
                                                render={
                                                    <Link
                                                        href={`#seater-${seater}`}
                                                        className="block select-none rounded-md px-3 py-1.5 text-sm font-medium no-underline outline-none transition-colors hover:bg-muted hover:text-foreground"
                                                    >
                                                        {seater} Seater
                                                    </Link>
                                                }
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Block</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[120px] gap-1 p-2">
                                    {blocks.map((block) => (
                                        <li key={block}>
                                            <NavigationMenuLink
                                                render={
                                                    <Link
                                                        href={`#block-${block}`}
                                                        className="block select-none rounded-md px-3 py-1.5 text-sm font-medium no-underline outline-none transition-colors hover:bg-muted hover:text-foreground"
                                                    >
                                                        Block {block}
                                                    </Link>
                                                }
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                                render={<Link href="/roommates">Find Your Roommate</Link>}
                            />
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Right Action */}
                <div className="flex items-center gap-2">
                    <Link
                        href="#post"
                        className="rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
                    >
                        Add Room
                    </Link>
                </div>
            </div>
        </header>
    )
}

function ListItem({
    title,
    children,
    href,
    ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
    return (
        <li {...props}>
            <NavigationMenuLink
                render={
                    <Link
                        href={href}
                        className="block select-none space-y-1 rounded-md p-2.5 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <div className="text-sm font-medium leading-none">{title}</div>
                        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            {children}
                        </p>
                    </Link>
                }
            />
        </li>
    )
}

export const Navbar = NavigationMenuDemo
export default Navbar

