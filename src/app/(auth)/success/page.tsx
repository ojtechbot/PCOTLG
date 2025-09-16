
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect after a longer delay to allow user to see the success message
    const timer = setTimeout(() => {
        router.push('/dashboard');
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground">
      <div className="relative flex h-32 w-32 items-center justify-center">
        <div
          className="animate-dissolve absolute h-full w-full rounded-full border-2 border-primary"
          style={{ animationDelay: '0s' }}
        ></div>
        <div
          className="animate-dissolve absolute h-full w-full rounded-full border-2 border-primary"
          style={{ animationDelay: '0.5s' }}
        ></div>
        <div
          className="animate-dissolve absolute h-full w-full rounded-full border-2 border-primary"
          style={{ animationDelay: '1s' }}
        ></div>
        <Image
          src="/images/logo.png"
          alt="Pentecostal Church of the Living God Logo"
          width={96}
          height={96}
          className="animate-logo-fade relative"
          priority
        />
      </div>
      <div className="mt-8 text-center">
        <h1 className="text-3xl font-headline font-bold text-primary">
          Success!
        </h1>
        <p className="text-muted-foreground">You are now being redirected to your dashboard...</p>
      </div>
    </div>
  );
}
