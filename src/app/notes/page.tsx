
"use client"

import { useEffect, useState, useRef, useCallback } from "react";
import { Send, NotebookPen } from "lucide-react";
import { format } from "date-fns";

import { DashboardLayout } from "@/components/dashboard-layout";
import { HandDrawnSeparator } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

interface Note {
  id: number;
  text: string;
  timestamp: string;
}

const LOCAL_STORAGE_KEY = 'personal-notes-app';

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load notes from local storage once on initial render
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error("Failed to parse notes from local storage:", error);
    }
  }, []);

  // Auto-scroll to bottom when new notes are added
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [notes.length]); // Only trigger on new notes

  const handleAddNote = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim() === "") return;

    const note: Note = {
      id: Date.now(),
      text: newNote.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    
    // Save to local storage after state update
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error("Failed to save notes to local storage:", error);
    }
    
    setNewNote("");
  }, [newNote, notes]);

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-headline font-bold tracking-tight text-primary flex items-center gap-3">
            <NotebookPen className="w-10 h-10" />
            My Personal Notes
          </h1>
          <p className="text-muted-foreground">
            A private space for your thoughts, reflections, and reminders. Data is stored locally on your device.
          </p>
        </div>

        <HandDrawnSeparator className="stroke-current text-border/50" />
        
        <div className="h-[60vh] flex flex-col max-w-4xl mx-auto w-full border rounded-lg">
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
                <div className="space-y-6">
                {notes.map((note) => (
                    <div key={note.id} className="flex items-start gap-4">
                        <Avatar>
                             <AvatarImage src={user?.photoURL ?? undefined} data-ai-hint="portrait" />
                            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                                <p className="font-semibold">{user?.name || "You"}</p>
                                <p className="text-xs text-muted-foreground">
                                    {format(new Date(note.timestamp), 'p, MMM dd')}
                                </p>
                            </div>
                            <div className="bg-muted p-3 rounded-lg mt-1">
                                <p className="whitespace-pre-wrap">{note.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {notes.length === 0 && (
                    <div className="text-center text-muted-foreground py-16">
                        <p>Your notes will appear here.</p>
                        <p className="text-sm">Type a message below to get started.</p>
                    </div>
                )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleAddNote} className="flex items-center gap-4">
                    <Input
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Write a private note..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon">
                        <Send className="w-4 h-4" />
                        <span className="sr-only">Save Note</span>
                    </Button>
                </form>
            </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
