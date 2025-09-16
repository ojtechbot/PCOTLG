
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';

export function HeroSection() {
    const [text, setText] = useState('');
    const fullText = "A Place of Faith, Hope & Love";

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setText(fullText.substring(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 100); // Adjust typing speed here (in ms)

        return () => clearInterval(interval);
    }, [fullText]);

    return (
        <section className="relative h-[60vh] flex items-center justify-center text-center text-white bg-black">
            <Image
                src="/images/congregation.jpg"
                alt="Church congregation"
                fill
                className="opacity-40 object-cover"
                data-ai-hint="church congregation worship"
                priority
            />
            <div className="relative z-10 p-4">
                <h1 className="text-5xl md:text-7xl font-headline font-bold text-white drop-shadow-lg min-h-[84px] md:min-h-[112px]">
                    {text}
                    <span className="animate-ping">|</span>
                </h1>
                <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md">
                    Join us to experience uplifting worship, heartfelt community, and a message of hope that transforms lives. All are welcome.
                </p>
                <Button asChild size="lg" className="mt-8">
                    <Link href="/login">Join Our Community</Link>
                </Button>
            </div>
        </section>
    );
}

    