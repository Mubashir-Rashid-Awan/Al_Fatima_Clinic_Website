import { createClient } from "@/lib/supabase/server";
import { MessagesList } from "@/components/admin/messages-list";
import type { ContactMessage } from "@/types/database.types";

async function getMessages(): Promise<ContactMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load messages:", error.message);
    return [];
  }
  return data ?? [];
}

export default async function AdminMessagesPage() {
  const messages = await getMessages();

  return (
    <div>
      <h1 className="text-2xl font-bold">Messages</h1>
      <p className="mt-1 text-sm text-muted-foreground">Submissions from the Contact page form.</p>

      <div className="mt-8">
        <MessagesList messages={messages} />
      </div>
    </div>
  );
}
