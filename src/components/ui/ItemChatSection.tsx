"use client";

import { useState, useRef, useEffect } from "react";
import { aiService } from "@/services/ai.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface ItemChatSectionProps {
  itemId: string;
  itemType: "spot" | "activity";
  itemName: string;
  suggestions?: string[];
  theme?: "light" | "dark";
}

export function ItemChatSection({
  itemId,
  itemType,
  itemName,
  suggestions,
  theme = "light",
}: ItemChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const defaultSuggestions = itemType === "spot"
    ? [
        "What is the best time to visit?",
        "Are there any entry fees or ticket requirements?",
        "How is the local transport and accessibility?",
        "What are the photography rules here?",
      ]
    : [
        "Is this activity suitable for beginners?",
        "What safety gear is provided?",
        "What should I wear or pack for this?",
        "How do group discounts work?",
      ];

  const activeSuggestions = suggestions || defaultSuggestions;

  useEffect(() => {
    // Add initial AI welcome message
    setMessages([
      {
        sender: "ai",
        text: `Hey! I'm **Voyager**, your street-smart travel guide. Ask me anything about **${itemName}**. I have details on local tips, entry hours, pricing, safety rules, and offbeat hacks ready!`,
        timestamp: new Date(),
      },
    ]);
  }, [itemName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = {
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      // Map frontend Message type to backend history format
      const history = messages.map((msg) => ({
        sender: msg.sender,
        text: msg.text,
      }));

      const res = await aiService.askDoubt(itemId, itemType, textToSend, history);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: res.answer,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, I had trouble connecting to the AI guide. Please try again in a bit!",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  const isDark = theme === "dark";

  return (
    <Card className={cn(
      "rounded-[3rem] border shadow-xl overflow-hidden flex flex-col h-[500px] w-full relative",
      isDark 
        ? "bg-slate-900/40 backdrop-blur-md border-white/5 text-white" 
        : "bg-white border-slate-100 text-slate-900 shadow-slate-200/50"
    )}>
      {/* Glow Effects (Dark Theme Only) */}
      {isDark && (
        <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none" />
      )}

      <CardHeader className={cn(
        "p-6 border-b flex-shrink-0 relative z-10",
        isDark ? "border-white/5 bg-slate-950/45" : "border-slate-50 bg-slate-50/50"
      )}>
        <CardTitle className="text-xl font-black font-heading tracking-tight flex items-center gap-2">
          <Sparkles className={cn("h-5 w-5", isDark ? "text-amber-400 animate-pulse" : "text-primary")} />
          Voyager AI
        </CardTitle>
        <CardDescription className={isDark ? "text-slate-400" : "text-slate-500"}>
          Your street-smart travel guide for local tips, rules, and hacks.
        </CardDescription>
      </CardHeader>

      {/* Chat Thread */}
      <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 relative z-10 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg, index) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={index}
              className={cn(
                "flex w-full gap-3",
                isUser ? "justify-end" : "justify-start"
              )}
            >
              {/* AI Avatar */}
              {!isUser && (
                <div className={cn(
                  "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border",
                  isDark 
                    ? "bg-slate-950 border-white/10 text-amber-400" 
                    : "bg-primary/10 border-primary/10 text-primary"
                )}>
                  <Sparkles className="h-4 w-4" />
                </div>
              )}

              {/* Message Bubble */}
              <div className={cn(
                "max-w-[75%] rounded-[1.5rem] px-5 py-3.5 text-sm font-medium leading-relaxed shadow-sm",
                isUser
                  ? isDark
                    ? "bg-amber-500 text-black rounded-tr-none font-bold"
                    : "bg-primary text-white rounded-tr-none"
                  : isDark
                    ? "bg-slate-950/70 border border-white/5 text-slate-100 rounded-tl-none"
                    : "bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none"
              )}>
                {/* Format basic bold syntax in text */}
                <p className="whitespace-pre-line text-xs md:text-sm font-semibold">
                  {msg.text.split("**").map((part, partIdx) => 
                    partIdx % 2 === 1 ? <strong key={partIdx} className="font-extrabold">{part}</strong> : part
                  )}
                </p>
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className={cn(
                  "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border",
                  isDark 
                    ? "bg-slate-800 border-white/10 text-amber-400" 
                    : "bg-slate-100 border-slate-200 text-slate-600"
                )}>
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex w-full gap-3 justify-start">
            <div className={cn(
              "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border",
              isDark 
                ? "bg-slate-950 border-white/10 text-amber-400" 
                : "bg-primary/10 border-primary/10 text-primary"
            )}>
              <Sparkles className="h-4 w-4" />
            </div>
            <div className={cn(
              "rounded-[1.5rem] px-5 py-3.5 text-sm font-medium leading-relaxed border flex items-center gap-2",
              isDark 
                ? "bg-slate-950/70 border-white/5 text-slate-400 rounded-tl-none" 
                : "bg-slate-50 border-slate-100 text-slate-500 rounded-tl-none"
            )}>
              <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
              Checking local guides...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </CardContent>

      {/* Footer Area: Input and suggestions */}
      <div className={cn(
        "p-6 border-t flex-shrink-0 relative z-10",
        isDark ? "border-white/5 bg-slate-950/45" : "border-slate-50 bg-slate-50/50"
      )}>
        {/* Suggestion Chips */}
        {messages.length === 1 && !loading && (
          <div className="mb-4 space-y-2">
            <p className={cn(
              "text-[10px] font-black uppercase tracking-wider",
              isDark ? "text-slate-500" : "text-slate-400"
            )}>
              Suggested Queries
            </p>
            <div className="flex flex-wrap gap-2">
              {activeSuggestions.map((suggestion, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => handleSend(suggestion)}
                  className={cn(
                    "text-[11px] px-3.5 py-1.5 rounded-full border transition-all text-left font-bold",
                    isDark
                      ? "border-white/10 bg-slate-900/50 text-slate-300 hover:border-amber-500/50 hover:bg-slate-900 hover:text-amber-400"
                      : "border-slate-200 bg-white text-slate-600 hover:border-primary/50 hover:bg-slate-50 hover:text-primary"
                  )}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="relative flex items-center">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={1}
            placeholder={`Ask about ${itemName}...`}
            className={cn(
              "w-full rounded-2xl border pr-14 pl-4 py-3.5 text-sm font-semibold resize-none focus:outline-none focus:ring-2 transition-all h-[48px] max-h-[48px]",
              isDark
                ? "bg-slate-950 border-white/10 text-white placeholder-slate-500 focus:ring-amber-500/20"
                : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-primary/20"
            )}
          />
          <div className="absolute right-2 top-1.5 flex items-center gap-1.5">
            <Button
              type="button"
              size="icon"
              disabled={loading || !inputValue.trim()}
              onClick={() => handleSend(inputValue)}
              className={cn(
                "h-9 w-9 rounded-xl transition-all shadow-md",
                isDark
                  ? "bg-amber-500 hover:bg-amber-400 text-black disabled:bg-slate-800 disabled:text-slate-600"
                  : "bg-primary hover:bg-primary/90 text-white"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
