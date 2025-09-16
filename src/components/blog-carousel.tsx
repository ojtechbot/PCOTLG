
"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowRight } from "lucide-react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { type BlogPost } from "@/lib/database/blog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"


interface BlogCarouselProps {
    posts: BlogPost[];
}

export function BlogCarousel({ posts }: BlogCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
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
        {posts.map((post) => (
          <CarouselItem key={post.id} className="md:basis-1/2 lg:basis-1/2">
            <div className="p-1">
                <div className="h-full">
                    <Card className="flex flex-col overflow-hidden h-full w-full md:flex-row">
                        <div className="relative h-48 w-full md:w-1/2 md:h-auto">
                            <Image src={post.image} alt={post.title} fill className="object-cover" data-ai-hint="blog post image" />
                        </div>
                        <div className="flex flex-col p-4 md:p-6 md:w-1/2 h-1/2 md:h-auto">
                            <CardHeader className="p-0">
                                <CardTitle className="font-headline text-lg md:text-2xl line-clamp-2">{post.title}</CardTitle>
                                <CardDescription className="text-xs">{format(new Date(post.date), 'PPP')}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 pt-2 flex-grow overflow-hidden">
                                <p className="hidden md:line-clamp-4 text-muted-foreground">{post.metaDescription}</p>
                            </CardContent>
                            <CardFooter className="p-0 pt-2 mt-auto">
                                <Button asChild size="sm" className="w-full md:w-auto">
                                    <Link href={`/blog/${post.id}`}>Read More <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                </Button>
                            </CardFooter>
                        </div>
                    </Card>
                </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex left-[-1rem] md:left-[-2.5rem]" />
      <CarouselNext className="hidden sm:flex right-[-1rem] md:right-[-2.5rem]" />
    </Carousel>
  )
}
