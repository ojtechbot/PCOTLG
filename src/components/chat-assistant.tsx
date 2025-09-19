
"use client"

import { useEffect, useState, useRef } from "react"
import { MessageSquare, Loader2, Plus, Send, X, ArrowDown, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { concierge } from "@/ai/flows/concierge"
import type { Message } from "@/lib/types";
import { Separator } from "./ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"
import { useSound } from "@/hooks/use-sound"
import { useToast } from "@/hooks/use-toast"


const initialMessage: Message = {
    role: "assistant",
    content: "Hello! I'm your Church Concierge. How can I help you today?"
}

const suggestionChips = [
    "What can you do?",
    "Find sermons on faith",
    "When is the summer picnic?",
    "Verses about forgiveness",
]

const CHAT_HISTORY_KEY = 'concierge-chat-history';

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const { playSound } = useSound();
  const { toast } = useToast();


  // Load chat history from localStorage on initial render
  useEffect(() => {
    // This code should only run on the client side
    if (typeof window !== 'undefined') {
      try {
        const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
              setMessages(parsedHistory);
          }
        }
      } catch (error) {
          console.error("Failed to parse chat history from local storage", error);
          setMessages([initialMessage]);
      }

      // Randomly decide to show the suggestion pop-up
      if (Math.random() > 0.5) { // 50% chance to show
        const suggestionTimer = setTimeout(() => {
          if (!isOpen) setShowSuggestion(true);
        }, 1000);
        
        const hideTimer = setTimeout(() => {
          setShowSuggestion(false);
        }, 5000);
        
        return () => {
            clearTimeout(suggestionTimer);
            clearTimeout(hideTimer);
        }
      }
    }
  }, [isOpen]);
  
  const scrollToBottom = (behavior: "smooth" | "auto" = "auto") => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior });
        }
    }
  }

  // Save chat history and handle scrolling
  useEffect(() => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
        } catch(error) {
            console.error("Failed to save chat history to local storage", error);
        }
    }
    
    // Always scroll to bottom when a new message is added, unless the user has scrolled up.
    if (!showScrollToBottom) {
      // Use a timeout to ensure the DOM has updated before scrolling
      setTimeout(() => scrollToBottom('smooth'), 100);
    }
  }, [messages, showScrollToBottom]);

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return
    
    playSound('sendMessage');
    const userMessage: Message = { role: "user", content: messageContent };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    
    try {
        // Pass the updated history to the concierge
        const assistantResponse = await concierge({ 
            history: messages, // Send history *before* the new user message
            message: messageContent 
        });
        playSound('notification');
        const assistantMessage: Message = { role: "assistant", content: assistantResponse };
        setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
        console.error("Chat error:", error);
         const errorMessage: Message = { role: "assistant", content: "I'm sorry, I encountered an error. Please try again." };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  }
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Show button if user is not within 50px of the bottom
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setShowScrollToBottom(!isAtBottom);
  }

  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSendMessage(input);
  }

  const handleNewChat = () => {
    setMessages([initialMessage]);
  }
  
  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    // Hide suggestion when user interacts with the widget
    if (showSuggestion) {
      setShowSuggestion(false);
    }
  }
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copied to clipboard!",
        duration: 2000,
    });
  }

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50 flex items-end gap-2">
        {!isOpen && showSuggestion && (
            <div className="relative animate-in fade-in-50 slide-in-from-bottom-2 duration-500 opacity-100 transition-opacity">
                 <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full animate-ping"></div>
                 <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full"></div>
                <div className="bg-primary text-primary-foreground rounded-lg rounded-br-none px-4 py-2 shadow-lg">
                    <p className="text-sm">Hi! How can I help?</p>
                </div>
            </div>
        )}
        <Button size="icon" className="rounded-full w-14 h-14 shadow-lg" onClick={handleToggleOpen}>
          <MessageSquare className="h-6 w-6" />
          <span className="sr-only">Toggle Chat</span>
        </Button>
      </div>
      {isOpen && (
        <div className="fixed bottom-0 right-0 z-50 w-full h-full md:h-auto md:max-w-sm md:bottom-24 md:right-6 md:max-h-[70vh]">
            <Card className="flex flex-col h-full shadow-2xl rounded-none md:rounded-lg overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                         <Avatar className="w-10 h-10 flex-shrink-0">
                            <AvatarFallback>AI</AvatarFallback>
                            <AvatarImage src="/images/logo.png" alt="Church logo" />
                        </Avatar>
                        <div>
                            <CardTitle className="font-headline text-lg">Church Concierge</CardTitle>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleNewChat}>
                                <Plus className="h-4 w-4" />
                                <span className="sr-only">New Chat</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>New Chat</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close Chat</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Close Chat</p>
                          </TooltipContent>
                        </Tooltip>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="flex-1 p-0 relative bg-secondary/20">
                    <ScrollArea className="h-full p-4" ref={scrollAreaRef} onScroll={handleScroll}>
                        <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div
                            key={index}
                            className={cn('group flex items-end gap-2',
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                            >
                            {message.role === "assistant" && (
                                <Avatar className="w-8 h-8 flex-shrink-0">
                                    <AvatarFallback>AI</AvatarFallback>
                                    <AvatarImage src="/images/logo.png" alt="Church logo" />
                                </Avatar>
                            )}
                            <div
                                className={cn('relative rounded-lg px-3 py-2 max-w-[85%] text-sm prose dark:prose-invert prose-p:my-0 prose-headings:my-2',
                                message.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-muted text-muted-foreground rounded-bl-none"
                                )}
                            >
                                <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6 text-current opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity" onClick={() => handleCopy(message.content)}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.content}
                                </ReactMarkdown>
                            </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-end gap-2 justify-start">
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback>AI</AvatarFallback>
                                     <AvatarImage src="/images/logo.png" alt="Church logo" />
                                </Avatar>
                                <div className="rounded-lg px-3 py-2 bg-muted flex items-center rounded-bl-none">
                                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                </div>
                            </div>
                        )}
                        </div>
                    </ScrollArea>
                    {showScrollToBottom && (
                        <div className="absolute bottom-4 right-4">
                            <Button size="icon" className="rounded-full" onClick={() => scrollToBottom('smooth')}>
                                <ArrowDown className="h-5 w-5" />
                                <span className="sr-only">Scroll to bottom</span>
                            </Button>
                        </div>
                    )}
                </CardContent>
                {messages.length <= 1 && (
                    <div className="px-4 pb-2 border-t pt-2">
                        <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex w-max space-x-2">
                                {suggestionChips.map(chip => (
                                    <Badge key={chip} variant="outline" className="cursor-pointer" onClick={() => handleSendMessage(chip)}>
                                        {chip}
                                    </Badge>
                                ))}
                            </div>
                             <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </div>
                )}
                <CardFooter className="p-2 border-t">
                    <form onSubmit={handleFormSubmit} className="flex w-full items-center space-x-2">
                        <Input
                        id="message"
                        placeholder="Ask a question..."
                        className="flex-1 rounded-full"
                        autoComplete="off"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        />
                        <Button type="submit" size="icon" className="rounded-full" disabled={isLoading || !input.trim()}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
      )}
    </TooltipProvider>
  )
}

    