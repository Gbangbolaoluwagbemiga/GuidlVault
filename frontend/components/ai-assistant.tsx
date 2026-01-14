"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname } from "next/navigation";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export function AiAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! I'm your VaultGuard assistant. Ask me anything about the platform or specific vaults." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Determine context
    const context = pathname?.includes("judge") ? "judge" : pathname?.includes("submit") ? "researcher" : "general";

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    async function handleSend() {
        if (!input.trim()) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMsg].slice(-10), // Send last 10 messages context
                    context
                }),
            });
            const data = await res.json();

            setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting to the brain. Try again later." }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="fixed bottom-24 right-6 w-96 h-[500px] glass shadow-2xl rounded-2xl z-50 flex flex-col overflow-hidden border border-indigo-500/30"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <Bot className="h-5 w-5" />
                                <span className="font-bold">VaultAI Assistant</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="space-y-4">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === "user"
                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-700 rounded-bl-none"
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-2 shadow-sm border border-slate-200 dark:border-slate-700 rounded-bl-none">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about scope, fees, etc..."
                                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                />
                                <Button type="submit" size="icon" disabled={loading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl flex items-center justify-center z-50 hover:shadow-2xl hover:shadow-indigo-500/25 transition-shadow"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
            </motion.button>
        </>
    );
}
