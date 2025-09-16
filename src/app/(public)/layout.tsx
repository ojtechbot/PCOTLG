
"use client"

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Info, Mail, User, Menu, Settings, LogOut, BarChart3, Heart, Calendar, Book, Clapperboard } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Suspense, useState } from "react";
import { Preloader } from "@/components/preloader";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogoutDialog } from "@/components/logout-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import dynamic from 'next/dynamic';
import { GoToTop } from "@/components/go-to-top";

const publicNavItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/about", icon: Info, label: "About" },
    { href: "/teachings", icon: Book, label: "Teachings & Articles" },
    { href: "/media", icon: Clapperboard, label: "Media Hub" },
    { href: "/events", icon: Calendar, label: "Events & Pages" },
    { href: "/contact", icon: Mail, label: "Contact" },
    { href: "/donate", icon: Heart, label: "Donate" },
];

const ChatAssistant = dynamic(() => import('@/components/chat-assistant').then(mod => mod.ChatAssistant), {
    ssr: false,
    loading: () => null,
});

function AuthNav() {
    const { user } = useAuth();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    
    if (user) {
        return (
            <>
            <ThemeToggle />
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.photoURL || undefined} alt="User" data-ai-hint="profile picture" />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                    </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard"><Home className="mr-2 h-4 w-4" /><span>Dashboard</span></Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href="/settings"><Settings className="mr-2 h-4 w-4" /><span>Settings</span></Link>
                </DropdownMenuItem>
                 {user?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Admin</span>
                        </Link>
                    </DropdownMenuItem>
                 )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsLogoutDialogOpen(true)}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <LogoutDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen} />
            </>
        )
    }

    return (
        <>
            <ThemeToggle />
            <Button asChild>
                <Link href="/login">
                    <User className="mr-2 h-4 w-4" />
                    Join us
                </Link>
            </Button>
        </>
    )
}


export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
                    <Link href="/home" className="flex items-center gap-2 font-headline font-semibold mr-4">
                        <Image src="/images/logo.png" alt="Pentecostal Church of the Living God Logo" width={40} height={40} />
                        <span className="hidden sm:inline-block text-xl">PCOTLG</span>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {publicNavItems.map(item => (
                            <Button asChild variant="ghost" key={item.href}>
                                <Link href={item.href}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.label}
                                </Link>
                            </Button>
                        ))}
                    </nav>

                    <div className="flex items-center justify-end flex-1 space-x-2">
                         <AuthNav />
                         {/* Mobile Navigation */}
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">Open menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left">
                                     <SheetHeader>
                                        <SheetTitle className={cn("sr-only")}>Navigation Menu</SheetTitle>
                                     </SheetHeader>
                                     <nav className="grid gap-6 text-lg font-medium mt-10">
                                         {publicNavItems.map(item => (
                                            <SheetClose asChild key={item.href}>
                                                <Link href={item.href} className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                                                    <item.icon className="h-5 w-5" />
                                                    {item.label}
                                                </Link>
                                            </SheetClose>
                                         ))}
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1">
                <Suspense fallback={<Preloader />}>
                    {children}
                </Suspense>
            </main>
            <GoToTop />
            <ChatAssistant />
            <footer className="bg-secondary/50">
                <div className="container mx-auto p-8 text-center text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Pentecostal Church of the Living God. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

    
