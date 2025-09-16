
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import type { BlogPost } from "@/lib/database/blog";
import { addBlogPost, updateBlogPost } from "@/lib/database/blog";
import { createNotification } from "@/lib/database/notifications";
import { useState } from "react";
import { Loader2, Sparkles, Mic } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { writeBlogPost } from "@/ai/flows/write-blog-post";
import { summarizeAndReadBlogPost } from "@/ai/flows/summarize-and-read-blog-post";
import { Badge } from "./ui/badge";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";


interface BlogPostFormDialogProps {
  post: BlogPost | null;
  onOpenChange: (open: boolean) => void;
}

export function BlogPostFormDialog({ post, onOpenChange }: BlogPostFormDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  // Use state to hold form values to allow AI to update them
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || "");
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [currentTag, setCurrentTag] = useState("");
  const [image, setImage] = useState(post?.image ?? 'https://placehold.co/600x400.png');
  const [date, setDate] = useState(post ? new Date(post.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

  // States for audio summary
  const [textSummary, setTextSummary] = useState(post?.textSummary || "");
  const [audioSummaryUrl, setAudioSummaryUrl] = useState(post?.audioSummaryUrl || "");


  const handleGenerateWithAi = async () => {
    if (!title) {
        toast({ variant: "destructive", title: "Topic Required", description: "Please provide a title or topic first."});
        return;
    }
    setIsAiLoading(true);
    try {
        const result = await writeBlogPost({ topic: title });
        setTitle(result.title);
        setContent(result.content);
        setMetaDescription(result.metaDescription);
        setTags(result.tags);
        toast({ title: "Content Generated!", description: "The AI has drafted a full, SEO-optimized blog post for you."});
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "AI Generation Failed", description: "Could not generate content. Please try again."});
    } finally {
        setIsAiLoading(false);
    }
  }

  const handleGenerateAudioSummary = async () => {
    if (!content) {
        toast({ variant: "destructive", title: "Content Required", description: "Please provide blog post content first."});
        return;
    }
    setIsAudioLoading(true);
    try {
        const result = await summarizeAndReadBlogPost({ content });
        setTextSummary(result.textSummary);
        setAudioSummaryUrl(result.audioSummaryUrl);
        toast({ title: "Audio Summary Generated!", description: "The AI has created a text and audio summary."});
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "AI Generation Failed", description: "Could not generate audio summary. Please try again."});
    } finally {
        setIsAudioLoading(false);
    }
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag) {
        e.preventDefault();
        if (!tags.includes(currentTag.trim())) {
            setTags([...tags, currentTag.trim()]);
        }
        setCurrentTag("");
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }


  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a post." });
      return;
    }
    setIsLoading(true);
    
    const postData = {
        title,
        content,
        date: new Date(date).toISOString(),
        author: user.name || "Anonymous",
        image,
        metaDescription,
        tags,
        textSummary,
        audioSummaryUrl,
    }

    try {
        let savedPost;
        if (post) {
            savedPost = await updateBlogPost({ ...post, ...postData });
        } else {
            savedPost = await addBlogPost(postData);
            // Create a notification for a new blog post
            await createNotification({
                title: "New Blog Post",
                body: `Check out the new article: "${savedPost.title}"`,
                link: `/blog/${savedPost.id}`
            });
        }
        
        toast({
            title: post ? "Post Updated!" : "Post Created!",
            description: `The blog post "${postData.title}" has been successfully saved.`,
        })
        onOpenChange(false);

    } catch(error) {
        console.error("Failed to save post", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "An error occurred while saving the blog post."
        })
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col">
          <form onSubmit={handleSave} className="flex flex-col h-full overflow-hidden">
            <DialogHeader>
              <DialogTitle>{post ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
              <DialogDescription>
                {post ? "Update the details for this blog post." : "Fill out the form to create a new post for the blog."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 flex-grow min-h-0">
                {/* Form Inputs Column */}
                <ScrollArea className="pr-4 -mr-4">
                    <div className="space-y-4 pr-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title / Topic</Label>
                            <div className="flex gap-2 items-center">
                                <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} className="flex-grow" required/>
                                <Button type="button" size="sm" variant="outline" className="text-xs" onClick={handleGenerateWithAi} disabled={isAiLoading || isAudioLoading}>
                                    {isAiLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin"/> : <Sparkles className="mr-2 h-3 w-3"/>}
                                    Draft with AI
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Content (Markdown)</Label>
                            <Textarea id="content" name="content" value={content} onChange={(e) => setContent(e.target.value)} className="font-mono" rows={15} placeholder="Write your blog post content here in Markdown format..." required/>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-3 rounded-md border p-4 bg-secondary/50">
                            <div className="flex justify-between items-center">
                               <Label>AI Audio Summary</Label>
                               <Button type="button" size="sm" variant="outline" className="text-xs" onClick={handleGenerateAudioSummary} disabled={isAudioLoading || isAiLoading}>
                                    {isAudioLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin"/> : <Mic className="mr-2 h-3 w-3"/>}
                                    Generate Audio
                                </Button>
                            </div>
                            {textSummary && (
                                <div className="space-y-2">
                                     <Label htmlFor="textSummary">Text Summary</Label>
                                     <Textarea id="textSummary" value={textSummary} onChange={(e) => setTextSummary(e.target.value)} rows={3} />
                                </div>
                            )}
                            {audioSummaryUrl && (
                                <div className="space-y-2">
                                     <Label>Audio Preview</Label>
                                     <audio controls src={audioSummaryUrl} className="w-full h-10" />
                                </div>
                            )}
                        </div>

                        <Separator />


                        <div className="space-y-2">
                            <Label htmlFor="metaDescription">Meta Description</Label>
                            <Textarea id="metaDescription" name="metaDescription" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} placeholder="A short, SEO-friendly summary (max 160 characters)." required/>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags</Label>
                            <Input 
                                id="tags" 
                                value={currentTag} 
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="Type a tag and press Enter"
                            />
                            <div className="flex flex-wrap gap-2 mt-2 min-h-[28px]">
                                {tags.map(tag => (
                                    <Badge key={tag} variant="secondary">
                                        {tag}
                                        <button type="button" className="ml-2 rounded-full hover:bg-destructive/20 p-0.5" onClick={() => handleRemoveTag(tag)}>
                                            <span className="sr-only">Remove {tag}</span>
                                            &times;
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Cover Image URL</Label>
                            <Input id="image" name="image" value={image} onChange={(e) => setImage(e.target.value)} required/>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Publish Date</Label>
                            <Input id="date" name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required/>
                        </div>
                    </div>
                </ScrollArea>

                {/* Live Preview Column */}
                <div className="hidden md:flex flex-col space-y-2">
                    <Label>Live Preview</Label>
                    <ScrollArea className="border rounded-md h-full">
                        <article className="prose dark:prose-invert p-4">
                           <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {`# ${title}\n\n![Cover Image](${image})\n\n${content}`}
                            </ReactMarkdown>
                        </article>
                    </ScrollArea>
                </div>
            </div>

            <DialogFooter className="pt-4 mt-auto border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Saving..." : "Save Post"}
              </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
