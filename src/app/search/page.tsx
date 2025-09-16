
"use client"

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type BlogPost } from "@/lib/database/blog";
import { DashboardLayout } from "@/components/dashboard-layout";
import PublicLayout from "@/app/(public)/layout";
import { useAuth } from "@/hooks/use-auth";
import { HandDrawnSeparator } from '@/components/icons';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchX, ArrowRight, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

function SearchResults() {
    const searchParams = useSearchParams();
    const q = searchParams.get('q');
    const [results, setResults] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!q) {
                setResults([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // Fetch all posts and filter client-side. This is more flexible than Firestore's
                // querying capabilities for full-text search and avoids complex index requirements.
                const postsQuery = query(collection(db, "blogPosts"), orderBy("date", "desc"));
                const allPostsSnapshot = await getDocs(postsQuery);
                const allPosts = allPostsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));

                const lowerCaseQuery = q.toLowerCase();
                const filteredPosts = allPosts.filter(post => 
                    post.title.toLowerCase().includes(lowerCaseQuery) ||
                    post.content.toLowerCase().includes(lowerCaseQuery) ||
                    post.metaDescription.toLowerCase().includes(lowerCaseQuery) ||
                    post.tags?.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
                );
                
                setResults(filteredPosts);

            } catch (error) {
                console.error("Error fetching search results:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [q]);

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">
                    Search Results
                </h1>
                <p className="text-muted-foreground">
                    {isLoading ? "Searching..." : `Found ${results.length} results for "${q}"`}
                </p>
            </div>

            <HandDrawnSeparator className="stroke-current text-border/50" />
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    Array.from({length: 3}).map((_, i) => (
                        <Card key={i}>
                            <Skeleton className="h-[250px] w-full" />
                            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                            <CardContent><Skeleton className="h-4 w-full" /></CardContent>
                            <CardFooter><Skeleton className="h-10 w-1/3" /></CardFooter>
                        </Card>
                    ))
                ) : results.length === 0 ? (
                    <div className="md:col-span-3">
                        <Card className="border-border/50 text-center py-12">
                            <CardContent>
                                <SearchX className="h-12 w-12 mx-auto text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">No blog posts found matching your search.</p>
                                <p className="text-sm text-muted-foreground">Try a different keyword.</p>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    results.map((post) => (
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
    );
}

function SearchPageContainer() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8"><Skeleton className="h-96 w-full" /></div>
            </DashboardLayout>
        )
    }

    if (user) {
        return (
            <DashboardLayout>
                <SearchResults />
            </DashboardLayout>
        );
    }

    return (
        <PublicLayout>
            <SearchResults />
        </PublicLayout>
    );
}

export default function SearchPage() {
    // Suspense is required by Next.js when using useSearchParams
    return (
        <Suspense fallback={<DashboardLayout><div className="flex-1 p-8"><Skeleton className="h-96 w-full" /></div></DashboardLayout>}>
            <SearchPageContainer />
        </Suspense>
    )
}

    