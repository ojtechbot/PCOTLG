
"use client"

import { useState, useRef } from "react";
import { BookMarked, Download, Loader2, Pause, Play, Search, Volume2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { HandDrawnSeparator } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { bibleSearch, type BibleSearchOutput, type BibleSearchInput } from "@/ai/flows/bible-search";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { DailyVerseCard } from "@/components/daily-verse-card";
import { useToast } from "@/hooks/use-toast";

export default function BibleStudyPage() {
    const [query, setQuery] = useState<BibleSearchInput>("");
    const [results, setResults] = useState<BibleSearchOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Audio states
    const [audioUrls, setAudioUrls] = useState<Record<number, string>>({});
    const [loadingAudioIndex, setLoadingAudioIndex] = useState<number | null>(null);
    const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { toast } = useToast();


    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setHasSearched(true);
        setResults(null);
        setAudioUrls({}); // Clear previous audio URLs
        try {
            const searchResults = await bibleSearch(query);
            setResults(searchResults);
        } catch (error) {
            console.error("Bible search failed:", error);
            setResults(null);
            toast({
                variant: "destructive",
                title: "Search Failed",
                description: "Could not perform Bible search. Please try again."
            })
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateAudioForResult = async (textToRead: string, index: number) => {
        if (loadingAudioIndex !== null) return; // Prevent multiple generations at once
        setLoadingAudioIndex(index);
        setPlayingAudioIndex(null);

        try {
            const audioData = await textToSpeech(textToRead);
            setAudioUrls(prev => ({...prev, [index]: audioData.media}));
            setPlayingAudioIndex(index); // Auto-play after generation
            if(audioRef.current) {
                audioRef.current.src = audioData.media;
                audioRef.current.play();
            }
        } catch (error) {
            console.error("Failed to generate audio:", error);
            toast({ variant: "destructive", title: "Audio Generation Failed", description: "Could not generate audio for this verse." });
        } finally {
            setLoadingAudioIndex(null);
        }
    }

    const handlePlayPause = (index: number) => {
        if (!audioRef.current) return;

        if (playingAudioIndex === index) { // Currently playing this verse, so pause it
            audioRef.current.pause();
            setPlayingAudioIndex(null);
        } else { // Not playing or another verse is playing
            audioRef.current.src = audioUrls[index];
            audioRef.current.play();
            setPlayingAudioIndex(index);
        }
    }

    return (
        <DashboardLayout>
            <div className="flex-1 space-y-8 p-4 md:p-8">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-4xl font-headline font-bold tracking-tight text-primary flex items-center gap-3">
                        <BookMarked className="w-10 h-10" />
                        Bible Study Tools
                    </h1>
                    <p className="text-muted-foreground">
                        Explore the scriptures with AI-powered search and daily inspiration.
                    </p>
                </div>

                <HandDrawnSeparator className="stroke-current text-border/50" />

                <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-8">
                        <Card>
                             <CardHeader>
                                <CardTitle className="font-headline">AI Bible Search</CardTitle>
                                <CardDescription>Have a question? Ask the Bible. Type a topic, question, or theme below.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <Input 
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="e.g., scriptures about forgiveness..."
                                        className="flex-grow"
                                        disabled={isLoading}
                                    />
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                        Search
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            {isLoading && (
                                <>
                                    <Skeleton className="h-32 w-full" />
                                    <Skeleton className="h-32 w-full" />
                                    <Skeleton className="h-32 w-full" />
                                </>
                            )}
                            {!isLoading && hasSearched && (
                                <>
                                    {results && results.results.length > 0 ? (
                                        results.results.map((result, index) => (
                                            <Card key={index}>
                                                <CardHeader>
                                                    <CardTitle className="font-scripture text-2xl">{result.reference}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                                                        "{result.text}"
                                                    </blockquote>
                                                    <p><span className="font-semibold text-primary">Relevance:</span> {result.explanation}</p>
                                                    <div className="mt-4 flex items-center gap-2">
                                                        <Button onClick={() => handleGenerateAudioForResult(`${result.reference}. ${result.text}`, index)} disabled={loadingAudioIndex !== null || !!audioUrls[index]} size="icon" variant="outline">
                                                            {loadingAudioIndex === index ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                                                            <span className="sr-only">Generate Audio</span>
                                                        </Button>
                                                        {audioUrls[index] && (
                                                            <>
                                                            <Button onClick={() => handlePlayPause(index)} size="icon" variant="outline">
                                                                {playingAudioIndex === index ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                                                <span className="sr-only">Play/Pause</span>
                                                            </Button>
                                                            <Button asChild size="icon" variant="outline">
                                                                <a href={audioUrls[index]} download={`${result.reference.replace(/ /g, '_')}.wav`}>
                                                                    <Download className="h-5 w-5" />
                                                                    <span className="sr-only">Download Audio</span>
                                                                </a>
                                                            </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <Card className="text-center py-12">
                                            <CardContent>
                                                <p className="text-muted-foreground">No results found for your query. Please try again.</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="space-y-8">
                        <DailyVerseCard />
                    </div>
                </div>
                 <audio ref={audioRef} onEnded={() => setPlayingAudioIndex(null)} onPause={() => setPlayingAudioIndex(null)} className="hidden"/>
            </div>
        </DashboardLayout>
    );
}
