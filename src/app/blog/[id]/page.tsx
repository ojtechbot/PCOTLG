
"use client";

import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowLeft, Calendar, User, Mic } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { DashboardLayout } from "@/components/dashboard-layout";
import PublicLayout from "@/app/(public)/layout";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { type BlogPost } from "@/lib/database/blog";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Preloader } from "@/components/preloader";

function BlogPostContent({ post }: { post: BlogPost }) {
  return (
        <div className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/blog">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to all posts
                    </Link>
                </Button>
                <article>
                    {post.audioSummaryUrl && post.textSummary && (
                        <Card className="my-8 bg-secondary/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-headline"><Mic className="w-5 h-5"/> AI Audio Summary</CardTitle>
                                <CardDescription>{post.textSummary}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <audio controls className="w-full">
                                    <source src={post.audioSummaryUrl} type="audio/wav" />
                                    Your browser does not support the audio element.
                                </audio>
                            </CardContent>
                        </Card>
                    )}

                    <Image 
                        src={post.image} 
                        alt={post.title} 
                        width={1200} 
                        height={600} 
                        className="rounded-lg object-cover w-full aspect-video mb-8"
                        data-ai-hint="blog post image"
                    />
                    
                    <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-foreground/80 prose-headings:text-primary prose-a:text-primary hover:prose-a:underline prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:text-muted-foreground">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {post.content}
                        </ReactMarkdown>
                    </div>

                </article>
            </div>
        </div>
  );
}


export default function BlogPostPage() {
    const { user, loading: authLoading } = useAuth();
    const params = useParams();
    const id = params.id as string;
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getPost(postId: string) {
            if (!postId) return;
            try {
                const docRef = doc(db, "blogPosts", postId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setPost({ 
                        id: docSnap.id, 
                        ...data,
                        date: data.date,
                    } as BlogPost);
                } else {
                    notFound();
                }
            } catch (error) {
                console.error("Error fetching post:", error);
                notFound();
            } finally {
                setLoading(false);
            }
        }
        getPost(id);
    }, [id]);
  
  if (authLoading || loading) {
     return <Preloader />;
  }

  if (user) {
    return (
        <DashboardLayout>
            {post ? <BlogPostContent post={post} /> : <Loading />}
        </DashboardLayout>
    )
  }

  return (
    <PublicLayout>
        {post ? <BlogPostContent post={post} /> : <Loading />}
    </PublicLayout>
  )
}

export function Loading() {
  return (
      <div className="flex-1 space-y-8 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2 mt-4" />
               <Skeleton className="h-8 w-64 mt-4" />
              <Skeleton className="h-[500px] w-full mt-8" />
              <div className="mt-8 space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
              </div>
          </div>
      </div>
  );
}

