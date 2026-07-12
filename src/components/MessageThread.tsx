"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { sendMessage } from "@/lib/actions/messages";

export type MessageDTO = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
};

export function MessageThread({
  conversationId,
  meId,
  messages,
}: {
  conversationId: string;
  meId: string;
  messages: MessageDTO[];
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function send() {
    const text = body.trim();
    if (!text) return;
    setErr(null);
    start(async () => {
      const res = await sendMessage(conversationId, text);
      if (res?.error) {
        setErr(res.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  }

  return (
    <div className="flex h-[65vh] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="scroll-slim flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-400">No messages yet. Say hello! 👋</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === meId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  mine ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-brand-100" : "text-slate-400"}`}>
                  {new Date(m.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-slate-100 p-3">
        {err && <p className="mb-1 text-xs text-rose-600">{err}</p>}
        <div className="flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type a message…"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <button
            onClick={send}
            disabled={pending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
