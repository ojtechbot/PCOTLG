
"use client"

import {
  Home,
  LogOut,
  Menu,
  Settings,
  BarChart3,
  Clapperboard,
  BookOpen,
  Calendar,
  Info,
  Mail,
  Heart,
  Book,
  BookMarked,
  MessageSquare,
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
import { LogoutDialog } from "./logout-dialog";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Preloader } from "./preloader";
import { NotificationBell } from "./notification-bell";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import { SearchBar } from "./search-bar";
import { cn } from "@/lib/utils";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { GoToTop } from "./go-to-top";


const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/about", icon: Info, label: "About" },
    { href: "/teachings", icon: Book, label: "Teachings & Articles" },
    { href: "/media", icon: Clapperboard, label: "Media Hub" },
    { href: "/events", icon: Calendar, label: "Events & Pages" },
    { href: "/bible-study", icon: BookMarked, label: "Bible Study" },
    { href: "/support", icon: MessageSquare, label: "Messages" },
    { href: "/contact", icon: Mail, label: "Contact" },
    { href: "/donate", icon: Heart, label: "Donate" },
];


function SidebarNav({ isMobile = false, onLogoutClick }: { isMobile?: boolean, onLogoutClick: () => void }) {
    const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
        if (isMobile) {
            return <SheetClose asChild><Link href={href}>{children}</Link></SheetClose>;
        }
        return <Link href={href}>{children}</Link>;
    };

  return (
    <>
    <nav className="grid items-start p-2 text-sm font-medium lg:px-4 lg:py-2">
      {navItems.map((item) => (
        <NavLink key={item.label} href={item.href}>
          <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-primary">
            <item.icon className="h-5 w-5" />
            {item.label}
          </span>
        </NavLink>
      ))}
    </nav>
    <div className="mt-auto p-2 lg:p-4">
        <nav className="grid items-start text-sm font-medium">
             <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    onLogoutClick();
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-primary"
            >
                <LogOut className="h-5 w-5" />
                Logout
            </a>
             <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground">
                <span className="flex-grow">Theme</span>
                <ThemeToggle />
            </div>
        </nav>
    </div>
    </>
  );
}

function Header({ children, onLogoutClick }: { children: ReactNode, onLogoutClick: () => void }) {
    const { user } = useAuth();
    
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      {children}
      <div className="w-full flex-1">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
      </div>
      <ThemeToggle />
      <NotificationBell />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.photoURL || undefined} alt="User" data-ai-hint="profile picture" />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
           <DropdownMenuItem asChild>
                <Link href="/dashboard"><BarChart3 className="mr-2 h-4 w-4" /><span>Dashboard</span></Link>
            </DropdownMenuItem>
          {user?.role === 'admin' && (
            <DropdownMenuItem asChild>
                <Link href="/admin">
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Admin</span>
                </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onLogoutClick}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { requestPermissionAndGetToken } = usePushNotifications();


  useEffect(() => {
    if (!loading && !user) {
        router.push('/login');
    } else if (!loading && user) {
        // Once user is loaded, try to get notification permission
        requestPermissionAndGetToken();
    }
  }, [user, loading, router, requestPermissionAndGetToken]);

  if (loading || !user) {
    return <Preloader />;
  }

  const handleLogoutClick = () => setIsLogoutDialogOpen(true);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-sidebar md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-headline font-semibold text-sidebar-foreground">
              <Image src="/images/logo.png" alt="Pentecostal Church of the Living God Logo" width={40} height={40} />
              <span className="text-xl">PCOTLG</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarNav onLogoutClick={handleLogoutClick} />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <Header onLogoutClick={handleLogoutClick}>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-sidebar text-sidebar-foreground p-0">
               <SheetHeader>
                 {/* The title is visually hidden but available for screen readers */}
                 <SheetTitle className={cn("sr-only")}>Navigation Menu</SheetTitle>
               </SheetHeader>
               <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-headline font-semibold text-sidebar-foreground">
                  <Image src="/images/logo.png" alt="Pentecostal Church of the Living God Logo" width={40} height={40} />
                  <span className="text-xl">PCOTLG</span>
                </Link>
              </div>
              <SidebarNav isMobile={true} onLogoutClick={handleLogoutClick} />
            </SheetContent>
          </Sheet>
        </Header>
        <main className="flex flex-1 flex-col gap-4 bg-background lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
      <GoToTop />
      <LogoutDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen} />
    </div>
  );
}

    
