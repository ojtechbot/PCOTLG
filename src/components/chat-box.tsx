
"use client"

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send } from "lucide-react";

export function ChatBox() {
    const [messages, setMessages] = useState([
        { user: "Jane D.", text: "So excited for today's message!" },
        { user: "John S.", text: "Welcome everyone! Glad you could join." },
    ]);
    const [newMessage, setNewMessage] = useState("");

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            setMessages([...messages, { user: "You", text: newMessage }]);
            setNewMessage("");
        }
    };

    return (
        <div className="flex flex-col h-[500px]">
            <div className="flex-1 space-y-4 overflow-y-auto p-4 bg-secondary/30 rounded-t-lg">
                {messages.map((msg, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={`https://placehold.co/32x32.png?text=${msg.user.charAt(0)}`} data-ai-hint="portrait" />
                            <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm">{msg.user}</p>
                            <p className="text-sm text-muted-foreground">{msg.text}</p>
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border/50 flex items-center gap-2">
                <Input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <Button type="submit" size="icon">
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    );
}
