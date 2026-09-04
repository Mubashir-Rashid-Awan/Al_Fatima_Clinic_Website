"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Mail, MailOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { markMessageRead } from "@/lib/admin/actions";
import type { ContactMessage } from "@/types/database.types";

export function MessagesList({ messages }: { messages: ContactMessage[] }) {
  const [list, setList] = useState(messages);
  const [, startTransition] = useTransition();

  function handleToggleRead(message: ContactMessage) {
    const next = !message.is_read;
    setList((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_read: next } : m)));
    startTransition(async () => {
      const res = await markMessageRead(message.id, next);
      if (!res.success) toast.error(res.error ?? "Failed to update");
    });
  }

  if (list.length === 0) {
    return <p className="rounded-lg border p-8 text-center text-sm text-muted-foreground">No messages yet.</p>;
  }

  return (
    <div className="space-y-3">
      {list.map((message) => (
        <Card key={message.id} className={message.is_read ? "opacity-70" : ""}>
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{message.full_name}</p>
                  {!message.is_read && <Badge variant="secondary">New</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {message.email}
                  {message.phone ? ` · ${message.phone}` : ""}
                </p>
                {message.subject && <p className="mt-1 text-sm font-medium">{message.subject}</p>}
                <p className="mt-2 text-sm text-muted-foreground">{message.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleToggleRead(message)}
                className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-accent"
                title={message.is_read ? "Mark as unread" : "Mark as read"}
              >
                {message.is_read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
