"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const ChatWidget = dynamic(
  () => import("./store-chat-widget").then((module) => module.StoreChatWidget),
  { ssr: false },
);

export function LazyChatWidget() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <ChatWidget />;
}
