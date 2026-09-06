"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { publicEnvironment } from "@/config/env.client";
import {
  createChatSocket,
  fetchSocketToken,
  type ChatSocket,
} from "@/lib/socket/chat-socket";
import type { ChatMessage } from "@/types/api";
import { useSession } from "./session-provider";

export type SocketConnectionState =
  "disabled" | "idle" | "connecting" | "connected" | "disconnected" | "error";

interface SocketContextValue {
  state: SocketConnectionState;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  joinConversation: (conversationId: string) => Promise<void>;
  leaveConversation: (conversationId: string) => Promise<void>;
  sendMessage: (
    conversationId: string,
    content: string,
  ) => Promise<ChatMessage>;
  subscribeToMessages: (listener: (message: ChatMessage) => void) => () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);
const ACK_TIMEOUT_MS = 10_000;

export function SocketProvider({ children }: { children: ReactNode }) {
  const { authenticated } = useSession();
  const socketRef = useRef<ChatSocket | null>(null);
  const listenersRef = useRef(new Set<(message: ChatMessage) => void>());
  const connectingRef = useRef<Promise<void> | null>(null);
  const [state, setState] = useState<SocketConnectionState>(
    publicEnvironment.chatEnabled ? "idle" : "disabled",
  );
  const [error, setError] = useState<string | null>(null);

  const destroySocket = useCallback(() => {
    const socket = socketRef.current;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    }
    connectingRef.current = null;
  }, []);

  const disconnect = useCallback(() => {
    destroySocket();
    setError(null);
    setState(publicEnvironment.chatEnabled ? "idle" : "disabled");
  }, [destroySocket]);

  const connect = useCallback(async () => {
    if (!publicEnvironment.chatEnabled) return;
    if (!authenticated) throw new Error("Sign in to use live chat");
    if (socketRef.current?.connected) return;
    if (socketRef.current) {
      socketRef.current.connect();
      return;
    }
    if (connectingRef.current) return connectingRef.current;

    const operation = (async () => {
      setState("connecting");
      setError(null);
      let token: string;
      try {
        token = await fetchSocketToken();
      } catch (tokenError) {
        setState("error");
        setError(
          tokenError instanceof Error
            ? tokenError.message
            : "Unable to authenticate live chat",
        );
        throw tokenError;
      }
      const socket = createChatSocket(token);
      let authRetryUsed = false;

      socket.on("connect", () => {
        authRetryUsed = false;
        setState("connected");
        setError(null);
      });
      socket.on("disconnect", () => setState("disconnected"));
      socket.on("message:created", (message) => {
        listenersRef.current.forEach((listener) => listener(message));
      });
      socket.on("connect_error", (connectionError) => {
        const unauthorized = connectionError.message
          .toLowerCase()
          .includes("unauthorized");
        if (unauthorized && !authRetryUsed) {
          authRetryUsed = true;
          void fetchSocketToken(true)
            .then((nextToken) => {
              socket.auth = { token: nextToken };
              socket.connect();
            })
            .catch(() => {
              setState("error");
              setError("Live chat authentication expired");
            });
          return;
        }
        setState("error");
        setError(connectionError.message || "Live chat connection failed");
      });

      socketRef.current = socket;
      socket.connect();
    })();

    connectingRef.current = operation;
    try {
      await operation;
    } finally {
      connectingRef.current = null;
    }
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated) destroySocket();
  }, [authenticated, destroySocket]);

  useEffect(() => destroySocket, [destroySocket]);

  const requireSocket = useCallback(async (): Promise<ChatSocket> => {
    await connect();
    const socket = socketRef.current;
    if (!socket) throw new Error("Live chat is unavailable");
    return socket;
  }, [connect]);

  const joinConversation = useCallback(
    async (conversationId: string) => {
      const socket = await requireSocket();
      await socket
        .timeout(ACK_TIMEOUT_MS)
        .emitWithAck("conversation:join", { conversationId });
    },
    [requireSocket],
  );

  const leaveConversation = useCallback(async (conversationId: string) => {
    const socket = socketRef.current;
    if (!socket) return;
    await socket
      .timeout(ACK_TIMEOUT_MS)
      .emitWithAck("conversation:leave", { conversationId });
  }, []);

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      const socket = await requireSocket();
      return socket
        .timeout(ACK_TIMEOUT_MS)
        .emitWithAck("message:send", { conversationId, content });
    },
    [requireSocket],
  );

  const subscribeToMessages = useCallback(
    (listener: (message: ChatMessage) => void) => {
      listenersRef.current.add(listener);
      return () => listenersRef.current.delete(listener);
    },
    [],
  );

  const value = useMemo(
    () => ({
      state,
      error,
      connect,
      disconnect,
      joinConversation,
      leaveConversation,
      sendMessage,
      subscribeToMessages,
    }),
    [
      connect,
      disconnect,
      error,
      joinConversation,
      leaveConversation,
      sendMessage,
      state,
      subscribeToMessages,
    ],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useChatSocket(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useChatSocket must be used inside SocketProvider");
  return context;
}
