
"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Preloader } from "@/components/preloader";

export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        // Always redirect to /home. The layout will handle showing the correct state.
        router.replace('/home');
    }, [router]);

    // Show a preloader while the redirect is happening.
    return <Preloader />;
}
