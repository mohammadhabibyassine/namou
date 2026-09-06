import { z } from "zod";

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_CHAT_ENABLED: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_SOCKET_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SOCKET_PATH: z.string().startsWith("/").default("/socket.io"),
  NEXT_PUBLIC_SOCKET_WEBSOCKET_ONLY: z.enum(["true", "false"]).default("true"),
  NEXT_PUBLIC_PRODUCT_IMAGE_ORIGIN: z.url().optional(),
});

const parsed = publicEnvironmentSchema.parse({
  NEXT_PUBLIC_CHAT_ENABLED: process.env.NEXT_PUBLIC_CHAT_ENABLED,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  NEXT_PUBLIC_SOCKET_PATH: process.env.NEXT_PUBLIC_SOCKET_PATH,
  NEXT_PUBLIC_SOCKET_WEBSOCKET_ONLY:
    process.env.NEXT_PUBLIC_SOCKET_WEBSOCKET_ONLY,
  NEXT_PUBLIC_PRODUCT_IMAGE_ORIGIN:
    process.env.NEXT_PUBLIC_PRODUCT_IMAGE_ORIGIN,
});

export const publicEnvironment = {
  chatEnabled: parsed.NEXT_PUBLIC_CHAT_ENABLED === "true",
  socketUrl: parsed.NEXT_PUBLIC_SOCKET_URL,
  socketPath: parsed.NEXT_PUBLIC_SOCKET_PATH,
  socketWebsocketOnly: parsed.NEXT_PUBLIC_SOCKET_WEBSOCKET_ONLY === "true",
  productImageOrigin: parsed.NEXT_PUBLIC_PRODUCT_IMAGE_ORIGIN
    ? new URL(parsed.NEXT_PUBLIC_PRODUCT_IMAGE_ORIGIN).origin
    : undefined,
} as const;
