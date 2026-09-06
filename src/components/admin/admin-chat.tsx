"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Archive, ArrowUp, Check, Loader2, Send, UserRound } from "lucide-react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { chatApi } from "@/features/chat/api";
import { formatDateTime } from "@/lib/format/date";
import { queryKeys } from "@/lib/query/keys";
import { useChatSocket } from "@/providers/socket-provider";
import type { ChatConversationStatus } from "@/types/api";
import { cn } from "@/lib/utils/cn";

const CONVERSATIONS_PAGE_SIZE = 25;
const MESSAGES_PAGE_SIZE = 50;

export function AdminChat() {
  const [status, setStatus] = useState<ChatConversationStatus>("open");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    state: socketState,
    connect,
    joinConversation,
    leaveConversation,
    subscribeToMessages,
  } = useChatSocket();

  // ── Conversations (infinite) ──────────────────────────────────────────
  const conversations = useInfiniteQuery({
    queryKey: queryKeys.admin.chat.conversations({ status }),
    initialPageParam: "",
    queryFn: ({ pageParam }) =>
      chatApi.adminConversations({
        status,
        pageSize: CONVERSATIONS_PAGE_SIZE,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    getNextPageParam: (page) =>
      page.pageInfo.hasNextPage
        ? (page.pageInfo.endCursor ?? undefined)
        : undefined,
  });

  const allConversations =
    conversations.data?.pages.flatMap((page) => page.items) ?? [];

  const active =
    allConversations.find((item) => item.id === selectedId) ??
    allConversations[0] ??
    null;

  // ── Messages (infinite — reverse chronological, load older) ───────────
  const messages = useInfiniteQuery({
    queryKey: queryKeys.admin.chat.messages(active?.id ?? "idle"),
    initialPageParam: "",
    queryFn: ({ pageParam }) =>
      chatApi.adminMessages(active!.id, {
        pageSize: MESSAGES_PAGE_SIZE,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    getNextPageParam: (page) =>
      page.pageInfo.hasNextPage
        ? (page.pageInfo.endCursor ?? undefined)
        : undefined,
    enabled: Boolean(active),
  });

  const allMessages =
    messages.data?.pages.flatMap((page) => page.items) ?? [];

  // ── Mutations ─────────────────────────────────────────────────────────
  const send = useMutation({
    mutationFn: (message: string) =>
      chatApi.adminSendMessage(active!.id, message),
    onSuccess: async () => {
      setContent("");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.admin.chat.messages(active!.id),
      });
    },
  });
  const assign = useMutation({
    mutationFn: () => chatApi.adminAssign(active!.id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.chat.conversations({ status }),
      }),
  });
  const updateStatus = useMutation({
    mutationFn: (next: ChatConversationStatus) =>
      chatApi.adminUpdateStatus(active!.id, next),
    onSuccess: async () => {
      setSelectedId(null);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.admin.chat.conversations({ status }),
      });
    },
  });

  // ── Socket integration ────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    let mounted = true;
    void connect()
      .then(async () => {
        if (mounted) await joinConversation(active.id);
      })
      .catch(() => undefined);
    const unsubscribe = subscribeToMessages((message) => {
      if (message.conversationId === active.id)
        void queryClient.invalidateQueries({
          queryKey: queryKeys.admin.chat.messages(active.id),
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
    queryClient,
    subscribeToMessages,
  ]);

  // Auto-scroll to bottom on new messages (first page load or new message sent)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (content.trim() && active) send.mutate(content.trim());
  }

  return (
    <div className="p-4 sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="technical-label text-subtle">
            Support / Realtime channel
          </p>
          <h1 className="display-title mt-2 text-6xl sm:text-8xl">Live chat</h1>
        </div>
        <label className="flex items-center gap-3">
          <span className="technical-label">Queue</span>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as ChatConversationStatus)
            }
            className="border-line bg-surface h-11 rounded-lg border px-4 font-mono text-[9px] uppercase"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>
      <div className="border-line bg-surface mt-7 grid min-h-[38rem] overflow-hidden rounded-xl border lg:grid-cols-[20rem_1fr]">
        {/* ── Conversation sidebar ─────────────────────────────────────── */}
        <aside className="border-line border-b lg:border-r lg:border-b-0">
          <div className="border-line text-subtle border-b p-4 font-mono text-[8px] uppercase">
            Conversations / {allConversations.length}
          </div>
          <div className="max-h-72 overflow-y-auto lg:max-h-[34rem]">
            {conversations.isPending ? (
              <div className="bg-muted m-3 h-56 animate-pulse rounded-lg" />
            ) : (
              <>
                {allConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedId(conversation.id)}
                    className={cn(
                      "border-line w-full border-b p-4 text-left",
                      active?.id === conversation.id
                        ? "bg-acid"
                        : "hover:bg-muted",
                    )}
                  >
                    <p className="truncate font-mono text-[10px] uppercase">
                      {conversation.subject ?? "General support"}
                    </p>
                    <p className="text-subtle mt-2 truncate text-xs">
                      {conversation.user.firstName ?? conversation.user.email}
                    </p>
                    <p className="text-subtle mt-2 font-mono text-[8px] uppercase">
                      {formatDateTime(conversation.updatedAt)}
                    </p>
                  </button>
                ))}
                {conversations.hasNextPage ? (
                  <button
                    onClick={() => conversations.fetchNextPage()}
                    disabled={conversations.isFetchingNextPage}
                    className="text-subtle flex w-full items-center justify-center gap-2 p-4 font-mono text-[8px] uppercase hover:bg-muted disabled:opacity-50"
                  >
                    {conversations.isFetchingNextPage ? (
                      <>
                        Loading <Loader2 size={11} className="animate-spin" />
                      </>
                    ) : (
                      "Load older conversations"
                    )}
                  </button>
                ) : null}
              </>
            )}
          </div>
        </aside>

        {/* ── Active conversation ──────────────────────────────────────── */}
        {active ? (
          <section className="flex min-h-[36rem] flex-col">
            <header className="border-line flex flex-wrap items-center justify-between gap-3 border-b p-4">
              <div>
                <p className="font-mono text-[10px] uppercase">
                  {active.subject ?? "General support"}
                </p>
                <p className="text-subtle mt-1 text-xs">
                  {active.user.email} / {socketState}
                </p>
              </div>
              <div className="flex gap-2">
                {!active.assignedAdminId ? (
                  <button
                    onClick={() => assign.mutate()}
                    className="border-line inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 font-mono text-[8px] uppercase"
                  >
                    <UserRound size={13} /> Assign to me
                  </button>
                ) : null}
                {active.status === "open" ? (
                  <button
                    onClick={() => updateStatus.mutate("closed")}
                    className="bg-ink inline-flex min-h-9 items-center gap-2 rounded-lg px-3 font-mono text-[8px] text-white uppercase"
                  >
                    <Check size={13} /> Close
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatus.mutate("archived")}
                    className="border-line inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 font-mono text-[8px] uppercase"
                  >
                    <Archive size={13} /> Archive
                  </button>
                )}
              </div>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {/* Load older messages button */}
              {messages.hasNextPage ? (
                <button
                  onClick={() => messages.fetchNextPage()}
                  disabled={messages.isFetchingNextPage}
                  className="text-subtle mx-auto flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-[8px] uppercase hover:bg-muted disabled:opacity-50"
                >
                  {messages.isFetchingNextPage ? (
                    <>
                      Loading <Loader2 size={11} className="animate-spin" />
                    </>
                  ) : (
                    <>
                      <ArrowUp size={11} /> Load older messages
                    </>
                  )}
                </button>
              ) : null}
              {allMessages.length ? (
                [...allMessages].reverse().map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.sender.role === "customer"
                        ? "bg-muted mr-auto max-w-[75%] rounded-xl p-3"
                        : "bg-ink ml-auto max-w-[75%] rounded-xl p-3 text-white"
                    }
                  >
                    <p className="text-sm leading-5">{message.content}</p>
                    <time className="mt-2 block font-mono text-[7px] uppercase opacity-45">
                      {formatDateTime(message.createdAt)}
                    </time>
                  </div>
                ))
              ) : (
                <p className="text-subtle py-16 text-center text-sm">
                  No messages in this channel.
                </p>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form
              onSubmit={submit}
              className="border-line grid grid-cols-[1fr_auto] gap-2 border-t p-3"
            >
              <input
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={5000}
                disabled={active.status !== "open"}
                placeholder="Reply to customer"
                className="border-line bg-background h-11 rounded-lg border px-3 text-sm disabled:opacity-50"
              />
              <button
                disabled={
                  !content.trim() || send.isPending || active.status !== "open"
                }
                className="bg-acid grid size-11 place-items-center rounded-lg disabled:opacity-40"
                aria-label="Send reply"
              >
                <Send size={15} />
              </button>
            </form>
          </section>
        ) : (
          <section className="technical-grid grid min-h-96 place-items-center">
            <div className="text-center">
              <p className="display-title text-5xl">Queue clear.</p>
              <p className="text-subtle mt-2 text-sm">
                No conversations in this view.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
