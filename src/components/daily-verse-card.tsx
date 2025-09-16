
"use client"

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { getDailyVerse, type DailyVerseOutput } from "@/ai/flows/daily-verse";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { Skeleton } from "./ui/skeleton";
import { BookOpen, Volume2, Download, Save, Loader2, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";

const LOCAL_STORAGE_KEY_VERSE = 'dailyVerse';
const LOCAL_STORAGE_KEY_NOTES = 'personal-notes-app';

export function DailyVerseCard() {
    const [verse, setVerse] = useState<DailyVerseOutput | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchVerse = async () => {
            setLoading(true);
            try {
                const dailyVerse = await getDailyVerse();
                setVerse(dailyVerse);
                localStorage.setItem(LOCAL_STORAGE_KEY_VERSE, JSON.stringify({
                    verse: dailyVerse,
                    date: new Date().toDateString()
                }));
            } catch (error) {
                console.error("Failed to fetch daily verse:", error);
                setVerse({ reference: "John 3:16", text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life." });
            } finally {
                setLoading(false);
            }
        };

        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY_VERSE);
        if (storedData) {
            const { verse: savedVerse, date } = JSON.parse(storedData);
            if (date === new Date().toDateString()) {
                setVerse(savedVerse);
                setLoading(false);
            } else {
                fetchVerse();
            }
        } else {
            fetchVerse();
        }
    }, []);

    const handleGenerateAudio = async () => {
        if (!verse) return;
        setIsGeneratingAudio(true);
        try {
            const audioData = await textToSpeech(`${verse.reference}. ${verse.text}`);
            setAudioUrl(audioData.media);
            toast({ title: "Audio Ready", description: "The audio for the verse is ready to play." });
        } catch (error) {
            console.error("Failed to generate audio:", error);
            toast({ variant: "destructive", title: "Audio Generation Failed", description: "Could not generate audio for this verse." });
        } finally {
            setIsGeneratingAudio(false);
        }
    };
    
    useEffect(() => {
        if (audioUrl && audioRef.current) {
            audioRef.current.play();
        }
    }, [audioUrl]);

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
        }
    };

    const handleSaveToNotes = () => {
        if (!verse) return;
        try {
            const savedNotesRaw = localStorage.getItem(LOCAL_STORAGE_KEY_NOTES);
            const savedNotes = savedNotesRaw ? JSON.parse(savedNotesRaw) : [];
            const newNote = {
                id: Date.now(),
                text: `Verse of the Day: ${verse.reference}\n"${verse.text}"`,
                timestamp: new Date().toISOString(),
            };
            const updatedNotes = [...savedNotes, newNote];
            localStorage.setItem(LOCAL_STORAGE_KEY_NOTES, JSON.stringify(updatedNotes));
            toast({ title: "Verse Saved", description: `"${verse.reference}" has been added to your personal notes.` });
        } catch (error) {
            console.error("Failed to save note:", error);
            toast({ variant: "destructive", title: "Save Failed", description: "Could not save the verse to your notes." });
        }
    };


    return (
        <Card className="shadow-lg border-primary/20 bg-gradient-to-br from-background to-secondary/20">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full border-2 border-primary/30">
                        <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="font-headline text-2xl">
                            Verse of the Day
                        </CardTitle>
                        <CardDescription>
                            Your daily dose of scripture and encouragement.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                ) : verse ? (
                    <div>
                        <h3 className="font-scripture text-2xl text-primary">{verse.reference}</h3>
                        <blockquote className="mt-2 pl-4 border-l-2 border-primary/50 italic text-muted-foreground">
                           <p>"{verse.text}"</p>
                        </blockquote>
                        <div className="mt-4 flex items-center gap-2">
                             <Button onClick={handleGenerateAudio} disabled={isGeneratingAudio || !!audioUrl} size="icon" variant="outline">
                                {isGeneratingAudio ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                                <span className="sr-only">Generate Audio</span>
                            </Button>
                             {audioUrl && (
                                <>
                                <Button onClick={handlePlayPause} size="icon" variant="outline">
                                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                    <span className="sr-only">Play/Pause</span>
                                </Button>
                                <Button asChild size="icon" variant="outline">
                                    <a href={audioUrl} download={`${verse.reference.replace(/ /g, '_')}.wav`}>
                                        <Download className="h-5 w-5" />
                                        <span className="sr-only">Download Audio</span>
                                    </a>
                                </Button>
                                </>
                             )}
                             <Button onClick={handleSaveToNotes} size="icon" variant="outline">
                                <Save className="h-5 w-5"/>
                                <span className="sr-only">Save to Notes</span>
                             </Button>
                        </div>
                        {audioUrl && <audio ref={audioRef} src={audioUrl} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} className="hidden"/>}
                    </div>
                ) : (
                    <p className="text-muted-foreground">Could not load verse. Please try again later.</p>
                )}
            </CardContent>
        </Card>
    );
}

    