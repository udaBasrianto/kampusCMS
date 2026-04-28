import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, MailOpen, Trash2, Phone } from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import { useContactMessages } from "@/hooks/useCampusData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/messages")({ component: Page });

function Page() {
  const { data: messages = [] } = useContactMessages();
  const qc = useQueryClient();

  const toggleRead = async (id: string, is_read: boolean) => {
    const { error } = await apiClient.updateMessageStatus(id, !is_read);
    if (error) return toast.error(error);
    qc.invalidateQueries({ queryKey: ["contact_messages"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus pesan ini?")) return;
    const { error } = await apiClient.deleteMessage(id);
    if (error) return toast.error(error);
    toast.success("Dihapus");
    qc.invalidateQueries({ queryKey: ["contact_messages"] });
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Pesan Kontak</h1>
      <p className="mt-1 text-muted-foreground">Pesan masuk dari form kontak publik.</p>

      <div className="mt-8 space-y-3">
        {messages.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Belum ada pesan masuk.
          </div>
        )}
        {messages.map((m: any) => (
          <div
            key={m.id}
            className={cn(
              "rounded-xl border border-border bg-card p-5",
              !m.is_read && "border-l-4 border-l-accent",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {!m.is_read && <span className="inline-block h-2 w-2 rounded-full bg-accent" />}
                  <span className="font-medium">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.email}</span>
                  {m.phone && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {m.phone}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm font-medium">{m.subject}</div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {m.message}
                </p>
                <div className="mt-3 text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleString("id-ID")}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => toggleRead(m.id, m.is_read)}
                  className="inline-flex items-center gap-1 rounded-lg border border-input px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                >
                  {m.is_read ? (
                    <>
                      <Mail className="h-3.5 w-3.5" /> Tandai Belum Dibaca
                    </>
                  ) : (
                    <>
                      <MailOpen className="h-3.5 w-3.5" /> Tandai Sudah Dibaca
                    </>
                  )}
                </button>
                <button
                  onClick={() => remove(m.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
