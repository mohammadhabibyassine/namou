import { io, type Socket } from "socket.io-client";
import { publicEnvironment } from "@/config/env.client";
import { refreshBrowserSession } from "@/services/api/v1/client";
import type { ChatMessage } from "@/types/api";

export interface ChatServerToClientEvents {
  "message:created": (message: ChatMessage) => void;
}

export interface ChatClientToServerEvents {
  "conversation:join": (
    input: { conversationId: string },
    acknowledge: (result: { conversationId: string }) => void,
  ) => void;
  "conversation:leave": (
    input: { conversationId: string },
    acknowledge: (result: { conversationId: string }) => void,
  ) => void;
  "message:send": (
    input: { conversationId: string; content: string },
    acknowledge: (result: ChatMessage) => void,
  ) => void;
}

export type ChatSocket = Socket<
  ChatServerToClientEvents,
  ChatClientToServerEvents
>;

export function createChatSocket(token: string): ChatSocket {
  return io(`${publicEnvironment.socketUrl}/chat`, {
    path: publicEnvironment.socketPath,
    autoConnect: false,
    auth: { token },
    reconnection: true,
    // A production deployment or temporary network outage can outlast a small
    // retry budget. Keep recovering while the authenticated page remains open.
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
    randomizationFactor: 0.5,
    timeout: 10_000,
    ...(publicEnvironment.socketWebsocketOnly
      ? { transports: ["websocket"] }
      : {}),
  });
}

export async function fetchSocketToken(forceRefresh = false): Promise<string> {
  if (forceRefresh) await refreshBrowserSession();

  let response = await fetch("/api/auth/socket-token", {
    cache: "no-store",
    credentials: "same-origin",
  });
  if (response.status === 401 && !forceRefresh) {
    await refreshBrowserSession();
    response = await fetch("/api/auth/socket-token", {
      cache: "no-store",
      credentials: "same-origin",
    });
  }
  if (!response.ok) throw new Error("Unable to authenticate live chat");
  const payload = (await response.json()) as { token: string };
  return payload.token;
}
