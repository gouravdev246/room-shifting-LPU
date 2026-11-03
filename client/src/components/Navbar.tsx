import * as React from "react"
import { useState } from "react"
import { Building2, Menu, X, User as UserIcon, LogOut, PlusCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
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

const typeComponents: { title: string; href: string; description: string }[] = [
    {
        title: "AC Rooms",
        href: "/?type=AC",
        description: "Air-conditioned comfortable rooms",
    },
    {
        title: "Non-AC Rooms",
        href: "/?type=Non-AC",
        description: "Affordable rooms with air cooling",
    },
]

export function NavigationMenuDemo() {
    const navigate = useNavigate()
    const { user, isAuthenticated, logout } = useAuth()

    const [hostels] = useState<string[]>([
        "BH-1",
        "BH-2",
        "BH-3",
        "BH-4",
        "BH-5",
        "GH-1",
        "GH-2",
        "GH-3",
    ])
    const [seaters] = useState<string[]>(["1", "2", "3", "4", "5"])
    const [blocks] = useState<string[]>(["A", "B", "C", "D"])
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        await logout()
        setIsMobileMenuOpen(false)
        navigate("/")
    }

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
                {/* <div className="hidden md:flex items-center">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Hostel</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[140px] gap-1 p-2">
                                        {hostels.map((hostel) => (
                                            <li key={hostel}>
                                                <NavigationMenuLink
                                                    render={
                                                        <Link
                                                            to={`/?hostel=${hostel.trim()}`}
                                                            className="block select-none rounded-md px-3 py-1.5 text-sm font-medium no-underline outline-none transition-colors hover:bg-muted hover:text-foreground"
                                                        >
                                                            {hostel.trim()}
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
                                    <ul className="grid w-[320px] gap-2 p-3">
                                        {typeComponents.map((component) => (
                                            <ListItem
                                                key={component.title + component.href}
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
                                    <ul className="grid w-[130px] gap-1 p-2">
                                        {seaters.map((seater) => (
                                            <li key={seater}>
                                                <NavigationMenuLink
                                                    render={
                                                        <Link
                                                            to={`/?seater=${seater}`}
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
                                                            to={`/?block=${block}`}
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
                                    render={<Link to="/">All Rooms</Link>}
                                />
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div> */}

                {/* Right Action */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {isAuthenticated && user ? (
                        <>
                            {/* User greeting pill */}
                            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-foreground bg-muted/70 px-3 py-1 rounded-full border border-border">
                                <UserIcon className="h-3.5 w-3.5 text-primary" />
                                <span className="max-w-[120px] truncate">{user.name}</span>
                                <span className="text-muted-foreground text-[10px] bg-background px-1.5 py-0.5 rounded border border-border">
                                    {user.hostel}
                                </span>
                            </div>

                            {/* Add Room button */}
                            {/* <Link
                                to="/add-room"
                                className="hidden sm:inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs sm:text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer whitespace-nowrap"
                            >
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span>Add Room</span>
                            </Link> */}

                            {/* Logout button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="cursor-pointer text-xs"
                                title="Sign out of your account"
                            >
                                <LogOut className="h-3.5 w-3.5 mr-1" />
                                <span>Logout</span>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer whitespace-nowrap"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-md bg-primary px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer whitespace-nowrap"
                            >
                                Register
                            </Link>
                        </>
                    )}

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
                <div className="md:hidden border-t bg-background px-4 py-4 space-y-4 shadow-lg animate-in fade-in-20">
                    {isAuthenticated && user && (
                        <div className="flex items-center justify-between pb-3 border-b">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-semibold text-foreground">{user.name}</div>
                                    <div className="text-xs text-muted-foreground">{user.reg_id} • {user.hostel}</div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <LogOut className="h-3.5 w-3.5 mr-1" />
                                Logout
                            </Button>
                        </div>
                    )}

                    <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Hostels
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {hostels.map((hostel) => (
                                <Link
                                    key={hostel}
                                    to={`/?hostel=${hostel.trim()}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                                >
                                    {hostel.trim()}
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
                                    to={`/?seater=${seater}`}
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
                                    to={`/?block=${block}`}
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
                            to="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors text-foreground"
                        >
                            All Room Listings
                        </Link>
                        {isAuthenticated ? (
                            <Link
                                to="/add-room"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-muted transition-colors"
                            >
                                + Add Room Listing
                            </Link>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-center rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-center rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
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
