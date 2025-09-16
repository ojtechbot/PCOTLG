
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
import type { Sermon } from "@/lib/database/sermons";
import { addSermon, updateSermon } from "@/lib/database/sermons";
import { useState } from "react";
import { Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { summarizeSermon } from "@/ai/flows/summarize-sermon";
import { generateSermonArtwork } from "@/ai/flows/generate-sermon-artwork";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import Image from "next/image";
import { Separator } from "./ui/separator";

interface SermonFormDialogProps {
  sermon: Sermon | null;
  onOpenChange: (open: boolean) => void;
}

export function SermonFormDialog({ sermon, onOpenChange }: SermonFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isArtLoading, setIsArtLoading] = useState(false);


  // Form state
  const [title, setTitle] = useState(sermon?.title || "");
  const [speaker, setSpeaker] = useState(sermon?.speaker || "");
  const [series, setSeries] = useState(sermon?.series || "");
  const [date, setDate] = useState(sermon?.date || new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState(sermon?.summary || "");
  const [scriptures, setScriptures] = useState(sermon?.scriptures?.join(', ') || "");
  const [discussionQuestions, setDiscussionQuestions] = useState(sermon?.discussionQuestions?.join('\n') || "");
  const [artworkUrl, setArtworkUrl] = useState(sermon?.artworkUrl || "");


  const handleGenerateWithAi = async () => {
    if (!title || !speaker) {
        toast({ variant: "destructive", title: "Info Required", description: "Please provide a sermon title and speaker first."});
        return;
    }
    setIsAiLoading(true);
    try {
        const result = await summarizeSermon({ title, speaker, series });
        setSummary(result.summary);
        setScriptures(result.scriptures.join(', '));
        setDiscussionQuestions(result.discussionQuestions.join('\n'));
        toast({ title: "Sermon Insights Generated!", description: "The AI has drafted a summary, scriptures, and questions."});
    } catch (error) {
        console.error("AI Generation Error:", error);
        toast({ variant: "destructive", title: "AI Generation Failed", description: "Could not generate insights. Please try again."});
    } finally {
        setIsAiLoading(false);
    }
  }

  const handleGenerateArtwork = async () => {
    if (!title) {
        toast({ variant: "destructive", title: "Title Required", description: "Please provide a sermon title to generate artwork."});
        return;
    }
    setIsArtLoading(true);
    try {
        const result = await generateSermonArtwork({ title });
        setArtworkUrl(result.artworkUrl);
        toast({ title: "Artwork Generated!", description: "A unique piece of art has been created for your sermon."});
    } catch (error) {
        console.error("Artwork Generation Error:", error);
        toast({ variant: "destructive", title: "Artwork Generation Failed", description: "Could not generate artwork. Please try again."});
    } finally {
        setIsArtLoading(false);
    }
  }


  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    const sermonData = {
        title,
        speaker,
        series,
        date,
        summary,
        scriptures: scriptures.split(',').map(s => s.trim()).filter(Boolean),
        discussionQuestions: discussionQuestions.split('\n').map(q => q.trim()).filter(Boolean),
        artworkUrl,
    };

    try {
        if (sermon) {
            await updateSermon({ ...sermon, ...sermonData });
        } else {
            await addSermon(sermonData);
        }
        
        toast({
            title: sermon ? "Sermon Updated!" : "Sermon Added!",
            description: `The sermon "${title}" has been successfully saved.`,
        })
        onOpenChange(false);

    } catch(error) {
        console.error("Failed to save sermon", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "An error occurred while saving the sermon."
        })
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <form onSubmit={handleSave} className="flex-grow flex flex-col overflow-hidden">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>{sermon ? "Edit Sermon" : "Add New Sermon"}</DialogTitle>
              <DialogDescription>
                {sermon ? "Update the details for this sermon." : "Fill out the form to add a new sermon."}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-grow my-4 pr-6 -mr-6">
                <div className="grid gap-4 py-4 pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="speaker">Speaker</Label>
                        <Input id="speaker" value={speaker} onChange={e => setSpeaker(e.target.value)} required/>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="series">Series</Label>
                        <Input id="series" value={series} onChange={e => setSeries(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required/>
                    </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3 rounded-md border p-4 bg-secondary/50">
                    <div className="flex justify-between items-center">
                        <Label>Sermon Artwork</Label>
                        <Button type="button" size="sm" variant="outline" className="text-xs" onClick={handleGenerateArtwork} disabled={isArtLoading || isAiLoading}>
                            {isArtLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin"/> : <ImageIcon className="mr-2 h-3 w-3"/>}
                            Generate with AI
                        </Button>
                    </div>
                     <div className="aspect-video rounded-md overflow-hidden relative bg-muted flex items-center justify-center">
                        {artworkUrl ? (
                            <Image src={artworkUrl} alt="Sermon artwork" fill className="object-cover"/>
                        ) : (
                            <ImageIcon className="w-10 h-10 text-muted-foreground" />
                        )}
                        {isArtLoading && <div className="absolute inset-0 bg-background/80 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin"/></div>}
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="artworkUrl">Image URL</Label>
                        <Input id="artworkUrl" value={artworkUrl} onChange={e => setArtworkUrl(e.target.value)} placeholder="Or paste an image URL here" />
                    </div>
                </div>

                <Separator className="my-4" />


                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label>AI-Generated Insights</Label>
                        <Button type="button" size="sm" variant="outline" className="text-xs" onClick={handleGenerateWithAi} disabled={isAiLoading || isArtLoading}>
                            {isAiLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin"/> : <Sparkles className="mr-2 h-3 w-3"/>}
                            Generate Insights
                        </Button>
                    </div>
                    <div className="space-y-4 rounded-md border p-4 bg-secondary/50">
                        <div className="space-y-2">
                            <Label htmlFor="summary">Summary</Label>
                            <Textarea id="summary" value={summary} onChange={e => setSummary(e.target.value)} rows={3}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="scriptures">Key Scriptures (comma-separated)</Label>
                            <Input id="scriptures" value={scriptures} onChange={e => setScriptures(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="questions">Discussion Questions (one per line)</Label>
                            <Textarea id="questions" value={discussionQuestions} onChange={e => setDiscussionQuestions(e.target.value)} rows={3}/>
                        </div>
                    </div>
                </div>
                </div>
            </ScrollArea>
            <DialogFooter className="flex-shrink-0 pt-4 border-t mt-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading || isAiLoading || isArtLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
