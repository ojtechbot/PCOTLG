
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page is deprecated and now redirects to /settings.
// The /settings page contains all profile management functionality.
export default function DeprecatedProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings');
  }, [router]);

  return null; // Return null to render nothing while redirecting
}

    