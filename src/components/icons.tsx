import type { SVGProps } from "react";

export const HandDrawnSeparator = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="100%"
    height="20"
    viewBox="0 0 400 20"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
    className="stroke-current text-border my-4"
    {...props}
  >
    <path
      d="M0 10 C 50 2, 100 15, 150 10 S 250 0, 300 12 S 380 18, 400 8"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

export const PrayerCandle = (props: SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
    >
        <path d="M9 20h6" />
        <path d="M5 16h14" />
        <path d="M7.5 16L9 5c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2l1.5 11" />
        <path d="M12 2v2" />
        <path d="M12 2a2.5 2.5 0 0 1 2.5 2.5c0 .6-.2 1.2-.6 1.7-.4.5-.9.8-1.4 1-.5.2-1.1.2-1.6 0-.5-.2-1-.5-1.4-1-.4-.5-.6-1.1-.6-1.7A2.5 2.5 0 0 1 12 2Z" />
    </svg>
);
