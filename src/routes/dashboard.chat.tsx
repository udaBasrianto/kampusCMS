import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Bot } from "lucide-react";

export const Route = createFileRoute("/dashboard/chat")({
  component: DashboardChat,
});

function DashboardChat() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Riwayat Chat AI</h1>
          <p className="mt-1 text-muted-foreground">Lihat riwayat percakapan Anda dengan asisten AI kampus.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-green-500/10 p-4 mb-4 text-green-500">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Riwayat Kosong</h2>
        <p className="text-muted-foreground max-w-md">
          Anda belum pernah melakukan percakapan dengan Chatbot AI kampus. Silakan gunakan widget chat di sudut kanan bawah untuk mulai bertanya.
        </p>
        <button className="mt-6 inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-semibold hover:bg-muted" onClick={() => {
          // Dispatch a custom event or trigger chatbot open if needed
          const event = new CustomEvent("open-chatbot");
          window.dispatchEvent(event);
        }}>
          <Bot className="h-4 w-4" /> Buka AI Chatbot
        </button>
      </div>
    </div>
  );
}
