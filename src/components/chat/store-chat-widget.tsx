"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { chatApi } from "@/features/chat/api";
import { queryKeys } from "@/lib/query/keys";
import { formatDateTime } from "@/lib/format/date";
import { useSession } from "@/providers/session-provider";
import { useChatSocket } from "@/providers/socket-provider";

export function StoreChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const { authenticated } = useSession();
  const {
    state: socketState,
    connect,
    joinConversation,
    leaveConversation,
    subscribeToMessages,
  } = useChatSocket();
  const queryClient = useQueryClient();
  const conversations = useQuery({
    queryKey: queryKeys.chat.conversations({ status: "open" }),
    queryFn: () => chatApi.conversations({ status: "open", pageSize: 10 }),
    enabled: open && authenticated,
  });
  const active = conversations.data?.items[0] ?? null;
  const messages = useQuery({
    queryKey: queryKeys.chat.messages(active?.id ?? "idle"),
    queryFn: () => chatApi.messages(active!.id, { pageSize: 50 }),
    enabled: open && Boolean(active),
  });
  const create = useMutation({
    mutationFn: () => chatApi.createConversation(subject.trim() || undefined),
    onSuccess: async () => {
      setSubject("");
      await queryClient.invalidateQueries({
        queryKey: ["chat", "conversations"],
      });
    },
  });
  const send = useMutation({
    mutationFn: (message: string) => chatApi.sendMessage(active!.id, message),
    onSuccess: async () => {
      setContent("");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.chat.messages(active!.id),
      });
    },
  });

  useEffect(() => {
    if (!open || !active) return;
    let mounted = true;
    void connect()
      .then(async () => {
        if (mounted) await joinConversation(active.id);
      })
      .catch(() => undefined);
    const unsubscribe = subscribeToMessages((message) => {
      if (message.conversationId === active.id)
        void queryClient.invalidateQueries({
          queryKey: queryKeys.chat.messages(active.id),
        });
    });
    return () => {
      mounted = false;
      unsubscribe();
      void leaveConversation(active.id).catch(() => undefined);
    };
  }, [
    active,
    connect,
    joinConversation,
    leaveConversation,
    open,
    queryClient,
    subscribeToMessages,
  ]);

  if (pathname.startsWith("/admin")) return null;
  function submit(event: FormEvent) {
    event.preventDefault();
    const value = content.trim();
    if (value && active) send.mutate(value);
  }
  return (
    <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      {open ? (
        <section
          className="border-line bg-surface mb-3 flex h-[min(34rem,calc(100vh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border shadow-2xl"
          aria-label="Namou support chat"
        >
          <header className="bg-ink flex items-center justify-between p-4 text-white">
            <div className="flex items-center gap-3">
              <span className="bg-acid text-ink grid size-9 place-items-center rounded-xl">
                <span className="flex gap-1">
                  <i className="bg-ink size-1.5 rounded-full" />
                  <i className="bg-ink size-1.5 rounded-full" />
                </span>
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase">
                  Namou live channel
                </p>
                <p className="mt-1 font-mono text-[8px] text-white/45 uppercase">
                  {socketState}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid size-9 place-items-center"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </header>
          {!authenticated ? (
            <div className="grid flex-1 place-items-center p-6 text-center">
              <div>
                <p className="display-title text-4xl">Identify to connect.</p>
                <p className="text-subtle mt-3 text-sm">
                  Sign in to start a secure conversation and keep its history.
                </p>
                <Link
                  href={`/login?next=${encodeURIComponent(pathname)}`}
                  className="bg-acid mt-5 inline-block rounded-lg px-5 py-3 font-mono text-[9px] uppercase"
                >
                  Login to chat
                </Link>
              </div>
            </div>
          ) : conversations.isPending ? (
            <div className="bg-muted m-4 flex-1 animate-pulse rounded-lg" />
          ) : active ? (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.data?.items.length ? (
                  [...messages.data.items].reverse().map((message) => (
                    <div
                      key={message.id}
                      className={
                        message.sender.role === "customer"
                          ? "bg-ink ml-auto max-w-[85%] rounded-xl p-3 text-white"
                          : "bg-muted mr-auto max-w-[85%] rounded-xl p-3"
                      }
                    >
                      <p className="text-sm leading-5">{message.content}</p>
                      <time className="mt-2 block font-mono text-[7px] uppercase opacity-45">
                        {formatDateTime(message.createdAt)}
                      </time>
                    </div>
                  ))
                ) : (
                  <p className="text-subtle py-10 text-center text-sm">
                    Send the first message.
                  </p>
                )}
              </div>
              <form
                onSubmit={submit}
                className="border-line grid grid-cols-[1fr_auto] gap-2 border-t p-3"
              >
                <label>
                  <span className="sr-only">Message</span>
                  <input
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    maxLength={5000}
                    placeholder="Type a message"
                    className="border-line bg-background h-11 w-full rounded-lg border px-3 text-sm"
                  />
                </label>
                <button
                  disabled={!content.trim() || send.isPending}
                  className="bg-acid grid size-11 place-items-center rounded-lg disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                create.mutate();
              }}
              className="grid flex-1 place-items-center p-6"
            >
              <div className="w-full text-center">
                <p className="display-title text-4xl">Open a channel.</p>
                <p className="text-subtle mt-3 text-sm">
                  What can the Namou team help with?
                </p>
                <label className="mt-5 block text-left">
                  <span className="technical-label">Subject / optional</span>
                  <input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    maxLength={255}
                    className="border-line bg-background mt-2 h-11 w-full rounded-lg border px-3 text-sm"
                  />
                </label>
                <button className="bg-acid mt-3 min-h-11 w-full rounded-lg font-mono text-[9px] uppercase">
                  Start conversation
                </button>
              </div>
            </form>
          )}
        </section>
      ) : null}
      <button
        onClick={() => setOpen((value) => !value)}
        className="bg-ink text-acid ml-auto grid size-14 place-items-center rounded-2xl shadow-xl transition-transform motion-safe:hover:scale-105"
        aria-label={open ? "Close support chat" : "Open support chat"}
        aria-expanded={open}
      >
        {open ? <X size={20} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
