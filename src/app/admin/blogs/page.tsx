
"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, PlusCircle, Newspaper } from "lucide-react"
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BlogPostFormDialog } from "@/components/blog-post-form-dialog"
import { type BlogPost, deleteBlogPost } from "@/lib/database/blog"
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";


export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
    const { toast } = useToast();

    useEffect(() => {
      const q = query(collection(db, "blogPosts"), orderBy("date", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = snapshot.docs.map(doc => {
            const data = doc.data();
            // Safely convert Timestamp to ISO string
            const date = data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date;
            return { id: doc.id, ...data, date } as BlogPost
        });
        setPosts(postsData);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching posts:", error);
        toast({
            variant: "destructive",
            title: "Error fetching data",
            description: "Could not load blog posts. Please try again later.",
        });
        setIsLoading(false);
      });
      return () => unsubscribe();
    }, [toast]);


    const handleEdit = (post: BlogPost) => {
        setSelectedPost(post);
        setIsFormOpen(true);
    }
    
    const handleCreate = () => {
        setSelectedPost(null);
        setIsFormOpen(true);
    }

    const openDeleteConfirm = (post: BlogPost) => {
        setPostToDelete(post);
        setIsConfirmOpen(true);
    }

    const handleDelete = async () => {
        if (!postToDelete) return;

        try {
            await deleteBlogPost(postToDelete.id);
            toast({ title: "Post Deleted", description: "The blog post has been successfully removed." });
        } catch (error) {
            console.error("Error deleting post:", error);
            toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete the post. Please try again." });
        } finally {
            setIsConfirmOpen(false);
            setPostToDelete(null);
        }
    }

    const isValidDate = (date: any) => {
      return date && !isNaN(new Date(date).getTime());
    }


  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Blog Posts</CardTitle>
                    <CardDescription>
                    Manage your church's blog content.
                    </CardDescription>
                </div>
                 <Button onClick={handleCreate}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Post
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
               </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-12">
                    <Newspaper className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No blog posts found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new post.</p>
                    <Button className="mt-4" onClick={handleCreate}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Post
                    </Button>
                </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.author}</TableCell>
                    <TableCell>{isValidDate(post.date) ? format(new Date(post.date), 'PPP') : 'Invalid Date'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => handleEdit(post)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openDeleteConfirm(post)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </main>
      {isFormOpen && <BlogPostFormDialog post={selectedPost} onOpenChange={setIsFormOpen} />}
      {isConfirmOpen && postToDelete && (
        <DeleteConfirmationDialog
            itemName={postToDelete.title}
            itemType="blog post"
            onConfirm={handleDelete}
            onOpenChange={setIsConfirmOpen}
        />
      )}
    </>
  )
}
