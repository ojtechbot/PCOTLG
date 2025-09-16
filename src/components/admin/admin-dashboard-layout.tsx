
"use client"

import {
  BarChart3,
  BookOpen,
  Calendar,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Send,
  Users,
  Wallet,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutDialog } from "../logout-dialog";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Preloader } from "../preloader";
import Image from "next/image";
import { ThemeToggle } from "../theme-toggle";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";


const navItems = [
  { href: "/admin", icon: BarChart3, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Manage Users" },
  { href: "/admin/giving", icon: Wallet, label: "Giving" },
  { href: "/admin/leaders", icon: Users, label: "Leaders" },
  { href: "/admin/blogs", icon: Newspaper, label: "Blogs" },
  { href: "/admin/events", icon: Calendar, label: "Events" },
  { href: "/admin/sermons", icon: BookOpen, label: "Sermons" },
  { href: "/admin/community", icon: Users, label: "Community" },
  { href: "/admin/notifications", icon: Send, label: "Notifications" },
  { href: "/admin/subscribers", icon: Mail, label: "Subscribers" },
];

function SidebarNav({ isMobile = false }) {
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
        if (isMobile) {
            return <SheetClose asChild><Link href={href}>{children}</Link></SheetClose>;
        }
        return <Link href={href}>{children}</Link>;
    };

    return (
        <>
        <nav className="grid items-start p-2 text-sm font-medium lg:p-4">
        {navItems.map((item) => (
            <NavLink key={item.label} href={item.href}>
            <span className="flex items-center gap-3 rounded-lg px-3 py-3 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-primary">
                <item.icon className="h-5 w-5" />
                {item.label}
            </span>
            </NavLink>
        ))}
        </nav>
        <div className="mt-auto p-4">
            <nav className="grid items-start text-sm font-medium">
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        setIsLogoutDialogOpen(true);
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-primary"
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </a>
                <div className="flex items-center gap-3 rounded-lg px-3 py-3 text-sidebar-foreground">
                    <span className="flex-grow">Theme</span>
                    <ThemeToggle />
                </div>
            </nav>
        </div>
        <LogoutDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen} />
        </>
    );
}

function Header({ children }: { children: ReactNode }) {
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const { user } = useAuth();
    
    return (
        <>
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
        {children}
        <div className="w-full flex-1">
            {/* Can add search here if needed */}
        </div>
        <ThemeToggle />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photoURL || undefined} alt="User" data-ai-hint="profile picture" />
                <AvatarFallback>{user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setIsLogoutDialogOpen(true)}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        </header>
        <LogoutDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen} />
        </>
    );
}

export function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user, redirect to admin login
        router.push('/admin/login');
      } else if (user.role !== 'admin') {
        // User is not an admin, show 404
        notFound();
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <Preloader />;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-sidebar md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/admin" className="flex items-center gap-2 font-headline font-semibold text-sidebar-foreground">
              <Image src="/images/logo.png" alt="Pentecostal Church of the Living God Logo" width={40} height={40} />
              <span className="text-xl">Admin Panel</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarNav />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <Header>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-sidebar text-sidebar-foreground p-0">
               <SheetHeader>
                 <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
               </SheetHeader>
               <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
                <Link href="/admin" className="flex items-center gap-2 font-headline font-semibold text-sidebar-foreground">
                  <Image src="/images/logo.png" alt="Pentecostal Church of the Living God Logo" width={40} height={40} />
                  <span className="text-xl">Admin Panel</span>
                </Link>
              </div>
              <SidebarNav isMobile={true} />
            </SheetContent>
          </Sheet>
        </Header>
        <main className="flex flex-1 flex-col gap-4 bg-background lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
