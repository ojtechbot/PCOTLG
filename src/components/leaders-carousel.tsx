
"use client";

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { type Leader } from "@/lib/database/leaders"
import { Card, CardHeader, CardTitle } from "./ui/card";

export function LeadersCarousel({ leaders }: { leaders: Leader[] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  if (!leaders || leaders.length === 0) {
    return <p className="text-center text-muted-foreground">Our leaders will be introduced soon.</p>;
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {leaders.map((leader) => (
          <CarouselItem key={leader.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1 h-full">
                <Card className="border-border/50 text-center items-center hover:shadow-lg hover:border-primary/30 transition-all overflow-hidden h-full">
                    <Image src={leader.image} alt={leader.name} width={400} height={400} className="object-cover h-64 w-full" data-ai-hint={leader.imageHint} />
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{leader.name}</CardTitle>
                        <p className="text-sm font-semibold text-primary">{leader.title}</p>
                    </CardHeader>
                </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex left-[-1rem]" />
      <CarouselNext className="hidden sm:flex right-[-1rem]" />
    </Carousel>
  )
}
