
"use client";

import * as React from "react";
import Image from "next/image";

/**
 * A highly optimized preloader component that displays a simple, fast-loading animation with the app logo.
 * This version features a spinning gradient border.
 */
export function Preloader() {

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
       <p className="mt-4 animate-text-fade text-lg font-medium text-muted-foreground">
          Loading...
        </p>
    </div>
  );
}
