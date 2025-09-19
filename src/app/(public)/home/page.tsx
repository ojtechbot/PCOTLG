
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Church, HeartHandshake, Newspaper, Users, Calendar, BookOpen } from "lucide-react";
import { collection, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HandDrawnSeparator } from "@/components/icons";
import { db } from "@/lib/firebase";
import { type BlogPost } from "@/lib/database/blog";
import { type ChurchEvent } from "@/lib/database/events";
import { getLeaders, type Leader } from "@/lib/database/leaders";
import { type Sermon } from "@/lib/database/sermons";
import { BlogCarousel } from "@/components/blog-carousel";
import { LeadersCarousel } from "@/components/leaders-carousel";
import { HeroSection } from "@/components/hero-section";
import { SermonsCarousel } from "@/components/sermons-carousel";
import { ContactUsForm } from "@/components/contact-us-form";

const galleryImages = [
    { src: "/images/e1.jpeg", alt: "", hint: "community event" },
    { src: "/images/e2.jpeg", alt: "Worship service", hint: "worship service" },
    { src: "/images/e3.jpeg", alt: "Youth group activity", hint: "youth group" },
    { src: "/images/e4.jpeg", alt: "Church building exterior", hint: "church building" },
];

async function getHomepageData() {
    try {
        const postQuery = query(collection(db, "blogPosts"), orderBy("date", "desc"), limit(5));
        const eventsQuery = query(collection(db, "events"), orderBy("date", "asc"), limit(3));
        const sermonsQuery = query(collection(db, "sermons"), orderBy("date", "desc"), limit(5));
        
        const [postSnapshot, eventsSnapshot, leaders, sermonsSnapshot] = await Promise.all([
            getDocs(postQuery),
            getDocs(eventsQuery),
            getLeaders(6),
            getDocs(sermonsQuery),
        ]);

        const allPosts = postSnapshot.docs.map(doc => {
            const data = doc.data();
            const date = data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date;
            const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
            return { ...data, id: doc.id, date, createdAt } as BlogPost;
        });

        const upcomingEvents = eventsSnapshot.docs.map(doc => {
            const data = doc.data();
            const date = data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date;
            return { ...data, id: doc.id, date } as ChurchEvent;
        });
        
        const recentSermons = sermonsSnapshot.docs.map(doc => {
            const data = doc.data();
            const date = data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date;
            const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
            return { ...data, id: doc.id, date, createdAt } as Sermon;
        });
        
        const serializedLeaders = leaders.map(leader => ({
            ...leader,
            createdAt: leader.createdAt, // Already a string
        }));

        return { allPosts, upcomingEvents, leaders: serializedLeaders, recentSermons };
    } catch (error) {
        console.error("Error fetching homepage data:", error);
        return { allPosts: [], upcomingEvents: [], leaders: [], recentSermons: [] };
    }
}


