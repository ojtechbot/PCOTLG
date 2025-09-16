
import type { ReactNode } from "react";
import { AdminDashboardLayout } from "@/components/admin/admin-dashboard-layout";

export default async function AdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    // The AdminDashboardLayout will handle authentication and redirection.
    return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
