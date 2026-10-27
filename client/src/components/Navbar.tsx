

import * as React from "react"
import { useState } from "react"
import { Building2, Menu, X } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

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
    const [user] = useState<Boolean>(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Brand / Logo */}
                <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 font-bold text-base sm:text-lg tracking-tight hover:opacity-80 transition-opacity whitespace-nowrap shrink-0"
                >
                    <Building2 className="h-5 w-5 text-primary shrink-0" />
                    <span>LPU Room Shift</span>
                </Link>

                {/* Desktop Navigation Menu (hidden on mobile, visible on md+) */}
                <div className="hidden md:flex items-center">
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
                                                            to={`#hostel-${hostel.trim()}`}
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

                            <NavigationMenuItem className="hidden lg:flex">
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
                                                            to={`#seater-${seater}`}
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
                                                            to={`#block-${block}`}
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
                                    render={<Link to="/roommates">Find Your Roommate</Link>}
                                />
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-2">
                    {user && (
                        <Link
                            to="/logout"
                            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                            Logout
                        </Link>
                    )}
                    <Link
                        to={user ? "/add-room" : "/login"}
                        className="rounded-md bg-primary px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer whitespace-nowrap"
                    >
                        {user ? "Add Room" : "Login"}
                    </Link>

                    {/* Mobile Hamburger Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden cursor-pointer"
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        aria-label="Toggle navigation menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown Drawer */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t bg-background px-4 py-4 space-y-4 shadow-lg">
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Hostels
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {hostels.map((hostel) => (
                                <Link
                                    key={hostel}
                                    to={`#hostel-${hostel.trim()}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                                >
                                    Hostel {hostel.trim()}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Room Capacity (Seaters)
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {seaters.map((seater) => (
                                <Link
                                    key={seater}
                                    to={`#seater-${seater}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                                >
                                    {seater} Seater
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Blocks
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {blocks.map((block) => (
                                <Link
                                    key={block}
                                    to={`#block-${block}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                                >
                                    Block {block}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 border-t flex flex-col gap-2">
                        <Link
                            to="/roommates"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors text-foreground"
                        >
                            Find Your Roommate
                        </Link>
                        <Link
                            to="/add-room"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-muted transition-colors"
                        >
                            + Add Room Listing
                        </Link>
                    </div>
                </div>
            )}
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
                        to={href}
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

