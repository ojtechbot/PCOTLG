
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import type { Sermon } from "@/lib/database/sermons";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Book, MessageSquare, BookOpenCheck } from "lucide-react";
import { Button } from "./ui/button";

interface SermonDetailDialogProps {
  sermon: Sermon;
  onOpenChange: (open: boolean) => void;
}

export function SermonDetailDialog({ sermon, onOpenChange }: SermonDetailDialogProps) {

  const hasInsights = sermon.summary || (sermon.scriptures && sermon.scriptures.length > 0) || (sermon.discussionQuestions && sermon.discussionQuestions.length > 0);

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">{sermon.title}</DialogTitle>
          <DialogDescription>
            A sermon by {sermon.speaker}
            {sermon.series && ` from the series "${sermon.series}"`}.
            Preached on {new Date(sermon.date).toLocaleDateString()}.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-6 -mr-6">
            <div className="space-y-6 pr-2">
                {hasInsights ? (
                    <>
                    {sermon.summary && (
                        <div className="space-y-2">
                        <h3 className="font-headline text-lg flex items-center gap-2"><Book className="w-5 h-5 text-primary"/> Summary</h3>
                        <p className="text-muted-foreground">{sermon.summary}</p>
                        </div>
                    )}
                    {sermon.scriptures && sermon.scriptures.length > 0 && (
                        <div className="space-y-2">
                        <h3 className="font-headline text-lg flex items-center gap-2"><BookOpenCheck className="w-5 h-5 text-primary"/> Key Scriptures</h3>
                        <div className="flex flex-wrap gap-2">
                            {sermon.scriptures.map(scripture => (
                            <Badge key={scripture} variant="secondary">{scripture}</Badge>
                            ))}
                        </div>
                        </div>
                    )}
                    {sermon.discussionQuestions && sermon.discussionQuestions.length > 0 && (
                        <div className="space-y-2">
                        <h3 className="font-headline text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary"/> Discussion Questions</h3>
                        <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                            {sermon.discussionQuestions.map((question, index) => (
                            <li key={index}>{question}</li>
                            ))}
                        </ul>
                        </div>
                    )}
                    </>
                ) : (
                    <p className="text-muted-foreground text-center py-8">No summary or insights are available for this sermon yet.</p>
                )}
            </div>
        </ScrollArea>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
