
"use client";

import { collection, query, orderBy, getDocs, Timestamp } from "firebase/firestore";
import Image from "next/image";
import { format } from "date-fns";
import { Calendar, User, Newspaper, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

import { DashboardLayout } from "@/components/dashboard-layout";
import PublicLayout from "@/app/(public)/layout";
import { HandDrawnSeparator } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { type BlogPost } from "@/lib/database/blog";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Preloader } from "@/components/preloader";


function BlogPageContent({ posts, isLoading }: { posts: BlogPost[], isLoading: boolean }) {
    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <div className="flex flex-col space-y-2">
            <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">
                Our Blog
            </h1>
            <p className="text-muted-foreground">
                Thoughts, stories, and updates from our community.
            </p>
            </div>

            <HandDrawnSeparator className="stroke-current text-border/50" />
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
                 Array.from({length: 6}).map((_, i) => (
                    <Card key={i} className="border-border/50">
                        <Skeleton className="h-[250px] w-full" />
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-10 w-1/3" />
                        </CardFooter>
                    </Card>
                ))
            ) : posts.length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3">
                    <Card className="border-border/50 text-center py-12">
                    <CardContent>
                        <Newspaper className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">There are no blog posts yet.</p>
                        <p className="text-sm text-muted-foreground">Check back soon for new content.</p>
                    </CardContent>
                    </Card>
                </div>
            ) : (
                posts.map((post) => (
                    <Card key={post.id} className="border-border/50 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all overflow-hidden">
                        <Link href={`/blog/${post.id}`} className="block">
                        <Image src={post.image} alt={post.title} width={600} height={400} className="object-cover h-[250px]" data-ai-hint="blog post image" />
                        </Link>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl line-clamp-2">
                            <Link href={`/blog/${post.id}`} className="hover:text-primary transition-colors">{post.title}</Link>
                            </CardTitle>
                            <CardDescription className="line-clamp-3 h-[60px]">{post.metaDescription}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <div className="text-sm text-muted-foreground space-y-2">
                                <p className="flex items-center gap-2"><User className="w-4 h-4"/>{post.author}</p>
                                <p className="flex items-center gap-2"><Calendar className="w-4 h-4"/>{format(new Date(post.date), 'PPP')}</p>
                            </div>
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map(tag => (
                                        <Badge key={tag} variant="secondary">{tag}</Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                        <Button asChild variant="outline" className="w-full">
                            <Link href={`/blog/${post.id}`}>
                                Read More <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        </CardFooter>
                    </Card>
                ))
            )}
            </div>
        </div>
    )
}

export default function BlogPage() {
    const { user, loading: authLoading } = useAuth();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getBlogPosts() {
            try {
                const q = query(collection(db, "blogPosts"), orderBy("date", "desc"));
                const snapshot = await getDocs(q);
                const postsData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const date = data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date;
                    return { 
                        id: doc.id,
                        ...data,
                        date,
                    } as BlogPost
                });
                setPosts(postsData);
            } catch (error) {
                console.error("Error fetching blog posts:", error);
            } finally {
                setLoading(false);
            }
        }
        getBlogPosts();
    }, []);
  
    if(authLoading) {
        return <Preloader />;
    }

    if(user) {
        return (
            <DashboardLayout>
                <BlogPageContent posts={posts} isLoading={loading} />
            </DashboardLayout>
        )
    }

    return (
        <PublicLayout>
            <BlogPageContent posts={posts} isLoading={loading} />
        </PublicLayout>
    )
}