export default async function HomePage() {
    const { allPosts, upcomingEvents, leaders, recentSermons } = await getHomepageData();

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1">
                {/* Hero Section */}
                <HeroSection />

                {/* Features Section */}
                <section id="features" className="py-16 md:py-24 bg-background animate-fade-in-up">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-headline text-primary">Connect & Grow With Us</h2>
                             <HandDrawnSeparator className="mx-auto mt-4" />
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <Card className="text-center">
                                <CardHeader className="items-center">
                                    <div className="p-4 bg-primary/10 rounded-full">
                                        <Church className="w-8 h-8 text-primary" />
                                    </div>
                                    <CardTitle className="font-headline">Worship With Us</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>Join our services live or browse our sermon library.</p>
                                </CardContent>
                            </Card>
                            <Card className="text-center">
                                <CardHeader className="items-center">
                                     <div className="p-4 bg-primary/10 rounded-full">
                                        <Users className="w-8 h-8 text-primary" />
                                    </div>
                                    <CardTitle className="font-headline">Find Community</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>Connect with others in our community groups.</p>
                                </CardContent>
                            </Card>
                            <Card className="text-center">
                                <CardHeader className="items-center">
                                     <div className="p-4 bg-primary/10 rounded-full">
                                        <HeartHandshake className="w-8 h-8 text-primary" />
                                    </div>
                                    <CardTitle className="font-headline">Prayer Network</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>Share requests and support one another in prayer.</p>
                                </CardContent>
                            </Card>
                             <Card className="text-center">
                                <CardHeader className="items-center">
                                     <div className="p-4 bg-primary/10 rounded-full">
                                        <Newspaper className="w-8 h-8 text-primary" />
                                    </div>
                                    <CardTitle className="font-headline">Stay Informed</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>Read the latest news and stories on our blog.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
                

                {/* Blog Carousel & Upcoming Events */}
                <section className="py-16 md:py-24 bg-secondary/30 animate-fade-in-up animation-delay-200">
                    <div className="container mx-auto px-4 grid lg:grid-cols-3 gap-12 items-start">
                        {/* Blog Carousel */}
                        <div className="lg:col-span-2">
                             <h2 className="text-4xl font-headline text-primary mb-6">From The Blog</h2>
                             {allPosts.length > 0 ? (
                                <div className="w-[300px] md:w-full mx-auto">
                                    <BlogCarousel posts={allPosts} />
                                </div>
                             ) : (
                                <p>No blog posts yet. Check back soon!</p>
                             )}
                        </div>

                        {/* Upcoming Events */}
                        <div>
                             <h2 className="text-4xl font-headline text-primary mb-6">Upcoming Events</h2>
                             <div className="space-y-4">
                                {upcomingEvents.length > 0 ? (
                                    upcomingEvents.map(event => (
                                      <Card key={event.id} className="overflow-hidden w-full h-[250px] md:h-auto">
                                          <div className="relative h-2/5 w-full">
                                            <Image src={event.image} alt={event.title} fill className="object-cover" data-ai-hint="event photo"/>
                                          </div>
                                          <CardHeader className="p-4">
                                            <div className="text-center font-bold text-primary">
                                                <div className="text-sm">{format(new Date(event.date), "MMM dd, yyyy")}</div>
                                            </div>
                                          </CardHeader>
                                          <CardContent className="p-4 pt-0">
                                            <h3 className="font-semibold line-clamp-1">{event.title}</h3>
                                            <p className="text-sm text-muted-foreground">{format(new Date(event.date), "p")} @ {event.location}</p>
                                          </CardContent>
                                      </Card>
                                    ))
                                ) : (
                                    <p>No upcoming events. Check back soon!</p>
                                )}
                                <Link href="/login" className="block">
                                    <Card className="overflow-hidden w-full h-[250px] md:h-auto flex flex-col items-center justify-center text-center bg-secondary/50 hover:bg-secondary/70 transition-colors">
                                        <CardHeader>
                                            <Calendar className="w-12 h-12 text-primary mx-auto"/>
                                        </CardHeader>
                                        <CardContent>
                                            <h3 className="font-headline text-xl font-semibold">View Full Calendar</h3>
                                            <p className="text-sm text-muted-foreground mt-2">Explore all upcoming events</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                             </div>
                        </div>
                    </div>
                </section>
                
                {/* Sermon Carousel */}
                <section className="py-16 md:py-24 bg-background animate-fade-in-up animation-delay-400">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-headline text-primary">From The Pulpit</h2>
                            <HandDrawnSeparator className="mx-auto mt-4" />
                        </div>
                        {recentSermons.length > 0 ? (
                            <div className="w-[300px] md:w-full mx-auto">
                                <SermonsCarousel sermons={recentSermons} />
                            </div>
                        ) : (
                            <p className="text-center">Recent sermons will appear here soon.</p>
                        )}
                        <div className="text-center mt-12">
                            <Button asChild size="lg">
                                <Link href="/teachings">Browse All Teachings <BookOpen className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Leaders Section */}
                <section className="py-16 md:py-24 bg-secondary/30 animate-fade-in-up animation-delay-400">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-headline text-primary">Meet Our Leaders</h2>
                            <HandDrawnSeparator className="mx-auto mt-4" />
                        </div>
                        {leaders.length > 0 ? (
                            <div className="w-full md:w-full mx-auto">
                                <LeadersCarousel leaders={leaders} />
                            </div>
                        ) : (
                            <p className="text-center">Our leaders will be introduced soon.</p>
                        )}
                         <div className="text-center mt-12">
                            <Button asChild size="lg">
                                <Link href="/leaders">View All Leaders <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </div>
                    </div>
                </section>
                
                {/* Gallery */}
                <section className="py-16 md:py-24 bg-secondary/50 animate-fade-in-up animation-delay-800">
                    <div className="container mx-auto px-4">
                         <div className="text-center mb-12">
                            <h2 className="text-4xl font-headline text-primary">A Glimpse of Our Life</h2>
                             <HandDrawnSeparator className="mx-auto mt-4" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {galleryImages.map((img, i) => (
                                <div key={i} className="overflow-hidden rounded-lg shadow-lg aspect-w-1 aspect-h-1">
                                    <Image src={img.src} alt={img.alt} width={400} height={400} className="object-cover w-full h-full transform hover:scale-110 transition-transform duration-300" data-ai-hint={img.hint} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Form Section */}
                <section className="py-16 md:py-24 bg-background animate-fade-in-up animation-delay-600">
                    <div className="container mx-auto px-4">
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center">
                                <h2 className="text-4xl font-headline text-primary">Get In Touch</h2>
                                <p className="mt-4 text-muted-foreground">We'd love to hear from you. Send us a message and we'll get back to you soon.</p>
                            </div>
                             <div className="mt-8">
                               <ContactUsForm />
                             </div>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}

    