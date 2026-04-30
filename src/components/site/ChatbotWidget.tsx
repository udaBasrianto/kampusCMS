import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Minus, MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/useCampusData";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function ChatbotWidget() {
  const { data: settings } = useSiteSettings();
  const chatbot = (settings?.chatbot ?? {}) as any;
  const isEnabled = chatbot.enabled === true;
  const botAvatar = chatbot.bot_avatar as string | undefined;
  const botAvatarSize = Number(chatbot.bot_avatar_size) || 112;
  const { user } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize greeting message
  useEffect(() => {
    if (chatbot.greeting && messages.length === 0) {
      setMessages([
        {
          id: "greeting",
          role: "assistant",
          content: chatbot.greeting || "Halo! Ada yang bisa saya bantu?",
        },
      ]);
    }
  }, [chatbot.greeting, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  if (!isEnabled) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Send conversation history to backend API (handles all providers)
      const history = messages
        .filter(m => m.id !== "greeting")
        .map(m => ({
          role: m.role,
          content: m.content
        }));
        
      // Add current user message
      history.push({
        role: "user",
        content: userMsg.content
      });

      const API_URL = import.meta.env.VITE_API_URL || "/api/v1";
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history
        })
      });

      if (!res.ok) throw new Error("API Error");
      
      const data = await res.json();
      
      setMessages((prev) => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: data.reply || "Maaf, saya tidak mengerti." 
      }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: "Oops! Terjadi kesalahan saat menghubungi server AI. Coba lagi nanti." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOpen = () => {
    if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
      setIsMinimized(false);
    }
  };

  return (
    <div className="fixed bottom-24 lg:bottom-6 left-5 lg:left-6 z-50 flex flex-col items-start">
      {/* Floating Button */}
      {!isOpen && (
        botAvatar ? (
          <button
            onClick={toggleOpen}
            style={{ width: botAvatarSize, height: botAvatarSize }}
            className="group relative flex items-center justify-center transition-transform hover:scale-110 animate-in zoom-in"
          >
            <img src={botAvatar} alt="Chat" className="h-full w-full object-contain drop-shadow-2xl" />
            <span className="absolute right-4 top-4 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex h-4 w-4 rounded-full bg-accent border-2 border-white"></span>
            </span>
          </button>
        ) : (
          <button
            onClick={toggleOpen}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated transition-transform hover:scale-105 animate-in zoom-in"
          >
            <Bot className="h-6 w-6 transition-transform group-hover:scale-110" />
            <span className="absolute right-0 top-0 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-accent border-2 border-primary"></span>
            </span>
          </button>
        )
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={cn(
            "flex w-[320px] sm:w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevated transition-all duration-300 ease-in-out transform origin-bottom-left",
            isMinimized ? "h-[60px]" : "h-[450px] max-h-[70vh]"
          )}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between bg-primary p-4 text-primary-foreground cursor-pointer"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center gap-3">
              {botAvatar ? (
                <img src={botAvatar} alt="Bot" className="h-8 w-8 object-contain" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold leading-none">Asisten Kampus</h3>
                <p className="mt-1 text-[10px] text-white/70">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                className="rounded p-1 hover:bg-white/20 transition-colors"
                aria-label="Minimize"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="rounded p-1 hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex w-full",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div 
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-br-sm" 
                        : "bg-white border border-border text-foreground shadow-sm rounded-bl-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex w-full justify-start">
                  <div className="flex max-w-[85%] items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-white px-4 py-3 shadow-sm">
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40"></span>
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "0.2s" }}></span>
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0.4s" }}></span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Area or Login Prompt */}
          {!isMinimized && (
            <div className="border-t border-border bg-background p-3">
              {!user ? (
                <div className="flex flex-col items-center text-center p-2">
                  <p className="text-xs text-muted-foreground mb-3">Login diperlukan untuk memulai percakapan dengan AI.</p>
                  <Link 
                    to="/auth" 
                    className="w-full rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Masuk atau Daftar
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Ketik pesan..."
                    className="max-h-32 min-h-[44px] w-full resize-none rounded-xl border border-input bg-muted/50 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
