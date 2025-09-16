
"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { format } from "date-fns"
import { User, Calendar, Tag, Image as ImageIcon } from "lucide-react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { type Sermon } from "@/lib/database/sermons"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import Image from "next/image"


interface SermonsCarouselProps {
    sermons: Sermon[];
}

export function SermonsCarousel({ sermons }: SermonsCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      opts={{
        align: "start",
        loop: true,
      }}
    >
      <CarouselContent>
        {sermons.map((sermon) => (
          <CarouselItem key={sermon.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1 h-full">
                <Card className="flex flex-col overflow-hidden h-full min-h-[280px] border-border/50 hover:shadow-lg hover:border-primary/30 transition-all">
                    <CardHeader className="pb-2">
                        <CardTitle className="font-headline text-lg md:text-xl line-clamp-2">{sermon.title}</CardTitle>
                        {sermon.series && <Badge variant="secondary" className="w-fit mt-2">{sermon.series}</Badge>}
                    </CardHeader>
                     <CardContent className="flex-grow">
                         <div className="aspect-video relative rounded-md overflow-hidden bg-muted">
                            {sermon.artworkUrl ? (
                                <Image src={sermon.artworkUrl} alt={sermon.title} fill className="object-cover" data-ai-hint="sermon artwork" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-start space-y-2 text-sm text-muted-foreground pt-4">
                        <p className="flex items-center gap-2"><User className="w-4 h-4"/>{sermon.speaker}</p>
                        <p className="flex items-center gap-2"><Calendar className="w-4 h-4"/>{new Date(sermon.date).toLocaleDateString()}</p>
                    </CardFooter>
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
